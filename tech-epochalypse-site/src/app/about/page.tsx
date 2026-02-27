import type { Metadata } from 'next'
import ScrollReveal from '@/components/ScrollReveal'
import ContactColdie from '@/components/ContactColdie'

export const metadata: Metadata = {
  title: 'Dossier - Tech Epochalypse',
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
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-white mb-4">
              Behind the Network
            </p>
            <h1 className="font-display text-4xl md:text-6xl text-white mb-4 uppercase tracking-[0.05em]">
              Artist Dossier
            </h1>
            <div className="flex items-center justify-center gap-3 mt-2">
              <div className="w-12 h-px bg-white/10" />
              <span className="font-mono text-[9px] text-white uppercase tracking-wider">
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
              <img
                src="/Coldie-artist-headshot.jpg"
                alt="Coldie - Artist"
                className="w-full h-full object-cover"
                style={{ filter: 'grayscale(1) contrast(1.2)' }}
              />
              {/* Pixelated corruption */}
              <div className="absolute top-4 right-4 w-16 h-8 bg-white/[0.04] animate-pixel-drift" style={{ imageRendering: 'pixelated' as const }} />
              <div className="absolute bottom-8 left-4 w-24 h-3 bg-white/[0.03] animate-pixel-drift-slow" />
            </div>
          </ScrollReveal>

          <ScrollReveal className="lg:col-span-3" delay={150}>
            <div>
              <div className="classified-header">
                The Artist - Active File
              </div>
              <h2 className="font-display text-3xl md:text-4xl text-white mb-6 uppercase tracking-[0.03em]">
                Coldie
              </h2>
              <div className="space-y-4 text-white text-sm font-mono leading-relaxed">
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
                  visual language - one that merges glitch aesthetics, kinetic
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

              <p className="text-white text-xs font-mono mt-4">
                Clearance: <span className="redacted">FULL ACCESS</span> -
                Status: <span className="text-white">ACTIVE</span>
              </p>

              {/* Email */}
              <p className="font-mono text-sm text-white mt-8">
                Email: coldieart at gmail dot com
              </p>

              {/* Social links */}
              <div className="flex items-center gap-4 mt-4">
                <a
                  href="https://twitter.com/Coldie"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span className="font-mono text-[10px] uppercase tracking-wider">@Coldie</span>
                </a>
                <a
                  href="https://www.instagram.com/coldie3dart"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white transition-colors"
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
                The Series - Overview
              </div>
              <h2 className="font-display text-3xl md:text-4xl text-white mb-6 uppercase tracking-[0.03em]">
                What is Tech Epochalypse?
              </h2>
              <div className="space-y-4 text-white text-sm font-mono leading-relaxed">
                <p>
                  Tech Epochalypse is an interactive digital art series exploring
                  the figures who defined - and disrupted - the technological
                  epoch. Five &ldquo;Tech Overlords,&rdquo; rendered as kinetic
                  3D portraits, each built as a standalone interactive
                  experience.
                </p>
                <p>
                  Unlike traditional digital art, these pieces are not static
                  images. They are living, manipulable sculptures that exist in
                  your browser. Drag to rotate. Apply filters and effects.
                  Export your unique iteration as a JPEG or MP4 - creating your
                  own fragment of the epochalypse.
                </p>
                <p>
                  The series examines power, influence, and the individuals who
                  sit at the nexus of technology and society. Each overlord
                  represents a different facet of this epoch: innovation,
                  connectivity, acceleration, optimization, and silicon.
                </p>
                <p>
                  Tech Epochalypse was created to engage viewers to &lsquo;touch
                  the art.&rsquo; The suite of control layers leads to options.
                  These works were created to inspire new thoughts each time they
                  are viewed, so for this reason, the token is not permanently
                  affected each time a new layout is created. Once the art is
                  reloaded, the layout starts fresh and inspires a new expression.
                  These pieces are networked art and meant to be shared and
                  experimented both on your computer and mobile with the
                  touchscreen experience.
                </p>
                <p>
                  This is the first time Coldie has created kinetic 3D interactive
                  art. This level of functionality and interactivity will be the
                  building blocks for future releases. Tech Epochalypse is built
                  on the Transient Labs ERC-7160 token standard, allowing for
                  evolutionary updates and variety of asset storage options to
                  ensure the art is always viewable.
                </p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={150}>
            <div>
              <div className="classified-header">
                The Process - <span className="redacted">Methods</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl text-white mb-6 uppercase tracking-[0.03em]">
                How They&rsquo;re Made
              </h2>
              <div className="space-y-4 text-white text-sm font-mono leading-relaxed">
                <p>
                  Each artwork begins as a 3D scan or photographic reference,
                  then undergoes a process of digital manipulation, shader
                  programming, and interactive design. The final pieces are built
                  entirely in WebGL using Three.js and custom GLSL shaders.
                </p>
                <p>
                  The interactive layer is integral to the work - not an
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

        {/* Deep Dive */}
        <ScrollReveal>
          <div className="line-accent mb-16" />
          <div className="text-center mb-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-white mb-4">
              Interviews &amp; Conversations
            </p>
            <h2 className="font-display text-3xl md:text-4xl text-white uppercase tracking-[0.03em]">
              Deep Dive Decentral Eyes
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <a
              href="https://x.com/opensea/status/2023791066965541309"
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-6 border border-white/5 hover:border-white/15 bg-white/[0.02] hover:bg-white/[0.04] transition-all"
            >
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-white mb-3">
                OpenSea
              </p>
              <h3 className="font-display text-sm md:text-base text-white uppercase tracking-wide mb-2 transition-colors">
                In Conversation With Coldie
              </h3>
              <p className="font-mono text-[10px] text-white leading-relaxed">
                Written interview on the Tech Epochalypse drop - 250 1/1 stills critiquing tech power and the systems shaping modern life.
              </p>
            </a>
            <a
              href="https://www.carrotlane.com/p/ep-19-how-coldie-built-iconic-status"
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-6 border border-white/5 hover:border-white/15 bg-white/[0.02] hover:bg-white/[0.04] transition-all"
            >
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-white mb-3">
                Carrot Lane
              </p>
              <h3 className="font-display text-sm md:text-base text-white uppercase tracking-wide mb-2 transition-colors">
                How Coldie Built Iconic Status in Crypto Art
              </h3>
              <p className="font-mono text-[10px] text-white leading-relaxed">
                Podcast deep dive on building a legacy in crypto art, from the Snoop Dogg collaboration to the Decentral Eyes series.
              </p>
            </a>
            <a
              href="https://podcasts.proof.xyz/artist-spotlight-seeing-through-decentral-eyes-with-coldie/"
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-6 border border-white/5 hover:border-white/15 bg-white/[0.02] hover:bg-white/[0.04] transition-all"
            >
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-white mb-3">
                PROOF Podcast
              </p>
              <h3 className="font-display text-sm md:text-base text-white uppercase tracking-wide mb-2 transition-colors">
                Seeing Through Decentral Eyes
              </h3>
              <p className="font-mono text-[10px] text-white leading-relaxed">
                Artist spotlight on stereoscopic 3D art, blockchain-native creation, and the vision behind the portraits.
              </p>
            </a>
          </div>
        </ScrollReveal>

        {/* Contact CTA */}
        <ScrollReveal>
          <div className="mt-24 text-center">
            <div className="line-accent mb-12" />
            <h3 className="font-display text-2xl md:text-3xl text-white mb-4 uppercase tracking-[0.03em]">
              Get in Touch
            </h3>
            <p className="text-white text-sm font-mono max-w-lg mx-auto mb-8 leading-relaxed">
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
              <a
                href="https://coldie3d.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                <span>Visit Coldie3d.com</span>
              </a>
              <ContactColdie />
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
