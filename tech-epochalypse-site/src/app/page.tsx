import Link from 'next/link'
import dynamic from 'next/dynamic'
import ParticleNetwork from '@/components/ParticleNetwork'
import BioCoder from '@/components/BioCoder'
import ScrollReveal from '@/components/ScrollReveal'

const InteractiveFaceViewer = dynamic(
  () => import('@/components/InteractiveFaceViewer'),
  { ssr: false }
)

export default function HomePage() {
  return (
    <>
      {/* ── Hero — Noir Dossier ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
        {/* Particle background with pixelated blocks */}
        <ParticleNetwork />

        {/* Bio-Coder surveillance data overlay */}
        <BioCoder />

        {/* Dark vignette — softened so BioCoder/particles show through */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/30 to-black/70 pointer-events-none" />

        {/* Floating pixelated blocks — parallax depth layers */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ perspective: '1200px' }}>
          {/* Back layer — slow drift */}
          <div className="absolute top-[15%] left-[8%] w-24 h-3 bg-white/[0.03] animate-pixel-drift-slow" style={{ transform: 'translateZ(-60px)' }} />
          <div className="absolute top-[45%] right-[12%] w-16 h-8 bg-white/[0.04] animate-pixel-drift-slow delay-500" style={{ transform: 'translateZ(-40px)' }} />
          <div className="absolute bottom-[30%] left-[20%] w-32 h-2 bg-white/[0.02] animate-pixel-drift-slow delay-300" style={{ transform: 'translateZ(-80px)' }} />

          {/* Mid layer */}
          <div className="absolute top-[25%] right-[25%] w-12 h-12 bg-white/[0.05] animate-pixel-drift" style={{ imageRendering: 'pixelated' as const, transform: 'translateZ(0px)' }} />
          <div className="absolute top-[60%] left-[15%] w-20 h-4 bg-white/[0.04] animate-pixel-drift delay-700" />
          <div className="absolute top-[70%] right-[8%] w-8 h-16 bg-white/[0.03] animate-pixel-drift delay-200" />

          {/* Front layer — faster drift, closer */}
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
              Classified &mdash; Kinetic 3D Interactive Art Series
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
                Expose the Overlords
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

          <ScrollReveal delay={100}>
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 relative">
              {/* Interactive face viewer */}
              <div className="w-full md:w-1/2 relative group">
                <p className="font-mono text-sm uppercase tracking-[0.2em] text-white/70 mb-3">
                  👉 Touch the Art 🎨
                </p>
                <div className="aspect-[4/3] relative overflow-hidden bg-charcoal dossier-border">
                  <InteractiveFaceViewer />
                </div>
              </div>

              {/* Kinetic art description */}
              <div className="w-full md:w-1/2">
                <div className="classified-header">
                  Kinetic 3D Interactive Art
                </div>
                <p className="text-white text-base font-mono leading-relaxed mb-6 max-w-md">
                  You are looking at a living portrait. Not a photograph. Not a rendering.
                  A kinetic 3D artifact built from the public face of power &mdash; fractured,
                  reassembled, and set in motion. Move it. The face shifts. The layers
                  separate. What was hidden becomes visible.
                </p>
                <p className="text-white text-base font-mono leading-relaxed mb-8 max-w-md">
                  This is the surface. The full experience lets you tear the image apart,
                  rebuild it in your own language, and broadcast what you find.
                  The Overlords are waiting.
                </p>
                <Link
                  href="/mainframe"
                  className="btn-primary"
                >
                  <span>Remix the Overlords</span>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </div>
            </div>
          </ScrollReveal>
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
              unique iteration &mdash; your own fragment of the network.
            </p>
            <p className="text-white text-sm font-mono max-w-md mx-auto mb-12">
              Authorization: <span className="redacted">GRANTED</span> &mdash; Proceed with <span className="redacted">caution</span>
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
