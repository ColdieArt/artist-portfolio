import Link from 'next/link'
import ParticleNetwork from '@/components/ParticleNetwork'
import ScrollReveal from '@/components/ScrollReveal'
import overlords from '@/data/overlords.json'

export default function HomePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Particle background */}
        <ParticleNetwork />

        {/* Radial vignette */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-void/50 to-void pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="animate-fade-in">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-neon-green/70 mb-6">
              Interactive Digital Art Series
            </p>
          </div>

          <h1 className="animate-fade-in delay-200 font-display text-5xl md:text-7xl lg:text-8xl font-light text-white leading-[0.9] mb-8">
            Tech
            <br />
            <span className="text-gradient font-medium italic">
              Epochalypse
            </span>
          </h1>

          <p className="animate-fade-in delay-400 font-display text-xl md:text-2xl text-steel italic mb-12 max-w-2xl mx-auto">
            Five overlords. One network. Infinite iterations.
          </p>

          <div className="animate-fade-in delay-700">
            <Link href="/overlords" className="btn-primary">
              <span>Enter the Network</span>
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
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in delay-1000">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel/50">
            Scroll
          </p>
          <div className="w-px h-8 bg-gradient-to-b from-steel/30 to-transparent animate-pulse-glow" />
        </div>
      </section>

      {/* ── Overlord Previews on Scroll ── */}
      <section className="relative py-32 section-padding">
        <div className="page-container">
          <ScrollReveal>
            <div className="text-center mb-20">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-neon-green/60 mb-4">
                The Network
              </p>
              <h2 className="font-display text-3xl md:text-5xl text-white">
                Five Nodes of Power
              </h2>
            </div>
          </ScrollReveal>

          <div className="space-y-24 md:space-y-32">
            {overlords.map((overlord, i) => (
              <ScrollReveal key={overlord.slug} delay={i * 100}>
                <div
                  className={`flex flex-col ${
                    i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  } items-center gap-8 md:gap-16`}
                >
                  {/* Preview image */}
                  <div className="w-full md:w-1/2 relative group">
                    <div className="aspect-[4/3] relative overflow-hidden bg-charcoal rounded-sm">
                      {overlord.previewImage && (
                        <img
                          src={overlord.previewImage}
                          alt={overlord.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                          loading="lazy"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-void/80 via-transparent to-transparent" />

                      {/* Status badge */}
                      {overlord.status === 'coming-soon' && (
                        <div className="absolute top-4 right-4 font-mono text-[10px] uppercase tracking-wider text-neon-magenta/80 bg-neon-magenta/10 border border-neon-magenta/20 px-3 py-1">
                          Coming Soon
                        </div>
                      )}

                      {/* Overlord number */}
                      <div className="absolute bottom-4 left-4">
                        <span className="font-display text-6xl md:text-7xl font-light text-white/10">
                          {overlord.number}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="w-full md:w-1/2">
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-neon-green/60 mb-2">
                      Overlord {overlord.number}
                    </p>
                    <h3 className="font-display text-3xl md:text-4xl text-white mb-2">
                      {overlord.name}
                    </h3>
                    <p className="font-display text-lg italic text-steel mb-6">
                      {overlord.title}
                    </p>
                    <p className="text-steel/80 text-sm leading-relaxed mb-8 max-w-md">
                      {overlord.lore}
                    </p>
                    {overlord.status === 'live' ? (
                      <Link
                        href={`/overlords/${overlord.slug}`}
                        className="btn-primary"
                      >
                        <span>Interact</span>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </Link>
                    ) : (
                      <span className="btn-secondary cursor-default opacity-50">
                        Coming Soon
                      </span>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="relative py-32 section-padding">
        <div className="page-container text-center">
          <ScrollReveal>
            <div className="line-accent mb-16" />
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-neon-green/60 mb-6">
              The Network Awaits
            </p>
            <h2 className="font-display text-3xl md:text-5xl text-white mb-8">
              Step Inside the Epochalypse
            </h2>
            <p className="text-steel text-lg max-w-xl mx-auto mb-12">
              Drag, rotate, distort, and export. Every interaction creates a
              unique iteration — your own fragment of the network.
            </p>
            <Link href="/overlords" className="btn-primary">
              <span>Explore the Overlords</span>
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
