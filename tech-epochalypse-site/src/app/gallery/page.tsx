import type { Metadata } from 'next'
import ScrollReveal from '@/components/ScrollReveal'
import UserExports from '@/components/UserExports'
import overlords from '@/data/overlords.json'

export const metadata: Metadata = {
  title: 'Community Gallery — Tech Epochalypse',
  description:
    'A living gallery of visitor-created remixes and exported iterations from the Tech Epochalypse series.',
}

export default function GalleryPage() {
  const overlordNames = Object.fromEntries(
    overlords.map((o) => [o.slug, o.name])
  )
  const overlordSlugs = overlords.map((o) => o.slug)

  return (
    <section className="pt-28 md:pt-36 pb-24 section-padding bg-black grid-lines">
      <div className="page-container">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-12 md:mb-16">
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-white mb-4">
              Archive
            </p>
            <h1 className="font-display text-4xl md:text-6xl text-white mb-4 uppercase tracking-[0.05em]">
              Community Gallery
            </h1>
            <p className="font-mono text-sm text-white max-w-2xl mx-auto mb-2">
              Every interaction creates a unique iteration. This gallery
              showcases remixes and exports from visitors around the world.
            </p>
            <p className="font-mono text-xs text-white max-w-lg mx-auto">
              Click any piece to view full size. Play slideshow to cycle through the collection.
            </p>
          </div>
        </ScrollReveal>

        {/* User exports from Airtable */}
        <UserExports overlordNames={overlordNames} overlordSlugs={overlordSlugs} />

        {/* Submit CTA */}
        <ScrollReveal>
          <div className="mt-24 text-center">
            <div className="line-accent mb-12" />
            <h3 className="font-display text-2xl md:text-3xl text-white mb-4 uppercase tracking-[0.03em]">
              Share Your Iteration
            </h3>
            <p className="text-white text-sm font-mono max-w-lg mx-auto mb-8 leading-relaxed">
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
