interface Env {
  GALLERY_BUCKET: R2Bucket;
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
  'Access-Control-Allow-Headers': 'Content-Type',
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

    await env.GALLERY_BUCKET.put(key, file.stream(), {
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
    if (fileBytes) {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const ext = fileContentType === 'image/png' ? 'png' : 'jpg';
      const key = `exports/${id}.${ext}`;

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

    const today = new Date().toISOString().split('T')[0];

    // Build Airtable record with R2 image URL in a text field
    // Fields: Title, Image URL, Overlord, Date, Contributor, Category
    const fields: Record<string, unknown> = {
      'Name': `${overlord} — ${today}`,
      'Title': title || `${overlord} — ${today}`,
      'Overlord': overlord,
      'Date': today,
      'Contributor': xAccount || 'Anonymous',
      'Category': 'general submission',
    };

    // Store the R2 URL directly — no flaky attachment uploads
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
