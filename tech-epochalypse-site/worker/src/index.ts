interface Env {
  GALLERY_BUCKET: R2Bucket;
  VOTES_KV: KVNamespace;
  VS_DB: D1Database;
  VS_ADMIN_TOKEN: string;
  TURNSTILE_SECRET: string;
  RESEND_API_KEY: string;
  CONTACT_EMAIL: string;
  AIRTABLE_PAT: string;
  AIRTABLE_BASE_ID: string;
  AIRTABLE_TABLE_NAME: string;
  // Optional: separate table (same base) for the Rivera project's print
  // submissions. Routed to when the submission's `overlord` is 'rivera'.
  // Falls back to the literal table name 'Rivera Prints' if the secret is unset.
  AIRTABLE_TABLE_RIVERA?: string;

  // ─── Rivera print-on-demand (all optional; the whole flow stays dormant
  // until these are set, so deploying without them changes nothing) ───
  // HMAC key used to sign the unguessable order token in the offer email.
  RIVERA_ORDER_SECRET?: string;
  // Stripe secret key — enables the /rivera/order/<token> checkout endpoint.
  STRIPE_SECRET_KEY?: string;
  // Retail price of one 18×12 giclée, in the smallest currency unit (e.g. 9500 = $95.00).
  RIVERA_PRINT_PRICE_CENTS?: string;
  // ISO currency for the sale (default 'usd').
  RIVERA_PRINT_CURRENCY?: string;
  // Comma-separated ISO country codes Stripe will let the buyer ship to.
  RIVERA_SHIP_COUNTRIES?: string;
  // Phase 2 (Stripe webhook → Prodigi order + tracking email).
  STRIPE_WEBHOOK_SECRET?: string;
  PRODIGI_API_KEY?: string;
  PRODIGI_SKU?: string;
  // Prodigi API base — defaults to SANDBOX (no charge, no fulfilment). Set to
  // 'https://api.prodigi.com' to go live.
  PRODIGI_BASE_URL?: string;
  // Prodigi shipping method: Budget | Standard | StandardPlus | Express | Overnight.
  PRODIGI_SHIPPING_METHOD?: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

// ───────────────────────────── SUBJ events ─────────────────────────────
// Every submission is tagged with an event id (stored in Airtable's
// `Category` column and D1's `images.event`). SUBJ:01 entries predate the
// tag: their Airtable Category is the legacy 'general submission' string and
// their D1 rows carry the migration default 'subj-01'.
//
// ACTIVE_EVENT scopes the /vs voting tool (pairs, votes, leaderboard, per-IP
// quota) so a new competition never mixes with an archived one. Submission
// and voting windows are enforced server-side from the dates below; the
// admin token (X-Admin-Token) bypasses both gates for testing.
type SubjEvent = {
  id: string;            // 'subj-02'
  label: string;         // 'SUBJ:02'
  submitOpen: number;    // epoch ms (inclusive)
  submitClose: number;   // epoch ms (exclusive)
  voteOpen: number;
  voteClose: number;
};
const SUBJ_EVENTS: Record<string, SubjEvent> = {
  'subj-01': {
    id: 'subj-01', label: 'SUBJ:01',
    submitOpen: Date.UTC(2026, 4, 23, 13), submitClose: Date.UTC(2026, 4, 29, 7),
    voteOpen: Date.UTC(2026, 4, 29, 7), voteClose: Date.UTC(2026, 5, 11, 7),
  },
  // AGI Has Arrived — Jensen Huang only. All times Pacific (UTC-7 in Sep/Oct):
  //   submissions  Wed Sep 9 09:00 ET  →  Wed Sep 23 23:59 PT
  //   voting       Wed Sep 23 00:00 PT →  Wed Sep 30 23:59 PT
  'subj-02': {
    id: 'subj-02', label: 'SUBJ:02',
    // ⚠️ TEMP (2026-09-08): opened early so Coldie can test the Airtable
    // submission flow. Restore to Date.UTC(2026, 8, 9, 13) (Sep 9, 9 AM ET)
    // before announcing, or leave as-is if early entries are acceptable.
    submitOpen: Date.UTC(2026, 8, 8, 0), submitClose: Date.UTC(2026, 8, 24, 7),
    voteOpen: Date.UTC(2026, 8, 23, 7), voteClose: Date.UTC(2026, 9, 1, 7),
  },
};
const ACTIVE_EVENT = 'subj-02';
const LEGACY_CATEGORY = 'general submission';

// Map the client-supplied Airtable Category → D1 event id.
function eventFromCategory(category: string): string {
  return category in SUBJ_EVENTS ? category : 'subj-01';
}
function fmtPT(ms: number): string {
  return new Date(ms).toLocaleString('en-US', { timeZone: 'America/Los_Angeles', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) + ' PT';
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    // Normalize pathname: strip trailing slash (except root)
    const path = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, '') : url.pathname;

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // POST /upload — accept JPEG blob + metadata
    if (request.method === 'POST' && path === '/upload') {
      return handleUpload(request, env);
    }

    // GET /gallery — list all submissions
    if (request.method === 'GET' && path === '/gallery') {
      return handleList(request, env);
    }

    // GET /entries?category=subj-02 — approved Airtable records for one SUBJ
    // event (the live entries wall on /subj/<id>). Read-only, edge-cached.
    if (request.method === 'GET' && path === '/entries') {
      return handleEntries(request, env);
    }
    // GET /admin/entries.csv?category=subj-02|all&token=… — full Airtable
    // export (every field, incl. email / ETH address) as a CSV download.
    if (request.method === 'GET' && path === '/admin/entries.csv') {
      return handleEntriesCsv(request, env);
    }

    // GET /image/:key — serve an image from R2
    if (request.method === 'GET' && path.startsWith('/image/')) {
      return handleImage(path.slice(7), env);
    }

    // POST /submit — upload image + create Airtable record in one step
    if (request.method === 'POST' && path === '/submit') {
      return handleSubmit(request, env);
    }

    // POST /api/contact — inquiry form with Turnstile CAPTCHA
    if (request.method === 'POST' && path === '/api/contact') {
      return handleContact(request, env);
    }

    // POST /rivera/stripe-webhook — payment succeeded → place the Prodigi order.
    if (request.method === 'POST' && path === '/rivera/stripe-webhook') {
      return handleStripeWebhook(request, env);
    }
    // POST /rivera/prodigi/callback — Prodigi order-status updates → Airtable + tracking email.
    if (request.method === 'POST' && path === '/rivera/prodigi/callback') {
      return handleProdigiCallback(request, env);
    }
    // GET /rivera/order/success — post-payment thank-you page.
    if (request.method === 'GET' && path === '/rivera/order/success') {
      return handleRiveraOrderSuccess();
    }
    // GET /rivera/order/<token> — verify the signed token from the offer email
    // and start a Stripe Checkout session for that person's exact layout.
    if (request.method === 'GET' && path.startsWith('/rivera/order/')) {
      return handleRiveraOrder(request, env, decodeURIComponent(path.slice('/rivera/order/'.length)));
    }

    // POST /vote — cast a vote on a gallery submission (Turnstile + IP rate-limit + honeypot)
    if (request.method === 'POST' && path === '/vote') {
      return handleVote(request, env);
    }

    // GET /votes/recent — trending vote counts over the last N days (default 7)
    if (request.method === 'GET' && path === '/votes/recent') {
      return handleRecentVotes(request, env);
    }

    // /vs/* — Tinder-style pairwise voting tool (Elo). Independent from the
    // ♥-style /vote system above — uses D1 (VS_DB) instead of KV (VOTES_KV).
    if (request.method === 'GET' && path === '/vs/pair') {
      return handleVsPair(request, env);
    }
    if (request.method === 'POST' && path === '/vs/vote') {
      return handleVsVote(request, env);
    }
    if (request.method === 'GET' && path === '/vs/leaderboard') {
      return handleVsLeaderboard(request, env);
    }
    if (request.method === 'GET' && path === '/vs/admin/pending') {
      return handleVsPending(request, env);
    }
    if (request.method === 'GET' && path === '/vs/admin/list') {
      return handleVsAdminList(request, env);
    }
    if (request.method === 'POST' && path === '/vs/admin/decide') {
      return handleVsDecide(request, env);
    }
    if (request.method === 'POST' && path === '/vs/admin/sync') {
      return handleVsSync(request, env);
    }
    if (request.method === 'POST' && path === '/vs/admin/airtable-import') {
      return handleVsAirtableImport(request, env);
    }

    return json({ error: 'Not found', path, method: request.method }, 404);
  },
};

async function handleUpload(request: Request, env: Env): Promise<Response> {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;
    const overlord = (formData.get('overlord') as string) || 'unknown';

    if (!file) {
      return json({ error: 'No image provided' }, 400);
    }

    if (file.size > 96 * 1024 * 1024) {
      return json({ error: `File too large (got ${(file.size / 1048576).toFixed(2)}MB, max 96MB)` }, 400);
    }

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const ext = file.type === 'image/png' ? 'png' : 'jpg';
    const key = `exports/${id}.${ext}`;

    const fileBytes = await file.arrayBuffer();

    await env.GALLERY_BUCKET.put(key, fileBytes, {
      httpMetadata: { contentType: file.type || 'image/png' },
      customMetadata: {
        overlord,
        date: new Date().toISOString().split('T')[0],
        uploadedAt: new Date().toISOString(),
      },
    });

    const workerUrl = new URL(request.url);
    const imageUrl = `${workerUrl.origin}/image/${key}`;
    return json({ ok: true, id, key, url: imageUrl });
  } catch (e) {
    console.error('Upload error:', e);
    return json({ error: 'Upload failed' }, 500);
  }
}

