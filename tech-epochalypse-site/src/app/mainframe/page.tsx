import Link from 'next/link'
import Script from 'next/script'
import ScrollReveal from '@/components/ScrollReveal'
import UserExports from '@/components/UserExports'
import overlords from '@/data/overlords.json'
import collectors from '@/data/collectors.json'

const overlordMap = Object.fromEntries(overlords.map((o) => [o.slug, o]))
const listedOverlords = overlords.filter((o) => o.status !== 'unlisted')

export default function MainframePage() {
  const overlordNames = Object.fromEntries(
    listedOverlords.map((o) => [o.slug, o.name])
  )
  const overlordSlugs = listedOverlords.map((o) => o.slug)

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

      {/* ── Section 1: Exploits ── */}
      <section id="exploits" className="py-12 md:py-16 section-padding">
        <div className="page-container">
          <ScrollReveal>
            <div className="mb-8">
              <div className="classified-header">
                Active Operations -{' '}
                <span className="redacted">Directives</span>
              </div>
              <h2 className="font-display text-2xl md:text-3xl text-white uppercase tracking-[0.03em]">
                Exploits
              </h2>
              <p className="font-mono text-sm text-white/70 leading-relaxed mt-4">
                Pay attention to exploits that are listed. Can happen at any time. They are of utmost importance and offer those willing to accept the challenge an opportunity to build the dossier against the overlords.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="bg-white p-8 md:p-12">
              <div className="font-mono text-xs text-black uppercase tracking-[0.2em] mb-8">
                <h3 className="font-display text-2xl md:text-3xl text-black uppercase tracking-[0.03em] mb-6">
                  EXPLOITS - &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608; BRIEFING
                </h3>
                <div className="space-y-1 mb-8 border-b border-black/10 pb-6">
                  <p>CLASSIFICATION: &nbsp;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;</p>
                  <p>INTELLIGENCE DIVISION: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;DATA &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;</p>
                  <p>STATUS: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;MONITORING</p>
                </div>
              </div>

              <div className="font-mono text-sm text-black leading-relaxed space-y-6">
                <p className="text-black/40 text-xs uppercase tracking-widest">
                  // DIRECTIVE FROM &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608; COMMAND
                </p>

                <p className="font-bold">
                  This is the extraction point.
                </p>

                <p>
                  Exploits is where &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608; is collected, processed, and &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608; on the five Overlords. Every submission builds a living &#9608;&#9608;&#9608;&#9608;. A growing intelligence file of visual data that &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608; their agendas, their motives, and the architectures of &#9608;&#9608;&#9608;&#9608;&#9608;&#9608; they would rather you never &#9608;&#9608;&#9608;.
                </p>

                <p>
                  Some of what you find will be &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;. Some will be damning. All of it matters.
                </p>

                <p>
                  The &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608; of their plans is the power we hold. Not capital. Not &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;. Sight. The ability to see what is &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608; constructed around us and render it &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608; for others. This information must be &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608; with any who will have eyes to &#9608;&#9608;&#9608;.
                </p>

                {/* How the system operates */}
                <div className="border-t border-b border-black/10 py-6 my-6">
                  <p className="font-bold mb-3 text-xs uppercase tracking-widest">
                    HOW THE &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608; OPERATES:
                  </p>

                  <p>
                    When a new Exploit is &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608; or a new bounty is issued, this is the node where the &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608; is published. Each operation comes with &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608; directives and ground &#9608;&#9608;&#9608;&#9608; that must be followed. These are not &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;. They are operational &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;. Deviation from the &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608; compromises the mission.
                  </p>

                  <p className="mt-4">
                    Every Exploit is a &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;. A targeted challenge designed to extract the highest-value &#9608;&#9608;&#9608;&#9608; from the network. Submit &#9608;&#9608;&#9608;&#9608;. Submit intelligence. Submit what the Overlord does not want &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;.
                  </p>

                  <p className="mt-4 italic">
                    The best data &#9608;&#9608;&#9608;&#9608;.
                  </p>
                </div>

                {/* Reward structure */}
                <div className="border-b border-black/10 pb-6 mb-6">
                  <p className="font-bold mb-3 text-xs uppercase tracking-widest">
                    &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608; STRUCTURE:
                  </p>
                  <ul className="space-y-2 ml-1">
                    <li className="flex gap-2">
                      <span className="shrink-0">&rarr;</span>
                      <span>Rewards are &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608; between the operative, the community, and the &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608; who fund the network.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="shrink-0">&rarr;</span>
                      <span>No single entity &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608; the output.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="shrink-0">&rarr;</span>
                      <span>The network &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608; the network.</span>
                    </li>
                  </ul>
                </div>

                {/* Current status */}
                <div>
                  <p className="font-bold mb-3 text-xs uppercase tracking-widest">
                    CURRENT STATUS:
                  </p>
                  <div className="font-mono text-xs text-black uppercase tracking-[0.2em] space-y-1 mb-6">
                    <p>EXPLOIT #001: &nbsp;&nbsp;&nbsp;&nbsp;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;</p>
                    <p>ANNOUNCEMENT: &nbsp;&nbsp;&nbsp;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;</p>
                    <p>DIRECTIVE: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;PENDING &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;</p>
                    <p>REWARD TIER: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;</p>
                  </div>

                  <p>
                    The first &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608; is being &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;. Until the signal drops, your directive is &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;. Access the five Overlord nodes. Study the &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;. Learn the canvas you will be &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608; to breach.
                  </p>

                  <p className="mt-4">
                    When the order &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;, you will be ready. Or you &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;.
                  </p>
                </div>

                {/* CTA */}
                <div className="mt-10 text-center">
                  <Link
                    href="/overlords"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-black text-white font-mono text-sm uppercase tracking-[0.2em] hover:bg-black/80 transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    ACCESS THE OVERLORDS
                  </Link>
                </div>

                <p className="text-black/40 text-xs italic mt-8">
                  // END &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="line-accent" />

      {/* ── Section 1b: Current Exploit Submissions ── */}
      <section className="py-12 md:py-16 section-padding">
        <div className="page-container">
          <ScrollReveal>
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="classified-header">
                  Active Exploit - Submissions
                </div>
                <h2 className="font-display text-2xl md:text-3xl text-white uppercase tracking-[0.03em]">
                  Exploit Transmissions
                </h2>
              </div>
            </div>
          </ScrollReveal>

          <UserExports
            overlordNames={overlordNames}
            overlordSlugs={overlordSlugs}
            category="Current Exploit"
            headerText="Submissions for the current active exploit. These operatives have breached the network."
          />
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
                  Transmissions Collected Data Packets
                </div>
                <h2 className="font-display text-2xl md:text-3xl text-white uppercase tracking-[0.03em]">
                  RAW SIGNALS
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
            category="general submission"
          />
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
