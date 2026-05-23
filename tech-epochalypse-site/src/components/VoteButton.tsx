'use client'

import { useEffect, useState } from 'react'
import { useTurnstile } from './TurnstileProvider'

const VOTE_ENDPOINT = process.env.NEXT_PUBLIC_VOTE_ENDPOINT || 'https://te-gallery-api.coldieart.workers.dev/vote'

// Global voting rule (Community Pick): one vote per visitor per 24h across the
// entire event. Both server-side (KV by IP hash) and client-side (this
// localStorage flag) enforce the same constraint. The flag persists which
// record the visitor voted for so all VoteButton instances can render the
// right state on load.
const GLOBAL_VOTE_KEY = 'tee_global_vote_v1'
const VOTE_EVENT = 'tee:vote-cast'
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000

type GlobalVote = { recordId: string; timestamp: number }

function getGlobalVote(): GlobalVote | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(GLOBAL_VOTE_KEY)
    if (!raw) return null
    const obj = JSON.parse(raw) as GlobalVote
    if (!obj || typeof obj.recordId !== 'string' || typeof obj.timestamp !== 'number') return null
    if (Date.now() - obj.timestamp > TWENTY_FOUR_HOURS) {
      localStorage.removeItem(GLOBAL_VOTE_KEY)
      return null
    }
    return obj
  } catch { return null }
}

function setGlobalVote(recordId: string) {
  try {
    localStorage.setItem(GLOBAL_VOTE_KEY, JSON.stringify({ recordId, timestamp: Date.now() }))
    window.dispatchEvent(new CustomEvent(VOTE_EVENT, { detail: { recordId } }))
  } catch { /* ignore quota errors */ }
}

interface Props {
  recordId: string
  initialVotes: number
  size?: 'sm' | 'lg'
}

export default function VoteButton({ recordId, initialVotes, size = 'sm' }: Props) {
  const { execute, enabled } = useTurnstile()
  const [count, setCount] = useState<number>(initialVotes)
  const [globalVote, setGlobalVoteState] = useState<GlobalVote | null>(null)
  const [busy, setBusy] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setGlobalVoteState(getGlobalVote())
    const onVote = () => setGlobalVoteState(getGlobalVote())
    window.addEventListener(VOTE_EVENT, onVote)
    return () => window.removeEventListener(VOTE_EVENT, onVote)
  }, [])

  const votedForThis = globalVote?.recordId === recordId
  const votedForOther = globalVote && !votedForThis
  const disabled = busy || !!globalVote

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (disabled) return
    setError(null)
    setBusy(true)
    try {
      let token = ''
      if (enabled) {
        try { token = await execute() } catch (err) { console.warn('Turnstile execute failed', err) }
      }
      const res = await fetch(VOTE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordId, turnstileToken: token, website: '' }),
      })
      const data = await res.json().catch(() => ({} as { votes?: number; alreadyVoted?: boolean; error?: string; votedFor?: string }))
      if (res.ok && typeof data.votes === 'number' && data.votes >= 0) {
        setCount(data.votes)
        setGlobalVote(recordId)
      } else if (res.status === 429 || data.alreadyVoted) {
        // Server says this IP already voted today (maybe from another device/browser).
        // Mirror the server's record into local state so the UI reflects the real vote.
        const previousVote = data.votedFor || recordId
        setGlobalVote(previousVote)
        // If the IP voted for a DIFFERENT piece than the one the user just clicked,
        // surface a clear message so they understand why the banner shows a different title.
        if (previousVote !== recordId) {
          setError('This device already voted for another piece today')
        }
      } else {
        setError(data.error || 'Vote failed')
      }
    } catch (err) {
      setError((err as Error).message || 'Vote failed')
    } finally {
      setBusy(false)
    }
  }

  const isLarge = size === 'lg'
  const px = isLarge ? '10px 14px' : '6px 10px'
  const fs = isLarge ? '13px' : '11px'
  const heartSize = isLarge ? 16 : 13

  // Visual state:
  //  - voted-this  → filled red heart, count, "you voted for this" tooltip
  //  - voted-other → muted heart + count, disabled, "you already voted today" tooltip
  //  - idle        → grey heart + count, clickable
  const bg = votedForThis ? 'rgba(229, 57, 70, 0.15)' : votedForOther ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.55)'
  const border = votedForThis ? '1px solid rgba(229,57,70,0.6)' : '1px solid rgba(255,255,255,0.2)'
  const color = votedForThis ? '#ff7a85' : votedForOther ? 'rgba(255,255,255,0.4)' : '#fff'
  const title = votedForThis
    ? 'You voted for this in the last 24h'
    : votedForOther
      ? 'You already voted on another piece today'
      : 'Vote'

  return (
    <button
      type="button"
      onClick={handleClick}
      // Note: intentionally NOT using the HTML `disabled` attribute here.
      // Disabled buttons don't fire click events in some browsers, which means
      // e.stopPropagation() in handleClick never runs and the click may bubble
      // up to the Card's lightbox handler. We handle the disabled state purely
      // via JS (handleClick returns early) + visual CSS instead.
      aria-disabled={disabled}
      title={title}
      aria-pressed={votedForThis}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: px,
        background: bg,
        border,
        color,
        fontFamily: 'monospace',
        fontSize: fs,
        cursor: disabled ? 'default' : 'pointer',
        opacity: busy ? 0.6 : 1,
        transition: 'background 0.15s, border-color 0.15s, opacity 0.15s, color 0.15s',
        userSelect: 'none',
        backdropFilter: 'blur(2px)',
      }}
    >
      <svg width={heartSize} height={heartSize} viewBox="0 0 24 24" fill={votedForThis ? '#ff5a66' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>{count}</span>
      {error && <span title={error} style={{ marginLeft: '4px', color: '#f99' }}>⚠</span>}
    </button>
  )
}
