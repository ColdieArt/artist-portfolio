import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import overlords from '@/data/overlords.json'
import ArtworkViewer from '@/components/ArtworkViewer'
import TwitterFeed from '@/components/TwitterFeed'

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
    <div className="min-h-screen flex flex-col bg-black">
      {/* Top bar */}
      <div className="fixed top-14 md:top-16 left-0 right-0 z-40 bg-black/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-12">
          <Link
            href="/overlords"
            className="font-mono text-xs uppercase tracking-[0.2em] text-white/40 hover:text-white/70 transition-colors flex items-center gap-2"
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
            <span className="font-mono text-xs text-white/35 mr-4">
              Overlord {overlord.number} &mdash; {overlord.name}
            </span>
            {prev && (
              <Link
                href={`/overlords/${prev.slug}`}
                className="p-2 text-white/30 hover:text-white/60 transition-colors"
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
                className="p-2 text-white/30 hover:text-white/60 transition-colors"
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

      {/* Info panel — dossier style */}
      <div className="pt-[7rem] md:pt-[7.5rem] bg-abyss border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <div className="classified-header">
                Overlord {overlord.number} &mdash; Active Dossier
              </div>
              <h1 className="font-display text-4xl md:text-5xl text-white mb-3 uppercase tracking-[0.03em]">
                {overlord.name}
              </h1>
              <p className="font-mono text-sm text-white/45 mb-6 uppercase tracking-wider">
                Designation: {overlord.title}
              </p>
              <p className="text-white/50 text-base font-mono leading-relaxed">
                {overlord.lore}
              </p>
              <p className="text-white/20 text-xs font-mono mt-4">
                File: <span className="redacted">DOC-{overlord.number}-2024</span>
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-white/40 mb-2 border-b border-white/10 pb-1">
                  Medium
                </h3>
                <p className="text-white/50 text-sm font-mono">{overlord.medium}</p>
              </div>
              <div>
                <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-white/40 mb-2 border-b border-white/10 pb-1">
                  Year
                </h3>
                <p className="text-white/50 text-sm font-mono">{overlord.year}</p>
              </div>
              <div>
                <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-white/40 mb-2 border-b border-white/10 pb-1">
                  Interaction Protocol
                </h3>
                <p className="text-white/50 text-sm font-mono">
                  Drag to rotate. Use the built-in controls to apply filters and
                  effects. Export your unique iteration as JPEG or MP4.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent X posts */}
      {overlord.twitterHandle && (
        <div className="bg-abyss border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-16">
            <div className="classified-header">
              Intercepts &mdash; Recent Transmissions
            </div>
            <h2 className="font-display text-2xl md:text-3xl text-white mb-6 uppercase tracking-[0.03em]">
              Live from @{overlord.twitterHandle}
            </h2>
            <div className="max-w-2xl">
              <TwitterFeed
                handle={overlord.twitterHandle}
                name={overlord.name}
              />
            </div>
          </div>
        </div>
      )}

      {/* Launch artwork button */}
      <div className="flex-1 flex items-center justify-center bg-black">
        <ArtworkViewer overlord={overlord} />
      </div>
    </div>
  )
}
