const { Readable } = require('stream');

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const AIRTABLE_PAT = process.env.AIRTABLE_PAT || process.env.AIRTABLE_TOKEN;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  const AIRTABLE_TABLE = process.env.AIRTABLE_TABLE_NAME || process.env.AIRTABLE_SUBMISSIONS_TABLE || 'Submissions';

  if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID) {
    return res.status(500).json({ error: 'Airtable not configured on server' });
  }

  try {
    // Parse multipart form data manually using the busboy-free approach
    const chunks = [];
    await new Promise((resolve, reject) => {
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', resolve);
      req.on('error', reject);
    });
    const body = Buffer.concat(chunks);

    // Extract boundary from content-type header
    const contentType = req.headers['content-type'] || '';
    const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^\s;]+))/);
    if (!boundaryMatch) {
      return res.status(400).json({ error: 'Invalid multipart form data' });
    }
    const boundary = boundaryMatch[1] || boundaryMatch[2];

    // Parse multipart fields
    const parts = parseMultipart(body, boundary);
    const overlord = getFieldValue(parts, 'overlord') || 'unknown';
    const xAccount = getFieldValue(parts, 'xAccount') || '';
    const imagePart = parts.find(p => p.name === 'image');

    const today = new Date().toISOString().split('T')[0];

    // Create Airtable record
    const fields = {
      'Title': `${overlord} — ${today}`,
      'Overlord': overlord,
      'Submission Date': today,
      'X Account': xAccount || 'Anonymous',
    };

    const airtableRes = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE)}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_PAT}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields, typecast: true }),
      }
    );

    if (!airtableRes.ok) {
      const errBody = await airtableRes.text();
      console.error('Airtable create error:', airtableRes.status, errBody);
      return res.status(airtableRes.status).json({
        error: 'Airtable submission failed',
        details: errBody,
      });
    }

    const record = await airtableRes.json();

    // Attach image to Airtable record if provided
    let imageAttached = false;
    if (imagePart && imagePart.data.length > 0 && record.id) {
      try {
        const ext = (imagePart.contentType || 'image/png').includes('png') ? 'png' : 'jpg';
        const uploadBoundary = '----AirtableUpload' + Date.now();
        const filename = `submission.${ext}`;

        // Build multipart body for Airtable upload
        const preamble = Buffer.from(
          `--${uploadBoundary}\r\n` +
          `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n` +
          `Content-Type: ${imagePart.contentType || 'image/png'}\r\n\r\n`
        );
        const epilogue = Buffer.from(`\r\n--${uploadBoundary}--\r\n`);
        const uploadBody = Buffer.concat([preamble, imagePart.data, epilogue]);

        const uploadRes = await fetch(
          `https://content.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE)}/${record.id}/Image/uploadAttachment`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${AIRTABLE_PAT}`,
              'Content-Type': `multipart/form-data; boundary=${uploadBoundary}`,
            },
            body: uploadBody,
          }
        );

        if (uploadRes.ok) {
          imageAttached = true;
        } else {
          const errBody = await uploadRes.text();
          console.error('Airtable image upload failed:', uploadRes.status, errBody);
        }
      } catch (e) {
        console.error('Image upload exception:', e);
      }
    }

    return res.status(200).json({ ok: true, record: { id: record.id }, imageAttached });
  } catch (e) {
    console.error('Submit error:', e);
    return res.status(500).json({ error: 'Submission failed' });
  }
};

// Simple multipart parser
function parseMultipart(body, boundary) {
  const parts = [];
  const boundaryBuf = Buffer.from(`--${boundary}`);
  const endBuf = Buffer.from(`--${boundary}--`);

  let start = indexOf(body, boundaryBuf, 0);
  if (start === -1) return parts;

  while (true) {
    // Move past boundary + CRLF
    start += boundaryBuf.length;
    if (body.slice(start, start + 2).toString() === '--') break; // end boundary
    start += 2; // skip CRLF

    // Find end of headers (double CRLF)
    const headerEnd = indexOf(body, Buffer.from('\r\n\r\n'), start);
    if (headerEnd === -1) break;

    const headerStr = body.slice(start, headerEnd).toString();
    const dataStart = headerEnd + 4;

    // Find next boundary
    const nextBoundary = indexOf(body, boundaryBuf, dataStart);
    if (nextBoundary === -1) break;

    // Data ends 2 bytes before next boundary (CRLF)
    const data = body.slice(dataStart, nextBoundary - 2);

    // Parse headers
    const nameMatch = headerStr.match(/name="([^"]+)"/);
    const filenameMatch = headerStr.match(/filename="([^"]+)"/);
    const ctMatch = headerStr.match(/Content-Type:\s*(.+)/i);

    parts.push({
      name: nameMatch ? nameMatch[1] : '',
      filename: filenameMatch ? filenameMatch[1] : null,
      contentType: ctMatch ? ctMatch[1].trim() : null,
      data,
    });

    start = nextBoundary;
  }

  return parts;
}

function getFieldValue(parts, name) {
  const part = parts.find(p => p.name === name);
  return part ? part.data.toString() : null;
}

function indexOf(buf, search, fromIndex) {
  for (let i = fromIndex; i <= buf.length - search.length; i++) {
    let found = true;
    for (let j = 0; j < search.length; j++) {
      if (buf[i + j] !== search[j]) {
        found = false;
        break;
      }
    }
    if (found) return i;
  }
  return -1;
}
