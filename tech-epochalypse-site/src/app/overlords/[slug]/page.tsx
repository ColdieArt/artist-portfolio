import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import overlords from '@/data/overlords.json'
import ArtworkViewer from '@/components/ArtworkViewer'

interface PageProps {
  params: { slug: string }
}

export function generateStaticParams() {
  return overlords
    .filter((o) => o.status === 'live')
    .map((o) => ({ slug: o.slug }))
}

export function generateMetadata({ params }: PageProps): Metadata {
  const overlord = overlords.find((o) => o.slug === params.slug)
  if (!overlord) return {}

  return {
    title: `Overlord ${overlord.number} — ${overlord.name} | Tech Epochalypse`,
    description: overlord.description,
  }
}

export default function OverlordPage({ params }: PageProps) {
  const overlord = overlords.find((o) => o.slug === params.slug)
  if (!overlord || overlord.status !== 'live') notFound()

  const liveOverlords = overlords.filter((o) => o.status === 'live')
  const currentLiveIndex = liveOverlords.findIndex(
    (o) => o.slug === params.slug
  )
  const prev = liveOverlords[currentLiveIndex - 1] ?? null
  const next = liveOverlords[currentLiveIndex + 1] ?? null

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="fixed top-16 md:top-20 left-0 right-0 z-40 bg-void/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-12">
          <Link
            href="/overlords"
            className="font-mono text-xs uppercase tracking-[0.15em] text-steel hover:text-neon-green transition-colors flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path
                d="M13 8H3M7 4l-4 4 4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            All Overlords
          </Link>

          <div className="flex items-center gap-1">
            <span className="font-mono text-xs text-steel/50 mr-4">
              Overlord {overlord.number} — {overlord.name}
            </span>
            {prev && (
              <Link
                href={`/overlords/${prev.slug}`}
                className="p-2 text-steel hover:text-neon-green transition-colors"
                title={`Previous: ${prev.name}`}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            )}
            {next && (
              <Link
                href={`/overlords/${next.slug}`}
                className="p-2 text-steel hover:text-neon-green transition-colors"
                title={`Next: ${next.name}`}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Info panel */}
      <div className="pt-[7.5rem] md:pt-[8.5rem] bg-abyss border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-neon-green/60 mb-2">
                Overlord {overlord.number}
              </p>
              <h1 className="font-display text-3xl md:text-4xl text-white mb-2">
                {overlord.name}
              </h1>
              <p className="font-display text-lg italic text-steel mb-6">
                {overlord.title}
              </p>
              <p className="text-steel/80 text-sm leading-relaxed">
                {overlord.lore}
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-silver mb-2">
                  Medium
                </h3>
                <p className="text-steel text-sm">{overlord.medium}</p>
              </div>
              <div>
                <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-silver mb-2">
                  Year
                </h3>
                <p className="text-steel text-sm">{overlord.year}</p>
              </div>
              <div>
                <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-silver mb-2">
                  Interaction
                </h3>
                <p className="text-steel text-sm">
                  Drag to rotate. Use the built-in controls to apply filters and
                  effects. Export your unique iteration as JPEG or MP4.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Launch artwork button */}
      <div className="flex-1 flex items-center justify-center bg-void">
        <ArtworkViewer overlord={overlord} />
      </div>
    </div>
  )
}
