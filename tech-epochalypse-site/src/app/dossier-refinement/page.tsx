'use client'

import { useCallback, useEffect, useState } from 'react'

const WORKER_URL =
  process.env.NEXT_PUBLIC_GALLERY_WORKER_URL ||
  'https://te-gallery-api.coldieart.workers.dev'

type Img = {
  id: string
  overlord: string
  title: string
  imageUrl: string
  elo: number
  votes: number
}

type Pair = { left: Img; right: Img; overlord: string }

// Overlord filter removed from the UI — every pair is drawn from the full
// approved pool. The `overlord` constant is kept as 'all' so the existing
// worker call signature still works.
const overlord = 'all'

type Badge = { kind: string; label: string }

export default function VsPage() {
  const [pair, setPair] = useState<Pair | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [voted, setVoted] = useState<{ winnerId: string; loserId: string } | null>(null)
  const [count, setCount] = useState(0)
  const [badge, setBadge] = useState<Badge | null>(null)
  const [badgeVisible, setBadgeVisible] = useState(false)
  const [limitReached, setLimitReached] = useState(false)
  const [quota, setQuota] = useState<{ used: number; limit: number } | null>(null)

  const loadPair = useCallback(async (slug: string) => {
    setLoading(true)
    setError(null)
    setVoted(null)
    setBadge(null)
    setBadgeVisible(false)
    try {
      const res = await fetch(`${WORKER_URL}/vs/pair?overlord=${encodeURIComponent(slug)}`, {
        cache: 'no-store',
      })
      const data = await res.json()
      if (!res.ok) {
        setPair(null)
        setError(data?.error || 'Could not load a pair.')
      } else {
        setPair(data)
      }
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPair(overlord)
  }, [loadPair])

  const castVote = useCallback(
    async (winnerId: string, loserId: string) => {
      if (voted) return
      setVoted({ winnerId, loserId })
      try {
        const res = await fetch(`${WORKER_URL}/vs/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ winner: winnerId, loser: loserId }),
        })
        const data = await res.json().catch(() => null)
        // Always show a badge so the vote feels acknowledged, even if the
        // worker didn't supply one (network blip, older worker version, etc.).
        const nextBadge: Badge = (data?.badge as Badge) || { kind: 'delta', label: 'VOTE LOCKED' }
        setBadge(nextBadge)
        requestAnimationFrame(() => setBadgeVisible(true))
        if (typeof data?.used === 'number' && typeof data?.limit === 'number') {
          setQuota({ used: data.used, limit: data.limit })
        }
        if (data?.limitReached) {
          setLimitReached(true)
          return // don't queue another pair load
        }
        setCount((c) => c + 1)
      } catch {
        // Network failure — still confirm the click visually.
        setBadge({ kind: 'delta', label: 'VOTE LOCKED' })
        requestAnimationFrame(() => setBadgeVisible(true))
      }
      // Pause so the badge can land + read, then load the next pair.
      setTimeout(() => loadPair(overlord), 1200)
    },
    [voted, loadPair]
  )

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!pair || voted) return
      if (e.key === 'ArrowLeft') castVote(pair.left.id, pair.right.id)
      if (e.key === 'ArrowRight') castVote(pair.right.id, pair.left.id)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pair, voted, castVote])

  return (
    <section className="pt-28 md:pt-36 pb-24 section-padding bg-black min-h-screen">
      <div className="page-container">
        <div className="text-center mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.4em] text-white mb-3">Pairwise</p>
          <h1 className="font-display text-4xl md:text-6xl text-white mb-3 uppercase tracking-[0.05em]">
            Dossier Refinement
          </h1>
          <p className="font-mono text-sm text-white/70 max-w-2xl mx-auto mb-3 leading-relaxed">
            Two entries, side by side. Pick the one you prefer — then do it
            again. Every choice is a head-to-head match, not a tally.
          </p>
          <p className="font-mono text-sm text-white/60 max-w-2xl mx-auto mb-3 leading-relaxed">
            Each vote feeds a ranking algorithm (Elo, the system used to rank
            chess players) that tracks <em>which</em> entries beat <em>which</em>,
            not just how many votes they got. Beat a strong piece, gain more
            points. Lose to a weak one, drop more. The more matchups, the
            sharper the ranking.
          </p>
          <p className="font-mono text-sm text-white/60 max-w-2xl mx-auto mb-3 leading-relaxed">
            The top-ranked work wins the Community Pick and is minted into the
            Tech Epochalypse dossier.
          </p>
          <p className="font-mono text-sm text-white/50 max-w-xl mx-auto mb-2">
            Use ← / → keys.
          </p>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/60 max-w-xl mx-auto mb-6">
            Voting: Fri May 29 &ndash; June 10 &middot; 11:59 PM PT
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 font-mono text-xs uppercase tracking-wider">
            <span className="text-white/40">
              Votes cast: {quota ? `${quota.used} / ${quota.limit}` : count}
            </span>
            {/* Leaderboard link hidden during the submission window.
                Flip the `false` to bring it back once results are public. */}
            {false && (
              <a href="/dossier-refinement/leaderboard" className="text-white/80 underline underline-offset-4">
                Leaderboard →
              </a>
            )}
          </div>
        </div>

        {limitReached && (
          <div className="text-center py-20 max-w-xl mx-auto">
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-white/60 mb-4">
              Limit Reached
            </p>
            <h2 className="font-display text-3xl md:text-4xl text-white uppercase tracking-[0.05em] mb-4">
              Thanks for voting.
            </h2>
            <p className="font-mono text-sm text-white/70 leading-relaxed mb-2">
              You&rsquo;ve cast {quota?.limit ?? 25} votes — the maximum allowed
              per visitor. Every comparison you made feeds the ranking.
            </p>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50 mt-6">
              Winners announced Thu Jun 11 · 2 PM PT
            </p>
          </div>
        )}

        {!limitReached && loading && (
          <div className="text-center py-24 font-mono text-xs text-white/40 uppercase tracking-wider">
            Loading…
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-24">
            <p className="font-mono text-sm text-white/70 mb-6">{error}</p>
            <button onClick={() => loadPair(overlord)} className="btn-secondary">
              <span>Retry</span>
            </button>
          </div>
        )}

        {!limitReached && !loading && pair && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 max-w-5xl mx-auto">
            {[pair.left, pair.right].map((img) => {
              const isWinner = voted?.winnerId === img.id
              const isLoser = voted?.loserId === img.id
              const opponentId = img.id === pair.left.id ? pair.right.id : pair.left.id
              return (
                <button
                  key={img.id}
                  onClick={() => castVote(img.id, opponentId)}
                  disabled={!!voted}
                  className={[
                    'group relative aspect-square overflow-hidden border transition-all',
                    isWinner
                      ? 'border-green-400 ring-2 ring-green-400/60'
                      : isLoser
                      ? 'border-white/10 opacity-30'
                      : 'border-white/20 hover:border-white hover:scale-[1.01]',
                  ].join(' ')}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.imageUrl}
                    alt={img.title || img.overlord}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                  {img.title && (
                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-left">
                      <p className="font-mono text-xs text-white/90">{img.title}</p>
                    </div>
                  )}

                  {/* Flavor stamp — typewriter-style badge punches onto the
                      winning thumbnail right after the vote registers. Pure
                      decoration: no links, no interactions. Fades + scales
                      in via CSS transition. */}
                  {isWinner && badge && (
                    <div
                      className={[
                        'absolute inset-0 flex items-center justify-center pointer-events-none',
                        'transition-all duration-200 ease-out',
                        badgeVisible
                          ? 'opacity-100 scale-100 -rotate-3'
                          : 'opacity-0 scale-50 rotate-12',
                      ].join(' ')}
                    >
                      <div className="bg-black/85 border-2 border-white px-5 py-3 font-mono uppercase text-white text-center shadow-lg">
                        <div className="text-base md:text-xl tracking-[0.25em] leading-none">
                          {badge.label}
                        </div>
                      </div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
