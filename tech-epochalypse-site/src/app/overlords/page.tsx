import type { Metadata } from 'next'
import Link from 'next/link'
import ScrollReveal from '@/components/ScrollReveal'
import UserExports from '@/components/UserExports'
import overlords from '@/data/overlords.json'

export const metadata: Metadata = {
  title: 'The Overlords - Tech Epochalypse',
  description:
    'Explore all five Tech Overlords - interactive kinetic 3D portraits by Coldie.',
}

const listedOverlords = overlords.filter((o) => o.status !== 'unlisted')

export default function OverlordsPage() {
  const overlordNames = Object.fromEntries(
    listedOverlords.map((o) => [o.slug, o.name])
  )
  const overlordSlugs = listedOverlords.map((o) => o.slug)

  return (
    <>
    <section className="pt-28 md:pt-36 pb-24 lg:pb-8 section-padding bg-black grid-lines">
      <div className="page-container h-full">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-10 items-start h-full">
          {/* Left column - headline & text */}
          <div className="w-full lg:w-5/12 flex items-start">
            <ScrollReveal>
              <p className="font-mono text-xs uppercase tracking-[0.4em] text-white mb-4">
                Overlord Files
              </p>
              <h1 className="font-display text-5xl md:text-7xl text-white mb-6 uppercase tracking-[0.05em]">
                The Overlords
              </h1>
              <p className="font-mono text-sm text-white leading-relaxed mb-4 max-w-md">
                Know the people who know everything about you.
              </p>
              <p className="font-mono text-sm text-white/70 leading-relaxed mb-4 max-w-md">
                Tech Epochalypse is an interactive digital art series by Coldie featuring
                the faces behind the systems we live inside - Elon Musk, Mark Zuckerberg,
                Sam Altman, Jeff Bezos, and Jensen Huang. These are not static images.
                They are living, dimensional compositions built to be taken apart.
              </p>
              <p className="font-mono text-sm text-white/70 leading-relaxed mb-4 max-w-md">
                Each portrait exists in 3D space. Move it. Stack the layers. Push elements
                into depth. Pull them forward. Apply Control Layers that shift the image in
                ways the subject never intended. The piece responds to you - every rotation,
                every arrangement, every decision creates something that didn&rsquo;t exist before
                you touched it.
              </p>
              <p className="font-mono text-sm text-white/70 leading-relaxed mb-4 max-w-md">
                When you find the version that speaks in your voice, export it. That artifact
                is yours. Submit it to The Mainframe as a general entry for the community
                gallery, or deploy it during an active Exploit - a bounty event where the
                most powerful breach earns a collaboration with the Tech Epochalypse project,
                and extends to opportunities for special releases for token.
              </p>
              <p className="font-mono text-sm text-white leading-relaxed mb-6 max-w-md">
                The Overlords built their empires on controlling what you see.
                Here, you control how they&rsquo;re seen.
              </p>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/50 max-w-md">
                Choose an overlord now and touch the art.
              </p>
            </ScrollReveal>
          </div>

          {/* Right column - overlord grid, 2 wide, fits viewport */}
          <div className="w-full lg:w-7/12 lg:h-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:grid-rows-3 lg:h-full">
              {listedOverlords.map((overlord, i) => (
                <ScrollReveal key={overlord.slug} delay={i * 100} className="lg:min-h-0 lg:h-full">
                  <OverlordCard overlord={overlord} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="pb-24 section-padding bg-black grid-lines">
      <div className="page-container">
        <ScrollReveal>
          <UserExports
            overlordNames={overlordNames}
            overlordSlugs={overlordSlugs}
            headerText="Raw Signals - community exports from across the network. Unfiltered. Unranked. Create something. Touch the art. Submit the creation."
          />
        </ScrollReveal>
      </div>
    </section>
    </>
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
            style={{ filter: 'contrast(1.2)' }}
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
