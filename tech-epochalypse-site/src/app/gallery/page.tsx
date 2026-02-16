import type { Metadata } from 'next'
import ScrollReveal from '@/components/ScrollReveal'
import UserExports from '@/components/UserExports'
import overlords from '@/data/overlords.json'
import galleryItemsRaw from '@/data/gallery.json'

interface GalleryItem {
  id: string
  type: 'image' | 'video'
  contributor: string
  date: string
  overlord: string
}

const galleryItems = galleryItemsRaw as GalleryItem[]

export const metadata: Metadata = {
  title: 'Community Gallery — Tech Epochalypse',
  description:
    'A living gallery of visitor-created remixes and exported iterations from the Tech Epochalypse series.',
}

export default function GalleryPage() {
  const overlordNames = Object.fromEntries(
    overlords.map((o) => [o.slug, o.name])
  )

  return (
    <section className="pt-28 md:pt-36 pb-24 section-padding">
      <div className="page-container">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-16 md:mb-20">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-neon-green/60 mb-4">
              Community
            </p>
            <h1 className="font-display text-4xl md:text-6xl text-white mb-4">
              Community Gallery
            </h1>
            <p className="font-display text-lg md:text-xl italic text-steel max-w-2xl mx-auto mb-8">
              Every interaction creates a unique iteration. This gallery
              showcases remixes and exports from visitors around the world.
            </p>

            {/* Filter bar */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-steel/50 mr-2">
                Filter:
              </span>
              <button className="font-mono text-xs uppercase tracking-wider px-4 py-2 border border-neon-green/30 text-neon-green bg-neon-green/5">
                All
              </button>
              {overlords
                .filter((o) => o.status === 'live')
                .map((o) => (
                  <button
                    key={o.slug}
                    className="font-mono text-xs uppercase tracking-wider px-4 py-2 border border-white/10 text-steel hover:border-white/20 hover:text-silver transition-colors"
                  >
                    {o.name}
                  </button>
                ))}
            </div>
          </div>
        </ScrollReveal>

        {/* User exports from artwork interactions */}
        <UserExports overlordNames={overlordNames} />

        {/* Gallery grid */}
        {galleryItems.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {galleryItems.map((item, i) => (
              <ScrollReveal key={item.id} delay={i * 80}>
                <div className="break-inside-avoid group relative bg-charcoal/30 border border-white/5 overflow-hidden card-hover">
                  <div className="aspect-[4/5] relative overflow-hidden bg-charcoal">
                    {item.type === 'image' ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="font-mono text-xs text-steel/40">
                          [artwork export]
                        </span>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="font-mono text-xs text-steel/40">
                          [video export]
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-void/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs text-silver">
                        {item.contributor}
                      </span>
                      <span className="font-mono text-[10px] text-steel/50">
                        {item.date}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-neon-green/50">
                      {overlordNames[item.overlord] ?? item.overlord}
                    </span>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <EmptyGallery />
        )}

        {/* Submit CTA */}
        <ScrollReveal>
          <div className="mt-24 text-center">
            <div className="line-accent mb-12" />
            <h3 className="font-display text-2xl md:text-3xl text-white mb-4">
              Share Your Iteration
            </h3>
            <p className="text-steel text-sm max-w-lg mx-auto mb-8 leading-relaxed">
              Create your unique export from any overlord artwork, then share it
              with the community. Every iteration is a new perspective on the
              network.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/overlords" className="btn-primary">
                <span>Create an Export</span>
              </a>
              <a
                href="mailto:gallery@techepochalypse.com?subject=Gallery Submission"
                className="btn-secondary"
              >
                <span>Submit Your Work</span>
              </a>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

function EmptyGallery() {
  return (
    <div className="text-center py-24 border border-dashed border-white/10 rounded-sm">
      <div className="text-6xl mb-6 opacity-20">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="mx-auto text-steel">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1"/>
          <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1"/>
          <path d="M21 15l-5-5-6 6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h3 className="font-display text-xl text-white mb-2">
        Gallery Coming Soon
      </h3>
      <p className="text-steel text-sm max-w-sm mx-auto">
        Community submissions will appear here. Visit an overlord artwork to
        create and export your unique iteration.
      </p>
    </div>
  )
}
