import { NextResponse } from 'next/server'
import { getAllCacheRows, type PulseCacheRow } from '@/lib/db'
import { OVERLORD_MAP } from '@/config/overlords'

export const dynamic = 'force-dynamic'

function parseHeadlines(raw: string | null): unknown[] {
  if (!raw) return []
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function formatRow(row: PulseCacheRow) {
  const config = OVERLORD_MAP[row.overlord]
  return {
    key: row.overlord,
    name: config?.name || row.overlord,
    pulse_7day: row.pulse_7day,
    pulse_30day: row.pulse_30day,
    trend_percent: row.trend_percent,
    trend_direction: row.trend_direction,
    avg_sentiment_7day: row.avg_sentiment_7day,
    sentiment_label: row.sentiment_label,
    top_headlines: parseHeadlines(row.top_headlines),
    peak_day_30d: row.peak_day_30d,
    peak_count_30d: row.peak_count_30d,
  }
}

export async function GET() {
  try {
    const rows = getAllCacheRows()

    if (rows.length === 0) {
      return NextResponse.json({
        updated_at: null,
        overlords: [],
        hottest: null,
        biggest_surge: null,
        most_negative: null,
        quietest: null,
      })
    }

    const overlords = rows.map(formatRow)

    // Determine highlight roles
    const hottest = overlords.reduce((a, b) =>
      a.pulse_7day >= b.pulse_7day ? a : b
    )
    const biggestSurge = overlords.reduce((a, b) =>
      a.trend_percent >= b.trend_percent ? a : b
    )
    const mostNegative = overlords.reduce((a, b) =>
      a.avg_sentiment_7day <= b.avg_sentiment_7day ? a : b
    )
    const quietest = overlords.reduce((a, b) =>
      a.pulse_7day <= b.pulse_7day ? a : b
    )

    return NextResponse.json({
      updated_at: rows[0]?.updated_at || null,
      overlords,
      hottest: hottest.key,
      biggest_surge: biggestSurge.key,
      most_negative: mostNegative.key,
      quietest: quietest.key,
    })
  } catch (err) {
    console.error('Error fetching pulse data:', err)
    return NextResponse.json(
      { error: 'Failed to fetch pulse data' },
      { status: 500 }
    )
  }
}