async function handleSubmit(request: Request, env: Env): Promise<Response> {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;
    // Optional smaller thumbnail JPEG produced client-side. Used for the
    // Airtable Image attachment when present (Airtable can't reliably
    // attach 25MB+ files). Falls back to the full-size image URL if the
    // client didn't send one.
    const thumb = formData.get('thumb') as File | null;
    const overlord = (formData.get('overlord') as string) || 'unknown';
    const xAccount = (formData.get('xAccount') as string) || '';
    const title = (formData.get('title') as string) || '';
    const ethAddress = (formData.get('ethAddress') as string) || '';
    const email = (formData.get('email') as string) || '';
    const composition = (formData.get('composition') as string) || '';
    // Which SUBJ event this entry belongs to. Editors send e.g. 'subj-02';
    // older clients send nothing and fall back to the legacy category.
    const category = ((formData.get('category') as string) || LEGACY_CATEGORY).trim();
    const event = eventFromCategory(category);

    // Enforce the submission window for tagged events (admin bypasses).
    const evt = SUBJ_EVENTS[category];
    if (evt && !isAdmin(request, env)) {
      const now = Date.now();
      if (now < evt.submitOpen) {
        return json({ error: `${evt.label} submissions open ${fmtPT(evt.submitOpen)}`, windowClosed: true }, 403);
      }
      if (now >= evt.submitClose) {
        return json({ error: `${evt.label} submissions closed ${fmtPT(evt.submitClose)}`, windowClosed: true }, 403);
      }
    }

    if (!env.AIRTABLE_PAT || !env.AIRTABLE_BASE_ID || !env.AIRTABLE_TABLE_NAME) {
      return json({ error: 'Airtable not configured on server' }, 500);
    }

    // Rivera project prints go to their own table in the SAME base; everything
    // else (Tech Epochalypse overlords) uses the default table. Backward-compatible.
    const airtableTable = overlord === 'rivera'
      ? (env.AIRTABLE_TABLE_RIVERA || 'Rivera Prints')
      : env.AIRTABLE_TABLE_NAME;

    // Read file bytes upfront so we can use them for both R2 and Airtable
    let fileBytes: ArrayBuffer | null = null;
    let fileContentType = 'image/png';
    if (file && file.size > 0) {
      if (file.size > 96 * 1024 * 1024) {
        return json({ error: `File too large (got ${(file.size / 1048576).toFixed(2)}MB, max 96MB)` }, 400);
      }
      fileBytes = await file.arrayBuffer();
      fileContentType = file.type || 'image/png';
    }

    // Upload image to R2 if provided
    let imageUrl = '';
    let r2Key = '';
    if (fileBytes) {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const ext = fileContentType === 'image/png' ? 'png' : 'jpg';
      const key = `exports/${id}.${ext}`;
      r2Key = key;

      await env.GALLERY_BUCKET.put(key, fileBytes, {
        httpMetadata: { contentType: fileContentType },
        customMetadata: {
          overlord,
          event,
          date: new Date().toISOString().split('T')[0],
          uploadedAt: new Date().toISOString(),
        },
      });

      const workerUrl = new URL(request.url);
      imageUrl = `${workerUrl.origin}/image/${key}`;
    }

    // Upload thumbnail to R2 if the client supplied one. Used as the
    // Airtable Image-attachment URL so the attachment column displays
    // reliably even when the full export is 25MB+.
    let thumbUrl = '';
    if (thumb && thumb.size > 0) {
      try {
        const thumbBytes = await thumb.arrayBuffer();
        const thumbId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-thumb`;
        const thumbKey = `exports/${thumbId}.jpg`;
        await env.GALLERY_BUCKET.put(thumbKey, thumbBytes, {
          httpMetadata: { contentType: thumb.type || 'image/jpeg' },
          customMetadata: {
            overlord,
            kind: 'thumbnail',
            date: new Date().toISOString().split('T')[0],
            uploadedAt: new Date().toISOString(),
          },
        });
        const workerUrl = new URL(request.url);
        thumbUrl = `${workerUrl.origin}/image/${thumbKey}`;
      } catch (e) {
        console.error('Thumbnail upload failed:', e);
      }
    }

    // Upload composition JSON to R2 (when provided)
    let jsonUrl = '';
    if (composition && composition.length > 0) {
      try {
        const jsonId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const jsonKey = `compositions/${jsonId}.json`;
        await env.GALLERY_BUCKET.put(jsonKey, composition, {
          httpMetadata: { contentType: 'application/json' },
          customMetadata: { overlord, date: new Date().toISOString().split('T')[0] },
        });
        const workerUrl = new URL(request.url);
        jsonUrl = `${workerUrl.origin}/image/${jsonKey}`;
      } catch (e) {
        console.error('Composition upload failed:', e);
      }
    }

    // Register the submission in the /vs voting pool as pending (admin approves later).
    // We register the THUMBNAIL URL (when the client supplied a thumb) rather than
    // the full-size URL so the voting UI loads quickly. Falls back to the full
    // image for older clients that didn't generate a thumb.
    if (r2Key && env.VS_DB && overlord !== 'rivera') {
      try {
        await env.VS_DB.prepare(
          `INSERT OR IGNORE INTO images (id, overlord, title, image_url, elo, votes, wins, losses, status, created_at, event)
           VALUES (?1, ?2, ?3, ?4, 1500, 0, 0, 0, 'pending', ?5, ?6)`
        )
          .bind(r2Key, overlord, title || '', thumbUrl || imageUrl, Date.now(), event)
          .run();
      } catch (e) {
        console.error('VS_DB insert (submit) failed:', e);
      }
    }

    const today = new Date().toISOString().split('T')[0];

    // Build Airtable record with R2 image URL in a text field
    // Fields: Title, Image URL, Overlord, Date, Contributor, Category
    const fields: Record<string, unknown> = {
      'Title': title || `${overlord} — ${today}`,
      'Overlord': overlord,
      'Submission Date': today,
      'Date': today,
      'X Account': xAccount || 'Anonymous',
      'Contributor': xAccount || 'Anonymous',
      'Category': category,
    };
    if (ethAddress) fields['ETH Address'] = ethAddress;
    if (email) fields['Email'] = email;

    if (imageUrl) {
      // 'Image URL' text field always points at the full-size export so
      // anyone clicking through gets the original quality.
      fields['Image URL'] = imageUrl;
      // The 'Image' attachment column gets the smaller thumbnail URL when
      // the client sent one (~0.5-2MB), or falls back to the full-size
      // URL on older clients. Airtable's attachment service fetches this
      // URL itself — keeping it small avoids silent attachment failures
      // when the full export is over the plan's per-attachment cap.
      const imgFilename = `${overlord}-${Date.now()}.jpg`;
      const attachmentUrl = thumbUrl || imageUrl;
      fields['Image'] = [{ url: attachmentUrl, filename: imgFilename }];
    }
    if (jsonUrl) {
      // Send the JSON to a few likely column names so it lands in the
      // base regardless of which one the schema actually uses.
      // 'JSON URL' — text field for a clickable URL
      // 'JSON'     — attachment field (Airtable downloads the .json into the cell)
      fields['JSON URL'] = jsonUrl;
      const jsonFilename = `composition-${Date.now()}.json`;
      fields['JSON'] = [{ url: jsonUrl, filename: jsonFilename }];
    }

    // Retry the Airtable write, peeling off any field the schema doesn't have.
    const droppedFields: string[] = [];
    let airtableRes!: Response;
    let errBody = '';
    for (let attempt = 0; attempt < 12; attempt++) {
      airtableRes = await fetch(
        `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${encodeURIComponent(airtableTable)}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.AIRTABLE_PAT}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fields, typecast: true }),
        }
      );
      if (airtableRes.ok) break;
      errBody = await airtableRes.text();
      let unknownField: string | null = null;
      try {
        const parsed = JSON.parse(errBody) as { error?: { type?: string; message?: string } };
        if (parsed?.error?.type === 'UNKNOWN_FIELD_NAME') {
          const m = parsed.error.message && parsed.error.message.match(/Unknown field name:\s*"([^"]+)"/);
          if (m) unknownField = m[1];
        }
      } catch (_) { /* ignore */ }
      if (!unknownField || !(unknownField in fields)) break;
      droppedFields.push(unknownField);
      delete fields[unknownField];
    }

    if (!airtableRes.ok) {
      console.error('Airtable create error:', airtableRes.status, errBody, 'dropped:', droppedFields);
      return json({ error: 'Airtable submission failed', details: errBody, droppedFields }, airtableRes.status);
    }
    if (droppedFields.length) console.warn('[submit] dropped unknown Airtable fields:', droppedFields);

    const record = (await airtableRes.json()) as { id: string };

    // Rivera print-on-demand: email the submitter an offer to buy a giclée of
    // the exact layout they just registered. Fully automated (fires on every
    // Rivera submit). No-op unless the print flow is configured, and wrapped so
    // an email failure can never fail the submission itself.
    if (overlord === 'rivera') {
      console.log('[rivera-offer] submit gate:', {
        hasEmail: !!email, hasImageUrl: !!imageUrl, recordId: record?.id || null,
      });
      if (email && imageUrl && record?.id) {
        try {
          const base = new URL(request.url).origin;
          await sendRiveraPrintOffer(env, base, { email, name: xAccount, imageUrl, recordId: record.id });
        } catch (e) {
          console.error('Rivera offer email failed (non-fatal):', e);
        }
      }
    }

    return json({ ok: true, record, imageUrl });
  } catch (e) {
    console.error('Submit error:', e);
    return json({ error: 'Submission failed' }, 500);
  }
}

async function handleList(request: Request, env: Env): Promise<Response> {
  const listed = await env.GALLERY_BUCKET.list({ prefix: 'exports/', limit: 100 });
  const origin = new URL(request.url).origin;

  const items = await Promise.all(
    listed.objects.map(async (obj) => {
      const head = await env.GALLERY_BUCKET.head(obj.key);
      return {
        id: obj.key.replace('exports/', '').replace(/\.(jpg|png)$/, ''),
        key: obj.key,
        imageUrl: `${origin}/image/${obj.key}`,
        overlord: head?.customMetadata?.overlord || 'unknown',
        date: head?.customMetadata?.date || '',
        size: obj.size,
      };
    })
  );

  // Newest first
  items.sort((a, b) => b.id.localeCompare(a.id));

  return json(items);
}

