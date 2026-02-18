import { NextResponse } from 'next/server'

const NEWS_API_BASE = 'https://newsapi.org/v2/everything'

const OVERLORD_CONFIGS = [
  { key: 'musk', name: 'Elon Musk', query: '"Elon Musk"', color: '#3b82f6' },
  { key: 'zuckerberg', name: 'Mark Zuckerberg', query: '"Mark Zuckerberg" OR "Zuckerberg Meta"', color: '#06b6d4' },
  { key: 'altman', name: 'Sam Altman', query: '"Sam Altman" OR "Altman OpenAI"', color: '#a3a3a3' },
  { key: 'bezos', name: 'Jeff Bezos', query: '"Jeff Bezos"', color: '#f97316' },
  { key: 'huang', name: 'Jensen Huang', query: '"Jensen Huang" OR "Huang Nvidia"', color: '#84cc16' },
]

const QUALITY_DOMAINS = [
  'reuters.com', 'bloomberg.com', 'techcrunch.com', 'theverge.com',
  'arstechnica.com', 'wired.com', 'cnbc.com', 'bbc.com', 'nytimes.com',
  'washingtonpost.com', 'ft.com', 'wsj.com', 'theguardian.com',
  'apnews.com', 'axios.com', 'engadget.com',
].join(',')

const POSITIVE_WORDS = new Set([
  'breakthrough', 'surge', 'record', 'growth', 'profit', 'success',
  'innovation', 'milestone', 'launch', 'approved', 'partnership',
  'soar', 'gain', 'rally', 'boom', 'expand', 'improve', 'win',
])
const NEGATIVE_WORDS = new Set([
  'crash', 'lawsuit', 'scandal', 'decline', 'loss', 'layoff',
  'investigation', 'fine', 'controversy', 'failure', 'ban', 'drop',
  'plunge', 'cut', 'threat', 'risk', 'concern', 'warn', 'probe',
])

function scoreSentiment(text: string): number {
  const words = text.toLowerCase().split(/\W+/)
  let score = 0
  for (const w of words) {
    if (POSITIVE_WORDS.has(w)) score += 1
    if (NEGATIVE_WORDS.has(w)) score -= 1
  }
  return Math.max(-1, Math.min(1, score / Math.max(1, words.length) * 10))
}

function labelSentiment(score: number): string {
  if (score > 0.3) return 'positive'
  if (score > 0.05) return 'leaning positive'
  if (score > -0.05) return 'neutral'
  if (score > -0.3) return 'leaning negative'
  return 'negative'
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

interface NewsArticle {
  title: string
  description: string | null
  url: string
  source: { name: string }
  publishedAt: string
}

interface Headline {
  title: string
  source_name: string
  url: string
  published_at: string
  description: string
}

interface OverlordPulse {
  key: string
  name: string
  color: string
  pulse_count: number
  sentiment_score: number
  sentiment_label: string
  trend_direction: string
  headlines: Headline[]
}

async function fetchOverlordNews(
  query: string,
  apiKey: string
): Promise<{ totalResults: number; articles: NewsArticle[] }> {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  const params = new URLSearchParams({
    q: query,
    from: formatDate(yesterday),
    to: formatDate(new Date()),
    language: 'en',
    sortBy: 'relevancy',
    pageSize: '10',
    domains: QUALITY_DOMAINS,
    apiKey,
  })

  const res = await fetch(`${NEWS_API_BASE}?${params.toString()}`)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`NewsAPI ${res.status}: ${text}`)
  }
  return res.json()
}

export async function GET() {
  const apiKey = process.env.NEWS_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'NEWS_API_KEY not configured on the server' },
      { status: 503 }
    )
  }

  try {
    const results: OverlordPulse[] = []

    for (const config of OVERLORD_CONFIGS) {
      try {
        const data = await fetchOverlordNews(config.query, apiKey)

        const cleanArticles = (data.articles || [])
          .filter(
            (a) =>
              a.title && a.title !== '[Removed]' &&
              a.description && a.description !== '[Removed]'
          )
          .slice(0, 5)

        const headlines: Headline[] = cleanArticles.map((a) => ({
          title: a.title,
          source_name: a.source?.name || 'Unknown',
          url: a.url,
          published_at: a.publishedAt,
          description: (a.description || '').substring(0, 200),
        }))

        const allText = cleanArticles
          .map((a) => `${a.title} ${a.description || ''}`)
          .join(' ')
        const sentimentScore = scoreSentiment(allText)

        results.push({
          key: config.key,
          name: config.name,
          color: config.color,
          pulse_count: data.totalResults || 0,
          sentiment_score: Math.round(sentimentScore * 100) / 100,
          sentiment_label: labelSentiment(sentimentScore),
          trend_direction:
            data.totalResults > 50
              ? 'surging'
              : data.totalResults > 20
                ? 'rising'
                : 'stable',
          headlines,
        })
      } catch (err) {
        results.push({
          key: config.key,
          name: config.name,
          color: config.color,
          pulse_count: 0,
          sentiment_score: 0,
          sentiment_label: 'neutral',
          trend_direction: 'stable',
          headlines: [],
        })
        console.error(`Pulse fetch error for ${config.key}:`, err)
      }
    }

    results.sort((a, b) => b.pulse_count - a.pulse_count)

    const hottest = results[0]?.key || null
    const quietest = results[results.length - 1]?.key || null
    const mostNeg = [...results].sort(
      (a, b) => a.sentiment_score - b.sentiment_score
    )[0]?.key || null
    const bigSurge = [...results].sort(
      (a, b) => b.pulse_count - a.pulse_count
    )[0]?.key || null

    return NextResponse.json({
      overlords: results,
      hottest,
      biggest_surge: bigSurge,
      most_negative: mostNeg,
      quietest,
      updated_at: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Pulse API error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch pulse data' },
      { status: 500 }
    )
  }
}
