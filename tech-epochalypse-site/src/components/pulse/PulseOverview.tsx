'use client'

import type { OverlordPulse } from '@/lib/pulse-client'

interface Props {
  overlords: OverlordPulse[]
  hottest: string | null
}

export default function PulseOverview({ overlords, hottest }: Props) {
  const maxCount = Math.max(...overlords.map((o) => o.pulse_count), 1)
  const hottestOverlord = overlords.find((o) => o.key === hottest)

  return (
    <div>
      {hottestOverlord && (
        <div className="text-center mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/40 mb-2">
            Dominating the News Cycle
          </p>
          <h2
            className="font-display text-3xl md:text-4xl uppercase tracking-[0.05em] mb-1"
            style={{ color: hottestOverlord.color }}
          >
            {hottestOverlord.name}
          </h2>
          <p className="font-mono text-sm text-white/50">
            {hottestOverlord.pulse_count} articles this week
          </p>
        </div>
      )}

      <div className="space-y-2.5">
        {overlords.map((overlord) => {
          const pct = maxCount > 0 ? (overlord.pulse_count / maxCount) * 100 : 0
          return (
            <div key={overlord.key} className="flex items-center gap-4">
              <span className="font-mono text-xs uppercase tracking-wider text-white/60 w-28 text-right shrink-0">
                {overlord.key}
              </span>
              <div className="flex-1 relative h-7 bg-white/[0.03]">
                <div
                  className="h-full transition-all duration-1000 ease-out flex items-center justify-end pr-2"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: overlord.color,
                    opacity: 0.7,
                  }}
                >
                  <span className="font-mono text-xs text-white/90 font-medium">
                    {overlord.pulse_count}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 w-8 shrink-0">
                <span className="text-xs" title={overlord.trend_direction}>
                  {overlord.trend_direction === 'surging'
                    ? '\u2191\u2191'
                    : overlord.trend_direction === 'rising'
                    ? '\u2191'
                    : '\u2192'}
                </span>
                <span className="text-sm" title={overlord.sentiment_label}>
                  {overlord.sentiment_score > 0.1
                    ? '\uD83D\uDE10'
                    : overlord.sentiment_score < -0.1
                    ? '\uD83D\uDE1F'
                    : '\uD83D\uDE10'}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
