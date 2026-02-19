'use client'

import type { OverlordPulse } from '@/lib/pulse-client'

interface Props {
  overlords: OverlordPulse[]
  hottest: string | null
}

function ordinal(n: number): string {
  if (n === 1) return '1st'
  if (n === 2) return '2nd'
  if (n === 3) return '3rd'
  return `${n}th`
}

export default function PulseOverview({ overlords, hottest }: Props) {
  const sorted = [...overlords].sort((a, b) => b.pulse_count - a.pulse_count)
  const maxCount = sorted[0]?.pulse_count || 1
  const leader = sorted[0]
  const rest = sorted.slice(1)
  const totalArticles = sorted.reduce((sum, o) => sum + o.pulse_count, 0)

  return (
    <div>
      <div className="classified-header">
        Trending Leaderboard &mdash;{' '}
        <span className="redacted-partial">Live</span>
      </div>

      <p className="font-mono text-xs text-white mt-3 mb-6">
        {totalArticles} total articles tracked across {sorted.length} overlords
      </p>

      {/* Leader callout + leaderboard grid */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.8fr] gap-8 md:gap-10">

        {/* Left: #1 Leader card */}
        {leader && (
          <div
            className="border border-white/10 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden"
            style={{ borderTopColor: leader.color, borderTopWidth: 2 }}
          >
            {/* Faint glow background */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                background: `radial-gradient(ellipse at center, ${leader.color}, transparent 70%)`,
              }}
            />
            <div className="relative z-10">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white block mb-3">
                Dominating the News Cycle
              </span>
              <span
                className="font-display text-5xl md:text-6xl font-bold block leading-none"
                style={{ color: leader.color }}
              >
                1<span className="text-3xl md:text-4xl align-super">st</span>
              </span>
              <h2
                className="font-display text-2xl md:text-3xl uppercase tracking-[0.05em] mt-3"
                style={{ color: leader.color }}
              >
                {leader.name}
              </h2>
              <p className="font-mono text-sm text-white mt-2">
                {leader.pulse_count} articles tracked
              </p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <span className="font-mono text-[10px] uppercase tracking-widest text-white">
                  Sentiment: {leader.sentiment_label}
                </span>
                <span className="text-xs">
                  {leader.trend_direction === 'surging'
                    ? '\u2191\u2191'
                    : leader.trend_direction === 'rising'
                    ? '\u2191'
                    : '\u2192'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Right: Ranked 2nd–5th */}
        <div className="flex flex-col justify-center space-y-3">
          {rest.map((overlord, i) => {
            const rank = i + 2
            const pct = maxCount > 0 ? (overlord.pulse_count / maxCount) * 100 : 0

            return (
              <div key={overlord.key} className="group">
                <div className="flex items-center gap-3">
                  {/* Rank badge */}
                  <span
                    className="font-display text-lg w-10 text-right shrink-0 uppercase tracking-wide"
                    style={{ color: overlord.color, opacity: 1 }}
                  >
                    {ordinal(rank)}
                  </span>

                  {/* Bar + info */}
                  <div className="flex-1 min-w-0">
                    {/* Name row */}
                    <div className="flex items-baseline justify-between mb-1">
                      <span
                        className="font-mono text-sm uppercase tracking-wider truncate"
                        style={{ color: overlord.color }}
                      >
                        {overlord.name}
                      </span>
                      <span className="font-mono text-xs text-white shrink-0 ml-2">
                        {overlord.pulse_count} articles
                      </span>
                    </div>

                    {/* Bar */}
                    <div className="relative h-5 bg-white/[0.03]">
                      <div
                        className="h-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: overlord.color,
                          opacity: 0.5,
                        }}
                      />
                      {/* Percentage marker */}
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] text-white">
                        {Math.round(pct)}%
                      </span>
                    </div>
                  </div>

                  {/* Trend indicator */}
                  <span className="text-xs shrink-0 w-5 text-center" title={overlord.trend_direction}>
                    {overlord.trend_direction === 'surging'
                      ? '\u2191\u2191'
                      : overlord.trend_direction === 'rising'
                      ? '\u2191'
                      : '\u2192'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
