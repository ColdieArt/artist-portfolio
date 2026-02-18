'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface OverlordPulse {
  key: string
  name: string
  pulse_7day: number
  trend_direction: string
  trend_percent: number
  avg_sentiment_7day: number
  sentiment_label: string
}

interface PulseData {
  updated_at: string | null
  overlords: OverlordPulse[]
  hottest: string | null
  biggest_surge: string | null
}

const ACCENT_COLORS: Record<string, string> = {
  musk: '#5b8cf7',
  zuckerberg: '#00d4ff',
  altman: '#f5e6a3',
  bezos: '#ff9900',
  huang: '#76b900',
}

const SHORT_NAMES: Record<string, string> = {
  musk: 'MUSK',
  zuckerberg: 'ZUCK',
  altman: 'ALTMAN',
  bezos: 'BEZOS',
  huang: 'HUANG',
}

const TREND_ARROWS: Record<string, string> = {
  surging: '\u2191\u2191',
  rising: '\u2191',
  stable: '\u2192',
  cooling: '\u2193',
  quiet: '\u2193\u2193',
}

const CACHE_KEY = 'pulse-bar-cache'
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

export default function PulseBar() {
  const [data, setData] = useState<PulseData | null>(null)
  const [visible, setVisible] = useState(false)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true

    // Check client-side cache
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const { data: cachedData, timestamp } = JSON.parse(cached)
        if (Date.now() - timestamp < CACHE_TTL) {
          setData(cachedData)
          setVisible(true)
          return
        }
      }
    } catch {}

    // Fetch fresh data
    fetch('/api/pulse')
      .then((res) => {
        if (!res.ok) throw new Error('API error')
        return res.json()
      })
      .then((pulseData: PulseData) => {
        if (pulseData.overlords && pulseData.overlords.length > 0) {
          setData(pulseData)
          setVisible(true)
          try {
            localStorage.setItem(
              CACHE_KEY,
              JSON.stringify({ data: pulseData, timestamp: Date.now() })
            )
          } catch {}
        }
      })
      .catch(() => {
        // Silently fail — pulse bar is non-essential
      })
  }, [])

  if (!visible || !data || data.overlords.length === 0) return null

  const maxPulse = Math.max(...data.overlords.map((o) => o.pulse_7day), 1)
  const hottest = data.overlords.find((o) => o.key === data.hottest)

  return (
    <div className="w-full bg-black/80 backdrop-blur-sm border-b border-white/5 z-40 relative">
      {/* Desktop */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-2">
          <div className="flex items-center gap-6">
            <Link
              href="/the-pulse"
              className="flex items-center gap-2 shrink-0"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
                The Pulse
              </span>
            </Link>

            <div className="flex items-center gap-4 flex-1 min-w-0">
              {data.overlords.map((overlord) => {
                const color = ACCENT_COLORS[overlord.key] || '#666'
                const width = (overlord.pulse_7day / maxPulse) * 100
                const arrow = TREND_ARROWS[overlord.trend_direction] || '\u2192'
                const isSurging = overlord.trend_direction === 'surging'

                return (
                  <Link
                    key={overlord.key}
                    href={`/the-pulse#${overlord.key}`}
                    className="flex items-center gap-2 group min-w-0"
                  >
                    <span className="font-mono text-[10px] text-white/40 group-hover:text-white/70 transition-colors whitespace-nowrap">
                      {SHORT_NAMES[overlord.key] || overlord.key.toUpperCase()}
                    </span>
                    <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden relative">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          isSurging ? 'animate-pulse-glow' : ''
                        }`}
                        style={{
                          width: `${width}%`,
                          backgroundColor: color,
                          boxShadow: isSurging
                            ? `0 0 8px ${color}60`
                            : 'none',
                        }}
                      />
                    </div>
                    <span className="font-mono text-[10px] text-white/30 whitespace-nowrap">
                      {overlord.pulse_7day}
                      <span className="ml-0.5">{arrow}</span>
                    </span>
                  </Link>
                )
              })}
            </div>

            {data.updated_at && (
              <span className="font-mono text-[9px] text-white/20 shrink-0">
                {new Date(data.updated_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        {hottest && (
          <Link href="/the-pulse" className="block px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/60">
                  <span
                    style={{ color: ACCENT_COLORS[hottest.key] || '#fff' }}
                  >
                    {SHORT_NAMES[hottest.key]}
                  </span>
                  {' '}
                  IS{' '}
                  {hottest.trend_direction === 'surging'
                    ? 'SURGING'
                    : hottest.trend_direction === 'rising'
                    ? 'RISING'
                    : 'LEADING'}
                </span>
              </div>
              <span className="font-mono text-[9px] text-white/30 uppercase tracking-[0.1em]">
                See The Pulse &rarr;
              </span>
            </div>
          </Link>
        )}
      </div>
    </div>
  )
}
