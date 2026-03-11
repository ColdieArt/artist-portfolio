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
  const AIRTABLE_TABLE = process.env.AIRTABLE_TABLE_NAME || process.env.AIRTABLE_SUBMISSIONS_TABLE || 'Submissions';

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
    const overlord = getFieldValue(parts, 'overlord') || 'unknown';
    const xAccount = getFieldValue(parts, 'xAccount') || '';
    const title = getFieldValue(parts, 'title') || '';

    // Upload image or video directly to R2 via S3 API
    let imageUrl = '';
    const imagePart = parts.find(p => p.name === 'image' && p.filename) || parts.find(p => p.name === 'video' && p.filename);
    if (imagePart && imagePart.data.length > 0) {
      if (imagePart.data.length > 10 * 1024 * 1024) {
        return res.status(400).json({ error: 'File too large (max 10MB)' });
      }

      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const isVideo = (imagePart.contentType || '').includes('video/') || (imagePart.filename || '').endsWith('.mp4');
      const ext = isVideo ? 'mp4' : (imagePart.contentType || '').includes('png') ? 'png' : 'jpg';
      const key = `exports/${id}.${ext}`;
      const imgContentType = isVideo ? 'video/mp4' : (imagePart.contentType || 'image/png');

      const s3 = getS3Client();
      await s3.send(new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: imagePart.data,
        ContentType: imgContentType,
        Metadata: {
          overlord,
          date: new Date().toISOString().split('T')[0],
          uploadedat: new Date().toISOString(),
        },
      }));

      // Build a public image URL served through our own API
      const host = req.headers['x-forwarded-host'] || req.headers.host || 'knowyouroverlord.art';
      const proto = req.headers['x-forwarded-proto'] || 'https';
      imageUrl = `${proto}://${host}/api/image?key=${encodeURIComponent(key)}`;
    }

    const today = new Date().toISOString().split('T')[0];

    const fields = {
      'Title': title || `${overlord} — ${today}`,
      'Overlord': overlord,
      'Submission Date': today,
      'X Account': xAccount || 'Anonymous',
    };

    if (imageUrl) {
      fields['Image URL'] = imageUrl;
    }

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
    return res.status(200).json({ ok: true, record: { id: record.id }, imageUrl });
  } catch (e) {
    console.error('Submit error:', e);
    return res.status(500).json({ error: 'Submission failed', details: e.message });
  }
};

// Simple multipart parser
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
