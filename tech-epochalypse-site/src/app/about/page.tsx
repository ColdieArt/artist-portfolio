import type { Metadata } from 'next'
import Link from 'next/link'
import ScrollReveal from '@/components/ScrollReveal'

export const metadata: Metadata = {
  title: 'Dossier — Tech Epochalypse',
  description:
    'Learn about Coldie, the artist behind Tech Epochalypse, and the vision driving this interactive digital art series.',
}

export default function AboutPage() {
  return (
    <section className="pt-28 md:pt-36 pb-24 section-padding bg-black grid-lines">
      <div className="page-container">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-16 md:mb-24">
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-white/40 mb-4">
              Behind the Network
            </p>
            <h1 className="font-display text-4xl md:text-6xl text-white mb-4 uppercase tracking-[0.05em]">
              Dossier
            </h1>
            <div className="flex items-center justify-center gap-3 mt-2">
              <div className="w-12 h-px bg-white/10" />
              <span className="font-mono text-[9px] text-white/10 uppercase tracking-wider">
                File: <span className="redacted">ARTIST-001</span>
              </span>
              <div className="w-12 h-px bg-white/10" />
            </div>
          </div>
        </ScrollReveal>

        {/* Artist section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 mb-24 md:mb-32">
          <ScrollReveal className="lg:col-span-2">
            <div className="aspect-[3/4] relative overflow-hidden bg-charcoal dossier-border">
              <div className="w-full h-full flex items-center justify-center border border-white/5">
                <div className="text-center">
                  <div className="w-32 h-32 rounded-full bg-charcoal border border-white/5 mx-auto mb-4 flex items-center justify-center">
                    <span className="font-display text-4xl text-white/10">C</span>
                  </div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/10">
                    Artist Photo
                  </p>
                </div>
              </div>
              {/* Pixelated corruption */}
              <div className="absolute top-4 right-4 w-16 h-8 bg-white/[0.04] animate-pixel-drift" style={{ imageRendering: 'pixelated' as const }} />
              <div className="absolute bottom-8 left-4 w-24 h-3 bg-white/[0.03] animate-pixel-drift-slow" />
            </div>
          </ScrollReveal>

          <ScrollReveal className="lg:col-span-3" delay={150}>
            <div>
              <div className="classified-header">
                The Artist &mdash; Active File
              </div>
              <h2 className="font-display text-3xl md:text-4xl text-white mb-6 uppercase tracking-[0.03em]">
                Coldie
              </h2>
              <div className="space-y-4 text-white/50 text-sm font-mono leading-relaxed">
                <p>
                  Coldie is a pioneering digital artist and one of the earliest
                  creators in the NFT and crypto art movement. Working at the
                  intersection of technology, culture, and fine art, Coldie
                  creates immersive 3D stereoscopic and interactive digital
                  portraits that challenge how we perceive influential figures.
                </p>
                <p>
                  With work collected by major institutions and featured in
                  publications worldwide, Coldie has established a distinctive
                  visual language &mdash; one that merges glitch aesthetics, kinetic
                  sculpture, and digital manipulation into portraits that feel
                  alive, unstable, and deeply human.
                </p>
                <p>
                  Tech Epochalypse represents the culmination of years of
                  experimentation: fully interactive 3D artworks that visitors
                  can manipulate, distort, and export as their own unique
                  iterations.
                </p>
              </div>

              <p className="text-white/20 text-xs font-mono mt-4">
                Clearance: <span className="redacted">FULL ACCESS</span> &mdash;
                Status: <span className="text-white/40">ACTIVE</span>
              </p>

              {/* Social links */}
              <div className="flex items-center gap-4 mt-8">
                <a
                  href="https://twitter.com/Coldie"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white/35 hover:text-white/60 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span className="font-mono text-[10px] uppercase tracking-wider">@Coldie</span>
                </a>
                <a
                  href="https://instagram.com/coldie"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white/35 hover:text-white/60 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5"/>
                    <circle cx="12" cy="12" r="5"/>
                    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/>
                  </svg>
                  <span className="font-mono text-[10px] uppercase tracking-wider">@coldie</span>
                </a>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Series statement */}
        <ScrollReveal>
          <div className="line-accent mb-16" />
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-24 md:mb-32">
          <ScrollReveal>
            <div>
              <div className="classified-header">
                The Series &mdash; Overview
              </div>
              <h2 className="font-display text-3xl md:text-4xl text-white mb-6 uppercase tracking-[0.03em]">
                What is Tech Epochalypse?
              </h2>
              <div className="space-y-4 text-white/50 text-sm font-mono leading-relaxed">
                <p>
                  Tech Epochalypse is an interactive digital art series exploring
                  the figures who defined &mdash; and disrupted &mdash; the technological
                  epoch. Five &ldquo;Tech Overlords,&rdquo; rendered as kinetic
                  3D portraits, each built as a standalone interactive
                  experience.
                </p>
                <p>
                  Unlike traditional digital art, these pieces are not static
                  images. They are living, manipulable sculptures that exist in
                  your browser. Drag to rotate. Apply filters and effects.
                  Export your unique iteration as a JPEG or MP4 &mdash; creating your
                  own fragment of the epochalypse.
                </p>
                <p>
                  The series examines power, influence, and the individuals who
                  sit at the nexus of technology and society. Each overlord
                  represents a different facet of this epoch: innovation,
                  connectivity, acceleration, optimization, and silicon.
                </p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={150}>
            <div>
              <div className="classified-header">
                The Process &mdash; <span className="redacted">Methods</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl text-white mb-6 uppercase tracking-[0.03em]">
                How They&rsquo;re Made
              </h2>
              <div className="space-y-4 text-white/50 text-sm font-mono leading-relaxed">
                <p>
                  Each artwork begins as a 3D scan or photographic reference,
                  then undergoes a process of digital manipulation, shader
                  programming, and interactive design. The final pieces are built
                  entirely in WebGL using Three.js and custom GLSL shaders.
                </p>
                <p>
                  The interactive layer is integral to the work &mdash; not an
                  afterthought. Each portrait responds to viewer input: dragging
                  rotates the form, controls apply real-time effects, and the
                  export system captures your unique perspective as a new
                  artifact.
                </p>
                <p>
                  The result is art that doesn&rsquo;t sit behind glass. It
                  invites participation. Every viewer creates something new.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Press / Features */}
        <ScrollReveal>
          <div className="line-accent mb-16" />
          <div className="text-center mb-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/15 mb-4">
              Recognition
            </p>
            <h2 className="font-display text-3xl md:text-4xl text-white uppercase tracking-[0.03em]">
              Featured In
            </h2>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-20">
            {['Cointelegraph', 'SuperRare', 'Nifty Gateway'].map((pub) => (
              <span
                key={pub}
                className="font-display text-lg md:text-xl text-white uppercase tracking-wider"
              >
                {pub}
              </span>
            ))}
          </div>
        </ScrollReveal>

        {/* Contact CTA */}
        <ScrollReveal>
          <div className="mt-24 text-center">
            <div className="line-accent mb-12" />
            <h3 className="font-display text-2xl md:text-3xl text-white mb-4 uppercase tracking-[0.03em]">
              Get in Touch
            </h3>
            <p className="text-white/40 text-sm font-mono max-w-lg mx-auto mb-8 leading-relaxed">
              For commissions, collaborations, press inquiries, or collecting
              opportunities, reach out through social channels or email.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://twitter.com/Coldie"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                <span>Connect on X</span>
              </a>
              <Link href="/overlords" className="btn-secondary">
                <span>View the Overlords</span>
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
