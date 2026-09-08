// Kinetic 3D Interactive portraits - live collect pages on Transient (Ethereum).
// Elon Musk is not listed here; only the four currently available subjects.
export const KINETIC_CONTRACT = '0xea030bb4da83c7b470f6d6109880116459509553'
export const KINETIC_COLLECTION_URL = `https://www.transient.xyz/nfts/ethereum/${KINETIC_CONTRACT}`

const tokenUrl = (id: number) => `${KINETIC_COLLECTION_URL}/${id}`

export type KineticMint = {
  slug: string
  name: string
  title: string
  tokenId: number
  url: string
  image: string
}

export const KINETIC_MINTS: KineticMint[] = [
  {
    slug: 'mark-zuckerberg',
    name: 'Mark Zuckerberg',
    title: 'The Connector',
    tokenId: 25,
    url: tokenUrl(25),
    image: '/images/overlords/Mark-Zuckerberg-coldie-kinetic-art.avif',
  },
  {
    slug: 'sam-altman',
    name: 'Sam Altman',
    title: 'The Accelerationist',
    tokenId: 27,
    url: tokenUrl(27),
    image: '/images/overlords/sam-altman-coldie-kinetic-3d.avif',
  },
  {
    slug: 'jeff-bezos',
    name: 'Jeff Bezos',
    title: 'The Optimizer',
    tokenId: 26,
    url: tokenUrl(26),
    image: '/images/overlords/jeff-bezos-coldie-kinetic-collage.avif',
  },
  {
    slug: 'jensen-huang',
    name: 'Jensen Huang',
    title: 'The Chipmaker',
    tokenId: 24,
    url: tokenUrl(24),
    image: '/images/overlords/jensen-huang-coldie-digital-3d-art.avif',
  },
]

export const KINETIC_MINT_URLS: Record<string, string> = Object.fromEntries(
  KINETIC_MINTS.map((m) => [m.slug, m.url])
)
