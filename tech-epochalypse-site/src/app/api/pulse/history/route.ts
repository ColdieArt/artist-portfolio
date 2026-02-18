import { NextRequest, NextResponse } from 'next/server'
import { getAllDailyHistory } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const days = Math.min(Math.max(parseInt(searchParams.get('days') || '90', 10) || 90, 1), 365)

    const data = getAllDailyHistory(days)

    return NextResponse.json({ days, data })
  } catch (err) {
    console.error('Error fetching pulse history:', err)
    return NextResponse.json(
      { error: 'Failed to fetch pulse history' },
      { status: 500 }
    )
  }
}
