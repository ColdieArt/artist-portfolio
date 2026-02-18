import { NextRequest, NextResponse } from 'next/server'
import { fetchAllHolders } from '@/lib/airtable'

const ADMIN_SECRET = process.env.ADMIN_SECRET ?? ''

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!ADMIN_SECRET || authHeader !== `Bearer ${ADMIN_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const holders = await fetchAllHolders()

    const activeCount = holders.filter((h) => h.fields.is_active_holder).length
    const totalTokens = holders.reduce((sum, h) => sum + h.fields.token_count, 0)

    return NextResponse.json({
      total_records: holders.length,
      active_holders: activeCount,
      total_tokens: totalTokens,
      holders: holders.map((h) => ({
        id: h.id,
        ...h.fields,
      })),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
