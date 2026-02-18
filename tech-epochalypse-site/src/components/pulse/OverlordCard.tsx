'use client'

import { useState, useEffect } from 'react'

const ACCENT_COLORS: Record<string, string> = {
  musk: '#5b8cf7',
  zuckerberg: '#00d4ff',
  altman: '#f5e6a3',
  bezos: '#ff9900',
  huang: '#76b900',
}

const TREND_ARROWS: Record<string, string> = {
  surging: '\u2191\u2191',
  rising: '\u2191',
  stable: '\u2192',
  cooling: '\u2193',
  quiet: '\u2193\u2193',
}

interface Headline {
  title: string
  source_name: string
  url: string
  published_at: string
  description: string
}

interface OverlordData {
  key: string
  name: string
  pulse_7day: number
  pulse_30day: number
  trend_direction: string
  trend_percent: number
  avg_sentiment_7day: number
  sentiment_label: string
  top_headlines: Headline[]
  peak_day_30d: string | null
  peak_count_30d: number
}

interface DailyEntry {
  date: string
  article_count: number
  sentiment_score: number
}

interface OverlordDetail {
  daily_history: DailyEntry[]
}

interface OverlordCardProps {
  overlord: OverlordData
  defaultExpanded?: boolean
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const w = 200
  const h = 32
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w
      const y = h - ((v - min) / range) * h
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full h-8"
      preserveAspectRatio="none"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 1) return 'just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function OverlordCard({
  overlord,
  defaultExpanded = false,
}: OverlordCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [detail, setDetail] = useState<OverlordDetail | null>(null)
  const [loading, setLoading] = useState(false)

  const color = ACCENT_COLORS[overlord.key] || '#666'
  const arrow = TREND_ARROWS[overlord.trend_direction] || '\u2192'
  const trendSign = overlord.trend_percent >= 0 ? '+' : ''

  // Check if this card should be auto-expanded via hash
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '')
      if (hash === overlord.key) {
        setExpanded(true)
      }
    }
  }, [overlord.key])

  useEffect(() => {
    if (expanded && !detail && !loading) {
      setLoading(true)
      fetch(`/api/pulse/${overlord.key}`)
        .then((res) => res.json())
        .then((data: OverlordDetail) => {
          setDetail(data)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [expanded, detail, loading, overlord.key])

  const sparkData = detail?.daily_history?.map((d) => d.article_count) || []

  return (
    <div
      id={overlord.key}
      className="border border-white/5 hover:border-white/10 bg-white/[0.02] transition-all scroll-mt-24"
    >
      {/* Color accent bar */}
      <div className="h-0.5" style={{ backgroundColor: color }} />

      {/* Collapsed header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex items-center justify-between text-left group"
      >
        <div className="flex items-center gap-4 min-w-0">
          <span
            className="font-display text-base md:text-lg uppercase tracking-[0.05em]"
            style={{ color }}
          >
            {overlord.name}
          </span>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <span className="font-mono text-xs text-white/50">
            {overlord.pulse_7day} articles
          </span>
          <span className="font-mono text-xs text-white/40">
            {arrow}{' '}
            <span className="uppercase">{overlord.trend_direction}</span>
          </span>
          <span
            className={`font-mono text-[10px] transition-transform ${
              expanded ? 'rotate-180' : ''
            }`}
          >
            &#9660;
          </span>
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-6 pb-6 border-t border-white/5">
          <div className="pt-4 space-y-6">
            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-1">
                  This Week
                </p>
                <p className="font-mono text-lg text-white">
                  {overlord.pulse_7day}
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-1">
                  This Month
                </p>
                <p className="font-mono text-lg text-white">
                  {overlord.pulse_30day}
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-1">
                  Sentiment
                </p>
                <p className="font-mono text-sm text-white/70 capitalize">
                  {overlord.sentiment_label}{' '}
                  <span className="text-white/30">
                    ({overlord.avg_sentiment_7day.toFixed(2)})
                  </span>
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-1">
                  Trend
                </p>
                <p className="font-mono text-sm text-white/70">
                  {arrow} {trendSign}
                  {overlord.trend_percent.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Peak day */}
            {overlord.peak_day_30d && (
              <p className="font-mono text-[10px] text-white/30">
                Peak:{' '}
                {new Date(overlord.peak_day_30d + 'T00:00:00').toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}{' '}
                ({overlord.peak_count_30d} articles in one day)
              </p>
            )}

            {/* Sparkline */}
            {sparkData.length > 1 && (
              <div className="border border-white/5 bg-white/[0.01] p-3 rounded">
                <p className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-2">
                  30-Day Activity
                </p>
                <Sparkline data={sparkData.slice(-30)} color={color} />
              </div>
            )}

            {loading && (
              <p className="font-mono text-xs text-white/30 animate-pulse">
                Loading details...
              </p>
            )}

            {/* Headlines */}
            {overlord.top_headlines && overlord.top_headlines.length > 0 && (
              <div>
                <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-3">
                  Latest Headlines
                </p>
                <div className="space-y-3">
                  {overlord.top_headlines.map((headline, i) => (
                    <a
                      key={i}
                      href={headline.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group/headline"
                    >
                      <p className="font-mono text-xs text-white/70 group-hover/headline:text-white transition-colors leading-relaxed">
                        &bull; &ldquo;{headline.title}&rdquo;
                      </p>
                      <p className="font-mono text-[10px] text-white/25 mt-0.5 pl-3">
                        {headline.source_name}
                        {headline.published_at && (
                          <> &mdash; {timeAgo(headline.published_at)}</>
                        )}
                        {' '}
                        <span className="text-white/15">[&rarr;]</span>
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
