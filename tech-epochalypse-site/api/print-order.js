const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || '8cd572b8af641d3f03353b7cd96a1a78';
const R2_BUCKET = process.env.R2_BUCKET_NAME || 'te-gallery';

function getS3Client() {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const AIRTABLE_PAT = process.env.AIRTABLE_PAT || process.env.AIRTABLE_TOKEN;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  const AIRTABLE_TABLE = 'lisbon';

  if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID) {
    return res.status(500).json({ error: 'Airtable not configured on server' });
  }

  if (!process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
    return res.status(500).json({ error: 'R2 credentials not configured on server' });
  }

  try {
    // Parse multipart form data
    const chunks = [];
    await new Promise((resolve, reject) => {
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', resolve);
      req.on('error', reject);
    });
    const body = Buffer.concat(chunks);

    const contentType = req.headers['content-type'] || '';
    const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^\s;]+))/);
    if (!boundaryMatch) {
      return res.status(400).json({ error: 'Invalid multipart form data' });
    }
    const boundary = boundaryMatch[1] || boundaryMatch[2];

    const parts = parseMultipart(body, boundary);
    const email = getFieldValue(parts, 'email') || '';
    const compositionJson = getFieldValue(parts, 'compositionJson') || '';

    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    const id = `lisbon-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const today = new Date().toISOString().split('T')[0];
    const s3 = getS3Client();

    // Upload PNG to R2
    let imageUrl = '';
    const imagePart = parts.find(p => p.name === 'image' && p.filename);
    if (imagePart && imagePart.data.length > 0) {
      if (imagePart.data.length > 15 * 1024 * 1024) {
        return res.status(400).json({ error: 'Image too large (max 15MB)' });
      }
      const imgKey = `print-orders/${id}.png`;
      await s3.send(new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: imgKey,
        Body: imagePart.data,
        ContentType: 'image/png',
        Metadata: { email, date: today },
      }));
      const host = req.headers['x-forwarded-host'] || req.headers.host || 'knowyouroverlord.art';
      const proto = req.headers['x-forwarded-proto'] || 'https';
      imageUrl = `${proto}://${host}/api/image?key=${encodeURIComponent(imgKey)}`;
    }

    // Upload JSON to R2
    let jsonUrl = '';
    if (compositionJson) {
      const jsonKey = `print-orders/${id}.json`;
      await s3.send(new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: jsonKey,
        Body: Buffer.from(compositionJson, 'utf-8'),
        ContentType: 'application/json',
        Metadata: { email, date: today },
      }));
      const host = req.headers['x-forwarded-host'] || req.headers.host || 'knowyouroverlord.art';
      const proto = req.headers['x-forwarded-proto'] || 'https';
      jsonUrl = `${proto}://${host}/api/image?key=${encodeURIComponent(jsonKey)}`;
    }

    // Create Airtable record in 'lisbon' table
    const fields = {
      'Email': email,
      'Date': today,
    };
    if (imageUrl) fields['Image URL'] = imageUrl;
    // Send JSON as a file attachment (Airtable fetches from the R2 URL)
    if (jsonUrl) fields['Composition JSON'] = [{ url: jsonUrl, filename: `${id}.json` }];

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
      // Parse Airtable error for a human-readable message
      let detail = errBody;
      try {
        const parsed = JSON.parse(errBody);
        if (parsed.error) {
          detail = parsed.error.message || parsed.error.type || errBody;
        }
      } catch (_) {}
      return res.status(airtableRes.status).json({
        error: 'Airtable submission failed',
        details: detail,
      });
    }

    const record = await airtableRes.json();
    return res.status(200).json({ ok: true, record: { id: record.id }, imageUrl, jsonUrl });
  } catch (e) {
    console.error('Print order error:', e);
    return res.status(500).json({ error: 'Submission failed', details: e.message });
  }
};

// Simple multipart parser (same as submit.js)
function parseMultipart(body, boundary) {
  const parts = [];
  const boundaryBuf = Buffer.from(`--${boundary}`);

  let start = indexOf(body, boundaryBuf, 0);
  if (start === -1) return parts;

  while (true) {
    start += boundaryBuf.length;
    if (body.slice(start, start + 2).toString() === '--') break;
    start += 2;

    const headerEnd = indexOf(body, Buffer.from('\r\n\r\n'), start);
    if (headerEnd === -1) break;

    const headerStr = body.slice(start, headerEnd).toString();
    const dataStart = headerEnd + 4;

    const nextBoundary = indexOf(body, boundaryBuf, dataStart);
    if (nextBoundary === -1) break;

    const data = body.slice(dataStart, nextBoundary - 2);

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
      if (buf[i + j] !== search[j]) { found = false; break; }
    }
    if (found) return i;
  }
  return -1;
}
