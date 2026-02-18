/**
 * Client-side Google News RSS fetcher for The Pulse.
 * Fetches real headlines via Google News RSS — no API key needed, no server route.
 * Works perfectly with static export (output: 'export').
 *
 * Google News RSS endpoint:
 *   https://news.google.com/rss/search?q=QUERY&hl=en-US&gl=US&ceid=US:en
 */

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
  { key: 'musk', name: 'Elon Musk', query: 'Elon Musk', color: '#3b82f6' },
  { key: 'zuckerberg', name: 'Mark Zuckerberg', query: 'Mark Zuckerberg', color: '#06b6d4' },
  { key: 'altman', name: 'Sam Altman', query: 'Sam Altman', color: '#a3a3a3' },
  { key: 'bezos', name: 'Jeff Bezos', query: 'Jeff Bezos', color: '#f97316' },
  { key: 'huang', name: 'Jensen Huang', query: 'Jensen Huang', color: '#84cc16' },
] as const

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

/**
 * Extract the source name from a Google News RSS title.
 * Google News titles end with " - Source Name"
 */
function extractSource(title: string): { cleanTitle: string; source: string } {
  const lastDash = title.lastIndexOf(' - ')
  if (lastDash > 0) {
    return {
      cleanTitle: title.substring(0, lastDash).trim(),
      source: title.substring(lastDash + 3).trim(),
    }
  }
  return { cleanTitle: title, source: 'Google News' }
}

/**
 * Strip HTML tags from a string (for RSS description fields)
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

/**
 * Fetch Google News RSS for a search query and parse the XML.
 * Uses a public CORS proxy to avoid browser CORS restrictions.
 */
async function fetchGoogleNewsRSS(query: string): Promise<{
  totalResults: number
  articles: { title: string; source: string; url: string; pubDate: string; description: string }[]
}> {
  const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`

  // Try fetching directly first, then fall back to a CORS proxy
  let xml = ''
  try {
    const res = await fetch(rssUrl)
    if (res.ok) {
      xml = await res.text()
    }
  } catch {
    // Direct fetch failed (likely CORS), try proxy
  }

  if (!xml) {
    // Use allorigins as a CORS proxy
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`
    const res = await fetch(proxyUrl)
    if (!res.ok) {
      throw new Error(`RSS fetch failed: ${res.status}`)
    }
    xml = await res.text()
  }

  // Parse the RSS XML
  const parser = new DOMParser()
  const doc = parser.parseFromString(xml, 'text/xml')
  const items = doc.querySelectorAll('item')

  const articles: { title: string; source: string; url: string; pubDate: string; description: string }[] = []

  items.forEach((item) => {
    const rawTitle = item.querySelector('title')?.textContent || ''
    const { cleanTitle, source } = extractSource(rawTitle)
    const url = item.querySelector('link')?.textContent || ''
    const pubDate = item.querySelector('pubDate')?.textContent || ''
    const rawDesc = item.querySelector('description')?.textContent || ''
    const description = stripHtml(rawDesc)

    if (cleanTitle) {
      articles.push({ title: cleanTitle, source, url, pubDate, description })
    }
  })

  return { totalResults: articles.length, articles }
}

/**
 * Fetch live Pulse data for all overlords from Google News RSS.
 * No API key required.
 */
export async function fetchPulseData(): Promise<PulseData> {
  const results: OverlordPulse[] = []

  // Fetch all overlords in parallel for speed
  const fetches = OVERLORD_CONFIGS.map(async (config) => {
    try {
      const data = await fetchGoogleNewsRSS(config.query)

      const headlines: Headline[] = data.articles.slice(0, 5).map((a) => ({
        title: a.title,
        source_name: a.source,
        url: a.url,
        published_at: a.pubDate ? new Date(a.pubDate).toISOString() : new Date().toISOString(),
        description: a.description.substring(0, 200),
      }))

      const allText = data.articles.map((a) => `${a.title} ${a.description}`).join(' ')
      const sentimentScore = scoreSentiment(allText)

      return {
        key: config.key,
        name: config.name,
        color: config.color,
        pulse_count: data.totalResults,
        sentiment_score: Math.round(sentimentScore * 100) / 100,
        sentiment_label: labelSentiment(sentimentScore),
        trend_direction: data.totalResults > 80 ? 'surging' : data.totalResults > 40 ? 'rising' : 'stable',
        headlines,
      } as OverlordPulse
    } catch (err) {
      console.error(`Pulse fetch error for ${config.key}:`, err)
      return {
        key: config.key,
        name: config.name,
        color: config.color,
        pulse_count: 0,
        sentiment_score: 0,
        sentiment_label: 'neutral',
        trend_direction: 'stable',
        headlines: [],
      } as OverlordPulse
    }
  })

  const overlordResults = await Promise.all(fetches)
  results.push(...overlordResults)

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
 * Generate demo/sample data for when RSS fetch fails.
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
