/**
 * Client-side NewsAPI fetcher for The Pulse.
 * Fetches directly from the browser — no server-side code, no native modules.
 *
 * NOTE: NewsAPI free tier only works from localhost.
 * For production, upgrade to a paid plan or use a proxy.
 */

const NEWS_API_BASE = 'https://newsapi.org/v2/everything'

export interface Headline {
  title: string
  source_name: string
  url: string
  published_at: string
  description: string
}

export interface OverlordPulse {
  key: string
  name: string
  color: string
  pulse_count: number
  sentiment_score: number
  sentiment_label: string
  trend_direction: string
  headlines: Headline[]
}

export interface PulseData {
  overlords: OverlordPulse[]
  hottest: string | null
  biggest_surge: string | null
  most_negative: string | null
  quietest: string | null
  updated_at: string
}

export const OVERLORD_CONFIGS = [
  { key: 'musk', name: 'Elon Musk', query: '"Elon Musk"', color: '#3b82f6' },
  { key: 'zuckerberg', name: 'Mark Zuckerberg', query: '"Mark Zuckerberg" OR "Zuckerberg Meta"', color: '#06b6d4' },
  { key: 'altman', name: 'Sam Altman', query: '"Sam Altman" OR "Altman OpenAI"', color: '#a3a3a3' },
  { key: 'bezos', name: 'Jeff Bezos', query: '"Jeff Bezos"', color: '#f97316' },
  { key: 'huang', name: 'Jensen Huang', query: '"Jensen Huang" OR "Huang Nvidia"', color: '#84cc16' },
] as const

const QUALITY_DOMAINS = [
  'reuters.com', 'bloomberg.com', 'techcrunch.com', 'theverge.com',
  'arstechnica.com', 'wired.com', 'cnbc.com', 'bbc.com', 'nytimes.com',
  'washingtonpost.com', 'ft.com', 'wsj.com', 'theguardian.com',
  'apnews.com', 'axios.com', 'engadget.com',
].join(',')

// Simple sentiment keywords
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

