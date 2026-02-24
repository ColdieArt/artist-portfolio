'use client'

import { useState } from 'react'
import Link from 'next/link'
import Script from 'next/script'
import ScrollReveal from '@/components/ScrollReveal'
import UserExports from '@/components/UserExports'
import overlords from '@/data/overlords.json'
import collectors from '@/data/collectors.json'

const overlordMap = Object.fromEntries(overlords.map((o) => [o.slug, o]))

export default function MainframePage() {
  const [formData, setFormData] = useState({
    name: '',
    ethAddress: '',
    email: '',
    xHandle: '',
  })
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [formError, setFormError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormStatus('submitting')
    setFormError('')

    try {
      const res = await fetch('/api/exploit-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Submission failed')
      }

      setFormStatus('success')
      setFormData({ name: '', ethAddress: '', email: '', xHandle: '' })
    } catch (err) {
      setFormStatus('error')
      setFormError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  const overlordNames = Object.fromEntries(
    overlords.map((o) => [o.slug, o.name])
  )
  const overlordSlugs = overlords.map((o) => o.slug)

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
                The nerve center of Tech Epochalypse. Community iterations,
                active exploits, and founding signals &mdash; all in
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
                Active Operations &mdash;{' '}
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
              <div className="font-mono text-xs text-black uppercase tracking-[0.2em] mb-6">
                <h3 className="font-display text-2xl md:text-3xl text-black uppercase tracking-[0.03em] mb-4">
                  EXPLOITS &mdash; INCOMING
                </h3>
                <div className="space-y-1 mb-6 border-b border-black/10 pb-6">
                  <p>STATUS: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;</p>
                  <p>NEXT EXPLOIT: &nbsp;&nbsp;&nbsp;&nbsp;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;</p>
                  <p>CLASSIFICATION: &nbsp;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;</p>
                </div>
              </div>

              <div className="font-mono text-sm text-black leading-relaxed space-y-6">
                <p>
                  Future exploits are being &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;. The network is not done with you. Register below to be the first to know when the next directive drops.
                </p>

                <p className="text-black/40 text-xs uppercase tracking-widest">
                  // ENTER YOUR CREDENTIALS TO JOIN THE &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608; LIST
                </p>

                {formStatus === 'success' ? (
                  <div className="border border-black/10 p-8 text-center">
                    <p className="font-display text-xl text-black uppercase tracking-[0.05em] mb-2">
                      TRANSMISSION RECEIVED
                    </p>
                    <p className="text-black/60 text-xs uppercase tracking-widest">
                      You will be contacted when the next exploit is &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;.
                    </p>
                    <button
                      onClick={() => setFormStatus('idle')}
                      className="mt-4 text-xs uppercase tracking-widest text-black/40 hover:text-black transition-colors"
                    >
                      Submit another
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label htmlFor="exploit-name" className="block text-xs uppercase tracking-widest text-black/60 mb-2">
                        Name / Alias *
                      </label>
                      <input
                        id="exploit-name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-transparent border border-black/20 px-4 py-3 font-mono text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black transition-colors"
                        placeholder="Your operative name"
                      />
                    </div>

                    <div>
                      <label htmlFor="exploit-eth" className="block text-xs uppercase tracking-widest text-black/60 mb-2">
                        ETH Address
                      </label>
                      <input
                        id="exploit-eth"
                        type="text"
                        value={formData.ethAddress}
                        onChange={(e) => setFormData({ ...formData, ethAddress: e.target.value })}
                        className="w-full bg-transparent border border-black/20 px-4 py-3 font-mono text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black transition-colors"
                        placeholder="0x..."
                      />
                    </div>

                    <div>
                      <label htmlFor="exploit-email" className="block text-xs uppercase tracking-widest text-black/60 mb-2">
                        Email Address *
                      </label>
                      <input
                        id="exploit-email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-transparent border border-black/20 px-4 py-3 font-mono text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black transition-colors"
                        placeholder="operative@email.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="exploit-x" className="block text-xs uppercase tracking-widest text-black/60 mb-2">
                        X Handle
                      </label>
                      <input
                        id="exploit-x"
                        type="text"
                        value={formData.xHandle}
                        onChange={(e) => setFormData({ ...formData, xHandle: e.target.value })}
                        className="w-full bg-transparent border border-black/20 px-4 py-3 font-mono text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black transition-colors"
                        placeholder="@handle"
                      />
                    </div>

                    {formStatus === 'error' && (
                      <p className="text-red-600 text-xs uppercase tracking-widest">
                        {formError || 'Transmission failed. Try again.'}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={formStatus === 'submitting'}
                      className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-black text-white font-mono text-sm uppercase tracking-[0.2em] hover:bg-black/80 disabled:bg-black/40 transition-colors"
                    >
                      {formStatus === 'submitting' ? (
                        'TRANSMITTING...'
                      ) : (
                        <>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          JOIN THE LIST
                        </>
                      )}
                    </button>
                  </form>
                )}

                <p className="text-black/30 text-[10px] uppercase tracking-widest pt-4 border-t border-black/10">
                  // Your data is stored securely. No spam. Only &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;.
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
                  Active Exploit &mdash; Submissions
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

      {/* ── Section: Collection on OpenSea ── */}
      <section className="py-12 md:py-16 section-padding">
        <div className="page-container">
          <ScrollReveal>
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="classified-header">
                  On-Chain Artifacts &mdash;{' '}
                  <span className="redacted">Ethereum</span>
                </div>
                <h2 className="font-display text-2xl md:text-3xl text-white uppercase tracking-[0.03em]">
                  The Collection
                </h2>
              </div>
              <Link href="/series" className="btn-secondary">
                <span>Full Series</span>
              </Link>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-start">
              <div>
                <h3 className="font-display text-2xl text-white mb-2 uppercase tracking-[0.03em]">
                  Tech Epochalypse Moments
                </h3>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50 mb-4">
                  Decentral Eyes &bull; 250 Items &bull; ERC-7160 &bull; Ethereum
                </p>
                <p className="text-white text-sm font-mono leading-relaxed max-w-xl mb-6">
                  250 curated 1/1 stills from the kinetic 3D portrait series.
                  Each Moment is a still-frame capture from the interactive
                  Overlord portraits &mdash; frozen instances of a composition
                  that never sits still. Built on the Transient Labs ERC-7160
                  token standard.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://opensea.io/collection/tech-epochalypse-moments-decentral-eyes"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-5 py-2.5 bg-white text-black font-mono text-xs uppercase tracking-[0.15em] hover:bg-white/90 transition-colors"
                  >
                    View on OpenSea
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                  <Link href="/series" className="btn-primary">
                    <span>Explore the Series</span>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                </div>
              </div>
              <div className="hidden md:grid grid-cols-3 gap-2">
                {overlords.slice(0, 3).map((o) => (
                  <div key={o.slug} className="w-24 h-24 overflow-hidden bg-charcoal border border-white/5">
                    <img
                      src={o.previewImage}
                      alt={o.name}
                      className="w-full h-full object-cover"
                      style={{ filter: 'grayscale(1) contrast(1.1)' }}
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
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
