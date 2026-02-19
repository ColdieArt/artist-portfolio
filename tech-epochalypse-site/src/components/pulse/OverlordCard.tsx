'use client'

import { useState } from 'react'
import type { OverlordPulse } from '@/lib/pulse-client'

interface Props {
  overlord: OverlordPulse
}

export default function OverlordCard({ overlord }: Props) {
  const [expanded, setExpanded] = useState(false)

  const trendLabel =
    overlord.trend_direction === 'surging'
      ? 'SURGING'
      : overlord.trend_direction === 'rising'
      ? 'RISING'
      : overlord.trend_direction === 'cooling'
      ? 'COOLING'
      : 'STABLE'

  const trendArrow =
    overlord.trend_direction === 'surging'
      ? '\u2191\u2191'
      : overlord.trend_direction === 'rising'
      ? '\u2191'
      : overlord.trend_direction === 'cooling'
      ? '\u2193'
      : '\u2192'

  return (
    <div className="border-t border-white/5">
      <div
        className="border-t-2 py-4 px-4 cursor-pointer hover:bg-white/[0.02] transition-colors duration-200"
        style={{ borderTopColor: overlord.color }}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <h3
            className="font-display text-lg uppercase tracking-[0.05em]"
            style={{ color: overlord.color }}
          >
            {overlord.name}
          </h3>
          <div className="flex items-center gap-4">
            <span className="font-mono text-sm text-white">
              {overlord.pulse_count} articles
            </span>
            <span className="font-mono text-xs text-white">
              {trendArrow} {trendLabel}
            </span>
            <span
              className={`font-mono text-xs transition-transform duration-200 text-white ${
                expanded ? 'rotate-180' : ''
              }`}
            >
              ▼
            </span>
          </div>
        </div>
      </div>

      {expanded && overlord.headlines.length > 0 && (
        <div className="px-4 pb-5 space-y-3 animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <span className="font-mono text-[10px] uppercase tracking-widest text-white">
              Sentiment: {overlord.sentiment_label}
            </span>
          </div>
          {overlord.headlines.map((hl, i) => (
            <a
              key={i}
              href={hl.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <div className="flex items-start gap-3">
                <span className="font-mono text-[10px] text-white mt-1 shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <p className="font-mono text-sm text-white transition-colors leading-snug">
                    {hl.title}
                  </p>
                  <p className="font-mono text-[10px] text-white mt-1 uppercase tracking-wider">
                    {hl.source_name}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      {expanded && overlord.headlines.length === 0 && (
        <div className="px-4 pb-4">
          <p className="font-mono text-xs text-white">
            No headlines available.
          </p>
        </div>
      )}
    </div>
  )
}