// GET /entries?category=subj-02
// Approved Airtable records for one SUBJ event, in the same {records:[…]}
// shape the old /api/airtable-records proxy returned, so the existing
// gallery components can consume it unchanged. Only a whitelist of fields is
// exposed (no emails / wallet addresses). Cached at the edge for 60s.
async function handleEntries(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const category = (url.searchParams.get('category') || ACTIVE_EVENT).trim();
  if (!/^[\w\s-]{1,40}$/.test(category)) return json({ error: 'Invalid category' }, 400);
  if (!env.AIRTABLE_PAT || !env.AIRTABLE_BASE_ID || !env.AIRTABLE_TABLE_NAME) {
    return json({ error: 'Airtable not configured on server' }, 500);
  }

  // Edge cache (60s). Responses are re-wrapped on the way out so CORS
  // headers are always present regardless of what the cache preserved.
  const cache = caches.default;
  const cacheKey = new Request(`${url.origin}/entries?category=${encodeURIComponent(category)}`, { method: 'GET' });
  const entriesHeaders = {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=60',
    ...CORS_HEADERS,
  };
  const hit = await cache.match(cacheKey);
  if (hit) return new Response(hit.body, { status: hit.status, headers: entriesHeaders });

  try {
    const safeCat = category.replace(/'/g, "\\'");
    const formula = `AND({Approved}=1, {Category}='${safeCat}')`;
    const fieldsWanted = ['Title', 'Image', 'Approved', 'Category', 'Overlord', 'Contributor', 'X Account', 'Image URL', 'Submission Date'];
    const records: unknown[] = [];
    let offset: string | undefined;
    for (let page = 0; page < 20; page++) {
      const qs = new URLSearchParams({ filterByFormula: formula, pageSize: '100' });
      for (const f of fieldsWanted) qs.append('fields[]', f);
      if (offset) qs.set('offset', offset);
      const res = await fetch(
        `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${encodeURIComponent(env.AIRTABLE_TABLE_NAME)}?${qs}`,
        { headers: { Authorization: `Bearer ${env.AIRTABLE_PAT}` } }
      );
      if (!res.ok) {
        const body = await res.text();
        console.error('[entries] Airtable read failed:', res.status, body);
        return json({ error: 'Airtable read failed', status: res.status }, 502);
      }
      const data = (await res.json()) as { records?: unknown[]; offset?: string };
      records.push(...(data.records || []));
      offset = data.offset;
      if (!offset) break;
    }

    const out = new Response(JSON.stringify({ category, count: records.length, records }), {
      status: 200,
      headers: entriesHeaders,
    });
    await cache.put(cacheKey, out.clone());
    return out;
  } catch (e) {
    console.error('[entries] error:', e);
    return json({ error: 'Failed to load entries' }, 500);
  }
}

// GET /admin/entries.csv?category=subj-02|all — admin only.
// Streams every Airtable record for the category as CSV. Attachment fields
// are flattened to their first URL; multi-value fields are joined with " | ".
async function handleEntriesCsv(request: Request, env: Env): Promise<Response> {
  if (!isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401);
  const url = new URL(request.url);
  const category = (url.searchParams.get('category') || ACTIVE_EVENT).trim();
  if (!/^[\w\s-]{1,40}$/.test(category)) return json({ error: 'Invalid category' }, 400);
  if (!env.AIRTABLE_PAT || !env.AIRTABLE_BASE_ID || !env.AIRTABLE_TABLE_NAME) {
    return json({ error: 'Airtable not configured on server' }, 500);
  }
  try {
    type Rec = { id: string; createdTime: string; fields: Record<string, unknown> };
    const records: Rec[] = [];
    let offset: string | undefined;
    for (let page = 0; page < 50; page++) {
      const qs = new URLSearchParams({ pageSize: '100' });
      if (category !== 'all') qs.set('filterByFormula', `{Category}='${category.replace(/'/g, "\\'")}'`);
      if (offset) qs.set('offset', offset);
      const res = await fetch(
        `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${encodeURIComponent(env.AIRTABLE_TABLE_NAME)}?${qs}`,
        { headers: { Authorization: `Bearer ${env.AIRTABLE_PAT}` } }
      );
      if (!res.ok) return json({ error: 'Airtable read failed', status: res.status, body: await res.text() }, 502);
      const data = (await res.json()) as { records?: Rec[]; offset?: string };
      records.push(...(data.records || []));
      offset = data.offset;
      if (!offset) break;
    }

    // Column order: stable, well-known fields first, then anything else seen.
    const preferred = ['Title', 'Contributor', 'X Account', 'Email', 'ETH Address', 'Overlord', 'Category', 'Approved', 'Submission Date', 'Date', 'Image URL', 'Image', 'JSON URL', 'JSON'];
    const seen = new Set<string>();
    for (const r of records) for (const k of Object.keys(r.fields)) seen.add(k);
    const columns = [...preferred.filter((c) => seen.has(c)), ...[...seen].filter((c) => !preferred.includes(c)).sort()];

    const cell = (v: unknown): string => {
      let out: string;
      if (v == null) out = '';
      else if (Array.isArray(v)) {
        out = v.map((x) => (x && typeof x === 'object' && 'url' in (x as object) ? String((x as { url: string }).url) : String(x))).join(' | ');
      } else if (typeof v === 'object') out = JSON.stringify(v);
      else out = String(v);
      return /[",\r\n]/.test(out) ? `"${out.replace(/"/g, '""')}"` : out;
    };
    const lines = [['Record ID', 'Created', ...columns].map(cell).join(',')];
    for (const r of records) lines.push([r.id, r.createdTime, ...columns.map((c) => r.fields[c])].map(cell).join(','));
    const csv = '\uFEFF' + lines.join('\r\n') + '\r\n';
    const stamp = new Date().toISOString().slice(0, 10);
    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${category === 'all' ? 'all-submissions' : category}-${stamp}.csv"`,
        'Cache-Control': 'no-store',
        ...CORS_HEADERS,
      },
    });
  } catch (e) {
    console.error('[entries.csv] error:', e);
    return json({ error: 'Failed to export entries' }, 500);
  }
}

async function handleContact(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json() as {
      name?: string;
      email?: string;
      inquiryType?: string;
      message?: string;
      turnstileToken?: string;
    };

    const { name, email, inquiryType, message, turnstileToken } = body;

    if (!name || !email || !message || !turnstileToken) {
      return json({ error: 'All fields are required' }, 400);
    }

    // Verify Turnstile CAPTCHA
    const turnstileRes = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: env.TURNSTILE_SECRET,
          response: turnstileToken,
          remoteip: request.headers.get('CF-Connecting-IP') || '',
        }),
      }
    );

    const turnstileData = await turnstileRes.json() as { success: boolean };
    if (!turnstileData.success) {
      return json({ error: 'CAPTCHA verification failed' }, 403);
    }

    // Store inquiry in R2 as a backup record
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const inquiry = {
      id,
      name,
      email,
      inquiryType: inquiryType || 'General Inquiry',
      message,
      submittedAt: new Date().toISOString(),
    };

    await env.GALLERY_BUCKET.put(
      `inquiries/${id}.json`,
      JSON.stringify(inquiry, null, 2),
      {
        httpMetadata: { contentType: 'application/json' },
        customMetadata: { type: 'inquiry', email },
      }
    );

    // Send email via Resend if configured
    const contactEmail = env.CONTACT_EMAIL || 'coldieart@gmail.com';
    if (env.RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Tech Epochalypse <noreply@knowyouroverlord.art>',
          to: [contactEmail],
          reply_to: email,
          subject: `Collect Inquiry: ${inquiryType || 'General'} — ${name}`,
          text: [
            `New collect inquiry from ${name}`,
            `Email: ${email}`,
            `Type: ${inquiryType || 'General Inquiry'}`,
            '',
            'Message:',
            message,
            '',
            `Submitted: ${inquiry.submittedAt}`,
            `ID: ${id}`,
          ].join('\n'),
        }),
      });
    }

    return json({ ok: true, id });
  } catch (e) {
    return json({ error: 'Failed to process inquiry' }, 500);
  }
}

async function handleImage(key: string, env: Env): Promise<Response> {
  const decodedKey = decodeURIComponent(key);
  const object = await env.GALLERY_BUCKET.get(decodedKey);
  if (!object) {
    return json({ error: 'Image not found', key: decodedKey }, 404);
  }

  const filename = decodedKey.split('/').pop() || 'image.png';
  return new Response(object.body, {
    headers: {
      'Content-Type': object.httpMetadata?.contentType || 'image/png',
      'Content-Length': String(object.size),
      'Content-Disposition': `inline; filename="${filename}"`,
      'Cache-Control': 'public, max-age=31536000, immutable',
      ...CORS_HEADERS,
    },
  });
}

// ─── VOTE ENDPOINT ─────────────────────────────────────────────────────────
// POST /vote with JSON body: { recordId: string, turnstileToken: string, website?: string }
// - 'website' is a honeypot field: any non-empty value is treated as a bot.
// - Validates Turnstile, then IP rate-limits 1 vote per (IP, recordId) per 24h via KV.
// - Increments the 'Votes' number field on the Airtable record.

