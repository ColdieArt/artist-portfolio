'use client'

import { useState, useEffect } from 'react'
import ScrollReveal from '@/components/ScrollReveal'
import PulseOverview from '@/components/pulse/PulseOverview'
import OverlordCard from '@/components/pulse/OverlordCard'
import PulseChart from '@/components/pulse/PulseChart'
import PulseNarrative from '@/components/pulse/PulseNarrative'

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

interface PulseResponse {
  updated_at: string | null
  overlords: OverlordData[]
  hottest: string | null
  biggest_surge: string | null
  most_negative: string | null
  quietest: string | null
}

export default function ThePulsePage() {
  const [data, setData] = useState<PulseResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/pulse')
      .then((res) => res.json())
      .then((pulseData: PulseResponse) => {
        setData(pulseData)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-void">
      {/* Header */}
      <section className="pt-28 pb-16 section-padding">
        <div className="page-container">
          <ScrollReveal>
            <div className="text-center">
              <div className="classified-header">
                Intelligence Feed &mdash;{' '}
                <span className="redacted">Live</span>
              </div>
              <h1 className="font-display text-4xl md:text-6xl text-white uppercase tracking-[0.05em] mt-4">
                The Pulse
              </h1>
              <p className="font-mono text-sm text-white/40 mt-4 max-w-2xl mx-auto leading-relaxed">
                Real-time tracking of how much each Tech Epochalypse overlord is
                dominating the news cycle. Updated daily. The data never lies.
              </p>
              {data?.updated_at && (
                <p className="font-mono text-[10px] text-white/20 mt-3 uppercase tracking-widest">
                  Last updated:{' '}
                  {new Date(data.updated_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="line-accent" />

      {/* Loading state */}
      {loading && (
        <section className="py-20 section-padding">
          <div className="page-container text-center">
            <div className="inline-flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/30" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white/20" />
              </span>
              <p className="font-mono text-sm text-white/30 animate-pulse">
                Intercepting transmissions...
              </p>
            </div>
          </div>
        </section>
      )}

      {/* No data state */}
      {!loading && (!data || data.overlords.length === 0) && (
        <section className="py-20 section-padding">
          <div className="page-container text-center">
            <p className="font-mono text-sm text-white/40 mb-4">
              No pulse data available yet.
            </p>
            <p className="font-mono text-xs text-white/25 max-w-md mx-auto leading-relaxed">
              The pulse job hasn&rsquo;t run yet. Set your{' '}
              <code className="text-white/40">NEWS_API_KEY</code> environment
              variable and trigger a refresh via the admin endpoint or wait for
              the daily cron.
            </p>
          </div>
        </section>
      )}

      {/* Main content — only when data exists */}
      {!loading && data && data.overlords.length > 0 && (
        <>
          {/* Section 1: Overview */}
          <section className="py-12 md:py-16 section-padding">
            <div className="page-container">
              <ScrollReveal>
                <PulseOverview
                  overlords={data.overlords}
                  hottest={data.hottest}
                />
              </ScrollReveal>
            </div>
          </section>

          <div className="line-accent" />

          {/* Section 2: Overlord Detail Cards */}
          <section className="py-12 md:py-16 section-padding">
            <div className="page-container">
              <ScrollReveal>
                <div className="classified-header">
                  Dossiers &mdash;{' '}
                  <span className="redacted-partial">Individual</span>
                </div>
                <h2 className="font-display text-2xl md:text-3xl text-white mb-8 uppercase tracking-[0.03em]">
                  Overlord Breakdown
                </h2>
              </ScrollReveal>

              <div className="space-y-3">
                {data.overlords.map((overlord, i) => (
                  <ScrollReveal key={overlord.key} delay={i * 75}>
                    <OverlordCard overlord={overlord} />
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>

          <div className="line-accent" />

          {/* Section 3: Historical Chart */}
          <section className="py-12 md:py-16 section-padding">
            <div className="page-container">
              <ScrollReveal>
                <div className="classified-header">
                  Signal History &mdash;{' '}
                  <span className="redacted">Classified</span>
                </div>
                <h2 className="font-display text-2xl md:text-3xl text-white mb-8 uppercase tracking-[0.03em]">
                  90-Day Activity
                </h2>
                <div className="border border-white/5 bg-white/[0.01] p-4 md:p-6">
                  <PulseChart />
                </div>
              </ScrollReveal>
            </div>
          </section>

          <div className="line-accent" />

          {/* Section 4: Narrative */}
          <section className="py-12 md:py-16 section-padding">
            <div className="page-container">
              <ScrollReveal>
                <PulseNarrative
                  overlords={data.overlords}
                  hottest={data.hottest}
                  biggest_surge={data.biggest_surge}
                  most_negative={data.most_negative}
                  quietest={data.quietest}
                />
              </ScrollReveal>
            </div>
          </section>
        </>
      )}

      {/* Footer spacer */}
      <div className="h-16" />
    </div>
  )
}
