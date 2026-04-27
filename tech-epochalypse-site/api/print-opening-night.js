const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { Resend } = require('resend');

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || '8cd572b8af641d3f03353b7cd96a1a78';
const R2_BUCKET = process.env.R2_BUCKET_NAME || 'te-gallery';
const AIRTABLE_TABLE = 'OPENING NIGHT';
const FROM_EMAIL = 'Coldie <coldie@knowyouroverlord.art>';

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

function formatPrintNumber(n) {
  return '#' + String(n).padStart(4, '0');
}

function buildEmailHtml(printNumberStr, imageUrl) {
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#111;">
  <p style="font-size:16px;line-height:1.5;">Thank you for 'touching the art' with Coldie's Tech Epochalypse kinetic 3D collage. Your print number is <strong>${printNumberStr}</strong>. See thumbnail to confirm your customized layout. Visit print team to collect your print and have it signed by Coldie on opening night.</p>
  <div style="margin-top:24px;text-align:center;">
    <img src="${imageUrl}" alt="Your custom layout ${printNumberStr}" style="max-width:600px;width:100%;height:auto;border:1px solid #ddd;" />
  </div>
  <p style="margin-top:24px;font-size:13px;color:#666;">Print number: ${printNumberStr}<br/>If your number does not match the layout, please show this email to gallery staff.</p>
</div>`;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const AIRTABLE_PAT = process.env.AIRTABLE_PAT || process.env.AIRTABLE_TOKEN;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID) {
    return res.status(500).json({ error: 'Airtable not configured on server' });
  }
  if (!process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
    return res.status(500).json({ error: 'R2 credentials not configured on server' });
  }
  if (!RESEND_API_KEY) {
    return res.status(500).json({ error: 'Resend not configured on server' });
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
    const email = (getFieldValue(parts, 'email') || '').trim();
    const compositionJson = getFieldValue(parts, 'compositionJson') || '';
    const localRef = (getFieldValue(parts, 'localRef') || '').trim();

    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const id = `opening-night-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const today = new Date().toISOString().split('T')[0];
    const s3 = getS3Client();
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'knowyouroverlord.art';
    const proto = req.headers['x-forwarded-proto'] || 'https';

    const imagePart = parts.find(p => p.name === 'image' && p.filename);
    if (!imagePart || imagePart.data.length === 0) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    if (imagePart.data.length > 30 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image too large (max 30MB)' });
    }

    const imgKey = `opening-night/${id}.jpg`;
    await s3.send(new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: imgKey,
      Body: imagePart.data,
      ContentType: 'image/jpeg',
      Metadata: { email, date: today },
    }));
    const imageUrl = `${proto}://${host}/api/image?key=${encodeURIComponent(imgKey)}`;

    let jsonUrl = '';
    if (compositionJson) {
      const jsonKey = `opening-night/${id}.json`;
      await s3.send(new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: jsonKey,
        Body: Buffer.from(compositionJson, 'utf-8'),
        ContentType: 'application/json',
        Metadata: { email, date: today },
      }));
      jsonUrl = `${proto}://${host}/api/image?key=${encodeURIComponent(jsonKey)}`;
    }

    const fields = {
      'Email': email,
      'JPEG': imageUrl,
      'Status': 'pending',
    };
    if (jsonUrl) fields['Composition JSON'] = jsonUrl;
    if (localRef) fields['Notes'] = `Local ref: ${localRef}`;

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
      let detail = errBody;
      try {
        const parsed = JSON.parse(errBody);
        if (parsed.error) detail = parsed.error.message || parsed.error.type || errBody;
      } catch (_) {}
      return res.status(airtableRes.status).json({
        error: 'Airtable submission failed',
        details: detail,
        imageUrl,
      });
    }

    const record = await airtableRes.json();
    const printNumberRaw = record.fields && record.fields['Print #'];
    const printNumberStr = printNumberRaw != null ? formatPrintNumber(printNumberRaw) : '#????';

    let emailSent = false;
    let emailError = null;
    try {
      const resend = new Resend(RESEND_API_KEY);
      const sendRes = await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: `Your Tech Epochalypse print ${printNumberStr}`,
        html: buildEmailHtml(printNumberStr, imageUrl),
      });
      if (sendRes && sendRes.error) {
        emailError = sendRes.error.message || String(sendRes.error);
      } else {
        emailSent = true;
      }
    } catch (e) {
      emailError = e.message || String(e);
      console.error('Resend send error:', e);
    }

    return res.status(200).json({
      ok: true,
      printNumber: printNumberRaw,
      printNumberStr,
      record: { id: record.id },
      imageUrl,
      jsonUrl,
      emailSent,
      emailError,
    });
  } catch (e) {
    console.error('Print opening-night error:', e);
    return res.status(500).json({ error: 'Submission failed', details: e.message });
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

module.exports.config = { api: { bodyParser: false } };
