const WORKER_URL = process.env.GALLERY_WORKER_URL || 'https://te-gallery-api.coldieart.workers.dev';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Forward the raw request body to the worker
    const chunks = [];
    await new Promise((resolve, reject) => {
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', resolve);
      req.on('error', reject);
    });
    const body = Buffer.concat(chunks);

    const workerRes = await fetch(WORKER_URL + '/upload', {
      method: 'POST',
      headers: { 'Content-Type': req.headers['content-type'] || '' },
      body,
    });

    const data = await workerRes.json();
    return res.status(workerRes.status).json(data);
  } catch (e) {
    console.error('Upload proxy error:', e.message);
    return res.status(502).json({ error: 'Upload service unavailable' });
  }
};
