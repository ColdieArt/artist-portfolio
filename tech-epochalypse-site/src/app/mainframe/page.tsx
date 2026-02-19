'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import ScrollReveal from '@/components/ScrollReveal'
import PulseOverview from '@/components/pulse/PulseOverview'
import PulseChart from '@/components/pulse/PulseChart'
import PulseNarrative from '@/components/pulse/PulseNarrative'
import UserExports from '@/components/UserExports'
import {
  fetchPulseData,
  getSamplePulseData,
  type PulseData,
} from '@/lib/pulse-client'
import overlords from '@/data/overlords.json'
import collectors from '@/data/collectors.json'

const overlordMap = Object.fromEntries(overlords.map((o) => [o.slug, o]))

export default function MainframePage() {
  const [pulseData, setPulseData] = useState<PulseData | null>(null)
  const [pulseLoading, setPulseLoading] = useState(true)

  const overlordNames = Object.fromEntries(
    overlords.map((o) => [o.slug, o.name])
  )
  const overlordSlugs = overlords.map((o) => o.slug)

  const loadPulse = useCallback(async () => {
    setPulseLoading(true)
    try {
      const data = await fetchPulseData()
      const hasData = data.overlords.some((o) => o.pulse_count > 0)
      setPulseData(hasData ? data : getSamplePulseData())
    } catch {
      setPulseData(getSamplePulseData())
    }
    setPulseLoading(false)
  }, [])

  useEffect(() => {
    loadPulse()
  }, [loadPulse])

  return (
    <div className="min-h-screen bg-void">
      {/* ── Header ── */}
      <section className="pt-28 pb-16 section-padding">
        <div className="page-container">
          <ScrollReveal>
            <div className="text-center">
              <div className="classified-header">
                Central Hub &mdash;{' '}
                <span className="redacted">All Systems</span>
              </div>
              <h1 className="font-display text-4xl md:text-6xl text-white uppercase tracking-[0.05em] mt-4">
                The Mainframe
              </h1>
              <p className="font-mono text-sm text-white mt-4 max-w-2xl mx-auto leading-relaxed">
                The nerve center of Tech Epochalypse. Live intelligence,
                community iterations, collectors, and artist dossier &mdash; all
                in one feed.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="line-accent" />

      {/* ── Section 1: The Pulse ── */}
      <section className="py-12 md:py-16 section-padding">
        <div className="page-container">
          <ScrollReveal>
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="classified-header">
                  Intelligence Feed &mdash;{' '}
                  <span className="redacted">Live</span>
                </div>
                <h2 className="font-display text-2xl md:text-3xl text-white uppercase tracking-[0.03em]">
                  The Pulse
                </h2>
              </div>
              <Link href="/the-pulse" className="btn-secondary">
                <span>Full Dashboard</span>
              </Link>
            </div>
          </ScrollReveal>

          {pulseLoading && (
            <div className="text-center py-12">
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
          )}

          {!pulseLoading && pulseData && pulseData.overlords.length > 0 && (
            <div className="space-y-8">
              <ScrollReveal>
                <PulseOverview
                  overlords={pulseData.overlords}
                  hottest={pulseData.hottest}
                />
              </ScrollReveal>
              <ScrollReveal>
                <div className="border border-white/5 bg-white/[0.01] p-4 md:p-6">
                  <PulseChart overlords={pulseData.overlords} />
                </div>
              </ScrollReveal>
              <ScrollReveal>
                <PulseNarrative
                  overlords={pulseData.overlords}
                  hottest={pulseData.hottest}
                  most_negative={pulseData.most_negative}
                  quietest={pulseData.quietest}
                />
              </ScrollReveal>
            </div>
          )}
        </div>
      </section>

      <div className="line-accent" />

      {/* ── Section 2: Gallery ── */}
      <section className="py-12 md:py-16 section-padding">
        <div className="page-container">
          <ScrollReveal>
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="classified-header">
                  Archive &mdash; Community Exports
                </div>
                <h2 className="font-display text-2xl md:text-3xl text-white uppercase tracking-[0.03em]">
                  The Gallery
                </h2>
              </div>
              <Link href="/gallery" className="btn-secondary">
                <span>Full Gallery</span>
              </Link>
            </div>
          </ScrollReveal>

          <UserExports
            overlordNames={overlordNames}
            overlordSlugs={overlordSlugs}
          />
        </div>
      </section>

      <div className="line-accent" />

      {/* ── Section 3: Collectors ── */}
      <section className="py-12 md:py-16 section-padding">
        <div className="page-container">
          <ScrollReveal>
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="classified-header">
                  The Inner Circle &mdash; Verified
                </div>
                <h2 className="font-display text-2xl md:text-3xl text-white uppercase tracking-[0.03em]">
                  Collectors
                </h2>
              </div>
              <Link href="/collectors" className="btn-secondary">
                <span>All Collectors</span>
              </Link>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {collectors.map((collector, i) => (
              <ScrollReveal key={collector.name} delay={i * 150}>
                <div className="group relative bg-charcoal/30 border border-white/5 hover:border-white/10 overflow-hidden transition-all duration-500">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <div className="p-8 md:p-10">
                    <div className="flex items-start gap-6">
                      {/* Avatar */}
                      <div className="shrink-0">
                        {collector.avatar ? (
                          <img
                            src={collector.avatar}
                            alt={collector.name}
                            className="w-20 h-20 rounded-full object-cover border border-white/10"
                            loading="lazy"
                            style={{ filter: 'grayscale(1) contrast(1.1)' }}
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-charcoal border border-white/10 flex items-center justify-center">
                            <span className="font-display text-2xl text-white">
                              {collector.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-2xl text-white mb-1 uppercase tracking-[0.03em]">
                          {collector.name}
                        </h3>
                        {collector.bio && (
                          <p className="text-white text-sm font-mono italic leading-relaxed mb-4">
                            &ldquo;{collector.bio}&rdquo;
                          </p>
                        )}
                        <div className="mb-4">
                          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white mb-2">
                            Collection
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {collector.pieces.map((slug) => {
                              const overlord = overlordMap[slug]
                              if (!overlord) return null
                              return (
                                <Link
                                  key={slug}
                                  href={
                                    overlord.status === 'live'
                                      ? `/overlords/${slug}`
                                      : '/overlords'
                                  }
                                  className="flex items-center gap-2 bg-black/50 border border-white/5 px-3 py-1.5 hover:border-white/15 transition-colors"
                                >
                                  {overlord.previewImage && (
                                    <img
                                      src={overlord.previewImage}
                                      alt={overlord.name}
                                      className="w-6 h-6 object-cover rounded-sm"
                                      style={{ filter: 'grayscale(1)' }}
                                    />
                                  )}
                                  <span className="font-mono text-[11px] uppercase tracking-wider text-white">
                                    {overlord.name}
                                  </span>
                                </Link>
                              )
                            })}
                          </div>
                        </div>
                        {/* Social links */}
                        <div className="flex items-center gap-3">
                          {collector.socials.twitter && (
                            <a
                              href={collector.socials.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white hover:text-white transition-colors"
                              title="Twitter / X"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                              </svg>
                            </a>
                          )}
                          {collector.socials.instagram && (
                            <a
                              href={collector.socials.instagram}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white hover:text-white transition-colors"
                              title="Instagram"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <rect
                                  x="2"
                                  y="2"
                                  width="20"
                                  height="20"
                                  rx="5"
                                />
                                <circle cx="12" cy="12" r="5" />
                                <circle
                                  cx="17.5"
                                  cy="6.5"
                                  r="1.5"
                                  fill="currentColor"
                                  stroke="none"
                                />
                              </svg>
                            </a>
                          )}
                          {collector.socials.website && (
                            <a
                              href={collector.socials.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white hover:text-white transition-colors"
                              title="Website"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <circle cx="12" cy="12" r="10" />
                                <line x1="2" y1="12" x2="22" y2="12" />
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <div className="line-accent" />

      {/* ── Section 4: Dossier ── */}
      <section className="py-12 md:py-16 section-padding">
        <div className="page-container">
          <ScrollReveal>
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="classified-header">
                  The Artist &mdash; Active File
                </div>
                <h2 className="font-display text-2xl md:text-3xl text-white uppercase tracking-[0.03em]">
                  Dossier
                </h2>
              </div>
              <Link href="/about" className="btn-secondary">
                <span>Full Dossier</span>
              </Link>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 items-start">
              <div className="aspect-[3/4] relative overflow-hidden bg-charcoal dossier-border">
                <img
                  src="/Coldie-artist-headshot.jpg"
                  alt="Coldie — Artist"
                  className="w-full h-full object-cover"
                  style={{ filter: 'grayscale(1) contrast(1.2)' }}
                />
              </div>
              <div>
                <h3 className="font-display text-3xl text-white mb-4 uppercase tracking-[0.03em]">
                  Coldie
                </h3>
                <div className="space-y-4 text-white text-sm font-mono leading-relaxed">
                  <p>
                    Coldie is a pioneering digital artist and one of the earliest
                    creators in the NFT and crypto art movement. Working at the
                    intersection of technology, culture, and fine art, Coldie
                    creates immersive 3D stereoscopic and interactive digital
                    portraits that challenge how we perceive influential figures.
                  </p>
                  <p>
                    Tech Epochalypse represents the culmination of years of
                    experimentation: fully interactive 3D artworks that visitors
                    can manipulate, distort, and export as their own unique
                    iterations.
                  </p>
                </div>
                <div className="flex items-center gap-4 mt-6">
                  <a
                    href="https://twitter.com/Coldie"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-white transition-colors"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    <span className="font-mono text-[10px] uppercase tracking-wider">
                      @Coldie
                    </span>
                  </a>
                  <a
                    href="https://instagram.com/coldie"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-white transition-colors"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="5" />
                      <circle cx="12" cy="12" r="5" />
                      <circle
                        cx="17.5"
                        cy="6.5"
                        r="1.5"
                        fill="currentColor"
                        stroke="none"
                      />
                    </svg>
                    <span className="font-mono text-[10px] uppercase tracking-wider">
                      @coldie
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="h-16" />
    </div>
  )
}
