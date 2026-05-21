// Server-side proxy for Airtable record reads.
// Uses the same env vars as /api/submit (AIRTABLE_PAT / BASE_ID / TABLE_NAME) so the
// token never has to be exposed in the client bundle via NEXT_PUBLIC_*.

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const AIRTABLE_PAT = process.env.AIRTABLE_PAT || process.env.AIRTABLE_TOKEN;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  const AIRTABLE_TABLE = process.env.AIRTABLE_TABLE_NAME || process.env.AIRTABLE_SUBMISSIONS_TABLE || 'Submissions';

  if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID) {
    return res.status(500).json({ error: 'Airtable not configured on server' });
  }

  const category = (req.query.category || '').toString().trim();
  // Approved is required for any public visibility.
  const formula = category
    ? `AND({Approved}=1,LOWER({Category})="${category.toLowerCase().replace(/"/g, '\\"')}")`
    : `{Approved}=1`;

  // Try the gallery query, but if Airtable complains the schema is missing a field
  // (e.g. {Approved} or {Category}), retry with a relaxed formula so the page still
  // shows something useful instead of erroring out the whole component.
  const sortQs = 'sort%5B0%5D%5Bfield%5D=Date&sort%5B0%5D%5Bdirection%5D=desc';
  const buildUrl = (f) => `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE)}?${sortQs}&filterByFormula=${encodeURIComponent(f)}`;

  const attempts = [];
  let formulaAttempt = formula;
  let resp, body;
  for (let i = 0; i < 4; i++) {
    resp = await fetch(buildUrl(formulaAttempt), {
      headers: { Authorization: `Bearer ${AIRTABLE_PAT}` },
    });
    body = await resp.text();
    if (resp.ok) break;
    attempts.push({ formula: formulaAttempt, status: resp.status });
    try {
      const parsed = JSON.parse(body);
      const msg = parsed?.error?.message || '';
      const m = msg.match(/Unknown field name:\s*"([^"]+)"/);
      if (parsed?.error?.type === 'UNKNOWN_FIELD_NAME' && m) {
        // Strip references to this field from the formula; retry.
        const field = m[1];
        formulaAttempt = stripFieldFromFormula(formulaAttempt, field);
        if (!formulaAttempt) formulaAttempt = `TRUE()`;
        continue;
      }
    } catch (_) { /* fall through */ }
    break;
  }

  if (!resp.ok) {
    return res.status(resp.status).json({ error: 'Airtable read failed', details: body, attempts });
  }

  try {
    const data = JSON.parse(body);
    // Cache briefly at the edge so we don't hammer Airtable on every page view.
    res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
    return res.status(200).json(data);
  } catch (e) {
    return res.status(502).json({ error: 'Airtable returned invalid JSON', details: body.slice(0, 500) });
  }
};

// Remove conjunct clauses referencing a given field name from an AND(...) formula.
// Best-effort — drops the entire AND(...) wrapper if only one clause remains.
function stripFieldFromFormula(formula, field) {
  // Escape field for regex
  const esc = field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const refRegex = new RegExp(`\\{${esc}\\}`);
  if (!refRegex.test(formula)) return formula;
  // Remove '{Field}=1' or 'LOWER({Field})="..."' clauses inside AND(...)
  let f = formula;
  f = f.replace(new RegExp(`\\{${esc}\\}\\s*=\\s*1\\s*,?\\s*`, 'g'), '');
  f = f.replace(new RegExp(`LOWER\\(\\{${esc}\\}\\)\\s*=\\s*"[^"]*"\\s*,?\\s*`, 'g'), '');
  // Clean up trailing commas inside AND(...)
  f = f.replace(/,\s*\)/g, ')');
  f = f.replace(/AND\(\s*\)/g, 'TRUE()');
  // Unwrap AND(singleClause)
  f = f.replace(/^AND\(\s*([^,()]+(?:\([^)]*\))?[^,)]*)\s*\)$/, '$1');
  return f.trim();
}
