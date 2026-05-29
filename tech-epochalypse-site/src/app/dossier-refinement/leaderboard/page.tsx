'use client'

import { useEffect, useState } from 'react'
import overlords from '@/data/overlords.json'

const WORKER_URL =
  process.env.NEXT_PUBLIC_GALLERY_WORKER_URL ||
  'https://te-gallery-api.coldieart.workers.dev'

// Client-side gate only. The worker /vs/leaderboard endpoint itself stays
// public (the data is decorative), but the page is hidden behind a shared
// password so the standings stay private until launch. Persisted in
// sessionStorage so a tab refresh doesn't re-prompt.
const LEADERBOARD_PASSWORD = 'iknowsomeday'
const STORAGE_KEY = 'dossierLeaderboardUnlocked'

type Item = {
  id: string
  overlord: string
  title: string
  imageUrl: string
  elo: number
  votes: number
}

const overlordOptions = (overlords as Array<{ slug: string; name: string; status?: string }>)
  .filter((o) => o.status !== 'unlisted')

export default function VsLeaderboardPage() {
  const [unlocked, setUnlocked] = useState(false)
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState<string | null>(null)
  const [overlord, setOverlord] = useState<string>('all')
  const [items, setItems] = useState<Item[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  // Restore unlock state on mount.
  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem(STORAGE_KEY) === '1') {
      setUnlocked(true)
    }
  }, [])

  function tryUnlock(e: React.FormEvent) {
    e.preventDefault()
    if (pw === LEADERBOARD_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, '1')
      setUnlocked(true)
      setPwError(null)
    } else {
      setPwError('Incorrect password.')
    }
  }

  useEffect(() => {
    if (!unlocked) return
    let cancelled = false
    setLoading(true)
    fetch(`${WORKER_URL}/vs/leaderboard?overlord=${encodeURIComponent(overlord)}`, {
      cache: 'no-store',
    })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return
        setItems(d.items || [])
        setTotal(d.totalVotes || 0)
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [overlord, unlocked])

  if (!unlocked) {
    return (
      <section className="pt-32 pb-24 section-padding bg-black min-h-screen">
        <div className="max-w-md mx-auto text-center">
          <p className="font-mono text-xs uppercase tracking-[0.4em] text-white mb-3">Restricted</p>
          <h1 className="font-display text-3xl md:text-4xl text-white mb-6 uppercase tracking-wider">
            Leaderboard
          </h1>
          <p className="font-mono text-sm text-white/60 mb-6">
            Standings are private until launch. Enter the access code to view.
          </p>
          <form onSubmit={tryUnlock}>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Access code"
              autoFocus
              className="w-full bg-black border border-white/30 text-white px-3 py-2 font-mono text-sm mb-4"
            />
            <button type="submit" className="btn-primary w-full" disabled={!pw}>
              <span>Unlock</span>
            </button>
          </form>
          {pwError && <p className="mt-4 font-mono text-xs text-red-400">{pwError}</p>}
        </div>
      </section>
    )
  }

  return (
    <section className="pt-28 md:pt-36 pb-24 section-padding bg-black min-h-screen">
      <div className="page-container">
        <div className="text-center mb-10">
          <p className="font-mono text-xs uppercase tracking-[0.4em] text-white mb-3">Community</p>
          <h1 className="font-display text-4xl md:text-6xl text-white mb-3 uppercase tracking-[0.05em]">
            Leaderboard
          </h1>
          <p className="font-mono text-sm text-white/70 mb-6">
            Ranked by Elo. {total.toLocaleString()} votes cast.
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
            <a href="/dossier-refinement" className="text-white/80 underline underline-offset-4">
              Vote →
            </a>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 font-mono text-xs text-white/40 uppercase tracking-wider">
            Loading…
          </div>
        ) : items.length === 0 ? (
          <p className="text-center font-mono text-sm text-white/60">No approved entries yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 max-w-6xl mx-auto">
            {items.map((it, i) => (
              <div key={it.id} className="border border-white/15 bg-black">
                <div className="aspect-square overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={it.imageUrl} alt={it.title || it.overlord} className="w-full h-full object-cover" />
                </div>
                <div className="p-2.5">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/50">
                      #{i + 1}
                    </span>
                    <span className="font-mono text-xs text-white">{it.elo}</span>
                  </div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-white/60 truncate">
                    {it.overlord}
                  </p>
                  <p className="font-mono text-[10px] text-white/40">{it.votes} votes</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
