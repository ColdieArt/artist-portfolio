import { NextRequest, NextResponse } from 'next/server'
import { runSnapshot } from '@/lib/snapshot'

const ADMIN_SECRET = process.env.ADMIN_SECRET ?? ''

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!ADMIN_SECRET || authHeader !== `Bearer ${ADMIN_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await runSnapshot()
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
