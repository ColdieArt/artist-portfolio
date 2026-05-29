'use client'

import { useCallback, useEffect, useState } from 'react'

const WORKER_URL =
  process.env.NEXT_PUBLIC_GALLERY_WORKER_URL ||
  'https://te-gallery-api.coldieart.workers.dev'

type Status = 'approved' | 'pending' | 'rejected'
type Counts = Record<Status, number>

type Item = {
  id: string
  overlord: string
  title: string
  imageUrl: string
  elo: number
  votes: number
}

const TABS: { key: Status; label: string }[] = [
  { key: 'approved', label: 'Approved' },
  { key: 'pending', label: 'Pending' },
  { key: 'rejected', label: 'Rejected' },
]

export default function VsAdminPage() {
  const [token, setToken] = useState('')
  const [authed, setAuthed] = useState(false)
  const [tab, setTab] = useState<Status>('pending')
  const [items, setItems] = useState<Item[]>([])
  const [counts, setCounts] = useState<Counts>({ approved: 0, pending: 0, rejected: 0 })
  const [loading, setLoading] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importMsg, setImportMsg] = useState<string | null>(null)

  // Persist token in sessionStorage so reloads don't lock you out mid-review.
  useEffect(() => {
    const saved = sessionStorage.getItem('vsAdminToken')
    if (saved) {
      setToken(saved)
      setAuthed(true)
    }
  }, [])

  const load = useCallback(async (t: string, status: Status) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `${WORKER_URL}/vs/admin/list?status=${encodeURIComponent(status)}`,
        { headers: { 'X-Admin-Token': t }, cache: 'no-store' }
      )
      if (res.status === 401) {
        setError('Invalid token.')
        setAuthed(false)
        sessionStorage.removeItem('vsAdminToken')
        return
      }
      const data = await res.json()
      setItems(data.items || [])
      if (data.counts) setCounts(data.counts as Counts)
      setAuthed(true)
      sessionStorage.setItem('vsAdminToken', t)
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Reload whenever the active tab (or auth state) changes.
  useEffect(() => {
    if (authed && token) load(token, tab)
  }, [authed, token, tab, load])

  async function decide(id: string, decision: 'approved' | 'rejected') {
    setBusyId(id)
    try {
      await fetch(`${WORKER_URL}/vs/admin/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
        body: JSON.stringify({ id, decision }),
      })
      // Optimistic UI: drop the item from the current tab; nudge the counters.
      setItems((prev) => prev.filter((x) => x.id !== id))
      setCounts((prev) => ({
        ...prev,
        [tab]: Math.max(0, prev[tab] - 1),
        [decision]: prev[decision] + 1,
      }))
    } finally {
      setBusyId(null)
    }
  }

  async function sync() {
    setSyncing(true)
    try {
      await fetch(`${WORKER_URL}/vs/admin/sync`, {
        method: 'POST',
        headers: { 'X-Admin-Token': token },
      })
      await load(token, tab)
    } finally {
      setSyncing(false)
    }
  }

  async function importFromAirtable() {
    setImporting(true)
    setImportMsg(null)
    try {
      const res = await fetch(`${WORKER_URL}/vs/admin/airtable-import`, {
        method: 'POST',
        headers: { 'X-Admin-Token': token },
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.ok) {
        const parts = [
          `${data.total} total`,
          `${data.inserted} new`,
          `${data.updated} updated`,
        ]
        if (typeof data.migrated === 'number') parts.push(`${data.migrated} copied to R2`)
        if (data.skipped) parts.push(`${data.skipped} skipped`)
        if (Array.isArray(data.failures) && data.failures.length) {
          parts.push(`${data.failures.length} failed`)
        }
        setImportMsg(`Import: ${parts.join(' · ')}`)
      } else {
        setImportMsg(`Import failed: ${data.error || res.status}`)
      }
      await load(token, tab)
    } catch (e) {
      setImportMsg(`Import error: ${(e as Error).message}`)
    } finally {
      setImporting(false)
    }
  }

  if (!authed) {
    return (
      <section className="pt-32 pb-24 section-padding bg-black min-h-screen">
        <div className="max-w-md mx-auto text-center">
          <h1 className="font-display text-3xl text-white uppercase tracking-wider mb-6">
            Dossier Refinement Admin
          </h1>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Admin token"
            className="w-full bg-black border border-white/30 text-white px-3 py-2 font-mono text-sm mb-4"
          />
          <button
            onClick={() => token && load(token, tab)}
            className="btn-primary w-full"
            disabled={!token}
          >
            <span>Unlock</span>
          </button>
          {error && <p className="mt-4 font-mono text-xs text-red-400">{error}</p>}
        </div>
      </section>
    )
  }

  // Which action buttons each tab shows. Approved → can demote to Rejected.
  // Rejected → can promote to Approved. Pending → both.
  const showApprove = tab !== 'approved'
  const showReject = tab !== 'rejected'

  return (
    <section className="pt-28 md:pt-36 pb-24 section-padding bg-black min-h-screen">
      <div className="page-container">
        <div className="flex flex-wrap items-baseline justify-between gap-4 mb-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-white mb-2">Admin</p>
            <h1 className="font-display text-3xl md:text-5xl text-white uppercase tracking-[0.05em]">
              Submissions Review
            </h1>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-wider">
            <button onClick={importFromAirtable} disabled={importing} className="btn-secondary">
              <span>{importing ? 'Importing…' : 'Import from Airtable'}</span>
            </button>
            <button onClick={sync} disabled={syncing} className="btn-secondary">
              <span>{syncing ? 'Syncing…' : 'Sync from R2'}</span>
            </button>
            <button
              onClick={() => {
                sessionStorage.removeItem('vsAdminToken')
                setAuthed(false)
                setToken('')
              }}
              className="text-white/60 underline underline-offset-4"
            >
              Sign out
            </button>
          </div>
        </div>

        {importMsg && (
          <p className="mb-4 font-mono text-xs text-white/70">{importMsg}</p>
        )}

        {/* Status tabs — counts come from the same /vs/admin/list response. */}
        <div className="border-b border-white/15 mb-6 flex flex-wrap gap-x-6 gap-y-2">
          {TABS.map((t) => {
            const active = tab === t.key
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={[
                  'pb-3 -mb-px font-mono text-xs uppercase tracking-[0.2em] transition-colors',
                  active
                    ? 'text-white border-b-2 border-white'
                    : 'text-white/40 hover:text-white/80',
                ].join(' ')}
              >
                {t.label} <span className="text-white/40">({counts[t.key]})</span>
              </button>
            )
          })}
        </div>

        {loading ? (
          <p className="text-center font-mono text-xs text-white/40 uppercase tracking-wider py-20">
            Loading…
          </p>
        ) : items.length === 0 ? (
          <p className="text-center font-mono text-sm text-white/60 py-20">
            {tab === 'pending'
              ? 'Nothing pending. Run "Sync from R2" or "Import from Airtable" to populate.'
              : tab === 'approved'
              ? 'No approved entries yet. Approve some from the Pending tab.'
              : 'No rejected entries.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((it) => (
              <div key={it.id} className="border border-white/15 bg-black">
                <div className="aspect-square overflow-hidden bg-white/[0.02]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={it.imageUrl}
                    alt={it.title || it.overlord}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/60 mb-1">
                    {it.overlord}
                  </p>
                  {it.title && (
                    <p className="font-mono text-xs text-white/80 truncate mb-1">{it.title}</p>
                  )}
                  <p className="font-mono text-[10px] text-white/40 truncate mb-2">{it.id}</p>
                  {tab === 'approved' && (
                    <p className="font-mono text-[10px] text-white/50 mb-3">
                      Elo {it.elo} · {it.votes} votes
                    </p>
                  )}
                  <div className="flex gap-2">
                    {showApprove && (
                      <button
                        onClick={() => decide(it.id, 'approved')}
                        disabled={busyId === it.id}
                        className="flex-1 border border-green-400 text-green-400 py-1.5 font-mono text-[10px] uppercase tracking-wider hover:bg-green-400/10 disabled:opacity-50"
                      >
                        {tab === 'rejected' ? 'Restore' : 'Approve'}
                      </button>
                    )}
                    {showReject && (
                      <button
                        onClick={() => decide(it.id, 'rejected')}
                        disabled={busyId === it.id}
                        className="flex-1 border border-red-400/60 text-red-400/80 py-1.5 font-mono text-[10px] uppercase tracking-wider hover:bg-red-400/10 disabled:opacity-50"
                      >
                        {tab === 'approved' ? 'Remove' : 'Reject'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