export async function fetchPulseData(apiKey: string): Promise<PulseData> {
  const results: OverlordPulse[] = []

  for (const config of OVERLORD_CONFIGS) {
    try {
      const data = await fetchOverlordNews(config.query, apiKey)

      const cleanArticles = (data.articles || []).filter(
        (a) => a.title && a.title !== '[Removed]' && a.description && a.description !== '[Removed]'
      ).slice(0, 5)

      const headlines: Headline[] = cleanArticles.map((a) => ({
        title: a.title,
        source_name: a.source?.name || 'Unknown',
        url: a.url,
        published_at: a.publishedAt,
        description: (a.description || '').substring(0, 200),
      }))

      const allText = cleanArticles.map((a) => `${a.title} ${a.description || ''}`).join(' ')
      const sentimentScore = scoreSentiment(allText)

      results.push({
        key: config.key,
        name: config.name,
        color: config.color,
        pulse_count: data.totalResults || 0,
        sentiment_score: Math.round(sentimentScore * 100) / 100,
        sentiment_label: labelSentiment(sentimentScore),
        trend_direction: data.totalResults > 50 ? 'surging' : data.totalResults > 20 ? 'rising' : 'stable',
        headlines,
      })
    } catch (err) {
      // On error, still add with zero data so the UI renders
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

  // Sort by pulse count
  results.sort((a, b) => b.pulse_count - a.pulse_count)

  const hottest = results[0]?.key || null
  const quietest = results[results.length - 1]?.key || null
  const mostNeg = [...results].sort((a, b) => a.sentiment_score - b.sentiment_score)[0]?.key || null
  const bigSurge = [...results].sort((a, b) => b.pulse_count - a.pulse_count)[0]?.key || null

  return {
    overlords: results,
    hottest,
    biggest_surge: bigSurge,
    most_negative: mostNeg,
    quietest,
    updated_at: new Date().toISOString(),
  }
}

/**
 * Generate demo/sample data for when no API key is available
 * or when running in production without a paid NewsAPI plan.
 */
export function getSamplePulseData(): PulseData {
  const sampleHeadlines: Record<string, Headline[]> = {
    musk: [
      { title: "DOGE Faces Congressional Scrutiny Over Cost-Cutting Claims", source_name: 'Reuters', url: '#', published_at: new Date().toISOString(), description: 'Congressional leaders push back on efficiency claims as auditors question methodology.' },
      { title: "Tesla Stock Slides Amid European Boycott Movement", source_name: 'Bloomberg', url: '#', published_at: new Date().toISOString(), description: 'European sales drop 40% as consumer boycotts gain momentum across major markets.' },
      { title: "SpaceX Starship Completes 10th Successful Landing", source_name: 'Ars Technica', url: '#', published_at: new Date().toISOString(), description: 'Rapid reusability milestone achieved as turnaround time drops to 48 hours.' },
      { title: "Neuralink Receives FDA Approval for Expanded Trials", source_name: 'STAT News', url: '#', published_at: new Date().toISOString(), description: 'Brain-computer interface company cleared for 50-patient study after promising results.' },
    ],
    zuckerberg: [
      { title: "Meta's AR Glasses Ship 2M Units in First Quarter", source_name: 'The Verge', url: '#', published_at: new Date().toISOString(), description: 'Orion glasses see surprise demand as developers build spatial computing apps.' },
      { title: "Threads Surpasses 300M Monthly Active Users", source_name: 'WSJ', url: '#', published_at: new Date().toISOString(), description: 'Text-based social platform continues growth trajectory.' },
    ],
    altman: [
      { title: "OpenAI Launches GPT-5 with Real-Time Reasoning", source_name: 'Wired', url: '#', published_at: new Date().toISOString(), description: 'Latest model demonstrates breakthrough chain-of-thought capabilities.' },
      { title: "Altman Testifies Before Senate on AI Safety Framework", source_name: 'Washington Post', url: '#', published_at: new Date().toISOString(), description: 'OpenAI CEO proposes international regulatory body for AI governance.' },
      { title: "OpenAI Valued at $350B in Latest Funding Round", source_name: 'Financial Times', url: '#', published_at: new Date().toISOString(), description: 'Massive valuation jump driven by enterprise adoption.' },
    ],
    bezos: [
      { title: "Blue Origin Launches First Crewed New Glenn Mission", source_name: 'Space.com', url: '#', published_at: new Date().toISOString(), description: 'Heavy-lift rocket carries four astronauts to orbit.' },
    ],
    huang: [
      { title: "Nvidia Blackwell Ultra GPUs Sell Out Through 2027", source_name: "Tom's Hardware", url: '#', published_at: new Date().toISOString(), description: 'Unprecedented demand for next-gen AI accelerators.' },
      { title: "Nvidia Market Cap Hits $5 Trillion Milestone", source_name: 'CNBC', url: '#', published_at: new Date().toISOString(), description: 'Chipmaker becomes most valuable company as AI spending surges.' },
      { title: 'Jensen Huang: "We Are at the iPhone Moment for Robotics"', source_name: 'IEEE Spectrum', url: '#', published_at: new Date().toISOString(), description: 'Nvidia CEO unveils Isaac GR00T platform for humanoid robot development.' },
    ],
  }

  const overlords: OverlordPulse[] = [
    { key: 'musk', name: 'Elon Musk', color: '#3b82f6', pulse_count: 683, sentiment_score: -0.15, sentiment_label: 'leaning negative', trend_direction: 'rising', headlines: sampleHeadlines.musk },
    { key: 'altman', name: 'Sam Altman', color: '#a3a3a3', pulse_count: 654, sentiment_score: 0.25, sentiment_label: 'leaning positive', trend_direction: 'surging', headlines: sampleHeadlines.altman },
    { key: 'huang', name: 'Jensen Huang', color: '#84cc16', pulse_count: 480, sentiment_score: 0.35, sentiment_label: 'positive', trend_direction: 'rising', headlines: sampleHeadlines.huang },
    { key: 'zuckerberg', name: 'Mark Zuckerberg', color: '#06b6d4', pulse_count: 401, sentiment_score: -0.05, sentiment_label: 'leaning negative', trend_direction: 'surging', headlines: sampleHeadlines.zuckerberg },
    { key: 'bezos', name: 'Jeff Bezos', color: '#f97316', pulse_count: 323, sentiment_score: 0.05, sentiment_label: 'leaning positive', trend_direction: 'surging', headlines: sampleHeadlines.bezos },
  ]

  return {
    overlords,
    hottest: 'musk',
    biggest_surge: 'musk',
    most_negative: 'musk',
    quietest: 'bezos',
    updated_at: new Date().toISOString(),
  }
}
