interface Env {
  GALLERY_BUCKET: R2Bucket;
}

// ── Mint Drop Registry ──
// Active ERC-721 drops served via /api/mint endpoints

interface MintDrop {
  slug: string;
  name: string;
  artist: string;
  description: string;
  chainId: number;
  chainName: string;
  contractAddress: string;
  mintContractAddress: string;
  tokenStandard: string;
  allowlistUrl: string;
  refreshInterval: number;
  status: 'live' | 'upcoming' | 'ended';
}

const MINT_DROPS: MintDrop[] = [
  {
    slug: 'shape-study',
    name: 'Shape Study',
    artist: 'Coldie',
    description:
      'Shape Study — an exploration of form, structure, and the geometry of perception. ERC-721 on Base.',
    chainId: 8453,
    chainName: 'Base',
    contractAddress: '0xb38bd444399cd76c3f91aa2455052834e3451911',
    mintContractAddress: '0x384092784cfaa91efaa77870c04d958e20840242',
    tokenStandard: 'ERC-721',
    allowlistUrl:
      'https://dv0xp0uwyoh8r.cloudfront.net/stacks/c8aeee8f-7d14-4403-a8b2-fe06f97a79cc/allowlist',
    refreshInterval: 10000,
    status: 'live',
  },
];

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

    // GET /api/mint — list all active mint drops
    if (request.method === 'GET' && url.pathname === '/api/mint') {
      return handleMintDrops();
    }

    // GET /api/mint/:slug — get a specific drop by slug
    if (request.method === 'GET' && url.pathname.startsWith('/api/mint/')) {
      const slug = url.pathname.slice('/api/mint/'.length);
      return handleMintDrop(slug);
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

// ── Mint API handlers ──

function handleMintDrops(): Response {
  const live = MINT_DROPS.filter((d) => d.status === 'live');
  return json({
    drops: live,
    total: live.length,
  });
}

function handleMintDrop(slug: string): Response {
  const drop = MINT_DROPS.find((d) => d.slug === slug);
  if (!drop) {
    return json({ error: 'Drop not found' }, 404);
  }
  return json(drop);
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
