import type { Metadata } from 'next'
import Link from 'next/link'
import ScrollReveal from '@/components/ScrollReveal'

export const metadata: Metadata = {
  title: 'Kinetic 3D Patronage — Tech Epochalypse',
  description:
    'What Kinetic 3D token holders receive as part of their patronage — interactive art stewardship, network effects, real-time evolution, and collaborative prints.',
}

export default function Kinetic3DPatronagePage() {
  return (
    <section className="pt-28 md:pt-36 pb-24 section-padding bg-black grid-lines">
      <div className="page-container">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-16 md:mb-24">
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-white mb-4">
              Token Holder Benefits
            </p>
            <h1 className="font-display text-4xl md:text-6xl text-white mb-4 uppercase tracking-[0.05em]">
              Kinetic 3D Patronage
            </h1>
            <div className="flex items-center justify-center gap-3 mt-2">
              <div className="w-12 h-px bg-white/10" />
              <span className="font-mono text-[9px] text-white uppercase tracking-wider">
                Stewardship &mdash; <span className="redacted">Active</span>
              </span>
              <div className="w-12 h-px bg-white/10" />
            </div>
            <p className="font-mono text-sm text-white mt-6 max-w-2xl mx-auto leading-relaxed">
              As a Kinetic 3D token holder, you become a steward of a new method
              of interactive 3D art. Here is what your patronage includes.
            </p>
          </div>
        </ScrollReveal>

        <div className="line-accent mb-16" />

        {/* Touch the Art */}
        <ScrollReveal>
          <div className="mb-16 md:mb-24">
            <div className="classified-header">
              Benefit 001 &mdash;{' '}
              <span className="redacted">Stewardship</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl text-white mb-6 uppercase tracking-[0.03em]">
              Touch the Art
            </h2>
            <div className="space-y-4 text-white text-sm font-mono leading-relaxed max-w-3xl">
              <p>
                Collectors get to be stewards of this new method of interactive
                3D collaboration. It is meant to be used and explored, pushing
                yourself to be creative and feel something.
              </p>
            </div>
          </div>
        </ScrollReveal>

        <div className="line-accent mb-16" />

        {/* Network Effect */}
        <ScrollReveal>
          <div className="mb-16 md:mb-24">
            <div className="classified-header">
              Benefit 002 &mdash;{' '}
              <span className="redacted">Distribution</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl text-white mb-6 uppercase tracking-[0.03em]">
              Network Effect
            </h2>
            <div className="space-y-4 text-white text-sm font-mono leading-relaxed max-w-3xl">
              <p>
                Sharing this art IRL and digitally invites viewers to
                &lsquo;touch the art,&rsquo; but only the token holders own it.
              </p>
            </div>

            <div className="mt-8 space-y-4 max-w-3xl">
              <div className="bg-charcoal/30 border border-white/5 p-6">
                <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-white mb-3 border-b border-white/10 pb-3">
                  Project Hub
                </h3>
                <p className="text-white text-sm font-mono leading-relaxed">
                  A mini-site will act as a hub for the project, to showcase the
                  digital kinetic works and highlight the patrons of the project.
                </p>
              </div>

              <div className="bg-charcoal/30 border border-white/5 p-6">
                <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-white mb-3 border-b border-white/10 pb-3">
                  Community Engagement
                </h3>
                <p className="text-white text-sm font-mono leading-relaxed">
                  Community engagement with the digital works in ways that bring
                  more visibility and incentive to &lsquo;touch the art&rsquo;
                  which benefits collectors and creators.
                </p>
              </div>

              <div className="bg-charcoal/30 border border-white/5 p-6">
                <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-white mb-3 border-b border-white/10 pb-3">
                  Free Art Releases
                </h3>
                <p className="text-white text-sm font-mono leading-relaxed">
                  Includes free art (physical and digital) related to curated
                  community releases, tied to the kinetic token held. For
                  example, if there is an Elon Musk competition, holders of the
                  Musk kinetic token will get one of the released items.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <div className="line-accent mb-16" />

        {/* Real-Time Evolution */}
        <ScrollReveal>
          <div className="mb-16 md:mb-24">
            <div className="classified-header">
              Benefit 003 &mdash;{' '}
              <span className="redacted">Evolution</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl text-white mb-6 uppercase tracking-[0.03em]">
              Real-Time Evolution
            </h2>
            <div className="space-y-4 text-white text-sm font-mono leading-relaxed max-w-3xl">
              <p>
                Because this is a ERC-7160 Doppelg&auml;nger contract, the token
                will be upgraded as I implement the longer term vision of the
                project. These are being developed at different phases of
                R&amp;D. I am releasing it now so we can see it grow together,
                in real-time.
              </p>
            </div>

            <div className="mt-8 space-y-4 max-w-3xl">
              <div className="bg-charcoal/30 border border-white/5 p-6">
                <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-white mb-3 border-b border-white/10 pb-3">
                  Increased Interactivity
                </h3>
                <p className="text-white text-sm font-mono leading-relaxed">
                  Allowing deeper control of assets.
                </p>
              </div>

              <div className="bg-charcoal/30 border border-white/5 p-6">
                <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-white mb-3 border-b border-white/10 pb-3">
                  Advanced Viewing Methods
                </h3>
                <p className="text-white text-sm font-mono leading-relaxed">
                  Including stereoscopic 3D screens.
                </p>
              </div>

              <div className="bg-charcoal/30 border border-white/5 p-6">
                <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-white mb-3 border-b border-white/10 pb-3">
                  New Functionality
                </h3>
                <p className="text-white text-sm font-mono leading-relaxed">
                  Will open up doors for deeper impact.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <div className="line-accent mb-16" />

        {/* Added-Value: Collaborative Print */}
        <ScrollReveal>
          <div className="mb-16 md:mb-24">
            <div className="classified-header">
              Benefit 004 &mdash;{' '}
              <span className="redacted">Added-Value</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl text-white mb-6 uppercase tracking-[0.03em]">
              Added-Value
            </h2>
            <div className="space-y-4 text-white text-sm font-mono leading-relaxed max-w-3xl">
              <p>
                As a patron of the digital kinetic 3D series, there are inherent
                value-adds and opportunities to participate further with the
                project.
              </p>
            </div>

            <div className="mt-8 max-w-3xl">
              <div className="bg-charcoal/30 border border-white/5 p-6">
                <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-white mb-4 border-b border-white/10 pb-3">
                  Collaborative Physical Print
                </h3>
                <div className="space-y-3 text-white text-sm font-mono leading-relaxed">
                  <div className="flex items-baseline gap-3">
                    <span className="text-white/30 select-none">&mdash;</span>
                    <p>
                      Each token receives one gallery-quality print free of
                      charge.
                    </p>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-white/30 select-none">&mdash;</span>
                    <p>
                      Collector customizes their digital kinetic 3D layout to
                      their preferred composition.
                    </p>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-white/30 select-none">&mdash;</span>
                    <p>12&Prime; &times; 18&Prime;</p>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-white/30 select-none">&mdash;</span>
                    <p>Signed and numbered 1/1/10 per overlord.</p>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-white/30 select-none">&mdash;</span>
                    <p>
                      Collecting multiple overlords allows for mashup designs on
                      each print.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <div className="line-accent mb-16" />

        {/* Physical Kinetic 3D Series */}
        <ScrollReveal>
          <div className="mb-16 md:mb-24">
            <div className="classified-header">
              Benefit 005 &mdash;{' '}
              <span className="redacted">Physical</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl text-white mb-6 uppercase tracking-[0.03em]">
              Physical Kinetic 3D Series
            </h2>
            <div className="space-y-4 text-white text-sm font-mono leading-relaxed max-w-3xl">
              <p>
                Collector has first right to collect the physical kinetic 3D
                version of their digital work.
              </p>
            </div>

            <div className="mt-8 max-w-3xl">
              <div className="bg-charcoal/30 border border-white/5 p-6">
                <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-white mb-4 border-b border-white/10 pb-3">
                  Physical Edition Details
                </h3>
                <div className="space-y-3 text-white text-sm font-mono leading-relaxed">
                  <div className="flex items-baseline gap-3">
                    <span className="text-white/30 select-none">&mdash;</span>
                    <p>
                      $6,000 discount applies toward the cost of the physical,
                      if you choose to collect.
                    </p>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-white/30 select-none">&mdash;</span>
                    <p>18&Prime; &times; 24&Prime;</p>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-white/30 select-none">&mdash;</span>
                    <p>Signed and numbered 1/10 per overlord.</p>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-white/30 select-none">&mdash;</span>
                    <p>
                      Owning multiple digital pieces allows for mashup of
                      elements on the physical work.
                    </p>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-white/30 select-none">&mdash;</span>
                    <p>
                      Release date TBD based on R&amp;D and production.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Back to Series CTA */}
        <ScrollReveal>
          <div className="text-center mt-8">
            <Link
              href="/series"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-mono text-sm uppercase tracking-[0.2em] hover:bg-white/90 transition-colors"
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
              Back to Series
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
