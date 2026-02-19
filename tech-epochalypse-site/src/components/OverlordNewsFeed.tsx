'use client'

import { useEffect, useState } from 'react'
import { fetchSingleOverlordPulse, OVERLORD_CONFIGS } from '@/lib/pulse-client'
import type { OverlordPulse } from '@/lib/pulse-client'

interface Props {
  slug: string
}

export default function OverlordNewsFeed({ slug }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [data, setData] = useState<OverlordPulse | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetched, setFetched] = useState(false)

  const config = OVERLORD_CONFIGS.find((c) => c.slug === slug)

  // Fetch on first expand
  useEffect(() => {
    if (!expanded || fetched) return
    setLoading(true)
    fetchSingleOverlordPulse(slug).then((result) => {
      setData(result)
      setFetched(true)
      setLoading(false)
    })
  }, [expanded, fetched, slug])

  if (!config) return null

  return (
    <div className="mt-6 border border-white/10">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.03] transition-colors duration-200"
      >
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: config.color }} />
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-white">
            Live News Feed
          </span>
          {data && (
            <span className="font-mono text-[10px] text-white">
              {data.pulse_count} articles
            </span>
          )}
        </div>
        <span
          className={`font-mono text-xs text-white transition-transform duration-200 ${
            expanded ? 'rotate-180' : ''
          }`}
        >
          ▼
        </span>
      </button>

      {expanded && (
        <div className="border-t border-white/5 px-4 py-4 animate-fade-in">
          {loading && (
            <p className="font-mono text-xs text-white animate-pulse">
              Intercepting transmissions...
            </p>
          )}

          {!loading && data && data.headlines.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 mb-3">
                <span className="font-mono text-[10px] uppercase tracking-widest text-white">
                  Sentiment: {data.sentiment_label}
                </span>
              </div>
              {data.headlines.map((hl, i) => (
                <a
                  key={i}
                  href={hl.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-[10px] text-white mt-0.5 shrink-0">
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

          {!loading && data && data.headlines.length === 0 && (
            <p className="font-mono text-xs text-white">
              No transmissions intercepted.
            </p>
          )}

          {!loading && !data && (
            <p className="font-mono text-xs text-white">
              Feed unavailable.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
