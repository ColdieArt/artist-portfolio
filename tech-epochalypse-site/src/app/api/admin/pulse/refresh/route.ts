import { NextRequest, NextResponse } from 'next/server'
import { runDailyPulse } from '@/lib/pulse-job'
import { getRecentJobLogs, getAllCacheRows } from '@/lib/db'
import { OVERLORD_MAP } from '@/config/overlords'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

function verifyAdmin(request: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET
  if (!secret || secret === 'change-this-to-a-secure-secret') return true // Allow if not configured
  const auth = request.headers.get('x-admin-secret')
  return auth === secret
}

export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { results, errors } = await runDailyPulse()

    return NextResponse.json({
      status: errors.length > 0 ? 'partial' : 'success',
      message: 'Pulse job completed',
      results,
      errors,
      ran_at: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Admin pulse refresh failed:', err)
    return NextResponse.json(
      {
        status: 'error',
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const cache = getAllCacheRows()
    const logs = getRecentJobLogs(10)

    const summary = cache.map((row) => {
      const config = OVERLORD_MAP[row.overlord]
      return {
        key: row.overlord,
        name: config?.name || row.overlord,
        pulse_7day: row.pulse_7day,
        pulse_30day: row.pulse_30day,
        trend_direction: row.trend_direction,
        sentiment_label: row.sentiment_label,
        updated_at: row.updated_at,
      }
    })

    return NextResponse.json({
      overlords: summary,
      recent_jobs: logs,
      last_updated: cache[0]?.updated_at || null,
    })
  } catch (err) {
    console.error('Admin pulse status failed:', err)
    return NextResponse.json(
      { error: 'Failed to fetch admin data' },
      { status: 500 }
    )
  }
}
