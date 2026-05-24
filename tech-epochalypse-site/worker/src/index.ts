interface Env {
  GALLERY_BUCKET: R2Bucket;
  VS_DB: D1Database;
  VS_ADMIN_TOKEN: string;
  TURNSTILE_SECRET: string;
  RESEND_API_KEY: string;
  CONTACT_EMAIL: string;
  AIRTABLE_PAT: string;
  AIRTABLE_BASE_ID: string;
  AIRTABLE_TABLE_NAME: string;
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

    // /vs/* — Tinder-style pairwise voting tool (Elo)
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
    if (request.method === 'POST' && path === '/vs/admin/decide') {
      return handleVsDecide(request, env);
    }
    if (request.method === 'POST' && path === '/vs/admin/sync') {
      return handleVsSync(request, env);
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

    // Limit file size to 5MB
    if (file.size > 5 * 1024 * 1024) {
      return json({ error: 'File too large (max 5MB)' }, 400);
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
    const overlord = (formData.get('overlord') as string) || 'unknown';
    const xAccount = (formData.get('xAccount') as string) || '';
    const title = (formData.get('title') as string) || '';

    if (!env.AIRTABLE_PAT || !env.AIRTABLE_BASE_ID || !env.AIRTABLE_TABLE_NAME) {
      return json({ error: 'Airtable not configured on server' }, 500);
    }

    // Read file bytes upfront so we can use them for both R2 and Airtable
    let fileBytes: ArrayBuffer | null = null;
    let fileContentType = 'image/png';
    if (file && file.size > 0) {
      if (file.size > 5 * 1024 * 1024) {
        return json({ error: 'File too large (max 5MB)' }, 400);
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
          date: new Date().toISOString().split('T')[0],
          uploadedAt: new Date().toISOString(),
        },
      });

      const workerUrl = new URL(request.url);
      imageUrl = `${workerUrl.origin}/image/${key}`;
    }

    // Register the submission in the /vs voting pool as pending (admin approves later).
    if (r2Key && env.VS_DB) {
      try {
        await env.VS_DB.prepare(
          `INSERT OR IGNORE INTO images (id, overlord, title, image_url, elo, votes, wins, losses, status, created_at)
           VALUES (?1, ?2, ?3, ?4, 1500, 0, 0, 0, 'pending', ?5)`
        )
          .bind(r2Key, overlord, title || '', imageUrl, Date.now())
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
      'X Account': xAccount || 'Anonymous',
    };

    if (imageUrl) {
      fields['Image URL'] = imageUrl;
    }

    const airtableRes = await fetch(
      `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${encodeURIComponent(env.AIRTABLE_TABLE_NAME)}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.AIRTABLE_PAT}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields, typecast: true }),
      }
    );

    if (!airtableRes.ok) {
      const errBody = await airtableRes.text();
      console.error('Airtable create error:', airtableRes.status, errBody);
      return json({ error: 'Airtable submission failed', details: errBody }, airtableRes.status);
    }

    const record = (await airtableRes.json()) as { id: string };

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
};

async function voterHash(request: Request): Promise<string> {
  const ip = request.headers.get('CF-Connecting-IP') || '';
  const ua = request.headers.get('User-Agent') || '';
  const data = new TextEncoder().encode(`${ip}|${ua}`);
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
// Strategy: weight toward (1) images with fewest votes, (2) close Elo opponents.
async function handleVsPair(request: Request, env: Env): Promise<Response> {
  try {
    const overlord = new URL(request.url).searchParams.get('overlord') || 'all';

    // Pull a candidate pool ordered by fewest votes first, then random within tier.
    const where = overlord === 'all' ? '' : 'AND overlord = ?2';
    const params: unknown[] = ['approved'];
    if (overlord !== 'all') params.push(overlord);

    const pool = await env.VS_DB.prepare(
      `SELECT id, overlord, title, image_url, elo, votes, wins, losses, status, created_at
       FROM images
       WHERE status = ?1 ${where}
       ORDER BY votes ASC, RANDOM()
       LIMIT 40`
    )
      .bind(...params)
      .all<ImageRow>();

    const rows = pool.results || [];
    if (rows.length < 2) {
      return json({ error: 'Not enough approved images for this filter', count: rows.length }, 404);
    }

    // Pick image A from the front of the list (low-vote bias), then pick B as
    // the closest-Elo opponent from the remainder.
    const aIdx = Math.floor(Math.random() * Math.min(8, rows.length));
    const a = rows[aIdx];
    let b: ImageRow | null = null;
    let bestDelta = Infinity;
    for (let i = 0; i < rows.length; i++) {
      if (i === aIdx) continue;
      const delta = Math.abs(rows[i].elo - a.elo);
      // Add a small random jitter so we don't always pick the same neighbor.
      const jittered = delta + Math.random() * 30;
      if (jittered < bestDelta) {
        bestDelta = jittered;
        b = rows[i];
      }
    }
    if (!b) return json({ error: 'Could not select opponent' }, 500);

    // Shuffle which one is on the left.
    const [left, right] = Math.random() < 0.5 ? [a, b] : [b, a];
    return json({ left: stripImage(left), right: stripImage(right), overlord });
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
  };
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
        `SELECT id, overlord, title, image_url, elo, votes, wins, losses, status, created_at
         FROM images WHERE id = ?1`
      )
        .bind(winnerId)
        .first<ImageRow>(),
      env.VS_DB.prepare(
        `SELECT id, overlord, title, image_url, elo, votes, wins, losses, status, created_at
         FROM images WHERE id = ?1`
      )
        .bind(loserId)
        .first<ImageRow>(),
    ]);

    if (!winner || !loser) return json({ error: 'Image not found' }, 404);
    if (winner.status !== 'approved' || loser.status !== 'approved') {
      return json({ error: 'Image not approved' }, 400);
    }

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
      return json({ ok: true, deduped: true });
    }

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
        `INSERT INTO votes (winner_id, loser_id, overlord, voter_hash, ts) VALUES (?1, ?2, ?3, ?4, ?5)`
      ).bind(winnerId, loserId, overlordTag, hash, Date.now()),
    ]);

    return json({
      ok: true,
      winner: { id: winnerId, elo: Math.round(newWinnerElo) },
      loser: { id: loserId, elo: Math.round(newLoserElo) },
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
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10) || 50, 200);

    const where = overlord === 'all' ? '' : 'AND overlord = ?2';
    const params: unknown[] = ['approved'];
    if (overlord !== 'all') params.push(overlord);

    const res = await env.VS_DB.prepare(
      `SELECT id, overlord, title, image_url, elo, votes, wins, losses, status, created_at
       FROM images
       WHERE status = ?1 ${where}
       ORDER BY elo DESC, votes DESC
       LIMIT ${limit}`
    )
      .bind(...params)
      .all<ImageRow>();

    const total = await env.VS_DB.prepare(
      `SELECT COUNT(*) AS c FROM votes ${overlord === 'all' ? '' : 'WHERE overlord = ?1 OR overlord = "mixed"'}`
    )
      .bind(...(overlord === 'all' ? [] : [overlord]))
      .first<{ c: number }>();

    return json({
      overlord,
      totalVotes: total?.c || 0,
      items: (res.results || []).map(stripImage),
    });
  } catch (e) {
    console.error('vs/leaderboard error:', e);
    return json({ error: 'Failed to load leaderboard' }, 500);
  }
}

// GET /vs/admin/pending — admin only
async function handleVsPending(request: Request, env: Env): Promise<Response> {
  if (!isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401);
  try {
    const res = await env.VS_DB.prepare(
      `SELECT id, overlord, title, image_url, elo, votes, wins, losses, status, created_at
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
        const head = await env.GALLERY_BUCKET.head(obj.key);
        const overlord = head?.customMetadata?.overlord || 'unknown';
        const res = await env.VS_DB.prepare(
          `INSERT OR IGNORE INTO images (id, overlord, title, image_url, elo, votes, wins, losses, status, created_at)
           VALUES (?1, ?2, '', ?3, 1500, 0, 0, 0, 'pending', ?4)`
        )
          .bind(obj.key, overlord, `${origin}/image/${obj.key}`, obj.uploaded?.getTime() || Date.now())
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