async function handleVote(request: Request, env: Env): Promise<Response> {
  try {
    let body: { recordId?: string; turnstileToken?: string; website?: string };
    try { body = await request.json(); }
    catch { return json({ error: 'Invalid JSON body' }, 400); }

    const recordId = (body.recordId || '').toString().trim();
    const turnstileToken = (body.turnstileToken || '').toString();
    const honeypot = (body.website || '').toString();

    if (!recordId || !/^rec[a-zA-Z0-9]{14,18}$/.test(recordId)) {
      return json({ error: 'Invalid recordId' }, 400);
    }

    // Honeypot — silently accept (200) so bots think they succeeded, but do nothing.
    if (honeypot.length > 0) {
      return json({ ok: true, votes: -1, _hp: true });
    }

    // Turnstile validation
    if (!turnstileToken) return json({ error: 'Missing Turnstile token' }, 400);
    if (!env.TURNSTILE_SECRET) return json({ error: 'Turnstile not configured on server' }, 500);

    const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '0.0.0.0';

    const tsForm = new FormData();
    tsForm.set('secret', env.TURNSTILE_SECRET);
    tsForm.set('response', turnstileToken);
    tsForm.set('remoteip', ip);
    const tsRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: tsForm,
    });
    const tsBody = await tsRes.json() as { success?: boolean; 'error-codes'?: string[] };
    if (!tsBody.success) {
      return json({ error: 'Turnstile verification failed', codes: tsBody['error-codes'] || [] }, 403);
    }

    // GLOBAL 24h IP rate-limit — one vote per IP across the whole event,
    // regardless of which record was voted for (Community Pick semantics:
    // each voter picks ONE favorite). KV value stores the recordId so the
    // client can show which submission the voter already backed.
    const ipHash = await sha256Hex(ip + '|' + env.AIRTABLE_BASE_ID);
    const key = `vote:${ipHash}`;
    const existing = await env.VOTES_KV.get(key);
    if (existing) {
      return json({ error: 'Already voted in the last 24h', alreadyVoted: true, votedFor: existing }, 429);
    }
    // Reserve the slot up-front; rollback below if Airtable write fails.
    await env.VOTES_KV.put(key, recordId, { expirationTtl: 60 * 60 * 24 });

    // Increment Votes on the Airtable record. Fetch current, +1, PATCH.
    const airtableUrl = `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${encodeURIComponent(env.AIRTABLE_TABLE_NAME)}/${recordId}`;
    const getRes = await fetch(airtableUrl, {
      headers: { Authorization: `Bearer ${env.AIRTABLE_PAT}` },
    });
    if (!getRes.ok) {
      // Rollback the rate-limit so the user can retry.
      await env.VOTES_KV.delete(key);
      const errBody = await getRes.text();
      return json({ error: 'Record not found', details: errBody }, getRes.status);
    }
    const getJson = await getRes.json() as { fields?: { Votes?: number } };
    const current = Number(getJson.fields?.Votes || 0);
    const next = current + 1;

    const patchRes = await fetch(airtableUrl, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${env.AIRTABLE_PAT}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: { Votes: next }, typecast: true }),
    });
    if (!patchRes.ok) {
      await env.VOTES_KV.delete(key);
      const errBody = await patchRes.text();
      return json({ error: 'Vote write failed', details: errBody }, patchRes.status);
    }

    // Trending bucket: count this vote in today's per-record bucket so
    // /votes/recent can sum up the last N days. 8-day TTL keeps a 7-day
    // window always backed by full buckets and self-cleans old data.
    try {
      const today = new Date().toISOString().split('T')[0];
      const trendKey = `votes:daily:${today}:${recordId}`;
      const cur = await env.VOTES_KV.get(trendKey);
      const n = (cur ? parseInt(cur, 10) : 0) + 1;
      await env.VOTES_KV.put(trendKey, String(n), { expirationTtl: 60 * 60 * 24 * 8 });
    } catch (_) { /* trending is best-effort; don't fail the vote */ }

    return json({ ok: true, votes: next });
  } catch (e) {
    console.error('handleVote error:', e);
    return json({ error: 'Vote failed', details: (e as Error).message }, 500);
  }
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// GET /votes/recent?days=7 — returns trending vote counts over a window.
// Aggregates per-day buckets written by handleVote into { recordId: count }.
// Cached briefly at the edge so gallery pages don't hammer KV on every load.
async function handleRecentVotes(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const daysParam = parseInt(url.searchParams.get('days') || '7', 10);
    const days = Math.max(1, Math.min(7, isNaN(daysParam) ? 7 : daysParam));

    // Build list of YYYY-MM-DD dates for the window (today + previous days-1)
    const dates: string[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      dates.push(d.toISOString().split('T')[0]);
    }

    // List & sum all matching keys per date prefix.
    const counts: Record<string, number> = {};
    for (const date of dates) {
      let cursor: string | undefined = undefined;
      do {
        const list: KVNamespaceListResult<unknown> = await env.VOTES_KV.list({ prefix: `votes:daily:${date}:`, cursor });
        for (const k of list.keys) {
          // Key shape: votes:daily:<date>:<recordId>
          const parts = k.name.split(':');
          const recordId = parts[3];
          if (!recordId) continue;
          const v = await env.VOTES_KV.get(k.name);
          const n = v ? parseInt(v, 10) : 0;
          counts[recordId] = (counts[recordId] || 0) + (isNaN(n) ? 0 : n);
        }
        cursor = list.list_complete ? undefined : list.cursor;
      } while (cursor);
    }

    return new Response(JSON.stringify({ days, counts }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=30, s-maxage=60',
        ...CORS_HEADERS,
      },
    });
  } catch (e) {
    console.error('handleRecentVotes error:', e);
    return json({ error: 'Trending fetch failed', details: (e as Error).message }, 500);
  }
}

// ---------- /vs voting tool ----------

type ImageRow = {
  id: string;
  overlord: string;
  title: string;
  image_url: string;
  elo: number;
  votes: number;
  wins: number;
  losses: number;
  status: string;
  created_at: number;
  event: string;
};
const IMAGE_COLS = 'id, overlord, title, image_url, elo, votes, wins, losses, status, created_at, event';

// Hash by IP only. We deliberately drop the User-Agent (which would give the
// same person on Safari vs Chrome two separate quotas) so the per-IP vote cap
// can't be circumvented by switching browsers on the same device/network.
async function voterHash(request: Request): Promise<string> {
  const ip = request.headers.get('CF-Connecting-IP') || '';
  const data = new TextEncoder().encode(`ip:${ip}`);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32);
}

function isAdmin(request: Request, env: Env): boolean {
  const provided =
    request.headers.get('X-Admin-Token') ||
    new URL(request.url).searchParams.get('token') ||
    '';
  return !!env.VS_ADMIN_TOKEN && provided === env.VS_ADMIN_TOKEN;
}

// GET /vs/pair?overlord=slug|all
// Strategy: every approved image gets exposure to every voter before any
// image is shown twice.
//   - Compute the voter hash from the request.
//   - Sort the approved pool by (a) how many times THIS voter has already
//     seen the image, ascending — so unseen-to-this-voter images come first
//     — then by (b) total votes ascending so brand-new entries also get a
//     boost, then random tiebreak.
//   - Pick A from the front tier, then B from the front of the remainder.
//     Both A and B are drawn from low-exposure candidates, so high-vote
//     images don't get stranded behind a uniform-random opponent slot.
async function handleVsPair(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const overlord = url.searchParams.get('overlord') || 'all';
    const event = eventParam(url);
    const closed = votingClosedReason(event);
    if (closed && !isAdmin(request, env)) {
      return json({ error: closed, votingClosed: true, event }, 403);
    }
    const hash = await voterHash(request);

    const params: unknown[] = [hash, 'approved'];
    let where = '';
    if (event !== 'all') { params.push(event); where += ` AND i.event = ?${params.length}`; }
    if (overlord !== 'all') { params.push(overlord); where += ` AND i.overlord = ?${params.length}`; }

    const pool = await env.VS_DB.prepare(
      `SELECT i.id, i.overlord, i.title, i.image_url, i.elo, i.votes, i.wins, i.losses, i.status, i.created_at, i.event,
              (SELECT COUNT(*) FROM votes v
               WHERE v.voter_hash = ?1
                 AND (v.winner_id = i.id OR v.loser_id = i.id)) AS voter_seen
       FROM images i
       WHERE i.status = ?2 ${where}
       ORDER BY voter_seen ASC, i.votes ASC, RANDOM()`
    )
      .bind(...params)
      .all<ImageRow & { voter_seen: number }>();

    const rows = pool.results || [];
    if (rows.length < 2) {
      return json({ error: 'Not enough approved images for this filter', count: rows.length }, 404);
    }

    // Strict-tier selection: always prefer the lowest voter_seen count first.
    // Within a tier, prefer the lowest total-vote count next; ties broken
    // randomly. This guarantees that every image is shown to the voter
    // exactly once before any image is shown twice, then twice before any
    // third, and so on — given a large enough vote budget.
    function pickFromTier(candidates: (ImageRow & { voter_seen: number })[]) {
      if (!candidates.length) return null;
      const minSeen = candidates[0].voter_seen;
      const sameSeen = candidates.filter((r) => r.voter_seen === minSeen);
      const minVotes = sameSeen.reduce((m, r) => Math.min(m, r.votes), Infinity);
      const eligible = sameSeen.filter((r) => r.votes === minVotes);
      return eligible[Math.floor(Math.random() * eligible.length)];
    }

    const a = pickFromTier(rows);
    if (!a) return json({ error: 'Could not select A' }, 500);
    const b = pickFromTier(rows.filter((r) => r.id !== a.id));
    if (!b) return json({ error: 'Could not select B' }, 500);

    // Shuffle which one is on the left.
    const [left, right] = Math.random() < 0.5 ? [a, b] : [b, a];
    return json({ left: stripImage(left), right: stripImage(right), overlord, event });
  } catch (e) {
    console.error('vs/pair error:', e);
    return json({ error: 'Failed to get pair' }, 500);
  }
}

function stripImage(r: ImageRow) {
  return {
    id: r.id,
    overlord: r.overlord,
    title: r.title,
    imageUrl: r.image_url,
    elo: Math.round(r.elo),
    votes: r.votes,
    event: r.event,
  };
}

// Resolve the ?event= query param: defaults to the active event; 'all'
// disables the filter (admin views only).
function eventParam(url: URL): string {
  return url.searchParams.get('event') || ACTIVE_EVENT;
}
// Voting-window gate for an event. Returns null when voting is open.
function votingClosedReason(eventId: string): string | null {
  const evt = SUBJ_EVENTS[eventId];
  if (!evt) return null;
  const now = Date.now();
  if (now < evt.voteOpen) return `${evt.label} voting opens ${fmtPT(evt.voteOpen)}`;
  if (now >= evt.voteClose) return `${evt.label} voting closed ${fmtPT(evt.voteClose)}`;
  return null;
}

