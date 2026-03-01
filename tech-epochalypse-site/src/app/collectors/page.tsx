'use client'

import { useState } from 'react'
import Link from 'next/link'
import ScrollReveal from '@/components/ScrollReveal'
import collectors from '@/data/collectors.json'
import overlords from '@/data/overlords.json'

const overlordMap = Object.fromEntries(
  overlords.map((o) => [o.slug, o])
)

export default function CollectorsPage() {
  const [filter, setFilter] = useState<string | null>(null)

  const filtered = filter
    ? collectors.filter((c) => c.pieces.includes(filter))
    : collectors

  return (
    <section className="pt-28 md:pt-36 pb-24 section-padding bg-black grid-lines">
      <div className="page-container">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-16 md:mb-24">
            <h1 className="font-display text-5xl md:text-7xl text-white mb-4 uppercase tracking-[0.05em]">
              Founding Signals
            </h1>
            <p className="font-mono text-sm text-white max-w-2xl mx-auto">
              Every network starts with its first connection. These collectors
              didn&apos;t just acquire art, they invested in a vision: that digital
              art should be kinetic, interactive, and alive. They showed up before
              the signal was strong and helped build it into something worth
              broadcasting.
            </p>
          </div>
        </ScrollReveal>

        {/* Overlord filter */}
        <div className="flex flex-wrap items-center gap-2 mb-10">
          <button
            onClick={() => setFilter(null)}
            className={`font-mono text-[10px] uppercase tracking-[0.2em] px-4 py-2 border transition-colors ${
              filter === null
                ? 'bg-white text-black border-white'
                : 'text-white border-white/10 hover:border-white/30'
            }`}
          >
            All
          </button>
          {overlords.filter((o) => o.status !== 'unlisted').map((o) => (
            <button
              key={o.slug}
              onClick={() => setFilter(filter === o.slug ? null : o.slug)}
              className={`font-mono text-[10px] uppercase tracking-[0.2em] px-4 py-2 border transition-colors ${
                filter === o.slug
                  ? 'bg-white text-black border-white'
                  : 'text-white border-white/10 hover:border-white/30'
              }`}
            >
              {o.name}
            </button>
          ))}
        </div>

        {/* Collectors grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filtered.map((collector, i) => (
            <ScrollReveal key={collector.name} delay={i * 150}>
              <div className="group relative bg-charcoal/30 border border-white/5 hover:border-white/10 overflow-hidden transition-all duration-500">
                {/* Top accent line */}
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

                      {/* Owned pieces */}
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
                                className="flex items-center gap-2 bg-black/50 border border-white/5 px-3 py-1.5 hover:border-white/15 transition-colors group/piece"
                              >
                                {overlord.previewImage && (
                                  <img
                                    src={overlord.previewImage}
                                    alt={overlord.name}
                                    className="w-6 h-6 object-cover rounded-sm opacity-100 transition-opacity"
                                    style={{ filter: 'grayscale(1)' }}
                                  />
                                )}
                                <span className="font-mono text-[11px] uppercase tracking-wider text-white transition-colors">
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
                            className="text-white transition-colors"
                            title="Twitter / X"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                          </a>
                        )}
                        {collector.socials.instagram && (
                          <a
                            href={collector.socials.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white transition-colors"
                            title="Instagram"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="2" y="2" width="20" height="20" rx="5"/>
                              <circle cx="12" cy="12" r="5"/>
                              <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/>
                            </svg>
                          </a>
                        )}
                        {collector.socials.website && (
                          <a
                            href={collector.socials.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white transition-colors"
                            title="Website"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"/>
                              <line x1="2" y1="12" x2="22" y2="12"/>
                              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom line on hover */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Become a collector CTA */}
        <ScrollReveal>
          <div className="mt-24 text-center">
            <div className="line-accent mb-12" />
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-white mb-4">
              Join the Network
            </p>
            <h3 className="font-display text-2xl md:text-3xl text-white mb-4 uppercase tracking-[0.03em]">
              Interested in Collecting?
            </h3>
            <p className="text-white text-sm font-mono max-w-lg mx-auto mb-8 leading-relaxed">
              The Tech Epochalypse series represents a new frontier in
              interactive digital art. Contact the artist to learn about
              available pieces and future drops.
            </p>
            <Link href="/about" className="btn-secondary">
              <span>Contact the Artist</span>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
