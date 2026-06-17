import Link from 'next/link'
import Script from 'next/script'
import ScrollReveal from '@/components/ScrollReveal'
import overlords from '@/data/overlords.json'

import collectors from '@/data/collectors.json'

const overlordMap = Object.fromEntries(overlords.map((o) => [o.slug, o]))

export default function MainframePage() {
  return (
    <div className="min-h-screen bg-void">
      {/* ── Header ── */}
      <section className="pt-28 pb-16 section-padding">
        <div className="page-container">
          <ScrollReveal>
            <div className="text-center">
              <div className="classified-header">
                Central Hub -{' '}
                <span className="redacted">All Systems</span>
              </div>
              <h1 className="font-display text-4xl md:text-6xl text-white uppercase tracking-[0.05em] mt-4">
                The Mainframe
              </h1>
              <p className="font-mono text-sm text-white mt-4 max-w-2xl mx-auto leading-relaxed">
                The nerve center of Tech Epochalypse. Community iterations,
                active exploits, and founding signals - all in
                one feed.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="line-accent" />

      {/* ── Section 3: Founding Signals + The Wire ── */}
      <section className="py-12 md:py-16 section-padding">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column: Founding Signals */}
            <div>
              <ScrollReveal>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="font-display text-2xl md:text-3xl text-white uppercase tracking-[0.03em]">
                      Founding Signals
                    </h2>
                  </div>
                  <Link href="/collectors" className="btn-secondary">
                    <span>All Founding Signals</span>
                  </Link>
                </div>
              </ScrollReveal>

              <div className="grid grid-cols-1 gap-8">
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

            {/* Right Column: The Wire */}
            <div>
              <ScrollReveal>
                <div className="mb-8">
                  <h2 className="font-display text-2xl md:text-3xl text-white uppercase tracking-[0.03em]">
                    The Wire
                  </h2>
                  <p className="font-mono text-xs text-white/40 uppercase tracking-widest mt-2">
                    #KnowYourOverlord
                  </p>
                </div>
              </ScrollReveal>
              <div>
                <link href="https://assets.juicer.io/embed.css" media="all" rel="stylesheet" type="text/css" />
                <ul className="juicer-feed" data-feed-id="knowyouroverlord" data-per="9" data-pages="1" />
                <Script
                  src="https://assets.juicer.io/embed.js"
                  strategy="afterInteractive"
                />
              </div>
            </div>
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
                  The Artist - Active File
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
                  alt="Coldie - Artist"
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
                    href="https://www.instagram.com/coldie3dart"
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
