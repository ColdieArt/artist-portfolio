import { NextRequest, NextResponse } from 'next/server'
import { getCacheRow, getDailyHistory } from '@/lib/db'
import { OVERLORD_MAP } from '@/config/overlords'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: { overlord: string } }
) {
  try {
    const { overlord: overlordKey } = params
    const config = OVERLORD_MAP[overlordKey]

    if (!config) {
      return NextResponse.json(
        { error: `Unknown overlord: ${overlordKey}` },
        { status: 404 }
      )
    }

    const cache = getCacheRow(overlordKey)
    const history = getDailyHistory(overlordKey, 90)

    if (!cache) {
      return NextResponse.json({
        key: overlordKey,
        name: config.name,
        current: {
          pulse_7day: 0,
          pulse_30day: 0,
          trend_percent: 0,
          trend_direction: 'stable',
          avg_sentiment_7day: 0,
          sentiment_label: 'neutral',
        },
        top_headlines: [],
        daily_history: [],
      })
    }

    let headlines: unknown[] = []
    try {
      headlines = cache.top_headlines ? JSON.parse(cache.top_headlines) : []
    } catch {
      headlines = []
    }

    return NextResponse.json({
      key: overlordKey,
      name: config.name,
      current: {
        pulse_7day: cache.pulse_7day,
        pulse_30day: cache.pulse_30day,
        trend_percent: cache.trend_percent,
        trend_direction: cache.trend_direction,
        avg_sentiment_7day: cache.avg_sentiment_7day,
        sentiment_label: cache.sentiment_label,
      },
      top_headlines: headlines,
      daily_history: history.map((h) => ({
        date: h.date,
        article_count: h.article_count,
        sentiment_score: h.sentiment_score,
      })),
    })
  } catch (err) {
    console.error('Error fetching overlord data:', err)
    return NextResponse.json(
      { error: 'Failed to fetch overlord data' },
      { status: 500 }
    )
  }
}
