const WORKER_URL = process.env.GALLERY_WORKER_URL || 'https://te-gallery-api.coldieart.workers.dev';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const workerRes = await fetch(WORKER_URL + '/gallery');
    const data = await workerRes.json();
    return res.status(workerRes.status).json(data);
  } catch (e) {
    console.error('Gallery proxy error:', e.message);
    return res.status(502).json({ error: 'Gallery service unavailable' });
  }
};
