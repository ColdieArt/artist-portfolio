'use client'

import { useState, useEffect, useCallback } from 'react'
import ScrollReveal from '@/components/ScrollReveal'
import PulseOverview from '@/components/pulse/PulseOverview'
import OverlordCard from '@/components/pulse/OverlordCard'
import PulseChart from '@/components/pulse/PulseChart'
import PulseNarrative from '@/components/pulse/PulseNarrative'
import { fetchPulseData, getSamplePulseData, type PulseData } from '@/lib/pulse-client'

export default function ThePulsePage() {
  const [data, setData] = useState<PulseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [usingSample, setUsingSample] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)

    try {
      const pulseData = await fetchPulseData()
      const hasData = pulseData.overlords.some((o) => o.pulse_count > 0)
      if (hasData) {
        setData(pulseData)
        setUsingSample(false)
      } else {
        setData(getSamplePulseData())
        setUsingSample(true)
      }
    } catch {
      // RSS fetch failed — fallback to sample data
      setData(getSamplePulseData())
      setUsingSample(true)
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

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
              <p className="font-mono text-sm text-white mt-4 max-w-2xl mx-auto leading-relaxed">
                Real-time tracking of how much each Tech Epochalypse overlord is
                dominating the news cycle. The data never lies.
              </p>
              {data?.updated_at && (
                <p className="font-mono text-[10px] text-white mt-3 uppercase tracking-widest">
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
              {usingSample && (
                <p className="font-mono text-[10px] text-white mt-2 uppercase tracking-widest">
                  Displaying sample data &mdash; live feed unavailable
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
              <p className="font-mono text-sm text-white animate-pulse">
                Intercepting transmissions...
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Main content */}
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

          {/* Section 3: Visual Chart */}
          <section className="py-12 md:py-16 section-padding">
            <div className="page-container">
              <ScrollReveal>
                <div className="classified-header">
                  Signal Analysis &mdash;{' '}
                  <span className="redacted">Classified</span>
                </div>
                <h2 className="font-display text-2xl md:text-3xl text-white mb-8 uppercase tracking-[0.03em]">
                  Overlord Comparison
                </h2>
                <div className="border border-white/5 bg-white/[0.01] p-4 md:p-6">
                  <PulseChart overlords={data.overlords} />
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
