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

  if (!process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
    return res.status(500).json({ error: 'R2 credentials not configured on server' });
  }

  try {
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

    const imagePart = parts.find(p => p.name === 'image' && p.filename);
    if (!imagePart || imagePart.data.length === 0) {
      return res.status(400).json({ error: 'No image provided' });
    }

    if (imagePart.data.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'File too large (max 5MB)' });
    }

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const ext = (imagePart.contentType || '').includes('png') ? 'png' : 'jpg';
    const key = `exports/${id}.${ext}`;
    const imgContentType = imagePart.contentType || 'image/png';

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

    const host = req.headers['x-forwarded-host'] || req.headers.host || 'knowyouroverlord.art';
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const imageUrl = `${proto}://${host}/api/image?key=${encodeURIComponent(key)}`;

    return res.status(200).json({ ok: true, id, key, url: imageUrl });
  } catch (e) {
    console.error('Upload error:', e);
    return res.status(500).json({ error: 'Upload failed', details: e.message });
  }
};

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
