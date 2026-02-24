interface Env {
  GALLERY_BUCKET: R2Bucket;
  TURNSTILE_SECRET: string;
  RESEND_API_KEY: string;
  CONTACT_EMAIL: string;
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

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // POST /upload — accept JPEG blob + metadata
    if (request.method === 'POST' && url.pathname === '/upload') {
      return handleUpload(request, env);
    }

    // GET /gallery — list all submissions
    if (request.method === 'GET' && url.pathname === '/gallery') {
      return handleList(env);
    }

    // GET /image/:key — serve an image from R2
    if (request.method === 'GET' && url.pathname.startsWith('/image/')) {
      return handleImage(url.pathname.slice(7), env);
    }

    // POST /api/contact — inquiry form with Turnstile CAPTCHA
    if (request.method === 'POST' && url.pathname === '/api/contact') {
      return handleContact(request, env);
    }

    return json({ error: 'Not found' }, 404);
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
    const key = `exports/${id}.jpg`;

    await env.GALLERY_BUCKET.put(key, file.stream(), {
      httpMetadata: { contentType: 'image/jpeg' },
      customMetadata: {
        overlord,
        date: new Date().toISOString().split('T')[0],
        uploadedAt: new Date().toISOString(),
      },
    });

    return json({ ok: true, id, key });
  } catch (e) {
    return json({ error: 'Upload failed' }, 500);
  }
}

async function handleList(env: Env): Promise<Response> {
  const listed = await env.GALLERY_BUCKET.list({ prefix: 'exports/', limit: 100 });

  const items = await Promise.all(
    listed.objects.map(async (obj) => {
      const head = await env.GALLERY_BUCKET.head(obj.key);
      return {
        id: obj.key.replace('exports/', '').replace('.jpg', ''),
        key: obj.key,
        imageUrl: `/image/${obj.key}`,
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
  const object = await env.GALLERY_BUCKET.get(key);
  if (!object) {
    return json({ error: 'Image not found' }, 404);
  }

  return new Response(object.body, {
    headers: {
      'Content-Type': object.httpMetadata?.contentType || 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000, immutable',
      ...CORS_HEADERS,
    },
  });
}