// POST /vs/vote { winner: id, loser: id }
async function handleVsVote(request: Request, env: Env): Promise<Response> {
  try {
    const body = (await request.json()) as { winner?: string; loser?: string };
    const winnerId = body.winner;
    const loserId = body.loser;
    if (!winnerId || !loserId || winnerId === loserId) {
      return json({ error: 'Invalid vote payload' }, 400);
    }

    const [winner, loser] = await Promise.all([
      env.VS_DB.prepare(
        `SELECT ${IMAGE_COLS}
         FROM images WHERE id = ?1`
      )
        .bind(winnerId)
        .first<ImageRow>(),
      env.VS_DB.prepare(
        `SELECT ${IMAGE_COLS}
         FROM images WHERE id = ?1`
      )
        .bind(loserId)
        .first<ImageRow>(),
    ]);

    if (!winner || !loser) return json({ error: 'Image not found' }, 404);
    if (winner.status !== 'approved' || loser.status !== 'approved') {
      return json({ error: 'Image not approved' }, 400);
    }
    // Only the active event accepts votes, and never across events — an
    // archived SUBJ:01 entry can't be paired against a SUBJ:02 one.
    const event = winner.event;
    if (event !== loser.event) return json({ error: 'Cross-event pair' }, 400);
    if (event !== ACTIVE_EVENT && !isAdmin(request, env)) {
      return json({ error: `${SUBJ_EVENTS[event]?.label || event} voting is closed`, votingClosed: true }, 403);
    }
    const closed = votingClosedReason(event);
    if (closed && !isAdmin(request, env)) return json({ error: closed, votingClosed: true }, 403);

    const hash = await voterHash(request);

    // Soft rate-limit: don't double-count the same voter on the same unordered pair.
    const recent = await env.VS_DB.prepare(
      `SELECT id FROM votes
       WHERE voter_hash = ?1
         AND ((winner_id = ?2 AND loser_id = ?3) OR (winner_id = ?3 AND loser_id = ?2))
       LIMIT 1`
    )
      .bind(hash, winnerId, loserId)
      .first();
    if (recent) {
      // Same voter already weighed in on this pair — Elo unchanged, but we
      // still return a badge so the UI always shows confirmation.
      return json({ ok: true, deduped: true, badge: { kind: 'dup', label: 'ALREADY COUNTED' } });
    }

    // Per-IP vote cap. Once an IP has cast PER_IP_LIMIT counted votes, further
    // votes are rejected with a distinct status so the client can show a
    // "limit reached" message.
    const PER_IP_LIMIT = 25;
    // Quota is per event, so SUBJ:01 voters start fresh for SUBJ:02.
    const usedRow = await env.VS_DB.prepare(
      `SELECT COUNT(*) AS c FROM votes WHERE voter_hash = ?1 AND event = ?2`
    )
      .bind(hash, event)
      .first<{ c: number }>();
    const used = usedRow?.c ?? 0;
    if (used >= PER_IP_LIMIT) {
      return json(
        {
          ok: false,
          limitReached: true,
          used,
          limit: PER_IP_LIMIT,
          badge: { kind: 'limit', label: 'LIMIT REACHED' },
        },
        429
      );
    }

    // --- Pre-vote signals (used to compute the flavor badge) ---
    const preGap = Math.abs(winner.elo - loser.elo);
    const isUpset = winner.elo < loser.elo && loser.elo - winner.elo >= 100;
    const isTightCall = preGap < 30;

    // Streak check: did this image win each of its last 2 matchups?
    // Combined with the current vote that makes a 3-in-a-row streak.
    const recentForWinner = await env.VS_DB.prepare(
      `SELECT winner_id FROM votes
       WHERE winner_id = ?1 OR loser_id = ?1
       ORDER BY ts DESC
       LIMIT 2`
    )
      .bind(winnerId)
      .all<{ winner_id: string }>();
    const isStreak =
      (recentForWinner.results?.length ?? 0) === 2 &&
      recentForWinner.results!.every((r) => r.winner_id === winnerId);

    // Rank before the vote (1-based; count of strictly-higher Elo + 1).
    const beforeRankRow = await env.VS_DB.prepare(
      `SELECT COUNT(*) AS c FROM images
       WHERE status = 'approved' AND event = ?3 AND id != ?1 AND elo > ?2`
    )
      .bind(winnerId, winner.elo, event)
      .first<{ c: number }>();
    const beforeRank = (beforeRankRow?.c ?? 0) + 1;

    // Elo update, K = 32.
    const K = 32;
    const expectedW = 1 / (1 + Math.pow(10, (loser.elo - winner.elo) / 400));
    const newWinnerElo = winner.elo + K * (1 - expectedW);
    const newLoserElo = loser.elo + K * (0 - (1 - expectedW));

    const overlordTag =
      winner.overlord === loser.overlord ? winner.overlord : 'mixed';

    await env.VS_DB.batch([
      env.VS_DB.prepare(
        `UPDATE images SET elo = ?1, votes = votes + 1, wins = wins + 1 WHERE id = ?2`
      ).bind(newWinnerElo, winnerId),
      env.VS_DB.prepare(
        `UPDATE images SET elo = ?1, votes = votes + 1, losses = losses + 1 WHERE id = ?2`
      ).bind(newLoserElo, loserId),
      env.VS_DB.prepare(
        `INSERT INTO votes (winner_id, loser_id, overlord, voter_hash, ts, event) VALUES (?1, ?2, ?3, ?4, ?5, ?6)`
      ).bind(winnerId, loserId, overlordTag, hash, Date.now(), event),
    ]);

    // Rank after the vote, recomputed against the freshly-updated Elo column.
    const afterRankRow = await env.VS_DB.prepare(
      `SELECT COUNT(*) AS c FROM images
       WHERE status = 'approved' AND event = ?3 AND id != ?1 AND elo > ?2`
    )
      .bind(winnerId, newWinnerElo, event)
      .first<{ c: number }>();
    const afterRank = (afterRankRow?.c ?? 0) + 1;

    const eloDelta = Math.round(newWinnerElo - winner.elo);
    const isTopContender = afterRank <= 5;
    const isClimber = afterRank < beforeRank;

    // Priority cascade — exactly one badge per vote. Pure flavor, label only.
    let badge: { kind: string; label: string };
    if (isUpset) {
      badge = { kind: 'upset', label: 'UPSET' };
    } else if (isStreak) {
      badge = { kind: 'streak', label: 'STREAK' };
    } else if (isTopContender) {
      badge = { kind: 'top', label: 'TOP CONTENDER' };
    } else if (isClimber) {
      badge = { kind: 'climber', label: 'CLIMBER' };
    } else if (isTightCall) {
      badge = { kind: 'tight', label: 'TIGHT CALL' };
    } else {
      badge = { kind: 'delta', label: 'VOTE LOCKED' };
    }
    // Variables are still computed above for telemetry / future use.
    void eloDelta; void beforeRank; void afterRank;

    return json({
      ok: true,
      winner: { id: winnerId, elo: Math.round(newWinnerElo) },
      loser: { id: loserId, elo: Math.round(newLoserElo) },
      badge,
      used: used + 1,
      limit: PER_IP_LIMIT,
    });
  } catch (e) {
    console.error('vs/vote error:', e);
    return json({ error: 'Vote failed' }, 500);
  }
}

// GET /vs/leaderboard?overlord=slug|all&limit=50
async function handleVsLeaderboard(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const overlord = url.searchParams.get('overlord') || 'all';
    const event = eventParam(url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10) || 50, 200);

    const params: unknown[] = ['approved'];
    let where = '';
    if (event !== 'all') { params.push(event); where += ` AND event = ?${params.length}`; }
    if (overlord !== 'all') { params.push(overlord); where += ` AND overlord = ?${params.length}`; }

    const res = await env.VS_DB.prepare(
      `SELECT ${IMAGE_COLS}
       FROM images
       WHERE status = ?1 ${where}
       ORDER BY elo DESC, votes DESC
       LIMIT ${limit}`
    )
      .bind(...params)
      .all<ImageRow>();

    const vParams: unknown[] = [];
    const vWhere: string[] = [];
    if (event !== 'all') { vParams.push(event); vWhere.push(`event = ?${vParams.length}`); }
    if (overlord !== 'all') { vParams.push(overlord); vWhere.push(`(overlord = ?${vParams.length} OR overlord = "mixed")`); }
    const total = await env.VS_DB.prepare(
      `SELECT COUNT(*) AS c FROM votes ${vWhere.length ? 'WHERE ' + vWhere.join(' AND ') : ''}`
    )
      .bind(...vParams)
      .first<{ c: number }>();

    return json({
      overlord,
      event,
      totalVotes: total?.c || 0,
      items: (res.results || []).map(stripImage),
    });
  } catch (e) {
    console.error('vs/leaderboard error:', e);
    return json({ error: 'Failed to load leaderboard' }, 500);
  }
}

// GET /vs/admin/pending — admin only (kept for backwards compatibility)
async function handleVsPending(request: Request, env: Env): Promise<Response> {
  if (!isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401);
  try {
    const res = await env.VS_DB.prepare(
      `SELECT ${IMAGE_COLS}
       FROM images
       WHERE status = 'pending'
       ORDER BY created_at DESC
       LIMIT 200`
    ).all<ImageRow>();
    return json({ items: (res.results || []).map(stripImage) });
  } catch (e) {
    return json({ error: 'Failed to load pending' }, 500);
  }
}

// GET /vs/admin/list?status=approved|pending|rejected — admin only.
// Returns items for the requested status plus the count breakdown across
// all three statuses (so the UI can show tab counters in one round-trip).
async function handleVsAdminList(request: Request, env: Env): Promise<Response> {
  if (!isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401);
  const adminUrl = new URL(request.url);
  const status = (adminUrl.searchParams.get('status') || 'pending').toLowerCase();
  // Admin defaults to 'all' events so archived entries remain reachable.
  const event = adminUrl.searchParams.get('event') || 'all';
  if (!['approved', 'pending', 'rejected'].includes(status)) {
    return json({ error: 'Invalid status' }, 400);
  }
  try {
    const itemsRes = await env.VS_DB.prepare(
      `SELECT ${IMAGE_COLS}
       FROM images
       WHERE status = ?1 ${event === 'all' ? '' : 'AND event = ?2'}
       ORDER BY created_at DESC
       LIMIT 500`
    )
      .bind(...(event === 'all' ? [status] : [status, event]))
      .all<ImageRow>();

    const countsRes = await env.VS_DB.prepare(
      `SELECT status, COUNT(*) AS c FROM images GROUP BY status`
    ).all<{ status: string; c: number }>();

    const counts: Record<string, number> = { approved: 0, pending: 0, rejected: 0 };
    for (const row of countsRes.results || []) {
      counts[row.status] = row.c;
    }

    return json({
      status,
      event,
      activeEvent: ACTIVE_EVENT,
      items: (itemsRes.results || []).map(stripImage),
      counts,
    });
  } catch (e) {
    console.error('vs/admin/list error:', e);
    return json({ error: 'Failed to load list' }, 500);
  }
}

// POST /vs/admin/decide { id, decision: 'approved' | 'rejected' } — admin only
async function handleVsDecide(request: Request, env: Env): Promise<Response> {
  if (!isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401);
  try {
    const body = (await request.json()) as { id?: string; decision?: string };
    const { id, decision } = body;
    if (!id || (decision !== 'approved' && decision !== 'rejected')) {
      return json({ error: 'Invalid payload' }, 400);
    }
    await env.VS_DB.prepare(`UPDATE images SET status = ?1 WHERE id = ?2`)
      .bind(decision, id)
      .run();
    return json({ ok: true });
  } catch (e) {
    return json({ error: 'Decide failed' }, 500);
  }
}

