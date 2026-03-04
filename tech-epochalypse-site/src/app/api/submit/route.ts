import { NextRequest, NextResponse } from 'next/server'

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN ?? process.env.NEXT_PUBLIC_AIRTABLE_TOKEN ?? ''
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID ?? process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID ?? ''
const AIRTABLE_TABLE = process.env.AIRTABLE_SUBMISSIONS_TABLE ?? 'Submissions'

export async function POST(request: NextRequest) {
  if (!AIRTABLE_TOKEN) {
    return NextResponse.json({ error: 'Airtable token not configured' }, { status: 500 })
  }

  let body: { fields: Record<string, unknown>; typecast?: boolean }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.fields || typeof body.fields !== 'object') {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const res = await fetch(
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE)}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields: body.fields, typecast: body.typecast ?? true }),
    }
  )

  const data = await res.json()

  if (!res.ok) {
    return NextResponse.json({ error: data.error ?? 'Airtable request failed' }, { status: res.status })
  }

  return NextResponse.json(data)
}
