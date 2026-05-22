'use client'

import { useEffect, useState } from 'react'
import { useTurnstile } from './TurnstileProvider'

const VOTE_ENDPOINT = process.env.NEXT_PUBLIC_VOTE_ENDPOINT || 'https://te-gallery-api.coldieart.workers.dev/vote'

interface Props {
  recordId: string
  initialVotes: number
  size?: 'sm' | 'lg'
}

function lsKey(recordId: string) { return `voted:${recordId}` }

function hasVotedRecently(recordId: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    const v = localStorage.getItem(lsKey(recordId))
    if (!v) return false
    const t = parseInt(v, 10)
    if (Number.isNaN(t)) return false
    return Date.now() - t < 24 * 60 * 60 * 1000
  } catch { return false }
}

export default function VoteButton({ recordId, initialVotes, size = 'sm' }: Props) {
  const { execute, enabled } = useTurnstile()
  const [count, setCount] = useState<number>(initialVotes)
  const [voted, setVoted] = useState<boolean>(false)
  const [busy, setBusy] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setVoted(hasVotedRecently(recordId))
  }, [recordId])

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (busy || voted) return
    setError(null)
    setBusy(true)
    try {
      let token = ''
      if (enabled) {
        try { token = await execute() } catch (err) { /* fallthrough; server will 400 */ console.warn('Turnstile execute failed', err) }
      }
      const res = await fetch(VOTE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordId, turnstileToken: token, website: '' }),
      })
      const data = await res.json().catch(() => ({} as { votes?: number; alreadyVoted?: boolean; error?: string }))
      if (res.ok && typeof data.votes === 'number' && data.votes >= 0) {
        setCount(data.votes)
        setVoted(true)
        try { localStorage.setItem(lsKey(recordId), Date.now().toString()) } catch { /* ignore */ }
      } else if (res.status === 429 || data.alreadyVoted) {
        setVoted(true)
        try { localStorage.setItem(lsKey(recordId), Date.now().toString()) } catch { /* ignore */ }
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

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy || voted}
      title={voted ? 'Already voted in the last 24h' : 'Vote'}
      aria-pressed={voted}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: px,
        background: voted ? 'rgba(229, 57, 70, 0.15)' : 'rgba(0,0,0,0.55)',
        border: voted ? '1px solid rgba(229,57,70,0.6)' : '1px solid rgba(255,255,255,0.2)',
        color: voted ? '#ff7a85' : '#fff',
        fontFamily: 'monospace',
        fontSize: fs,
        cursor: voted || busy ? 'default' : 'pointer',
        opacity: busy ? 0.6 : 1,
        transition: 'background 0.15s, border-color 0.15s, opacity 0.15s',
        userSelect: 'none',
        backdropFilter: 'blur(2px)',
      }}
    >
      <svg width={heartSize} height={heartSize} viewBox="0 0 24 24" fill={voted ? '#ff5a66' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>{count}</span>
      {error && <span title={error} style={{ marginLeft: '4px', color: '#f99' }}>⚠</span>}
    </button>
  )
}