// POST /vs/admin/sync — backfill D1 from R2 listing (one-time, idempotent). Admin only.
async function handleVsSync(request: Request, env: Env): Promise<Response> {
  if (!isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401);
  try {
    const origin = new URL(request.url).origin;
    let cursor: string | undefined = undefined;
    let inserted = 0;
    let scanned = 0;
    do {
      const listed: R2Objects = await env.GALLERY_BUCKET.list({
        prefix: 'exports/',
        limit: 500,
        cursor,
      });
      for (const obj of listed.objects) {
        scanned++;
        // Skip thumbnail objects — they're auxiliary copies of submissions
        // we already index below, not separate submissions in their own right.
        if (obj.key.endsWith('-thumb.jpg')) continue;
        const head = await env.GALLERY_BUCKET.head(obj.key);
        const overlord = head?.customMetadata?.overlord || 'unknown';
        // Prefer the matching thumbnail (exports/<id>-thumb.jpg) when present
        // so the voting UI loads small images. Falls back to the full export
        // when no thumb was generated for older submissions.
        const thumbKey = obj.key.replace(/\.(jpg|png)$/i, '-thumb.jpg');
        const thumbHead = await env.GALLERY_BUCKET.head(thumbKey).catch(() => null);
        const servedKey = thumbHead ? thumbKey : obj.key;
        const res = await env.VS_DB.prepare(
          `INSERT OR IGNORE INTO images (id, overlord, title, image_url, elo, votes, wins, losses, status, created_at)
           VALUES (?1, ?2, '', ?3, 1500, 0, 0, 0, 'pending', ?4)`
        )
          .bind(obj.key, overlord, `${origin}/image/${servedKey}`, obj.uploaded?.getTime() || Date.now())
          .run();
        if (res.meta.changes) inserted++;
      }
      cursor = listed.truncated ? listed.cursor : undefined;
    } while (cursor);
    return json({ ok: true, scanned, inserted });
  } catch (e) {
    console.error('vs/sync error:', e);
    return json({ error: 'Sync failed' }, 500);
  }
}

// POST /vs/admin/airtable-import — populate D1 from Airtable, using Airtable's
// auto-generated image thumbnails as the voting-tool image URL. Admin only.
//
// Behavior:
//   • Iterates every record in the configured Airtable table where
//     `Approved` is TRUE (matches the same filter the public gallery uses).
//   • Picks the largest available auto-thumbnail
//     (attachment.thumbnails.large.url) for each record's `Image`
//     attachment; falls back to `small` and then the raw url.
//   • Upserts each row into D1 using the Airtable record id (recXXX…) as
//     the D1 primary key, so this endpoint is idempotent — re-running it
//     refreshes URLs (Airtable URLs are signed and expire after a few
//     hours) without inserting duplicates.
//   • Imports come in as status='approved' since they're already curated
//     in Airtable.
//
// Returns: { ok, total, inserted, updated, skipped, note }
async function handleVsAirtableImport(request: Request, env: Env): Promise<Response> {
  if (!isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401);
  if (!env.AIRTABLE_PAT || !env.AIRTABLE_BASE_ID || !env.AIRTABLE_TABLE_NAME) {
    return json({ error: 'Airtable not configured on server' }, 500);
  }
  try {
    // 1. Page through every Approved record.
    type AirtableAttachment = {
      url: string;
      thumbnails?: {
        small?: { url: string };
        large?: { url: string };
        full?: { url: string };
      };
    };
    type AirtableRecord = {
      id: string;
      createdTime?: string;
      fields: {
        Overlord?: string;
        Title?: string;
        Image?: AirtableAttachment[];
        Approved?: boolean;
      };
    };

    const records: AirtableRecord[] = [];
    let offset: string | undefined;
    do {
      const u = new URL(
        `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${encodeURIComponent(env.AIRTABLE_TABLE_NAME)}`
      );
      u.searchParams.set('filterByFormula', '{Approved}=TRUE()');
      u.searchParams.set('pageSize', '100');
      if (offset) u.searchParams.set('offset', offset);
      const res = await fetch(u.toString(), {
        headers: { Authorization: `Bearer ${env.AIRTABLE_PAT}` },
      });
      if (!res.ok) {
        const t = await res.text();
        return json({ error: 'Airtable fetch failed', status: res.status, details: t }, res.status);
      }
      const data = (await res.json()) as { records?: AirtableRecord[]; offset?: string };
      records.push(...(data.records || []));
      offset = data.offset;
    } while (offset);

    // 2. Migrate each image to R2 (once) + upsert D1 row.
    //    Strategy: pick the best-available Airtable URL (raw > full thumb >
    //    large > small), download it, store in R2 under a deterministic key
    //    so re-runs are idempotent. The D1 image_url field then holds the
    //    permanent worker-served R2 URL instead of an expiring Airtable URL.
    const workerOrigin = new URL(request.url).origin;
    let inserted = 0;
    let updated = 0;
    let migrated = 0; // newly copied into R2 this run
    let skipped = 0;
    const failures: { id: string; reason: string }[] = [];

    for (const r of records) {
      const overlord = r.fields?.Overlord || 'unknown';
      const title = r.fields?.Title || '';
      const image = r.fields?.Image?.[0];
      if (!image) {
        skipped++;
        continue;
      }

      // Prefer the raw original; fall back through thumbnail sizes for
      // records where only thumbnails are reliably available.
      const sourceUrl =
        image.url ||
        image.thumbnails?.full?.url ||
        image.thumbnails?.large?.url ||
        image.thumbnails?.small?.url;
      if (!sourceUrl) {
        skipped++;
        continue;
      }

      // Determine R2 key + check existing row.
      const r2Key = `data-refinement/${r.id}.jpg`;
      const r2Url = `${workerOrigin}/image/${r2Key}`;

      const existing = await env.VS_DB.prepare(
        'SELECT id, image_url FROM images WHERE id = ?1'
      )
        .bind(r.id)
        .first<{ id: string; image_url: string }>();

      // Migrate the bytes into R2 unless the object is already there.
      const alreadyInR2 = await env.GALLERY_BUCKET.head(r2Key);
      if (!alreadyInR2) {
        try {
          const imgRes = await fetch(sourceUrl);
          if (!imgRes.ok) throw new Error(`source HTTP ${imgRes.status}`);
          const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
          const bytes = await imgRes.arrayBuffer();
          await env.GALLERY_BUCKET.put(r2Key, bytes, {
            httpMetadata: { contentType },
            customMetadata: {
              source: 'airtable',
              recordId: r.id,
              overlord,
              migratedAt: new Date().toISOString(),
            },
          });
          migrated++;
        } catch (err) {
          failures.push({ id: r.id, reason: (err as Error).message });
          skipped++;
          continue;
        }
      }

      if (existing) {
        await env.VS_DB.prepare(
          `UPDATE images SET image_url = ?1, overlord = ?2, title = ?3, status = 'approved'
           WHERE id = ?4`
        )
          .bind(r2Url, overlord, title, r.id)
          .run();
        updated++;
      } else {
        const createdAt = r.createdTime ? new Date(r.createdTime).getTime() : Date.now();
        await env.VS_DB.prepare(
          `INSERT INTO images (id, overlord, title, image_url, elo, votes, wins, losses, status, created_at)
           VALUES (?1, ?2, ?3, ?4, 1500, 0, 0, 0, 'approved', ?5)`
        )
          .bind(r.id, overlord, title, r2Url, createdAt)
          .run();
        inserted++;
      }
    }

    return json({
      ok: true,
      total: records.length,
      inserted,
      updated,
      migrated,
      skipped,
      failures,
      note:
        'Images now stored permanently in R2 under data-refinement/. ' +
        'Re-running this endpoint only re-downloads images not already in R2.',
    });
  } catch (e) {
    console.error('airtable-import error:', e);
    return json({ error: 'Airtable import failed', details: (e as Error).message }, 500);
  }
}

// ─── RIVERA PRINT-ON-DEMAND ────────────────────────────────────────────────
// Flow: PRINT (client) → /submit stores the 5400×3600 JPEG in R2 + writes the
// Airtable row → this module emails the submitter an "order your giclée" offer
// → they click the signed link → /rivera/order/<token> opens Stripe Checkout
// (collects payment + shipping address). Phase 2 (not yet built) adds the
// Stripe webhook that places the Prodigi order and the shipment-tracking email.
//
// Everything is gated on config: without RIVERA_ORDER_SECRET + STRIPE_SECRET_KEY
// + RIVERA_PRINT_PRICE_CENTS the offer email is skipped and the order endpoint
// shows a holding page, so the worker is safe to deploy before accounts exist.

// base64url helpers (WebCrypto gives us btoa/atob in the Workers runtime).
function bytesToB64url(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function strToB64url(s: string): string {
  return bytesToB64url(new TextEncoder().encode(s));
}
function b64urlToStr(s: string): string {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}
async function hmacSha256(secret: string, msg: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg));
  return new Uint8Array(sig);
}

// Stateless, unguessable order token = base64url(recordId).base64url(HMAC).
// No PII in the URL (the email/address are fetched from Airtable at order time),
// which keeps the link shareable-safe and honours the no-PII-in-URLs rule.
async function signOrderToken(recordId: string, secret: string): Promise<string> {
  const sig = await hmacSha256(secret, recordId);
  return `${strToB64url(recordId)}.${bytesToB64url(sig)}`;
}
async function verifyOrderToken(token: string, secret: string): Promise<string | null> {
  const dot = token.indexOf('.');
  if (dot < 0) return null;
  let recordId: string;
  try { recordId = b64urlToStr(token.slice(0, dot)); } catch { return null; }
  if (!/^rec[a-zA-Z0-9]{14,18}$/.test(recordId)) return null;
  const expected = bytesToB64url(await hmacSha256(secret, recordId));
  const provided = token.slice(dot + 1);
  // Constant-time-ish compare.
  if (expected.length !== provided.length) return null;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ provided.charCodeAt(i);
  return diff === 0 ? recordId : null;
}

function riveraPriceCents(env: Env): number | null {
  const n = parseInt(env.RIVERA_PRINT_PRICE_CENTS || '', 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}
function formatMoney(cents: number, currency: string): string {
  const c = currency.toLowerCase();
  // 'MX$' rather than a bare '$' so a peso price can't be misread as USD.
  const sym = c === 'gbp' ? '£' : c === 'eur' ? '€' : c === 'mxn' ? 'MX$' : '$';
  const amount = (cents / 100).toFixed(2).replace(/\.00$/, '');
  const [whole, dec] = amount.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ','); // peso prices run to 4-5 digits
  return `${sym}${grouped}${dec ? '.' + dec : ''}`;
}
function htmlResponse(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', ...CORS_HEADERS },
  });
}
function riveraPage(title: string, bodyHtml: string): string {
  return `<!doctype html><html><head><meta charset="utf-8">`
    + `<meta name="viewport" content="width=device-width, initial-scale=1">`
    + `<title>${title}</title>`
    + `<style>body{margin:0;background:#111;color:#eee;font:16px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;`
    + `display:flex;min-height:100vh;align-items:center;justify-content:center;text-align:center;padding:24px}`
    + `.card{max-width:520px}h1{font-weight:600;font-size:22px;margin:0 0 12px}p{color:#bbb;margin:8px 0}</style>`
    + `</head><body><div class="card">${bodyHtml}</div></body></html>`;
}

