'use client'

// Multi-row gallery with shared lightbox + a "you have 1 vote today" header.
// Replaces the legacy single-grid GalleryViewer when UserExports is passed
// multiRow=true. Renders:
//   - VoteStatusBanner ("YOU HAVE 1 VOTE TODAY" or "✓ You voted X — Y left")
//   - 🏆 Top from Each Overlord    (one per overlord, 5 cards)
//   - 🔥 Trending This Week        (top 6 by recent 7-day votes)
//   - 🆕 Just Submitted            (newest 6 by date)
//   - 💎 Hidden Gems               (random 6 from items with <10 votes)
//   - 🥇 All-Time Leaders          (top 6 by total Votes)
//   - All Submissions              (full filterable grid)
//   - Shared lightbox dialog

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { GalleryItem } from './GalleryViewer'
import VoteButton from './VoteButton'
import ShareButton from './ShareButton'

const GLOBAL_VOTE_KEY = 'tee_global_vote_v1'
const VOTE_EVENT = 'tee:vote-cast'
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000

type GlobalVote = { recordId: string; timestamp: number }

function readGlobalVote(): GlobalVote | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(GLOBAL_VOTE_KEY)
    if (!raw) return null
    const obj = JSON.parse(raw) as GlobalVote
    if (!obj || typeof obj.recordId !== 'string' || typeof obj.timestamp !== 'number') return null
    if (Date.now() - obj.timestamp > TWENTY_FOUR_HOURS) return null
    return obj
  } catch { return null }
}

