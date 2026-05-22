import Link from 'next/link'
import Script from 'next/script'
import dynamic from 'next/dynamic'
import ScrollReveal from '@/components/ScrollReveal'
import overlords from '@/data/overlords.json'

const UserExports = dynamic(() => import('@/components/UserExports'), {
  ssr: false,
  loading: () => (
    <div className="text-center py-12">
      <p className="font-mono text-xs text-white/40 uppercase tracking-wider">Loading community exports…</p>
    </div>
  ),
})
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
                Tech Epochalypse Remix Competition
              </div>
              <h2 className="font-display text-2xl md:text-3xl text-white uppercase tracking-[0.03em]">
                SUBJ:01 - The Singularity
              </h2>
              <p className="font-mono text-sm text-white/70 leading-relaxed mt-4">
                The first remix competition in the Subject Series, under Tech Epochalypse. Five tech overlords, each a face of the Singularity. Pick one, remix it in Coldie&rsquo;s editor, and submit your own parallax collage.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="bg-white p-8 md:p-12">
              <div className="font-mono text-sm text-black leading-relaxed space-y-8">

                {/* WHAT IT IS */}
                <div>
                  <h3 className="font-display text-xl md:text-2xl text-black uppercase tracking-[0.03em] mb-3">
                    What It Is
                  </h3>
                  <p>
                    The first remix competition in the Subject Series, under Tech Epochalypse. Five tech overlords, each a face of the Singularity. Pick one, remix it in Coldie&rsquo;s editor, and submit your own parallax collage. Two ways to play: use Coldie&rsquo;s overlord assets, or upload your own art and remix it in. Both compete equally.
                  </p>
                </div>

                {/* THE FIVE OVERLORDS */}
                <div className="border-t border-black/10 pt-8">
                  <h3 className="font-display text-xl md:text-2xl text-black uppercase tracking-[0.03em] mb-4">
                    The Five Overlords
                  </h3>
                  <ul className="space-y-2 ml-1 mb-4">
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span><strong>Musk</strong> &mdash; the physical substrate</span></li>
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span><strong>Altman</strong> &mdash; the intelligence layer</span></li>
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span><strong>Zuckerberg</strong> &mdash; the identity layer</span></li>
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span><strong>Bezos</strong> &mdash; the logistics</span></li>
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span><strong>Huang</strong> &mdash; the silicon</span></li>
                  </ul>
                  <p className="italic">Pick one. Your choice locks your entry&rsquo;s category for the event.</p>
                </div>

                {/* HOW TO ENTER */}
                <div className="border-t border-black/10 pt-8">
                  <h3 className="font-display text-xl md:text-2xl text-black uppercase tracking-[0.03em] mb-4">
                    How to Enter
                  </h3>
                  <ol className="space-y-2 ml-1 mb-4">
                    <li className="flex gap-2"><span className="shrink-0 font-bold">1.</span><span>Go to <Link href="/overlords" className="underline">knowyouroverlord.art/subj/01</Link></span></li>
                    <li className="flex gap-2"><span className="shrink-0 font-bold">2.</span><span>Pick your overlord</span></li>
                    <li className="flex gap-2"><span className="shrink-0 font-bold">3.</span><span>Use the editor&rsquo;s depth and motion controls to build your parallax collage (remix Coldie&rsquo;s assets, upload your own, or both)</span></li>
                    <li className="flex gap-2"><span className="shrink-0 font-bold">4.</span><span>Submit before the deadline</span></li>
                  </ol>
                  <p>
                    <strong>Requirements:</strong> Follow <a href="https://x.com/coldie" target="_blank" rel="noopener noreferrer" className="underline">@coldie</a> on X. Repost the announcement. One submission per person. Free to enter. Wallet or email both accepted.
                  </p>
                </div>

                {/* KEY DATES */}
                <div className="border-t border-black/10 pt-8">
                  <h3 className="font-display text-xl md:text-2xl text-black uppercase tracking-[0.03em] mb-4">
                    Key Dates
                  </h3>
                  <ul className="space-y-2 ml-1">
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span><strong>Opens:</strong> Saturday, May 23 &mdash; 9:00 AM ET</span></li>
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span><strong>Closes:</strong> Wednesday, May 28 &mdash; 11:59 PT</span></li>
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span><strong>Winners announced:</strong> Thursday, June 4 &mdash; 10:00 AM ET</span></li>
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span><strong>Mints + raffles:</strong> Monday, June 15</span></li>
                  </ul>
                </div>

                {/* WINNERS */}
                <div className="border-t border-black/10 pt-8">
                  <h3 className="font-display text-xl md:text-2xl text-black uppercase tracking-[0.03em] mb-4">
                    Winners
                  </h3>
                  <p className="mb-4">Three winners, chosen across all five overlords.</p>
                  <ul className="space-y-2 ml-1 mb-4">
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span><strong>Curator&rsquo;s Pick 1</strong> (chosen by Coldie) &mdash; Edition of 10</span></li>
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span><strong>Curator&rsquo;s Pick 2</strong> (chosen by Coldie) &mdash; Edition of 10</span></li>
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span><strong>Community Pick</strong> (most public votes) &mdash; Edition of 42</span></li>
                  </ul>
                  <p className="mb-3">All winning artists receive 80% of public primary sales and 80% of secondary royalties on their edition.</p>
                  <p className="italic">What wins: Use of depth. Surprising use of the upload feature. Risk over polish. Make work only this medium could produce.</p>
                </div>

                {/* EDITION BREAKDOWN */}
                <div className="border-t border-black/10 pt-8">
                  <h3 className="font-display text-xl md:text-2xl text-black uppercase tracking-[0.03em] mb-4">
                    Edition Breakdown
                  </h3>
                  <p className="font-bold mb-2 text-xs uppercase tracking-widest">Curator&rsquo;s Pick 1 &amp; 2 (edition of 10 each):</p>
                  <ul className="space-y-2 ml-1 mb-6">
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span>1 to the artist</span></li>
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span>1 to Coldie</span></li>
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span>1 raffled to Moments holders of that overlord</span></li>
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span>1 raffled to Kinetic holders of that overlord</span></li>
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span>6 available to the public</span></li>
                  </ul>
                  <p className="font-bold mb-2 text-xs uppercase tracking-widest">Community Pick (edition of 42):</p>
                  <ul className="space-y-2 ml-1">
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span>Up to 10 to Kinetic holders of that overlord</span></li>
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span>10 raffled to Moments holders of that overlord</span></li>
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span>The remainder available to the public</span></li>
                  </ul>
                </div>

                {/* COLLECTOR REWARDS */}
                <div className="border-t border-black/10 pt-8">
                  <h3 className="font-display text-xl md:text-2xl text-black uppercase tracking-[0.03em] mb-4">
                    Collector Rewards
                  </h3>
                  <p className="mb-4">A snapshot of holder wallets is taken when the competition closes (May 28, 11:59 PT). Hold through then to qualify.</p>

                  <p className="font-bold mb-2 text-xs uppercase tracking-widest">Moments holders (50 per overlord)</p>
                  <ul className="space-y-2 ml-1 mb-6">
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span>Each Moment held = one raffle entry</span></li>
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span>Every winning piece triggers a raffle of that overlord&rsquo;s Moments holders</span></li>
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span>Raffle pools align to the winning overlord</span></li>
                  </ul>

                  <p className="font-bold mb-2 text-xs uppercase tracking-widest">Kinetic holders (10 per overlord)</p>
                  <ul className="space-y-2 ml-1 mb-6">
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span>1 free NFT for each Community Pick win matching your overlord</span></li>
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span>Entry into a dedicated Kinetic-only raffle for each Curator&rsquo;s Pick of your overlord</span></li>
                  </ul>

                  <p className="italic">One win per wallet across the entire event. Raffles draw in order &mdash; Curator&rsquo;s Pick 1, Curator&rsquo;s Pick 2, then Community Pick &mdash; and winning wallets are removed from later drawings. More collectors win. No sweeps.</p>
                </div>

                {/* THE VARIANT */}
                <div className="border-t border-black/10 pt-8">
                  <h3 className="font-display text-xl md:text-2xl text-black uppercase tracking-[0.03em] mb-4">
                    The Variant
                  </h3>
                  <p>
                    After winners are announced, Coldie creates a 1/1 Variant in response to the competition: a fully kinetic work with a complete 3D scene, built with a unique control layer found in no other piece. Each SUBJ event produces exactly one Variant. These are held as a dedicated series, reserved for future institutional and gallery presentation.
                  </p>
                </div>

                {/* THE PROMISE */}
                <div className="border-t border-black/10 pt-8">
                  <h3 className="font-display text-xl md:text-2xl text-black uppercase tracking-[0.03em] mb-4">
                    The Promise
                  </h3>
                  <p className="mb-4">
                    Artist-first, collector-rewarding. Winners keep 80%. Nearly half of every drop goes back to the collector community. SUBJ:01 is built to elevate artists who make great work and reward the collectors who&rsquo;ve been here from the start.
                  </p>
                  <p className="font-bold text-base">The Singularity has five faces. Pick yours.</p>
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

              </div>
            </div>
          </ScrollReveal>
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
                  SUBJ:01 - The Singularity - Submitted for Consideration
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