// Fires on every Rivera submit. No-op unless the print flow is fully configured.
async function sendRiveraPrintOffer(
  env: Env,
  base: string,
  opts: { email: string; name: string; imageUrl: string; recordId: string }
): Promise<void> {
  const secret = env.RIVERA_ORDER_SECRET;
  const priceCents = riveraPriceCents(env);
  if (!secret || !priceCents || !env.STRIPE_SECRET_KEY || !env.RESEND_API_KEY) {
    console.warn('[rivera-offer] skipped — config missing:', {
      orderSecret: !!secret, price: !!priceCents,
      stripeKey: !!env.STRIPE_SECRET_KEY, resendKey: !!env.RESEND_API_KEY,
    });
    return;
  }

  const currency = env.RIVERA_PRINT_CURRENCY || 'usd';
  const token = await signOrderToken(opts.recordId, secret);
  const orderUrl = `${base}/rivera/order/${token}`;
  const price = formatMoney(priceCents, currency);
  const greetName = opts.name && opts.name !== 'Anonymous' ? opts.name : 'there';

  const html = `<!doctype html><html><body style="margin:0;background:#0f0f0f;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#eee">`
    + `<div style="max-width:560px;margin:0 auto;padding:32px 24px">`
    + `<h1 style="font-size:22px;font-weight:600;margin:0 0 4px">Your Rivera mural is ready to print</h1>`
    + `<p style="color:#aaa;margin:0 0 20px">Hi ${greetName} — here's the layout you composed.</p>`
    + `<img src="${opts.imageUrl}" alt="Your Rivera mural layout" style="width:100%;border-radius:8px;display:block;margin:0 0 20px">`
    + `<p style="color:#ccc">Order a museum-quality <strong>18&times;12&Prime; giclée print</strong> of your exact composition, printed on demand and shipped to your door.</p>`
    + `<p style="margin:24px 0"><a href="${orderUrl}" style="display:inline-block;background:#fff;color:#111;text-decoration:none;font-weight:600;padding:14px 28px;border-radius:8px">Order your print — ${price}</a></p>`
    + `<p style="color:#777;font-size:13px">Price includes printing and shipping. You'll enter your delivery address at checkout.</p>`
    + `</div></body></html>`;

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.RESEND_API_KEY}` },
    body: JSON.stringify({
      from: 'Coldie <noreply@knowyouroverlord.art>',
      to: [opts.email],
      subject: 'Your Rivera mural is ready to print',
      html,
    }),
  });
  const resendBody = await resendRes.text();
  if (!resendRes.ok) {
    console.error('[rivera-offer] Resend rejected the send:', resendRes.status, resendBody);
  } else {
    console.log('[rivera-offer] sent to', opts.email, '→', resendBody);
  }
}

function handleRiveraOrderSuccess(): Response {
  return htmlResponse(
    riveraPage(
      'Order confirmed',
      `<h1>Thank you — your print is on its way to production.</h1>`
      + `<p>We've received your order and payment. You'll get a shipping confirmation by email once it's printed and dispatched.</p>`
    )
  );
}

async function handleRiveraOrder(request: Request, env: Env, token: string): Promise<Response> {
  const secret = env.RIVERA_ORDER_SECRET;
  const priceCents = riveraPriceCents(env);
  // Not configured yet → friendly holding page (email links won't 404).
  if (!secret || !priceCents || !env.STRIPE_SECRET_KEY) {
    return htmlResponse(
      riveraPage(
        'Print ordering — coming soon',
        `<h1>Print ordering is being set up.</h1><p>Your layout is saved. You'll be emailed as soon as prints can be ordered.</p>`
      )
    );
  }

  const recordId = await verifyOrderToken(token, secret);
  if (!recordId) {
    return htmlResponse(riveraPage('Invalid link', `<h1>This order link is invalid or has expired.</h1>`), 400);
  }

  // Fetch the layout's Airtable record for its image URL + buyer email.
  const table = env.AIRTABLE_TABLE_RIVERA || 'Rivera Prints';
  const recRes = await fetch(
    `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${encodeURIComponent(table)}/${recordId}`,
    { headers: { Authorization: `Bearer ${env.AIRTABLE_PAT}` } }
  );
  if (!recRes.ok) {
    return htmlResponse(riveraPage('Not found', `<h1>We couldn't find your artwork.</h1>`), 404);
  }
  const rec = (await recRes.json()) as { fields?: { Email?: string; 'Image URL'?: string; Title?: string } };
  const imageUrl = rec.fields?.['Image URL'] || '';
  const email = rec.fields?.Email || '';
  const title = rec.fields?.Title || 'Rivera Mural';
  if (!imageUrl) {
    return htmlResponse(riveraPage('Not ready', `<h1>Your artwork image isn't available yet.</h1>`), 409);
  }

  const base = new URL(request.url).origin;
  const currency = (env.RIVERA_PRINT_CURRENCY || 'usd').toLowerCase();
  // MX first — the mural is exhibited in Mexico, so most buyers ship domestically.
  const countries = (env.RIVERA_SHIP_COUNTRIES
    || 'MX,US,CA,GB,IE,AU,NZ,DE,FR,ES,IT,NL,SE,NO,DK,FI,CH,AT,BE,PT,JP')
    .split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);

  // Build a Stripe Checkout session (form-encoded REST — no SDK needed).
  const form = new URLSearchParams();
  form.set('mode', 'payment');
  form.set('success_url', `${base}/rivera/order/success?session_id={CHECKOUT_SESSION_ID}`);
  form.set('cancel_url', `${base}/rivera/order/${token}?canceled=1`);
  form.set('line_items[0][quantity]', '1');
  form.set('line_items[0][price_data][currency]', currency);
  form.set('line_items[0][price_data][unit_amount]', String(priceCents));
  form.set('line_items[0][price_data][product_data][name]', `${title} — 18×12″ Giclée Print`);
  form.set('line_items[0][price_data][product_data][images][0]', imageUrl);
  // Stripe's Managed Payments (on by default for newer accounts) rejects any
  // shipping parameter. We're fulfilling a PHYSICAL print, so the delivery
  // address is non-negotiable — disable managed payments for this request only,
  // which is the remedy Stripe's own error recommends. Scoped per-request so it
  // doesn't change anything else on the account.
  form.set('managed_payments[enabled]', 'false');
  countries.forEach((c, i) => form.set(`shipping_address_collection[allowed_countries][${i}]`, c));
  form.set('phone_number_collection[enabled]', 'true');
  if (email) form.set('customer_email', email);
  // Carried through to the payment webhook (Phase 2) so we know which layout to print.
  form.set('metadata[recordId]', recordId);
  form.set('metadata[imageUrl]', imageUrl);

  const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
  });
  if (!stripeRes.ok) {
    console.error('Stripe session error:', stripeRes.status, await stripeRes.text());
    return htmlResponse(riveraPage('Try again', `<h1>Checkout is temporarily unavailable.</h1><p>Please try your link again in a moment.</p>`), 502);
  }
  const session = (await stripeRes.json()) as { url?: string };
  if (!session.url) {
    return htmlResponse(riveraPage('Try again', `<h1>Checkout couldn't be started.</h1>`), 502);
  }
  return Response.redirect(session.url, 303);
}

// ─── PHASE 2: fulfilment (Stripe webhook → Prodigi order → Airtable + email) ──

function bytesToHex(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += bytes[i].toString(16).padStart(2, '0');
  return s;
}
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Verify Stripe's `Stripe-Signature` header against the RAW body (Stripe uses
// hex HMAC-SHA256 over `${t}.${rawBody}`; a header can carry several v1 sigs).
async function verifyStripeSignature(rawBody: string, sigHeader: string, secret: string): Promise<boolean> {
  if (!sigHeader) return false;
  const kv: Record<string, string[]> = {};
  for (const part of sigHeader.split(',')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    const k = part.slice(0, i), v = part.slice(i + 1);
    (kv[k] = kv[k] || []).push(v);
  }
  const t = kv['t']?.[0];
  const provided = kv['v1'] || [];
  if (!t || provided.length === 0) return false;
  // Replay guard: reject signatures older than 5 minutes.
  const ts = parseInt(t, 10);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > 300) return false;
  const expected = bytesToHex(await hmacSha256(secret, `${t}.${rawBody}`));
  return provided.some((p) => timingSafeEqual(expected, p));
}

// Token that lets only Prodigi (which received the URL) drive our callback.
async function orderCallbackToken(recordId: string, env: Env): Promise<string> {
  return bytesToB64url(await hmacSha256(env.RIVERA_ORDER_SECRET || '', 'cb:' + recordId));
}

// PATCH an Airtable record, peeling off any field the schema doesn't have
// (same tolerance as the create path, so missing columns never fail fulfilment).
async function patchAirtableTolerant(
  env: Env, table: string, recordId: string, fields: Record<string, unknown>
): Promise<boolean> {
  const url = `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${encodeURIComponent(table)}/${recordId}`;
  const f: Record<string, unknown> = { ...fields };
  const dropped: string[] = [];
  for (let attempt = 0; attempt < 12; attempt++) {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${env.AIRTABLE_PAT}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: f, typecast: true }),
    });
    if (res.ok) {
      // A PATCH that peeled every field still returns 200 while saving nothing —
      // say so loudly, otherwise the data loss is invisible.
      if (dropped.length) {
        console.warn('[rivera-airtable] columns MISSING from table "' + table + '" — data NOT saved for:', dropped);
      }
      console.log('[rivera-airtable] PATCH ok — saved:', Object.keys(f));
      return true;
    }
    const errBody = await res.text();
    let unknown: string | null = null;
    try {
      const p = JSON.parse(errBody) as { error?: { type?: string; message?: string } };
      if (p?.error?.type === 'UNKNOWN_FIELD_NAME') {
        const m = p.error.message && p.error.message.match(/Unknown field name:\s*"([^"]+)"/);
        if (m) unknown = m[1];
      }
    } catch { /* ignore */ }
    if (!unknown || !(unknown in f)) { console.error('Airtable PATCH failed:', res.status, errBody); return false; }
    dropped.push(unknown);
    delete f[unknown];
  }
  return false;
}

