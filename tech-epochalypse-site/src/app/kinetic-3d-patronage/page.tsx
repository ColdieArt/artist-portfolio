import type { Metadata } from 'next'
import Link from 'next/link'
import ScrollReveal from '@/components/ScrollReveal'

export const metadata: Metadata = {
  title: 'Kinetic 3D Patronage - Tech Epochalypse',
  description:
    'What Kinetic 3D token holders receive as part of their patronage - interactive art stewardship, network effects, real-time evolution, and collaborative prints.',
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
                Stewardship - <span className="redacted">Active</span>
              </span>
              <div className="w-12 h-px bg-white/10" />
            </div>
            <p className="font-mono text-sm text-white mt-6 max-w-2xl mx-auto leading-relaxed">
              As a Kinetic 3D token holder, you become a steward of a new method
              of interactive 3D art. Here is what your patronage includes.
            </p>
          </div>
        </ScrollReveal>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* Left: Benefits content */}
          <div className="flex-1">
            {/* Touch the Art */}
            <ScrollReveal>
              <div className="mb-16 md:mb-24">
                <div className="classified-header">
                  Benefit 001 -{' '}
                  <span className="redacted">Stewardship</span>
                </div>
                <h2 className="font-display text-3xl md:text-4xl text-white mb-6 uppercase tracking-[0.03em]">
                  Touch the Art
                </h2>
                <div className="space-y-4 text-white text-sm font-mono leading-relaxed">
                  <p>
                    Collectors get to be stewards of this new medium of kinetic 3D
                    collage. It is meant to be used and explored, pushing yourself
                    to be creative and feel something. Art can be so much more than
                    just something to stare at. As the series evolves and the
                    ecosystem of networked art grows, the living art itself will
                    remain the truth that all releases will be sourced from.
                  </p>
                  <p>
                    This is Coldie&apos;s genesis series that features this medium
                    of 3D kinetic collage.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <div className="line-accent mb-16" />

            {/* Network Effect */}
            <ScrollReveal>
              <div className="mb-16 md:mb-24">
                <div className="classified-header">
                  Benefit 002 -{' '}
                  <span className="redacted">Distribution</span>
                </div>
                <h2 className="font-display text-3xl md:text-4xl text-white mb-6 uppercase tracking-[0.03em]">
                  Network Effect
                </h2>
                <div className="space-y-4 text-white text-sm font-mono leading-relaxed">
                  <p>
                    Sharing this art IRL and digitally invites viewers to
                    &lsquo;touch the art,&rsquo; but only the token holders own it.
                  </p>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="bg-charcoal/30 border border-white/5 p-6">
                    <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-white mb-3 border-b border-white/10 pb-3">
                      Project Hub
                    </h3>
                    <p className="text-white text-sm font-mono leading-relaxed">
                      This mini-site acts as the networked hub for the Tech
                      Epochalypse series, to showcase the digital kinetic works and
                      highlight the patrons of the project that have helped bring
                      this new medium of collage to life.
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
                      Collector Allocations
                    </h3>
                    <p className="text-white text-sm font-mono leading-relaxed">
                      Kinetic token holders receive exclusive allocations from
                      curated physical and digital releases tied to their specific
                      work. Participation is determined by ownership at the time of
                      each release, with distributions aligned to the corresponding
                      Overlord.
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
                  Benefit 003 -{' '}
                  <span className="redacted">Evolution</span>
                </div>
                <h2 className="font-display text-3xl md:text-4xl text-white mb-6 uppercase tracking-[0.03em]">
                  Living Art Evolution
                </h2>
                <div className="space-y-4 text-white text-sm font-mono leading-relaxed">
                  <p>
                    A living composition that evolves with its collectors.
                  </p>
                  <p>
                    Because this is a ERC-7160 Doppelg&auml;nger contract
                    (Transient Labs), the token will be upgraded as I implement the
                    longer term vision of the project. I am releasing the current
                    medium functionality as it lives now so we can experience its
                    living art experience, together, in real-time.
                  </p>
                </div>

                <div className="mt-8 space-y-4">
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
                      In-depth viewing experiences meant for public interaction and experimentation.
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
                  Benefit 004 -{' '}
                  <span className="redacted">Added-Value</span>
                </div>
                <h2 className="font-display text-3xl md:text-4xl text-white mb-6 uppercase tracking-[0.03em]">
                  Added-Value
                </h2>
                <div className="space-y-4 text-white text-sm font-mono leading-relaxed">
                  <p>
                    As a patron of the digital kinetic 3D series, there are inherent
                    value-adds and opportunities to participate further with the
                    project.
                  </p>
                </div>

                <div className="mt-8">
                  <div className="bg-charcoal/30 border border-white/5 p-6">
                    <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-white mb-4 border-b border-white/10 pb-3">
                      Collaborative Physical Print
                    </h3>
                    <div className="space-y-3 text-white text-sm font-mono leading-relaxed">
                      <div className="flex items-baseline gap-3">
                        <span className="text-white/30 select-none">-</span>
                        <p>
                          The first collectors for these kinetic works will be
                          allocated one gallery-quality print.
                        </p>
                      </div>
                      <div className="flex items-baseline gap-3">
                        <span className="text-white/30 select-none">-</span>
                        <p>
                          Collector customizes their digital kinetic 3D layout to
                          their preferred composition.
                        </p>
                      </div>
                      <div className="flex items-baseline gap-3">
                        <span className="text-white/30 select-none">-</span>
                        <p>12&Prime; &times; 18&Prime;</p>
                      </div>
                      <div className="flex items-baseline gap-3">
                        <span className="text-white/30 select-none">-</span>
                        <p>Signed and numbered 1/1/10 per overlord.</p>
                      </div>
                      <div className="flex items-baseline gap-3">
                        <span className="text-white/30 select-none">-</span>
                        <p>
                          Full Set collectors can create multi-overlord mashup portraits
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
                  Benefit 005 -{' '}
                  <span className="redacted">Physical</span>
                </div>
                <h2 className="font-display text-3xl md:text-4xl text-white mb-6 uppercase tracking-[0.03em]">
                  Physical Kinetic 3D Series
                </h2>
                <div className="space-y-4 text-white text-sm font-mono leading-relaxed">
                  <p>
                    Collector has first right to collect the physical kinetic 3D
                    version of their digital work. These works are able to be
                    rearranged dynamically using magnets. Previously this medium
                    was sold by Coldie at{' '}
                    <a
                      href="https://onlineonly.christies.com/s/first-open-post-war-contemporary-art/coldie-b-1982-286/245196"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-white/80 transition-colors"
                    >
                      Christie&apos;s Auction House
                    </a>{' '}
                    in 2024.
                  </p>
                </div>

                <div className="mt-8">
                  <div className="bg-charcoal/30 border border-white/5 p-6">
                    <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-white mb-4 border-b border-white/10 pb-3">
                      Physical Edition Details
                    </h3>
                    <div className="space-y-3 text-white text-sm font-mono leading-relaxed">
                      <div className="flex items-baseline gap-3">
                        <span className="text-white/30 select-none">-</span>
                        <p>
                          $6,000 discount applies toward the cost of a single
                          physical magnetic work. Owning multiple digital pieces
                          does not increase the discount on a single physical work.
                          Price TBD as we are developing new production and
                          functionality tools currently.
                        </p>
                      </div>
                      <div className="flex items-baseline gap-3">
                        <span className="text-white/30 select-none">-</span>
                        <p>18&Prime; &times; 24&Prime;</p>
                      </div>
                      <div className="flex items-baseline gap-3">
                        <span className="text-white/30 select-none">-</span>
                        <p>Signed and numbered 1/10 per overlord.</p>
                      </div>
                      <div className="flex items-baseline gap-3">
                        <span className="text-white/30 select-none">-</span>
                        <p>
                          Owning multiple digital pieces allows for mashup of
                          elements on the physical work.
                        </p>
                      </div>
                      <div className="flex items-baseline gap-3">
                        <span className="text-white/30 select-none">-</span>
                        <p>
                          Release date TBD based on R&amp;D and production.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Right: Collection Overview Sidebar */}
          <div className="lg:w-96 shrink-0">
            <ScrollReveal>
              <div className="bg-charcoal/30 border border-white/5 p-6">
                <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-white mb-6 border-b border-white/10 pb-3">
                  Collection Overview
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-baseline">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">Overlords</span>
                    <span className="font-display text-lg text-white">5</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">Editions / Overlord</span>
                    <span className="font-display text-lg text-white">10</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">Price</span>
                    <span className="font-display text-lg text-white">$6,000 <span className="font-mono text-[10px] text-white/50">(in ETH)</span></span>
                  </div>
                </div>
              </div>

              {/* Full Sets */}
              <div className="bg-charcoal/30 border border-white/5 p-6 mt-4">
                <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-white mb-4 border-b border-white/10 pb-3">
                  Full Sets
                </h3>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-mono text-sm text-white">5 Total</span>
                  <span className="font-mono text-sm text-white">3 Available</span>
                </div>
                <p className="font-mono text-[10px] text-white/40 mb-5">
                  Set of 5 Overlords
                </p>
              </div>

              {/* Individual Tokens */}
              <div className="bg-charcoal/30 border border-white/5 p-6 mt-4">
                <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-white mb-4 border-b border-white/10 pb-3">
                  Individual Tokens
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="font-mono text-sm text-white">Elon Musk</span>
                    <span className="font-mono text-[11px] text-white/60">5 ed. - <span className="text-white">2 avail</span></span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="font-mono text-sm text-white">Mark Zuckerberg</span>
                    <span className="font-mono text-[11px] text-white/60">5 ed. - <span className="text-white">3 avail</span></span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="font-mono text-sm text-white">Sam Altman</span>
                    <span className="font-mono text-[11px] text-white/60">5 ed. - <span className="text-white">4 avail</span></span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="font-mono text-sm text-white">Jensen Huang</span>
                    <span className="font-mono text-[11px] text-white/60">5 ed. - <span className="text-white">4 avail</span></span>
                  </div>
                </div>
              </div>

              {/* Collectors */}
              <Link
                href="/collectors"
                className="block w-full text-center font-mono text-xs uppercase tracking-[0.15em] text-black bg-white px-4 py-3 mt-4 hover:bg-white/90 transition-colors"
              >
                View Collectors
              </Link>
            </ScrollReveal>
          </div>
        </div>

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
