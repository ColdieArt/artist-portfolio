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
  const initialFormula = category
    ? `AND({Approved}=1,LOWER({Category})="${category.toLowerCase().replace(/"/g, '\\"')}")`
    : `{Approved}=1`;

  // Build a URL with optional formula and sort.
  function buildUrl({ formula, sort }) {
    const params = new URLSearchParams();
    if (sort) {
      params.set('sort[0][field]', sort);
      params.set('sort[0][direction]', 'desc');
    }
    if (formula) params.set('filterByFormula', formula);
    return `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE)}?${params.toString()}`;
  }

  const attempts = [];
  let formulaAttempt = initialFormula;
  let sortAttempt = 'Date';
  let resp, body;

  // Try up to ~10 attempts, progressively relaxing the query.
  for (let i = 0; i < 10; i++) {
    resp = await fetch(buildUrl({ formula: formulaAttempt, sort: sortAttempt }), {
      headers: { Authorization: `Bearer ${AIRTABLE_PAT}` },
    });
    body = await resp.text();
    if (resp.ok) break;

    attempts.push({ formula: formulaAttempt, sort: sortAttempt, status: resp.status, body: body.slice(0, 200) });

    let handled = false;
    try {
      const parsed = JSON.parse(body);
      const msg = parsed?.error?.message || '';
      const type = parsed?.error?.type || '';
      const unknownFieldMatch = msg.match(/Unknown field name:\s*"([^"]+)"/);

      if (type === 'UNKNOWN_FIELD_NAME' && unknownFieldMatch) {
        const field = unknownFieldMatch[1];
        if (sortAttempt && field === sortAttempt) {
          // Sort field doesn't exist — drop the sort.
          sortAttempt = null;
          handled = true;
        } else if (formulaAttempt && new RegExp(`\\{${field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\}`).test(formulaAttempt)) {
          formulaAttempt = stripFieldFromFormula(formulaAttempt, field);
          if (!formulaAttempt) formulaAttempt = null;
          handled = true;
        }
      } else if (/INVALID_(?:SORT|FILTER)/i.test(type) || /sort/i.test(msg)) {
        // Sort or filter is malformed — relax it.
        if (sortAttempt) { sortAttempt = null; handled = true; }
        else if (formulaAttempt) { formulaAttempt = null; handled = true; }
      } else if (resp.status === 422 || resp.status === 400) {
        // Last-resort fallback: drop sort then formula.
        if (sortAttempt) { sortAttempt = null; handled = true; }
        else if (formulaAttempt) { formulaAttempt = null; handled = true; }
      }
    } catch (_) { /* not JSON; fall through */ }

    if (!handled) break;
  }

  if (!resp.ok) {
    return res.status(resp.status).json({ error: 'Airtable read failed', details: body, attempts });
  }

  try {
    const data = JSON.parse(body);
    // If we had to drop the formula, filter client-side to preserve the gate.
    if (!formulaAttempt && Array.isArray(data.records)) {
      data.records = data.records.filter(r => {
        if (!r.fields) return false;
        if (r.fields.Approved !== true && r.fields.Approved !== 1) return false;
        if (category) {
          const cat = (r.fields.Category || '').toString().toLowerCase();
          if (cat !== category.toLowerCase()) return false;
        }
        return true;
      });
      // Re-sort by Date desc (string) or createdTime fallback.
      data.records.sort((a, b) => {
        const ad = a.fields?.Date || a.createdTime;
        const bd = b.fields?.Date || b.createdTime;
        return String(bd).localeCompare(String(ad));
      });
    }
    res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
    return res.status(200).json({ ...data, _attempts: attempts.length, _droppedSort: !sortAttempt, _droppedFormula: !formulaAttempt });
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
