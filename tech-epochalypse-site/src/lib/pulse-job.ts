import { OVERLORDS, QUALITY_DOMAINS, BLOCKED_DOMAINS } from '@/config/overlords'
import { calculateSentiment, type Article } from '@/lib/sentiment'
import { upsertSnapshot, recalculateCache, logJobRun } from '@/lib/db'

const NEWS_API_BASE = 'https://newsapi.org/v2/everything'

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

interface NewsApiResponse {
  status: string
  totalResults: number
  articles: Article[]
}

/**
 * Check if an article URL belongs to a blocked domain.
 */
function isBlockedDomain(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '')
    return BLOCKED_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith('.' + domain)
    )
  } catch {
    return false
  }
}

/**
 * Filter out junk articles: removed content, empty titles, blocked domains.
 */
function filterArticles(articles: Article[]): Article[] {
  return articles.filter((a) => {
    if (!a.title || a.title === '[Removed]') return false
    if (!a.url) return false
    if (!a.description || a.description === '[Removed]') return false
    if (isBlockedDomain(a.url)) return false
    return true
  })
}

async function fetchOverlordNews(
  query: string,
  apiKey: string
): Promise<NewsApiResponse> {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const params = new URLSearchParams({
    q: query,
    from: formatDate(yesterday),
    to: formatDate(today),
    language: 'en',
    sortBy: 'relevancy',
    pageSize: '15',
    domains: QUALITY_DOMAINS.join(','),
    apiKey,
  })

  const res = await fetch(`${NEWS_API_BASE}?${params.toString()}`)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`NewsAPI error ${res.status}: ${text}`)
  }
  return res.json()
}

export interface PulseJobResult {
  overlord: string
  article_count: number
  sentiment_score: number
  headline_count: number
}

export async function runDailyPulse(): Promise<{
  results: PulseJobResult[]
  errors: string[]
}> {
  const apiKey = process.env.NEWS_API_KEY
  if (!apiKey) {
    throw new Error('NEWS_API_KEY environment variable is not set')
  }

  const today = formatDate(new Date())
  const results: PulseJobResult[] = []
  const errors: string[] = []

  for (const overlord of OVERLORDS) {
    try {
      const response = await fetchOverlordNews(overlord.search_query, apiKey)

      // Filter out junk articles, then take the top 5
      const cleanArticles = filterArticles(response.articles || []).slice(0, 5)

      const headlines = cleanArticles.map((a) => ({
        title: a.title || '',
        source_name: a.source?.name || 'Unknown',
        url: a.url || '',
        published_at: a.publishedAt || '',
        description: (a.description || '').substring(0, 200),
      }))

      const sentimentScore = calculateSentiment(cleanArticles)

      upsertSnapshot({
        overlord: overlord.key,
        date: today,
        article_count: response.totalResults || 0,
        sentiment_score: Math.round(sentimentScore * 100) / 100,
        top_headlines: headlines,
      })

      results.push({
        overlord: overlord.key,
        article_count: response.totalResults || 0,
        sentiment_score: Math.round(sentimentScore * 100) / 100,
        headline_count: headlines.length,
      })
    } catch (err) {
      const msg = `Error fetching ${overlord.key}: ${err instanceof Error ? err.message : String(err)}`
      errors.push(msg)
      console.error(msg)
    }

    // Respect rate limits — wait between requests
    await sleep(2000)
  }

  // Recalculate cache for all overlords
  for (const overlord of OVERLORDS) {
    try {
      recalculateCache(overlord.key)
    } catch (err) {
      const msg = `Error recalculating cache for ${overlord.key}: ${err instanceof Error ? err.message : String(err)}`
      errors.push(msg)
      console.error(msg)
    }
  }

  // Log the job run
  const summary = results
    .map((r) => `${r.overlord}: ${r.article_count} articles`)
    .join(', ')
  logJobRun(
    errors.length > 0 ? 'partial' : 'success',
    summary,
    errors.length > 0 ? errors.join('; ') : undefined
  )

  return { results, errors }
}
