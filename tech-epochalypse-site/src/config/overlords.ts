export interface OverlordConfig {
  key: string
  name: string
  short_name: string
  companies: string[]
  search_query: string
  accent_color: string
  artwork_slug: string
}

export const OVERLORDS: OverlordConfig[] = [
  {
    key: 'musk',
    name: 'Elon Musk',
    short_name: 'Musk',
    companies: ['Tesla', 'SpaceX', 'X'],
    search_query: '"Elon Musk" OR (Tesla AND Musk) OR (SpaceX AND Musk)',
    accent_color: '#5b8cf7',
    artwork_slug: 'elon-musk',
  },
  {
    key: 'zuckerberg',
    name: 'Mark Zuckerberg',
    short_name: 'Zuckerberg',
    companies: ['Meta', 'Instagram', 'Threads'],
    search_query: '"Mark Zuckerberg" OR (Meta AND Zuckerberg)',
    accent_color: '#00d4ff',
    artwork_slug: 'mark-zuckerberg',
  },
  {
    key: 'altman',
    name: 'Sam Altman',
    short_name: 'Altman',
    companies: ['OpenAI', 'ChatGPT'],
    search_query: '"Sam Altman" OR (OpenAI AND Altman)',
    accent_color: '#f5e6a3',
    artwork_slug: 'sam-altman',
  },
  {
    key: 'bezos',
    name: 'Jeff Bezos',
    short_name: 'Bezos',
    companies: ['Amazon', 'Blue Origin'],
    search_query: '"Jeff Bezos" OR (Amazon AND Bezos) OR ("Blue Origin" AND Bezos)',
    accent_color: '#ff9900',
    artwork_slug: 'jeff-bezos',
  },
  {
    key: 'huang',
    name: 'Jensen Huang',
    short_name: 'Huang',
    companies: ['Nvidia'],
    search_query: '"Jensen Huang" OR (Nvidia AND Huang)',
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
