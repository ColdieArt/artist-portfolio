import { NextRequest, NextResponse } from 'next/server'
import { findByWallet } from '@/lib/airtable'

const WALLET_RE = /^0x[0-9a-fA-F]{40}$/

export async function POST(req: NextRequest) {
  let body: { wallet_address?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const raw = body.wallet_address?.trim() ?? ''
  if (!WALLET_RE.test(raw)) {
    return NextResponse.json(
      { eligible: false, reason: 'invalid_address' },
      { status: 400 }
    )
  }

  const wallet = raw.toLowerCase()

  try {
    const record = await findByWallet(wallet)

    if (!record) {
      return NextResponse.json({ eligible: false, reason: 'not_found' })
    }

    if (record.fields.eligible_for_contests) {
      return NextResponse.json({
        eligible: true,
        token_count: record.fields.token_count,
      })
    }

    return NextResponse.json({
      eligible: false,
      reason: 'no_longer_holding',
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
