import type { Metadata } from 'next'
import Link from 'next/link'
import ScrollReveal from '@/components/ScrollReveal'
import overlords from '@/data/overlords.json'

export const metadata: Metadata = {
  title: 'The Overlords — Tech Epochalypse',
  description:
    'Explore all five Tech Overlords — interactive kinetic 3D portraits by Coldie.',
}

export default function OverlordsPage() {
  return (
    <section className="pt-28 md:pt-36 pb-24 lg:pb-8 section-padding bg-black grid-lines lg:h-screen lg:overflow-hidden">
      <div className="page-container h-full">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-10 items-start h-full">
          {/* Left column — headline & text */}
          <div className="w-full lg:w-5/12 flex items-center">
            <ScrollReveal>
              <p className="font-mono text-xs uppercase tracking-[0.4em] text-white mb-4">
                Overlord Files
              </p>
              <h1 className="font-display text-5xl md:text-7xl text-white mb-4 uppercase tracking-[0.05em]">
                The Overlords
              </h1>
              <p className="font-mono text-sm text-white max-w-md">
                Know the people who know everything about you.
              </p>
              <div className="flex items-center gap-3 mt-4">
                <div className="w-12 h-px bg-white/15" />
                <span className="font-mono text-xs text-white uppercase tracking-wider">
                  Clearance: <span className="redacted">LEVEL 3</span>
                </span>
                <div className="w-12 h-px bg-white/15" />
              </div>
            </ScrollReveal>
          </div>

          {/* Right column — overlord grid, 2 wide, fits viewport */}
          <div className="w-full lg:w-7/12 lg:h-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:grid-rows-3 lg:h-full">
              {overlords.map((overlord, i) => (
                <ScrollReveal key={overlord.slug} delay={i * 100} className="lg:min-h-0 lg:h-full">
                  <OverlordCard overlord={overlord} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

interface Overlord {
  slug: string
  number: string
  name: string
  title: string
  tagline: string
  description: string
  previewImage: string | null
  status: string
  order: number
}

function OverlordCard({ overlord }: { overlord: Overlord }) {
  const isLive = overlord.status === 'live'

  const content = (
    <div className="group relative bg-charcoal/50 border border-white/5 overflow-hidden card-hover cursor-pointer h-full">
      {/* Image */}
      <div className="aspect-[3/4] lg:aspect-auto lg:h-full relative overflow-hidden">
        {overlord.previewImage ? (
          <img
            src={overlord.previewImage}
            alt={overlord.name}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 opacity-100"
            loading="lazy"
            style={{ filter: 'grayscale(1) contrast(1.2)' }}
          />
        ) : (
          <div className="w-full h-full bg-charcoal flex items-center justify-center">
            <span className="font-display text-8xl text-white">
              {overlord.number}
            </span>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

        {/* Hover reveal line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/30 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

        {/* Number watermark */}
        <div className="absolute top-4 right-4">
          <span className="font-display text-5xl font-light text-white transition-colors duration-500">
            {overlord.number}
          </span>
        </div>

        {/* Pixelated block */}
        <div className="absolute top-6 left-4 w-16 h-4 bg-white/[0.04] animate-pixel-drift" style={{ imageRendering: 'pixelated' as const }} />

        {/* Status badge */}
        {!isLive && (
          <div className="absolute top-4 left-4 font-mono text-xs uppercase tracking-wider text-white bg-black/80 border border-white/15 px-3 py-1 backdrop-blur-sm">
            Classified
          </div>
        )}

        {/* Stamp for non-live */}
        {!isLive && (
          <div className="stamp top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm">
            RESTRICTED
          </div>
        )}

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-3">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-white mb-0.5">
            Overlord {overlord.number}
          </p>
          <h3 className="font-display text-xl lg:text-lg text-white mb-0.5 uppercase tracking-[0.03em]">
            {overlord.name}
          </h3>
          <p className="font-mono text-xs text-white">
            {overlord.title}
          </p>

          {/* Interact prompt */}
          <div className="mt-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="font-mono text-xs uppercase tracking-[0.15em] text-white">
              {isLive ? 'Take Control' : 'Restricted'}
            </span>
            {isLive && (
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="text-white">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  if (isLive) {
    return <Link href={`/overlords/${overlord.slug}`}>{content}</Link>
  }

  return content
}
