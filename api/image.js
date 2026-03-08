const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');

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

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const key = req.query.key;
  if (!key) {
    return res.status(400).json({ error: 'Missing key parameter' });
  }

  if (!process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
    return res.status(500).json({ error: 'R2 credentials not configured' });
  }

  try {
    const s3 = getS3Client();
    const response = await s3.send(new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
    }));

    const contentType = response.ContentType || 'image/png';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    const chunks = [];
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    res.setHeader('Content-Length', buffer.length);
    return res.status(200).end(buffer);
  } catch (e) {
    if (e.name === 'NoSuchKey' || e.$metadata?.httpStatusCode === 404) {
      return res.status(404).json({ error: 'Image not found' });
    }
    console.error('Image fetch error:', e);
    return res.status(500).json({ error: 'Failed to fetch image' });
  }
};
