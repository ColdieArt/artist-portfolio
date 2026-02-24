import Link from 'next/link'
import ParticleNetwork from '@/components/ParticleNetwork'
import BioCoder from '@/components/BioCoder'
import ScrollReveal from '@/components/ScrollReveal'

export default function HomePage() {
  return (
    <>
      {/* ── Hero - Noir Dossier ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
        {/* Particle background with pixelated blocks */}
        <ParticleNetwork />

        {/* Bio-Coder surveillance data overlay */}
        <BioCoder />

        {/* Dark vignette - softened so BioCoder/particles show through */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/30 to-black/70 pointer-events-none" />

        {/* Floating pixelated blocks - parallax depth layers */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ perspective: '1200px' }}>
          {/* Back layer - slow drift */}
          <div className="absolute top-[15%] left-[8%] w-24 h-3 bg-white/[0.03] animate-pixel-drift-slow" style={{ transform: 'translateZ(-60px)' }} />
          <div className="absolute top-[45%] right-[12%] w-16 h-8 bg-white/[0.04] animate-pixel-drift-slow delay-500" style={{ transform: 'translateZ(-40px)' }} />
          <div className="absolute bottom-[30%] left-[20%] w-32 h-2 bg-white/[0.02] animate-pixel-drift-slow delay-300" style={{ transform: 'translateZ(-80px)' }} />

          {/* Mid layer */}
          <div className="absolute top-[25%] right-[25%] w-12 h-12 bg-white/[0.05] animate-pixel-drift" style={{ imageRendering: 'pixelated' as const, transform: 'translateZ(0px)' }} />
          <div className="absolute top-[60%] left-[15%] w-20 h-4 bg-white/[0.04] animate-pixel-drift delay-700" />
          <div className="absolute top-[70%] right-[8%] w-8 h-16 bg-white/[0.03] animate-pixel-drift delay-200" />

          {/* Front layer - faster drift, closer */}
          <div className="absolute top-[35%] left-[40%] w-6 h-6 bg-white/[0.06] animate-pixel-drift-fast" style={{ transform: 'translateZ(40px)' }} />
          <div className="absolute bottom-[20%] right-[30%] w-14 h-3 bg-white/[0.05] animate-pixel-drift-fast delay-400" style={{ transform: 'translateZ(30px)' }} />

          {/* Redacted bars floating */}
          <div className="absolute top-[20%] left-[55%] w-40 h-4 bg-white/[0.08] animate-pixel-drift-slow delay-200" />
          <div className="absolute bottom-[40%] right-[40%] w-28 h-3 bg-white/[0.06] animate-pixel-drift delay-100" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="animate-fade-in">
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-white mb-8">
              Classified - Kinetic 3D Interactive Art Series
            </p>
          </div>

          <h1 className="animate-fade-in delay-200 text-6xl md:text-8xl lg:text-9xl text-white leading-[0.9] mb-2 uppercase tracking-[0.05em]" style={{ fontFamily: 'Arial Black, Arial, Helvetica, sans-serif', fontWeight: 900 }}>
            Know Your
            <br />
            <span className="text-white tracking-[0.02em]" style={{ fontFamily: 'Arial Black, Arial, Helvetica, sans-serif', fontWeight: 900 }}>
              Overlord
            </span>
          </h1>

          <p className="animate-fade-in delay-200 font-display text-3xl md:text-4xl lg:text-[2.8rem] text-white uppercase tracking-[0.05em] mb-6">
            Tech Epochalypse
          </p>

          {/* Redacted document line */}
          <div className="animate-fade-in delay-300 flex items-center justify-center gap-3 mb-8">
            <div className="w-16 h-px bg-white/20" />
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-white">
              Document <span className="redacted">REF-0042</span>
            </span>
            <div className="w-16 h-px bg-white/20" />
          </div>

          <p className="animate-fade-in delay-400 font-mono text-lg md:text-xl text-white mb-4 max-w-2xl mx-auto tracking-wide">
            Five overlords. One network. Infinite iterations.
          </p>


          <div className="animate-fade-in delay-700">
            <Link href="/mainframe" className="btn-primary btn-pulse">
              <span>ENTER THE MAINFRAME</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-2 right-[25%] flex flex-col items-center gap-3 animate-fade-in delay-1000">
          <p className="font-mono text-sm uppercase tracking-[0.3em] text-white/80 animate-bounce">
            Scroll Down
          </p>
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none" className="animate-bounce">
            <path d="M4 6l4 4 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"/>
          </svg>
        </div>
      </section>

      {/* ── Overlord Dossiers on Scroll ── */}
      <section className="relative py-32 section-padding bg-black grid-lines">
        <div className="page-container">
          <ScrollReveal>
            <div className="text-center mb-20">
              <p className="font-mono text-xs uppercase tracking-[0.4em] text-white mb-4">
                Overlord Files
              </p>
              <h2 className="font-display text-4xl md:text-6xl text-white uppercase tracking-[0.05em]">
                Touch the Art
              </h2>
              <div className="flex items-center justify-center gap-3 mt-4">
                <div className="w-12 h-px bg-white/15" />
                <span className="font-mono text-xs text-white uppercase tracking-wider">
                  5 nodes identified
                </span>
                <div className="w-12 h-px bg-white/15" />
              </div>
            </div>
          </ScrollReveal>

          {/* Full-width video */}
          <ScrollReveal delay={100}>
            <div className="relative w-full overflow-hidden dossier-border">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto block"
              >
                <source src="/images/overlords/Bezos-WIP-Base-web.mp4" type="video/mp4" />
              </video>
            </div>
          </ScrollReveal>

          {/* Two-column text below video */}
          <ScrollReveal delay={200}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 mt-12">
              {/* Left column */}
              <div>
                <div className="classified-header">
                  Kinetic 3D Interactive Art
                </div>
                <p className="text-white text-base font-mono leading-relaxed mb-6">
                  You are looking at a living portrait. Not a photograph. Not a rendering.
                  A kinetic 3D artifact built from the public face of power - fractured,
                  reassembled, and set in motion. Move it. The face shifts. The layers
                  separate. What was hidden becomes visible.
                </p>
                <p className="text-white text-base font-mono leading-relaxed mb-8">
                  This is the surface. The full experience lets you tear the image apart,
                  rebuild it in your own language, and broadcast what you find.
                  The Overlords are waiting.
                </p>
                <Link
                  href="/overlords"
                  className="btn-primary"
                >
                  <span>Remix the Overlords</span>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </div>

              {/* Right column */}
              <div>
                <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-[0.03em] mb-4">
                  User-enabled Composition
                </h2>
                <ul className="text-white text-sm font-mono leading-relaxed mb-8 space-y-2 list-disc list-inside">
                  <li>
                    <span className="font-bold">X/Y movement:</span> Pieces of the portrait can be moved and customized by clicking and dragging.
                  </li>
                  <li>
                    <span className="font-bold">Z Depth movement:</span> Clicking a piece moves it back one depth level at a time. Once the 15th and final depth level is reached, the piece loops back to the start.
                  </li>
                </ul>

                <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-[0.03em] mb-4">
                  Drop-down Menu Interactions
                </h2>
                <ul className="text-white text-sm font-mono leading-relaxed mb-8 space-y-2 list-disc list-inside">
                  <li>Animations are engaged using the &ldquo;3D&rdquo; and &ldquo;FLY&rdquo; buttons.</li>
                  <li>All 5 control layers can be toggled, some in combination.</li>
                  <li>Pieces can be removed from the canvas by dragging them over the trash icon.</li>
                  <li>The composition returns to its original state via the &ldquo;RESET&rdquo; button.</li>
                </ul>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Mainframe + Patrons split modules ── */}
      <section className="relative py-24 section-padding bg-black grid-lines">
        <div className="page-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: The Mainframe */}
            <ScrollReveal>
              <div className="group relative bg-charcoal/30 border border-white/5 hover:border-white/10 overflow-hidden transition-all duration-500 h-full flex flex-col">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <div className="p-8 md:p-10 flex flex-col flex-1">
                  <div className="classified-header">
                    Central Hub - <span className="redacted">All Systems</span>
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl text-white uppercase tracking-[0.03em] mb-4">
                    The Mainframe
                  </h3>
                  <p className="text-white text-sm font-mono leading-relaxed mb-6">
                    The nerve center of Tech Epochalypse. Active exploits with bounties,
                    community remix submissions, raw signal transmissions, and the live
                    social wire - all in one feed.
                  </p>
                  <div className="space-y-2 mb-8">
                    <Link href="/mainframe#exploits" className="flex items-center gap-2 text-white font-mono text-xs uppercase tracking-wider hover:text-white/70 transition-colors">
                      <span className="text-white/40">&rsaquo;</span> Active Exploits &amp; Bounties
                    </Link>
                    <Link href="/mainframe" className="flex items-center gap-2 text-white font-mono text-xs uppercase tracking-wider hover:text-white/70 transition-colors">
                      <span className="text-white/40">&rsaquo;</span> Community Submissions
                    </Link>
                    <Link href="/mainframe" className="flex items-center gap-2 text-white font-mono text-xs uppercase tracking-wider hover:text-white/70 transition-colors">
                      <span className="text-white/40">&rsaquo;</span> Raw Signals Gallery
                    </Link>
                    <Link href="/mainframe" className="flex items-center gap-2 text-white font-mono text-xs uppercase tracking-wider hover:text-white/70 transition-colors">
                      <span className="text-white/40">&rsaquo;</span> The Wire - Live Feed
                    </Link>
                    <Link href="/series" className="flex items-center gap-2 text-white font-mono text-xs uppercase tracking-wider hover:text-white/70 transition-colors">
                      <span className="text-white/40">&rsaquo;</span> The Collection - OpenSea
                    </Link>
                  </div>
                  <div className="mt-auto">
                    <Link href="/mainframe" className="btn-primary">
                      <span>Enter the Mainframe</span>
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </Link>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </div>
            </ScrollReveal>

            {/* Right: Founding Signals / Patrons */}
            <ScrollReveal delay={150}>
              <div className="group relative bg-charcoal/30 border border-white/5 hover:border-white/10 overflow-hidden transition-all duration-500 h-full flex flex-col">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <div className="p-8 md:p-10 flex flex-col flex-1">
                  <div className="classified-header">
                    Network Origins - <span className="redacted">First Contact</span>
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl text-white uppercase tracking-[0.03em] mb-4">
                    Founding Signals
                  </h3>
                  <p className="text-white text-sm font-mono leading-relaxed mb-6">
                    Every network starts with its first connection. These patrons
                    didn&rsquo;t just acquire art - they invested in a vision that
                    digital art should be kinetic, interactive, and alive. They showed up
                    before the signal was strong and helped build it into something worth
                    broadcasting.
                  </p>
                  <p className="text-white/50 text-xs font-mono uppercase tracking-wider mb-8">
                    Collectors &bull; Supporters &bull; Early Believers
                  </p>
                  <div className="mt-auto">
                    <Link href="/collectors" className="btn-primary">
                      <span>View Founding Signals</span>
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </Link>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="relative py-32 section-padding bg-black">
        <div className="page-container text-center">
          <ScrollReveal>
            <div className="line-accent mb-16" />
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-white mb-6">
              Access Protocol
            </p>
            <h2 className="font-display text-4xl md:text-6xl text-white mb-8 uppercase tracking-[0.03em]">
              Enter the Epochalypse
            </h2>
            <p className="text-white text-base font-mono max-w-xl mx-auto mb-4">
              Drag, rotate, distort, and export. Every interaction creates a
              unique iteration - your own fragment of the network.
            </p>
            <p className="text-white text-sm font-mono max-w-md mx-auto mb-12">
              Authorization: <span className="redacted">GRANTED</span> - Proceed with <span className="redacted">caution</span>
            </p>
            <Link href="/overlords" className="btn-primary">
              <span>View All Overlords</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  )
}
