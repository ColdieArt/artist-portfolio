// Per-submission share endpoint.
// Returns an HTML page with Twitter/OG meta tags pointing at the submission's
// image + title + contributor, then redirects a real visitor to the gallery
// with that piece auto-opened in the lightbox.
//
// X/Twitter, Facebook, Slack, etc. fetch this URL, read the meta tags, and
// render a rich preview card. Humans clicking the link land on the gallery.
//
// Route: GET /share/<recordId>  (vercel.json rewrites to /api/share/<recordId>)

module.exports = async (req, res) => {
  const recordId = (req.query.recordId || '').toString();
  const isValidId = /^rec[a-zA-Z0-9]{14,18}$/.test(recordId);

  const SITE_URL = process.env.SITE_URL || 'https://www.knowyouroverlord.art';
  const SUBJ_ID = '01';
  const targetUrl = `${SITE_URL}/subj/${SUBJ_ID}?p=${encodeURIComponent(recordId)}`;

  if (!isValidId) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(400).send(redirectHtml(`${SITE_URL}/subj/${SUBJ_ID}`, 'Invalid share link'));
  }

  const AIRTABLE_PAT = process.env.AIRTABLE_PAT || process.env.AIRTABLE_TOKEN;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  const AIRTABLE_TABLE = process.env.AIRTABLE_TABLE_NAME || process.env.AIRTABLE_SUBMISSIONS_TABLE || 'Submissions';

  let title = 'A submission';
  let contributor = 'an artist';
  let imageUrl = `${SITE_URL}/images/og-default.jpg`;

  // Try to enrich with the actual record's data. Fail soft — if Airtable is
  // unreachable we still serve a usable share page.
  if (AIRTABLE_PAT && AIRTABLE_BASE_ID) {
    try {
      const r = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE)}/${recordId}`,
        { headers: { Authorization: `Bearer ${AIRTABLE_PAT}` } }
      );
      if (r.ok) {
        const data = await r.json();
        const f = data.fields || {};
        if (f.Title) title = String(f.Title);
        if (f.Contributor) contributor = String(f.Contributor);
        else if (f['X Account']) contributor = String(f['X Account']);
        // Prefer the stable R2/worker public URL stored in 'Image URL' over
        // Airtable's attachment URL — Airtable signs attachment URLs with a
        // short expiry, so the X scraper may hit an expired URL and cache
        // a blank card image. The Image URL field points at the worker which
        // is always publicly accessible.
        if (f['Image URL']) imageUrl = String(f['Image URL']);
        else if (Array.isArray(f.Image) && f.Image[0] && f.Image[0].url) imageUrl = f.Image[0].url;
      }
    } catch (_) { /* fall through to defaults */ }
  }

  const pageTitle = `Vote for "${title}" — SUBJ:01 The Singularity`;
  const description = `By ${contributor} in @coldie's SUBJ:01 — Tech Epochalypse Remix Competition. Cast your vote for the Community Pick.`;

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(pageTitle)}</title>
<meta name="description" content="${esc(description)}">

<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="Tech Epochalypse">
<meta property="og:url" content="${esc(targetUrl)}">
<meta property="og:title" content="${esc(pageTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${esc(imageUrl)}">
<meta property="og:image:alt" content="${esc(title)}">

<!-- Twitter / X -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@coldie">
<meta name="twitter:creator" content="@coldie">
<meta name="twitter:title" content="${esc(pageTitle)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${esc(imageUrl)}">
<meta name="twitter:image:alt" content="${esc(title)}">

<!-- Redirect humans to the gallery; bots/scrapers read the meta tags above -->
<meta http-equiv="refresh" content="0; url=${esc(targetUrl)}">
<script>setTimeout(function(){ window.location.replace(${JSON.stringify(targetUrl)}) }, 50)</script>

<style>
  html,body { margin:0; padding:0; background:#000; color:#fff; font-family:monospace; }
  .wrap { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:24px; text-align:center; }
  a { color:#fff; text-decoration:underline; }
  img { max-width:90vw; max-height:60vh; object-fit:contain; margin-bottom:24px; opacity:0.85; }
  p { font-size:13px; letter-spacing:0.1em; text-transform:uppercase; opacity:0.6; }
</style>
</head>
<body>
<div class="wrap">
  <img src="${esc(imageUrl)}" alt="${esc(title)}">
  <p>Opening submission… <a href="${esc(targetUrl)}">Continue &rarr;</a></p>
</div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300');
  return res.status(200).send(html);
};

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function redirectHtml(url, msg) {
  return `<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=${esc(url)}"><title>${esc(msg || 'Redirecting')}</title>`;
}
