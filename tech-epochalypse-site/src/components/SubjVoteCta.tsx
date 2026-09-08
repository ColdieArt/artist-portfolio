'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

// Community-vote call-to-action for a SUBJ page. Three states driven by the
// event's voting window (client clock, so the static export never goes
// stale): before → "opens on", during → link to /dossier-refinement,
// after → "closed". Server-renders the "before" state; useEffect corrects
// it after hydration so there's no SSR/CSR mismatch.
type Props = {
  voteOpen: number
  voteClose: number
  votingLabel: string
  eventLabel: string
}

export default function SubjVoteCta({ voteOpen, voteClose, votingLabel, eventLabel }: Props) {
  const [phase, setPhase] = useState<'before' | 'open' | 'after'>('before')

  useEffect(() => {
    const tick = () => {
      const now = Date.now()
      setPhase(now < voteOpen ? 'before' : now < voteClose ? 'open' : 'after')
    }
    tick()
    const t = setInterval(tick, 60_000)
    return () => clearInterval(t)
  }, [voteOpen, voteClose])

  const body = (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <div className="classified-header">
          {phase === 'open' ? 'Community Vote — Now Open' : phase === 'after' ? 'Community Vote — Closed' : 'Community Vote — Opens at Close'}
        </div>
        <h2 className="font-display text-2xl md:text-3xl text-white uppercase tracking-[0.03em] mt-1">
          Dossier Refinement
        </h2>
        <p className="font-mono text-xs md:text-sm text-white/70 mt-2 max-w-2xl leading-relaxed">
          Two entries, side by side. Pick the one you prefer — then do it
          again. Every choice is a head-to-head match, not a tally. Votes feed
          a ranking algorithm (Elo, the system used to rank chess players)
          that tracks <em>which</em> entries beat <em>which</em>. The
          top-ranked work wins the {eventLabel} Community Pick and is minted
          into the Tech Epochalypse dossier.
        </p>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/50 mt-3">
          Voting: {votingLabel}
        </p>
      </div>
      <span
        className={`inline-flex items-center gap-3 font-mono text-xs md:text-sm uppercase tracking-[0.2em] px-5 md:px-7 py-3 md:py-4 shrink-0 ${
          phase === 'open' ? 'bg-white text-black' : 'border border-white/30 text-white/60'
        }`}
      >
        <span>{phase === 'open' ? 'Start Voting' : phase === 'after' ? 'Voting Closed' : 'Opens After Submissions Close'}</span>
        {phase === 'open' && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform duration-300 group-hover:translate-x-1">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </span>
    </div>
  )

  const box = 'group block border bg-white/[0.02] p-5 md:p-7 transition-colors duration-300'
  if (phase === 'open') {
    return (
      <Link href="/dossier-refinement" className={`${box} border-white/20 hover:border-white hover:bg-white/[0.06]`}>
        {body}
      </Link>
    )
  }
  return <div className={`${box} border-white/10`}>{body}</div>
}
