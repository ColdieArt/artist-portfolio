// ─────────────────────────────────────────────────────────────────────────
// SUBJ:01 "The Singularity" — archived case file data.
// Winners are displayed by artist handle; images live in
// public/dossier/winners/. `designation` controls the stamp/label:
//   'coldie'    → Coldie Selection  ("Selected" ink stamp)
//   'community' → Community Vote     ("Voted" blue stamp, from /dossier-refinement)
// Each winner is minted as an edition on the Tech Epochalypse — Dossier
// contract (Transient Labs, Ethereum); `mint` is its token page.
// ─────────────────────────────────────────────────────────────────────────
export type Designation = 'coldie' | 'community'

export interface Winner {
  artist: string
  image: string
  designation: Designation
  title: string
  mint: string
  price: string
}

export const SUBJ_01_MINT_CONTRACT =
  'https://www.transient.xyz/nfts/ethereum/0x96127e5b97c2919c10ddd86c66661bf5d27ba2b9'

export const SUBJ_01_WINNERS: Winner[] = [
  {
    artist: '@BoyaGeorge',
    image: '/dossier/winners/@BoyaGeorge.jpeg',
    designation: 'coldie',
    title: 'Emperor of Dislikes — Mark Zuckerberg',
    mint: `${SUBJ_01_MINT_CONTRACT}/2`,
    price: '0.04 ETH',
  },
  {
    artist: '@METAGEISTVR',
    image: '/dossier/winners/@METAGEISTVR.jpeg',
    designation: 'coldie',
    title: 'BERG! — Mark Zuckerberg',
    mint: `${SUBJ_01_MINT_CONTRACT}/1`,
    price: '0.04 ETH',
  },
  {
    artist: '@ArtemIoha79094',
    image: '/dossier/winners/@ArtemIoha79094.jpeg',
    designation: 'community',
    title: 'Singularity — Elon Musk',
    mint: `${SUBJ_01_MINT_CONTRACT}/3`,
    price: '0.015 ETH',
  },
]

export const DESIGNATION_META: Record<Designation, { stamp: string; kicker: string; stampClass: string }> = {
  coldie: { stamp: 'Selected', kicker: 'Curator’s Pick — Coldie', stampClass: 'rubber-stamp--ink' },
  community: { stamp: 'Voted', kicker: 'Community Vote', stampClass: 'rubber-stamp--blue' },
}
