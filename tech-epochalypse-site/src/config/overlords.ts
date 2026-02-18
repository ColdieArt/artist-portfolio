export interface OverlordConfig {
  key: string
  name: string
  short_name: string
  companies: string[]
  search_query: string
  accent_color: string
  artwork_slug: string
}

/**
 * Curated list of reputable tech/business news domains.
 * NewsAPI `domains` param restricts results to these sources only.
 */
export const QUALITY_DOMAINS = [
  'reuters.com',
  'apnews.com',
  'bloomberg.com',
  'cnbc.com',
  'wsj.com',
  'nytimes.com',
  'washingtonpost.com',
  'theguardian.com',
  'bbc.com',
  'bbc.co.uk',
  'techcrunch.com',
  'theverge.com',
  'arstechnica.com',
  'wired.com',
  'engadget.com',
  'zdnet.com',
  'cnet.com',
  'thedailybeast.com',
  'businessinsider.com',
  'forbes.com',
  'ft.com',
  'theatlantic.com',
  'axios.com',
  'semafor.com',
  'theinformation.com',
  'protocol.com',
  'venturebeat.com',
  'fortune.com',
  'marketwatch.com',
  'politico.com',
]

/**
 * Blocklist of domains known for low-quality, clickbait, or scraped content.
 * Articles from these domains are filtered out post-fetch as a safety net.
 */
export const BLOCKED_DOMAINS = [
  'biztoc.com',
  'yahoo.com',
  'msn.com',
  'news.google.com',
  'ground.news',
  'smarteranalyst.com',
  'investorplace.com',
  'benzinga.com',
  'thestreet.com',
  'fool.com',
  'seekingalpha.com',
  'accesswire.com',
  'prnewswire.com',
  'globenewswire.com',
  'businesswire.com',
  'newsbreak.com',
  'newsbtc.com',
]

export const OVERLORDS: OverlordConfig[] = [
  {
    key: 'musk',
    name: 'Elon Musk',
    short_name: 'Musk',
    companies: ['Tesla', 'SpaceX', 'X'],
    search_query: '"Elon Musk" AND (Tesla OR SpaceX OR xAI OR Neuralink OR "boring company" OR DOGE)',
    accent_color: '#5b8cf7',
    artwork_slug: 'elon-musk',
  },
  {
    key: 'zuckerberg',
    name: 'Mark Zuckerberg',
    short_name: 'Zuckerberg',
    companies: ['Meta', 'Instagram', 'Threads'],
    search_query: '"Mark Zuckerberg" AND (Meta OR Instagram OR Threads OR WhatsApp OR "Reality Labs" OR Llama)',
    accent_color: '#00d4ff',
    artwork_slug: 'mark-zuckerberg',
  },
  {
    key: 'altman',
    name: 'Sam Altman',
    short_name: 'Altman',
    companies: ['OpenAI', 'ChatGPT'],
    search_query: '"Sam Altman" AND (OpenAI OR ChatGPT OR GPT OR "artificial intelligence" OR AGI)',
    accent_color: '#f5e6a3',
    artwork_slug: 'sam-altman',
  },
  {
    key: 'bezos',
    name: 'Jeff Bezos',
    short_name: 'Bezos',
    companies: ['Amazon', 'Blue Origin'],
    search_query: '"Jeff Bezos" AND (Amazon OR "Blue Origin" OR AWS OR Kuiper OR "Washington Post")',
    accent_color: '#ff9900',
    artwork_slug: 'jeff-bezos',
  },
  {
    key: 'huang',
    name: 'Jensen Huang',
    short_name: 'Huang',
    companies: ['Nvidia'],
    search_query: '"Jensen Huang" AND (Nvidia OR GPU OR "artificial intelligence" OR CUDA OR "data center")',
    accent_color: '#76b900',
    artwork_slug: 'jensen-huang',
  },
]

export const OVERLORD_MAP = Object.fromEntries(
  OVERLORDS.map((o) => [o.key, o])
)

export function getOverlord(key: string): OverlordConfig | undefined {
  return OVERLORD_MAP[key]
}
