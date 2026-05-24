'use client'

import { useCallback, useEffect, useState } from 'react'
import overlords from '@/data/overlords.json'

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

const overlordOptions = (overlords as Array<{ slug: string; name: string; status?: string }>)
  .filter((o) => o.status !== 'unlisted')

export default function VsPage() {
  const [overlord, setOverlord] = useState<string>('all')
  const [pair, setPair] = useState<Pair | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [voted, setVoted] = useState<{ winnerId: string; loserId: string } | null>(null)
  const [count, setCount] = useState(0)

  const loadPair = useCallback(async (slug: string) => {
    setLoading(true)
    setError(null)
    setVoted(null)
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
  }, [overlord, loadPair])

  const castVote = useCallback(
    async (winnerId: string, loserId: string) => {
      if (voted) return
      setVoted({ winnerId, loserId })
      try {
        await fetch(`${WORKER_URL}/vs/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ winner: winnerId, loser: loserId }),
        })
        setCount((c) => c + 1)
      } catch {
        // swallow — UI will move on regardless
      }
      // brief pause so the user sees the highlight, then next pair
      setTimeout(() => loadPair(overlord), 450)
    },
    [voted, overlord, loadPair]
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
            Data Refinement
          </h1>
          <p className="font-mono text-sm text-white/70 max-w-xl mx-auto mb-3">
            Pick one. Then pick another.
            <br />
            The highest voted work will win the Community Vote and will be
            minted into the Tech Epochalypse dossier.
          </p>
          <p className="font-mono text-sm text-white/50 max-w-xl mx-auto mb-6">
            Use ← / → keys.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 font-mono text-xs uppercase tracking-wider">
            <label className="text-white/60">Overlord:</label>
            <select
              value={overlord}
              onChange={(e) => setOverlord(e.target.value)}
              className="bg-black border border-white/30 text-white px-3 py-1.5"
            >
              <option value="all">All Overlords</option>
              {overlordOptions.map((o) => (
                <option key={o.slug} value={o.slug}>
                  {o.name}
                </option>
              ))}
            </select>
            <span className="text-white/40">Votes this session: {count}</span>
            {/* Leaderboard link hidden during the submission window.
                Flip the `false` to bring it back once results are public. */}
            {false && (
              <a href="/data-refinement/leaderboard" className="text-white/80 underline underline-offset-4">
                Leaderboard →
              </a>
            )}
          </div>
        </div>

        {loading && (
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

        {!loading && pair && (
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
                </button>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