function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m`
  return 'less than 1 min'
}

interface Props {
  items: GalleryItem[]
  recentVotes: Record<string, number>
  overlordNames: Record<string, string>
  overlordSlugs: string[]
}

export default function EnhancedGallery({ items, recentVotes, overlordNames, overlordSlugs }: Props) {
  // ── Vote status banner state ───────────────────────────────────────────────
  const [globalVote, setGlobalVote] = useState<GlobalVote | null>(null)
  useEffect(() => {
    setGlobalVote(readGlobalVote())
    const onVote = () => setGlobalVote(readGlobalVote())
    window.addEventListener(VOTE_EVENT, onVote)
    // refresh every minute so the "Xh Ym left" countdown ticks
    const t = setInterval(() => setGlobalVote(readGlobalVote()), 60_000)
    return () => { window.removeEventListener(VOTE_EVENT, onVote); clearInterval(t) }
  }, [])

  const votedItem = useMemo(
    () => (globalVote ? items.find((i) => i.id === globalVote.recordId) ?? null : null),
    [globalVote, items],
  )

  // ── Derived row datasets ───────────────────────────────────────────────────
  const enriched = useMemo(
    () => items.map((i) => ({ ...i, recent: recentVotes[i.id] || 0 })),
    [items, recentVotes],
  )

  const trending = useMemo(
    () => [...enriched]
      .filter((i) => i.recent > 0)
      .sort((a, b) => b.recent - a.recent || (b.votes ?? 0) - (a.votes ?? 0))
      .slice(0, 6),
    [enriched],
  )

  const newest = useMemo(
    () => [...items]
      .sort((a, b) => String(b.date).localeCompare(String(a.date)))
      .slice(0, 6),
    [items],
  )

  const hiddenGems = useMemo(() => {
    const pool = items.filter((i) => (i.votes ?? 0) < 10)
    // Fisher-Yates shuffle on a copy
    const arr = [...pool]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr.slice(0, 6)
  }, [items])

  const leaders = useMemo(
    () => [...items]
      .sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0))
      .slice(0, 6),
    [items],
  )

  const perOverlordTop = useMemo(() => {
    return overlordSlugs
      .map((slug) => {
        const pool = items.filter((i) => i.overlord === slug)
        if (pool.length === 0) return null
        return [...pool].sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0))[0]
      })
      .filter((x): x is GalleryItem => !!x)
  }, [items, overlordSlugs])

  // ── Full grid filter + sort ────────────────────────────────────────────────
  const [filter, setFilter] = useState<string>('all')
  const [sort, setSort] = useState<'trending' | 'top' | 'newest' | 'random'>('trending')
  const filtered = useMemo(() => {
    const base = filter === 'all' ? enriched : enriched.filter((i) => i.overlord === filter)
    const arr = [...base]
    if (sort === 'trending') arr.sort((a, b) => b.recent - a.recent || (b.votes ?? 0) - (a.votes ?? 0))
    else if (sort === 'top') arr.sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0))
    else if (sort === 'newest') arr.sort((a, b) => String(b.date).localeCompare(String(a.date)))
    else { // random
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
      }
    }
    return arr
  }, [enriched, filter, sort])

  // ── Shared lightbox state ──────────────────────────────────────────────────
  // Lightbox cycles through whatever list it was opened from (the active row).
  const [lightbox, setLightbox] = useState<{ list: GalleryItem[]; index: number } | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

  const openLightbox = useCallback((list: GalleryItem[], index: number) => {
    setLightbox({ list, index })
  }, [])
  const closeLightbox = useCallback(() => setLightbox(null), [])
  const goNext = useCallback(() => {
    setLightbox((p) => (p ? { list: p.list, index: (p.index + 1) % p.list.length } : null))
  }, [])
  const goPrev = useCallback(() => {
    setLightbox((p) => (p ? { list: p.list, index: (p.index - 1 + p.list.length) % p.list.length } : null))
  }, [])

  useEffect(() => {
    const d = dialogRef.current
    if (!d) return
    if (lightbox && !d.open) d.showModal()
    else if (!lightbox && d.open) d.close()
  }, [lightbox])

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      else if (e.key === 'ArrowRight') goNext()
      else if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, closeLightbox, goNext, goPrev])

  // Deep-link sync: ?p=<recordId> opens that piece on mount, URL stays in sync
  const hydratedRef = useRef(false)
  useEffect(() => {
    if (hydratedRef.current) return
    hydratedRef.current = true
    if (typeof window === 'undefined' || items.length === 0) return
    try {
      const p = new URLSearchParams(window.location.search).get('p')
      if (!p) return
      const idx = filtered.findIndex((i) => i.id === p)
      if (idx >= 0) setLightbox({ list: filtered, index: idx })
    } catch { /* ignore */ }
  }, [filtered, items.length])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const url = new URL(window.location.href)
      if (lightbox) {
        const item = lightbox.list[lightbox.index]
        if (item) url.searchParams.set('p', item.id)
      } else {
        url.searchParams.delete('p')
      }
      window.history.replaceState(null, '', url.toString())
    } catch { /* ignore */ }
  }, [lightbox])

  const currentItem = lightbox ? lightbox.list[lightbox.index] : null

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-12">

      {/* Vote-status banner */}
      <VoteStatusBanner globalVote={globalVote} votedItem={votedItem} />

      {/* 🏆 Top from Each Overlord */}
      {perOverlordTop.length > 0 && (
        <Row
          icon="🏆"
          title="Top from Each Overlord"
          subtitle="One leader per category — every overlord stays visible"
          items={perOverlordTop}
          overlordNames={overlordNames}
          onCardClick={(i) => openLightbox(perOverlordTop, i)}
          recentMap={recentVotes}
        />
      )}

      {/* 🔥 Trending This Week */}
      {trending.length > 0 && (
        <Row
          icon="🔥"
          title="Trending This Week"
          subtitle="Most votes in the last 7 days"
          items={trending}
          overlordNames={overlordNames}
          onCardClick={(i) => openLightbox(trending, i)}
          recentMap={recentVotes}
          showTrendBadge
        />
      )}

      {/* 🆕 Just Submitted */}
      {newest.length > 0 && (
        <Row
          icon="🆕"
          title="Just Submitted"
          subtitle="Newest entries — give them their first vote"
          items={newest}
          overlordNames={overlordNames}
          onCardClick={(i) => openLightbox(newest, i)}
          recentMap={recentVotes}
        />
      )}

      {/* 💎 Hidden Gems */}
      {hiddenGems.length > 0 && (
        <Row
          icon="💎"
          title="Hidden Gems"
          subtitle="Fewer than 10 votes — discover something new"
          items={hiddenGems}
          overlordNames={overlordNames}
          onCardClick={(i) => openLightbox(hiddenGems, i)}
          recentMap={recentVotes}
        />
      )}

      {/* 🥇 All-Time Leaders */}
      {leaders.length > 0 && (
        <Row
          icon="🥇"
          title="All-Time Leaders"
          subtitle="Top total vote counts"
          items={leaders}
          overlordNames={overlordNames}
          onCardClick={(i) => openLightbox(leaders, i)}
          recentMap={recentVotes}
        />
      )}

      {/* All Submissions — full filterable grid */}
      <div>
        <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 mb-1">All Submissions</div>
            <h3 className="font-display text-xl md:text-2xl text-white uppercase tracking-[0.03em]">
              Browse the Full Gallery
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['trending', 'top', 'newest', 'random'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={`font-mono text-[10px] uppercase tracking-[0.15em] px-3 py-1.5 border transition-colors ${
                  sort === s ? 'bg-white text-black border-white' : 'bg-transparent text-white/70 border-white/20 hover:text-white hover:border-white/50'
                }`}
              >
                {s}
              </button>
            ))}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="font-mono text-[10px] uppercase tracking-[0.15em] px-3 py-1.5 bg-transparent text-white border border-white/20 hover:border-white/50 focus:outline-none focus:border-white"
              aria-label="Filter by overlord"
            >
              <option value="all" className="bg-black">All Overlords</option>
              {overlordSlugs.map((s) => (
                <option key={s} value={s} className="bg-black">{overlordNames[s] ?? s}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filtered.map((item, i) => (
            <Card
              key={item.id}
              item={item}
              overlordName={overlordNames[item.overlord] ?? item.overlord}
              recent={recentVotes[item.id] || 0}
              onClick={() => openLightbox(filtered, i)}
            />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 border border-dashed border-white/10">
            <p className="font-mono text-xs text-white/60 uppercase tracking-wider">No pieces in this filter.</p>
          </div>
        )}
      </div>

      {/* ── Shared lightbox ───────────────────────────────────────────────── */}
      <dialog
        ref={dialogRef}
        onClick={(e) => { if (e.target === e.currentTarget) closeLightbox() }}
        onCancel={(e) => { e.preventDefault(); closeLightbox() }}
        style={{
          position: 'fixed', inset: 0, width: '100vw', height: '100dvh',
          maxWidth: 'none', maxHeight: 'none', margin: 0, padding: 0,
          border: 'none', background: 'black', color: 'white', overflow: 'hidden',
        }}
      >
        {currentItem && lightbox && (
          <div style={{ display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr) auto', height: '100dvh' }}>
            {/* Top bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.9)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <p style={{ fontFamily: 'monospace', fontSize: 13, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentItem.title}
                </p>
                <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>by {currentItem.contributor}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#fff', marginRight: 8 }}>
                  {lightbox.index + 1} / {lightbox.list.length}
                </span>
                <VoteButton recordId={currentItem.id} initialVotes={currentItem.votes ?? 0} size="lg" />
                <ShareButton recordId={currentItem.id} title={currentItem.title} contributor={currentItem.contributor} imageUrl={currentItem.src} size="lg" />
                <button onClick={closeLightbox} style={{ padding: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#fff' }} title="Close (Esc)">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            {/* Image area */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', minHeight: 0, minWidth: 0 }}>
              <button onClick={goPrev} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', zIndex: 2, padding: 12, background: 'rgba(0,0,0,0.4)', border: 'none', cursor: 'pointer', color: '#fff' }} title="Previous (Left arrow)">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={currentItem.id}
                src={currentItem.src}
                alt={currentItem.title}
                style={{ display: 'block', maxWidth: '100vw', maxHeight: 'calc(100dvh - 100px)', width: 'auto', height: 'auto', objectFit: 'contain', filter: 'contrast(1.1)' }}
              />
              <button onClick={goNext} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', zIndex: 2, padding: 12, background: 'rgba(0,0,0,0.4)', border: 'none', cursor: 'pointer', color: '#fff' }} title="Next (Right arrow)">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            </div>
            {/* Bottom bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.9)' }}>
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                {overlordNames[currentItem.overlord] ?? currentItem.overlord}
              </span>
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{currentItem.date}</span>
            </div>
          </div>
        )}
      </dialog>
    </div>
  )
}

// ── Vote status banner ───────────────────────────────────────────────────────

function VoteStatusBanner({ globalVote, votedItem }: { globalVote: GlobalVote | null; votedItem: GalleryItem | null }) {
  if (!globalVote) {
    return (
      <div
        className="flex items-center justify-between gap-4 p-4 md:p-5 border border-white/15"
        style={{ background: 'linear-gradient(90deg, rgba(229,57,70,0.18), rgba(229,57,70,0.04))' }}
      >
        <div className="flex items-center gap-3">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#ff5a66" stroke="#ff5a66" strokeWidth="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <div>
            <div className="font-mono text-sm md:text-base text-white font-bold uppercase tracking-[0.15em]">
              You have 1 vote today
            </div>
            <div className="font-mono text-[11px] text-white/70 mt-0.5">
              Pick your favorite piece. Votes reset every 24h.
            </div>
          </div>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 hidden md:block">
          1 / 1 vote remaining
        </div>
      </div>
    )
  }

  const remaining = TWENTY_FOUR_HOURS - (Date.now() - globalVote.timestamp)
  const remainingStr = formatRemaining(remaining)
  const title = votedItem ? votedItem.title : 'a submission'

  return (
    <div
      className="flex items-center justify-between gap-4 p-4 md:p-5 border border-white/15"
      style={{ background: 'linear-gradient(90deg, rgba(76,175,80,0.18), rgba(76,175,80,0.04))' }}
    >
      <div className="flex items-center gap-3">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7ee36b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <div>
          <div className="font-mono text-sm md:text-base text-white font-bold uppercase tracking-[0.15em]">
            You voted for &ldquo;{title}&rdquo;
          </div>
          <div className="font-mono text-[11px] text-white/70 mt-0.5">
            Next vote available in {remainingStr}. Share your pick to rally votes for it.
          </div>
        </div>
      </div>
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 hidden md:block">
        0 / 1 vote remaining
      </div>
    </div>
  )
}

// ── A single horizontally-scrolling row of cards ─────────────────────────────

function Row({
  icon, title, subtitle, items, overlordNames, onCardClick, recentMap, showTrendBadge,
}: {
  icon: string
  title: string
  subtitle: string
  items: GalleryItem[]
  overlordNames: Record<string, string>
  onCardClick: (index: number) => void
  recentMap: Record<string, number>
  showTrendBadge?: boolean
}) {
  return (
    <div>
      <div className="flex items-end justify-between gap-4 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl md:text-3xl leading-none flex-shrink-0">{icon}</span>
          <div className="min-w-0">
            <h3 className="font-display text-lg md:text-xl text-white uppercase tracking-[0.03em] truncate">
              {title}
            </h3>
            <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/50 mt-0.5">
              {subtitle}
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-flow-col auto-cols-[minmax(220px,1fr)] md:auto-cols-[minmax(260px,1fr)] gap-3 md:gap-4 overflow-x-auto pb-2" style={{ scrollSnapType: 'x mandatory' }}>
        {items.map((item, i) => (
          <div key={item.id} style={{ scrollSnapAlign: 'start' }}>
            <Card
              item={item}
              overlordName={overlordNames[item.overlord] ?? item.overlord}
              recent={recentMap[item.id] || 0}
              onClick={() => onCardClick(i)}
              showTrendBadge={showTrendBadge}
              compact
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── A single card with always-visible vote count + share + open-lightbox ─────

function Card({
  item, overlordName, recent, onClick, showTrendBadge, compact,
}: {
  item: GalleryItem
  overlordName: string
  recent: number
  onClick: () => void
  showTrendBadge?: boolean
  compact?: boolean
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }}
      className="group relative bg-charcoal/30 border border-white/10 hover:border-white/30 overflow-hidden text-left cursor-pointer focus:outline-none focus:border-white/40 transition-colors"
    >
      <div className="aspect-video relative overflow-hidden bg-charcoal" style={{ aspectRatio: '16/9' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.src}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
          style={{ filter: 'contrast(1.1)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />

        {/* Always-visible vote count pill (top-left) */}
        <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 2, display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,0.7)', padding: '4px 8px', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(2px)' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="#ff5a66" stroke="#ff5a66" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#fff', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
            {item.votes ?? 0}
          </span>
          <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em', marginLeft: 2 }}>
            VOTES
          </span>
        </div>

        {/* Trend badge (when this card came from the Trending row) */}
        {showTrendBadge && recent > 0 && (
          <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 2, display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(229,57,70,0.85)', padding: '4px 8px', color: '#fff', fontFamily: 'monospace', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            🔥 +{recent} THIS WEEK
          </div>
        )}

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
          <p className={`font-mono text-white truncate ${compact ? 'text-xs' : 'text-sm'} mb-1`}>
            {item.title}
          </p>
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-xs text-white/80 truncate">
              {item.contributor}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-white/60 truncate">
              {overlordName}
            </span>
          </div>
        </div>

        {/* Vote + Share controls
            ─────────────────────
            On TRENDING cards we stack these vertically in the top-right,
            directly beneath the "🔥 +N THIS WEEK" chip, rendered in the badge
            style (red fill, monospace caps) at ~3x the regular text size so
            they're the obvious tap target.
            On non-trending cards we keep the compact top-right pair. */}
        {showTrendBadge && recent > 0 ? (
          <div
            style={{
              position: 'absolute',
              // Badge sits at top:8 and is ~22px tall → start the stack at 38
              // so there's a small gap matching the badge's own padding.
              top: 38,
              right: 8,
              zIndex: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: 6,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <VoteButton recordId={item.id} initialVotes={item.votes ?? 0} size="xl" />
            <ShareButton recordId={item.id} title={item.title} contributor={item.contributor} imageUrl={item.src} size="xl" />
          </div>
        ) : (
          <div
            style={{ position: 'absolute', top: 8, right: 8, zIndex: 2, display: 'flex', gap: 6 }}
            onClick={(e) => e.stopPropagation()}
          >
            <VoteButton recordId={item.id} initialVotes={item.votes ?? 0} size="sm" />
            <ShareButton recordId={item.id} title={item.title} contributor={item.contributor} imageUrl={item.src} size="sm" />
          </div>
        )}
      </div>
    </div>
  )
}
