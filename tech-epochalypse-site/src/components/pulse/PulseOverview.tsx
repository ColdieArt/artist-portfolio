'use client'

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

const SENTIMENT_EMOJI: Record<string, string> = {
  positive: '\u{1F60F}',
  'leaning positive': '\u{1F60F}',
  neutral: '\u{1F610}',
  'leaning negative': '\u{1F624}',
  negative: '\u{1F624}',
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
}

interface PulseOverviewProps {
  overlords: OverlordData[]
  hottest: string | null
}

export default function PulseOverview({ overlords, hottest }: PulseOverviewProps) {
  const maxPulse = Math.max(...overlords.map((o) => o.pulse_7day), 1)
  const hottestOverlord = overlords.find((o) => o.key === hottest)

  return (
    <div>
      {/* Headline */}
      {hottestOverlord && (
        <div className="mb-8 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/40 mb-2">
            Dominating the news cycle
          </p>
          <h2 className="font-display text-2xl md:text-4xl text-white uppercase tracking-[0.05em]">
            <span style={{ color: ACCENT_COLORS[hottestOverlord.key] }}>
              {hottestOverlord.name}
            </span>
          </h2>
          <p className="font-mono text-sm text-white/50 mt-2">
            {hottestOverlord.pulse_7day} articles this week
            {hottestOverlord.trend_direction === 'surging' && ' and climbing'}
          </p>
        </div>
      )}

      {/* Bar chart */}
      <div className="space-y-3">
        {overlords.map((overlord) => {
          const color = ACCENT_COLORS[overlord.key] || '#666'
          const width = (overlord.pulse_7day / maxPulse) * 100
          const arrow = TREND_ARROWS[overlord.trend_direction] || '\u2192'
          const emoji = SENTIMENT_EMOJI[overlord.sentiment_label] || '\u{1F610}'
          const isHottest = overlord.key === hottest

          return (
            <a
              key={overlord.key}
              href={`#${overlord.key}`}
              className="block group"
            >
              <div className="flex items-center gap-4">
                <div className="w-28 shrink-0">
                  <span
                    className={`font-mono text-xs uppercase tracking-[0.15em] transition-colors ${
                      isHottest ? 'text-white' : 'text-white/50 group-hover:text-white/70'
                    }`}
                    style={isHottest ? { color } : undefined}
                  >
                    {overlord.name.split(' ').pop()}
                  </span>
                </div>

                <div className="flex-1 h-6 bg-white/5 rounded overflow-hidden relative">
                  <div
                    className="h-full rounded transition-all duration-1000 ease-out flex items-center justify-end pr-2"
                    style={{
                      width: `${Math.max(width, 2)}%`,
                      backgroundColor: `${color}30`,
                      borderRight: `2px solid ${color}`,
                      boxShadow: isHottest ? `0 0 12px ${color}40` : 'none',
                    }}
                  >
                    {width > 20 && (
                      <span className="font-mono text-[10px] text-white/70">
                        {overlord.pulse_7day}
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-20 shrink-0 flex items-center gap-1.5 justify-end">
                  <span className="font-mono text-[10px] text-white/40">
                    {arrow}
                  </span>
                  <span className="text-xs">{emoji}</span>
                </div>
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}