async function sendRiveraEmail(env: Env, to: string, subject: string, html: string): Promise<void> {
  if (!env.RESEND_API_KEY || !to) {
    console.warn('[rivera-email] skipped:', { hasResendKey: !!env.RESEND_API_KEY, to: to || '(empty)', subject });
    return;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.RESEND_API_KEY}` },
    body: JSON.stringify({ from: 'Coldie <noreply@knowyouroverlord.art>', to: [to], subject, html }),
  });
  const body = await res.text();
  if (!res.ok) console.error('[rivera-email] Resend rejected:', res.status, body, '| subject:', subject);
  else console.log('[rivera-email] sent:', subject, '→', to);
}

type StripeAddress = { line1?: string; line2?: string; city?: string; state?: string; postal_code?: string; country?: string };
type StripeShipping = { name?: string; address?: StripeAddress };
type StripeSession = {
  id: string;
  payment_status?: string;
  amount_total?: number;
  currency?: string;
  metadata?: { recordId?: string; imageUrl?: string };
  customer_details?: { email?: string; name?: string; phone?: string };
  shipping_details?: StripeShipping;                          // pre-Basil API
  collected_information?: { shipping_details?: StripeShipping }; // 2025-03-31.basil+
};

async function handleStripeWebhook(request: Request, env: Env): Promise<Response> {
  if (!env.STRIPE_WEBHOOK_SECRET) return json({ error: 'Webhook not configured' }, 503);
  const raw = await request.text(); // RAW body — required for signature verification
  const sig = request.headers.get('Stripe-Signature') || '';
  if (!(await verifyStripeSignature(raw, sig, env.STRIPE_WEBHOOK_SECRET))) {
    return json({ error: 'Invalid signature' }, 400);
  }
  let event: { type?: string; data?: { object?: StripeSession } };
  try { event = JSON.parse(raw); } catch { return json({ error: 'Bad JSON' }, 400); }
  // Only fulfil on a completed, paid Checkout Session; ack everything else.
  if (event.type !== 'checkout.session.completed') return json({ received: true, ignored: event.type });
  const session = event.data?.object;
  if (!session) return json({ received: true });
  if (session.payment_status && session.payment_status !== 'paid') return json({ received: true, unpaid: true });
  const recordId = session.metadata?.recordId;
  const imageUrl = session.metadata?.imageUrl;
  if (!recordId || !imageUrl) return json({ received: true, note: 'missing metadata' });
  try {
    await fulfilRiveraOrder(env, request, session, recordId, imageUrl);
  } catch (e) {
    // Non-2xx makes Stripe retry — safe because the Prodigi idempotencyKey
    // (the Stripe session id) guarantees a retry can't print a second copy.
    console.error('Rivera fulfilment failed:', e);
    return json({ error: 'Fulfilment failed' }, 500);
  }
  return json({ received: true });
}

async function fulfilRiveraOrder(
  env: Env, request: Request, session: StripeSession, recordId: string, imageUrl: string
): Promise<void> {
  const table = env.AIRTABLE_TABLE_RIVERA || 'Rivera Prints';

  // Fast idempotency: if this record already carries a Prodigi order id, stop.
  const recUrl = `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${encodeURIComponent(table)}/${recordId}`;
  let recordEmail = '';
  const getRes = await fetch(recUrl, { headers: { Authorization: `Bearer ${env.AIRTABLE_PAT}` } });
  if (getRes.ok) {
    const r = (await getRes.json()) as { fields?: Record<string, unknown> };
    if (r.fields?.['Prodigi Order ID']) return;
    recordEmail = (r.fields?.['Email'] as string) || '';
  }

  // Shipping address — read the new field first, fall back to the old one.
  const ship = session.collected_information?.shipping_details || session.shipping_details;
  const addr = ship?.address;
  if (!addr || !addr.line1 || !addr.country) throw new Error('No shipping address on session');
  // Stripe relocates fields between API versions (shipping_details moved into
  // collected_information in 2025-03-31.basil), so don't depend on
  // customer_details alone for the buyer's email — fall back to the Airtable
  // address the offer email already reached, which is known-good.
  const email = session.customer_details?.email || recordEmail;
  const name = ship?.name || session.customer_details?.name || 'Print Collector';
  console.log('[rivera-fulfil] buyer email resolved:', {
    fromStripe: !!session.customer_details?.email, fromAirtable: !!recordEmail, willEmail: !!email,
  });
  const phone = session.customer_details?.phone || '';

  if (!env.PRODIGI_API_KEY) throw new Error('Prodigi not configured');
  const base = env.PRODIGI_BASE_URL || 'https://api.sandbox.prodigi.com';
  const sku = env.PRODIGI_SKU || 'GLOBAL-HGE-12X18';
  const origin = new URL(request.url).origin;

  const orderBody = {
    merchantReference: recordId,
    shippingMethod: env.PRODIGI_SHIPPING_METHOD || 'Budget',
    idempotencyKey: session.id, // one Prodigi order per Checkout session — retry-safe
    callbackUrl: `${origin}/rivera/prodigi/callback?rid=${encodeURIComponent(recordId)}&k=${await orderCallbackToken(recordId, env)}`,
    recipient: {
      name,
      email: email || undefined,
      phoneNumber: phone || undefined,
      address: {
        line1: addr.line1,
        line2: addr.line2 || undefined,
        townOrCity: addr.city,
        stateOrCounty: addr.state || undefined,
        postalOrZipCode: addr.postal_code,
        countryCode: addr.country,
      },
    },
    items: [
      {
        sku,
        copies: 1,
        sizing: 'fillPrintArea', // image is exactly 3:2 = the print area, so no crop
        attributes: {},
        assets: [{ printArea: 'default', url: imageUrl }],
      },
    ],
  };

  const podRes = await fetch(`${base}/v4.0/Orders`, {
    method: 'POST',
    headers: { 'X-API-Key': env.PRODIGI_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(orderBody),
  });
  const podText = await podRes.text();
  if (!podRes.ok) {
    console.error('Prodigi order failed:', podRes.status, podText);
    throw new Error(`Prodigi order failed (${podRes.status})`);
  }
  let pod: { outcome?: string; order?: { id?: string; status?: { stage?: string } } } = {};
  try { pod = JSON.parse(podText); } catch { /* leave empty */ }
  const orderId = pod.order?.id || '';
  const stage = pod.order?.status?.stage || pod.outcome || 'Submitted';

  const amount = typeof session.amount_total === 'number' ? (session.amount_total / 100).toFixed(2) : '';
  const currency = (session.currency || '').toUpperCase();
  await patchAirtableTolerant(env, table, recordId, {
    'Prodigi Order ID': orderId,
    'Status': 'ordered',
    'Order Stage': stage,
    'Stripe Session ID': session.id,
    'Shipping Name': name,
    'Shipping Address': [addr.line1, addr.line2, addr.city, addr.state, addr.postal_code, addr.country].filter(Boolean).join(', '),
    'Price Paid': amount ? `${amount} ${currency}` : '',
  });

  if (email) {
    await sendRiveraEmail(
      env, email, 'Your Rivera print order is confirmed',
      `<div style="max-width:520px;margin:0 auto;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#eee;background:#0f0f0f;padding:28px">`
      + `<h1 style="font-size:20px;font-weight:600">Order confirmed — thank you.</h1>`
      + `<p style="color:#bbb">Your 18×12″ Hahnemühle giclée print is heading into production. We'll email tracking as soon as it ships.</p>`
      + (orderId ? `<p style="color:#777;font-size:13px">Order reference: ${orderId}</p>` : '')
      + `</div>`
    );
  }
}

async function handleProdigiCallback(request: Request, env: Env): Promise<Response> {
  if (!env.RIVERA_ORDER_SECRET) return json({ error: 'Not configured' }, 503);
  const url = new URL(request.url);
  const rid = url.searchParams.get('rid') || '';
  const k = url.searchParams.get('k') || '';
  if (!rid || !timingSafeEqual(k, await orderCallbackToken(rid, env))) {
    return json({ error: 'Unauthorized' }, 401);
  }
  let body: { order?: ProdigiOrder } & ProdigiOrder;
  try { body = await request.json(); } catch { return json({ error: 'Bad JSON' }, 400); }
  const order: ProdigiOrder = body.order || body;
  const stage = order?.status?.stage || '';
  const shipments = order?.shipments || [];
  const tracking = shipments.map((s) => s?.tracking?.url).find(Boolean) || '';

  const table = env.AIRTABLE_TABLE_RIVERA || 'Rivera Prints';
  const fields: Record<string, unknown> = { 'Order Stage': stage };
  const shipped = stage === 'Complete' || !!tracking;
  if (shipped) { fields['Status'] = 'shipped'; if (tracking) fields['Tracking URL'] = tracking; }

  // Send the shipped email once — guard on the record not already having a
  // Tracking URL so Prodigi's repeated callbacks don't re-email.
  let email = '', alreadyTracked = false;
  const recUrl = `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${encodeURIComponent(table)}/${rid}`;
  const getRes = await fetch(recUrl, { headers: { Authorization: `Bearer ${env.AIRTABLE_PAT}` } });
  if (getRes.ok) {
    const r = (await getRes.json()) as { fields?: { Email?: string; 'Tracking URL'?: string } };
    email = r.fields?.Email || '';
    alreadyTracked = !!r.fields?.['Tracking URL'];
  }

  await patchAirtableTolerant(env, table, rid, fields);

  if (shipped && tracking && email && !alreadyTracked) {
    await sendRiveraEmail(
      env, email, 'Your Rivera print has shipped',
      `<div style="max-width:520px;margin:0 auto;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#eee;background:#0f0f0f;padding:28px">`
      + `<h1 style="font-size:20px;font-weight:600">On its way.</h1>`
      + `<p style="color:#bbb">Your Rivera giclée print has shipped.</p>`
      + `<p style="margin:20px 0"><a href="${tracking}" style="display:inline-block;background:#fff;color:#111;text-decoration:none;font-weight:600;padding:12px 24px;border-radius:8px">Track your shipment</a></p>`
      + `</div>`
    );
  }
  return json({ received: true });
}

type ProdigiOrder = {
  id?: string;
  status?: { stage?: string };
  shipments?: { tracking?: { url?: string; number?: string } }[];
};
