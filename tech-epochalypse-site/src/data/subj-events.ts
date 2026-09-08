// ─────────────────────────────────────────────────────────────────────────
// SUBJ design competitions — single source of truth for the site.
//
// Add a new entry here when the next SUBJ launches. /subj/<id> renders from
// this table; the worker (worker/src/index.ts → SUBJ_EVENTS) holds the same
// dates for server-side window enforcement — keep the two in sync.
//
// `category` is the exact string written to Airtable's "Category" column
// and to D1 `images.event`. SUBJ:01 predates event tagging, so its Airtable
// rows use the legacy 'general submission' value.
// ─────────────────────────────────────────────────────────────────────────

export type SubjStatus = 'live' | 'upcoming' | 'closed'

export interface SubjEventConfig {
  id: string
  title: string
  subtitle: string
  status: SubjStatus
  category: string
  shortDescription: string
  /** Overlord slugs eligible for this event (order = display order). */
  overlordSlugs: string[]
  /** Epoch ms — used by the client-side vote CTA to pick its state. */
  voteOpen: number
  voteClose: number
  /** Display strings for the brief column. */
  dates: {
    opens: string
    closes: string
    voting: string
    winners: string
    mints: string
    snapshot: string
  }
  /** Section label + copy for the "who holds what" collector rewards block. */
  rewards: {
    momentsLabel: string
    kineticLabel: string
  }
  /** Closing line of the brief. */
  signoff: string
  /** Where the archived record lives once the event closes. */
  archiveHref?: string
}

export const SUBJ_EVENTS: Record<string, SubjEventConfig> = {
  '01': {
    id: '01',
    title: 'The Singularity',
    subtitle: 'Tech Epochalypse Remix Competition',
    status: 'closed',
    category: 'general submission',
    shortDescription:
      'Five tech overlords, each a face of the Singularity. Pick one, remix it in Coldie’s editor, and submit your own parallax collage. Use Coldie’s assets, upload your own, or both — all entries compete equally.',
    overlordSlugs: ['elon-musk', 'mark-zuckerberg', 'sam-altman', 'jeff-bezos', 'jensen-huang'],
    voteOpen: Date.UTC(2026, 4, 29, 7),
    voteClose: Date.UTC(2026, 5, 11, 7),
    dates: {
      opens: 'Sat May 23 · 9 AM ET',
      closes: 'Wed May 28 · 11:59 PT',
      voting: 'Fri May 29 – June 10 · 11:59 PM PT',
      winners: 'Thu Jun 11 · 2 PM PT',
      mints: 'Mon Jun 15',
      snapshot: 'May 28, 11:59 PT',
    },
    rewards: {
      momentsLabel: 'Moments holders (50 per overlord)',
      kineticLabel: 'Kinetic holders (10 per overlord)',
    },
    signoff: 'The Singularity has five faces. Pick yours.',
    archiveHref: '/dossier/01',
  },
  '02': {
    id: '02',
    title: 'AGI Has Arrived',
    subtitle: 'Tech Epochalypse Remix Competition',
    status: 'live',
    category: 'subj-02',
    shortDescription:
      'One overlord. One threshold. Jensen Huang built the machine it woke up inside — now remix him in Coldie’s editor and file your evidence of the morning after. Use Coldie’s assets, upload your own, or both — all entries compete equally.',
    overlordSlugs: ['jensen-huang'],
    // Voting: Wed Sep 23 12:00 AM PT → Wed Sep 30 11:59 PM PT (PDT = UTC-7)
    voteOpen: Date.UTC(2026, 8, 23, 7),
    voteClose: Date.UTC(2026, 9, 1, 7),
    dates: {
      opens: 'Wed Sep 9 · 9 AM ET',
      closes: 'Wed Sep 23 · 11:59 PM PT',
      voting: 'Wed Sep 23 – Wed Sep 30 · 11:59 PM PT',
      winners: 'Wed Oct 7',
      mints: 'Wed Oct 14',
      snapshot: 'Sep 23, 11:59 PM PT',
    },
    rewards: {
      momentsLabel: 'Jensen Huang Moments holders (50)',
      kineticLabel: 'Jensen Huang Kinetic holders (10)',
    },
    signoff: 'AGI has arrived. Show us what it looks like.',
  },
}

/** The event currently accepting submissions / votes. */
export const ACTIVE_SUBJ_ID = '02'
export const ACTIVE_SUBJ = SUBJ_EVENTS[ACTIVE_SUBJ_ID]
