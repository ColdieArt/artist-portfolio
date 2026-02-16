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
    <section className="pt-28 md:pt-36 pb-24 section-padding">
      <div className="page-container">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-16 md:mb-24">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-neon-green/60 mb-4">
              The Network
            </p>
            <h1 className="font-display text-4xl md:text-6xl text-white mb-4">
              The Overlords
            </h1>
            <p className="font-display text-lg md:text-xl italic text-steel max-w-xl mx-auto">
              Five figures who shaped the digital epoch. Each rendered as a
              kinetic 3D portrait you can interact with.
            </p>
          </div>
        </ScrollReveal>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {overlords.map((overlord, i) => (
            <ScrollReveal key={overlord.slug} delay={i * 100}>
              <OverlordCard overlord={overlord} />
            </ScrollReveal>
          ))}
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
    <div className="group relative bg-charcoal/50 border border-white/5 overflow-hidden card-hover cursor-pointer">
      {/* Image */}
      <div className="aspect-[3/4] relative overflow-hidden">
        {overlord.previewImage ? (
          <img
            src={overlord.previewImage}
            alt={overlord.name}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-charcoal flex items-center justify-center">
            <span className="font-display text-8xl text-white/5">
              {overlord.number}
            </span>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/30 to-transparent" />

        {/* Hover glow line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-neon-green scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

        {/* Number watermark */}
        <div className="absolute top-4 right-4">
          <span className="font-display text-5xl font-light text-white/[0.07] group-hover:text-white/10 transition-colors duration-500">
            {overlord.number}
          </span>
        </div>

        {/* Status badge */}
        {!isLive && (
          <div className="absolute top-4 left-4 font-mono text-[10px] uppercase tracking-wider text-neon-magenta/80 bg-void/80 border border-neon-magenta/20 px-3 py-1 backdrop-blur-sm">
            Coming Soon
          </div>
        )}

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neon-green/60 mb-1">
            Overlord {overlord.number}
          </p>
          <h3 className="font-display text-2xl text-white mb-1">
            {overlord.name}
          </h3>
          <p className="font-display text-sm italic text-steel/80">
            {overlord.title}
          </p>

          {/* Interact prompt */}
          <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-neon-green">
              {isLive ? 'Interact' : 'Coming Soon'}
            </span>
            {isLive && (
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="text-neon-green">
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
