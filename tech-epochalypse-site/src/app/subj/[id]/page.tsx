import Link from 'next/link'
import dynamic from 'next/dynamic'
import { notFound } from 'next/navigation'
import ScrollReveal from '@/components/ScrollReveal'
import overlords from '@/data/overlords.json'

const UserExports = dynamic(() => import('@/components/UserExports'), {
  ssr: false,
  loading: () => (
    <div className="text-center py-12">
      <p className="font-mono text-xs text-white/40 uppercase tracking-wider">Loading community exports…</p>
    </div>
  ),
})

// Each SUBJ event registered here. Add new IDs (02, 03, …) as future
// competitions launch; everything else 404s automatically.
type SubjEvent = {
  id: string
  title: string
  subtitle: string
  status: 'live' | 'upcoming' | 'closed'
  shortDescription: string
}

const SUBJ_EVENTS: Record<string, SubjEvent> = {
  '01': {
    id: '01',
    title: 'The Singularity',
    subtitle: 'Tech Epochalypse Remix Competition',
    status: 'live',
    shortDescription:
      'Five tech overlords, each a face of the Singularity. Pick one, remix it in Coldie’s editor, and submit your own parallax collage. Use Coldie’s assets, upload your own, or both — all entries compete equally.',
  },
}

export function generateStaticParams() {
  return Object.keys(SUBJ_EVENTS).map((id) => ({ id }))
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const event = SUBJ_EVENTS[params.id]
  if (!event) return { title: 'SUBJ — Not Found' }
  return {
    title: `SUBJ:${event.id} — ${event.title} | Tech Epochalypse`,
    description: event.shortDescription,
  }
}

export default function SubjPage({ params }: { params: { id: string } }) {
  const event = SUBJ_EVENTS[params.id]
  if (!event) notFound()

  const listedOverlords = overlords.filter((o) => o.status !== 'unlisted')
  const overlordNames = Object.fromEntries(listedOverlords.map((o) => [o.slug, o.name]))
  const overlordSlugs = listedOverlords.map((o) => o.slug)

  return (
    <div className="min-h-screen bg-void">
      {/* ── Compact Header ── */}
      <section className="pt-24 pb-6 section-padding">
        <div className="page-container">
          <ScrollReveal>
            <div>
              <div className="classified-header">{event.subtitle}</div>
              <h1 className="font-display text-3xl md:text-5xl text-white uppercase tracking-[0.03em]">
                SUBJ:{event.id} &mdash; {event.title}
              </h1>
              <p className="font-mono text-sm text-white/70 leading-relaxed mt-3 max-w-3xl">
                {event.shortDescription}
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="line-accent" />

      {/* ── Main two-column: 60% Overlords  |  40% Brief ── */}
      <section className="py-8 md:py-12 section-padding">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8">

            {/* LEFT (60%) — Pick Your Overlord */}
            <div className="lg:col-span-3">
              <ScrollReveal>
                <div className="mb-5">
                  <div className="classified-header">Pick Your Overlord</div>
                  <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-[0.03em]">
                    The Five Faces
                  </h2>
                  <p className="font-mono text-xs text-white/60 mt-2">
                    Your pick locks your entry&rsquo;s category. Click to open the editor.
                  </p>
                </div>
              </ScrollReveal>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {listedOverlords.map((o) => (
                  <Link
                    key={o.slug}
                    href={o.artworkFile}
                    className="group relative bg-charcoal/30 border border-white/5 hover:border-white/30 overflow-hidden transition-all duration-300"
                  >
                    <div className="relative overflow-hidden bg-charcoal" style={{ aspectRatio: '16/9' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={o.previewImage ?? '/images/placeholder.png'}
                        alt={o.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/60 mb-0.5">
                          SUBJECT {o.number} &mdash; {o.title}
                        </div>
                        <div className="font-display text-base md:text-lg text-white uppercase tracking-[0.03em] leading-tight">
                          {o.name}
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 font-mono text-[9px] uppercase tracking-wider text-white/90 bg-black/60 border border-white/20 px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        Remix &rarr;
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* RIGHT (40%) — Compact Brief (sticky on desktop) */}
            <aside className="lg:col-span-2">
              <div className="subj-brief bg-white p-5 md:p-6 lg:sticky lg:top-24">
                <div className="font-mono text-[11px] text-black leading-snug space-y-4">

                  <div>
                    <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-black/50 mb-1">Brief</div>
                    <h3 className="font-display text-lg md:text-xl text-black uppercase tracking-[0.03em] leading-tight">
                      The Competition
                    </h3>
                  </div>

                  {/* HOW TO ENTER */}
                  <div className="border-t border-black/10 pt-3">
                    <div className="font-bold uppercase tracking-widest text-[10px] mb-2">How to Enter</div>
                    <ol className="space-y-1 ml-1">
                      <li className="flex gap-1.5"><span className="shrink-0 font-bold">1.</span><span>Pick an overlord (left).</span></li>
                      <li className="flex gap-1.5"><span className="shrink-0 font-bold">2.</span><span>Use depth + motion controls to build your collage.</span></li>
                      <li className="flex gap-1.5"><span className="shrink-0 font-bold">3.</span><span>Remix Coldie&rsquo;s assets, upload your own, or both.</span></li>
                      <li className="flex gap-1.5"><span className="shrink-0 font-bold">4.</span><span>Submit before the deadline.</span></li>
                    </ol>
                    <p className="mt-2 text-[10px] text-black/70">
                      Follow <a href="https://x.com/coldie" target="_blank" rel="noopener noreferrer" className="underline">@coldie</a>, repost the announcement. One submission per person. Free.
                    </p>
                  </div>

                  {/* KEY DATES */}
                  <div className="border-t border-black/10 pt-3">
                    <div className="font-bold uppercase tracking-widest text-[10px] mb-2">Key Dates</div>
                    <ul className="space-y-0.5 ml-1">
                      <li><span className="font-bold">Opens:</span> Sat May 23 &middot; 9 AM ET</li>
                      <li><span className="font-bold">Closes:</span> Wed May 28 &middot; 11:59 PT</li>
                      <li><span className="font-bold">Winners:</span> Thu Jun 4 &middot; 10 AM ET</li>
                      <li><span className="font-bold">Mints + raffles:</span> Mon Jun 15</li>
                    </ul>
                  </div>

                  {/* WINNERS */}
                  <div className="border-t border-black/10 pt-3">
                    <div className="font-bold uppercase tracking-widest text-[10px] mb-2">Winners (3)</div>
                    <ul className="space-y-1 ml-1">
                      <li className="flex gap-1.5"><span className="shrink-0">&rarr;</span><span><strong>Curator&rsquo;s Pick 1</strong> &mdash; Coldie picks &mdash; Edition of 10</span></li>
                      <li className="flex gap-1.5"><span className="shrink-0">&rarr;</span><span><strong>Curator&rsquo;s Pick 2</strong> &mdash; Coldie picks &mdash; Edition of 10</span></li>
                      <li className="flex gap-1.5"><span className="shrink-0">&rarr;</span><span><strong>Community Pick</strong> &mdash; most votes &mdash; Edition of 42</span></li>
                    </ul>
                    <p className="mt-2 text-[10px] text-black/70">
                      Winning artists keep 80% of primary + secondary royalties.
                    </p>
                  </div>

                  {/* EDITIONS — collapsible to keep the column short */}
                  <details className="border-t border-black/10 pt-3 group">
                    <summary className="font-bold uppercase tracking-widest text-[10px] cursor-pointer select-none flex items-center justify-between">
                      <span>Edition Breakdown</span>
                      <span className="text-black/40 group-open:rotate-90 transition-transform">&rsaquo;</span>
                    </summary>
                    <div className="mt-2 space-y-2">
                      <div>
                        <div className="font-bold text-[10px]">Curator&rsquo;s Picks (edition of 10):</div>
                        <ul className="ml-1 mt-1 space-y-0.5">
                          <li>&rarr; 1 to artist &middot; 1 to Coldie</li>
                          <li>&rarr; 1 raffled to Moments holders</li>
                          <li>&rarr; 1 raffled to Kinetic holders</li>
                          <li>&rarr; 6 to public</li>
                        </ul>
                      </div>
                      <div>
                        <div className="font-bold text-[10px]">Community Pick (edition of 42):</div>
                        <ul className="ml-1 mt-1 space-y-0.5">
                          <li>&rarr; Up to 10 to Kinetic holders</li>
                          <li>&rarr; 10 raffled to Moments holders</li>
                          <li>&rarr; Remainder to public</li>
                        </ul>
                      </div>
                    </div>
                  </details>

                  {/* COLLECTOR REWARDS — collapsible */}
                  <details className="border-t border-black/10 pt-3 group">
                    <summary className="font-bold uppercase tracking-widest text-[10px] cursor-pointer select-none flex items-center justify-between">
                      <span>Collector Rewards</span>
                      <span className="text-black/40 group-open:rotate-90 transition-transform">&rsaquo;</span>
                    </summary>
                    <div className="mt-2 space-y-2">
                      <p className="text-[10px]">Snapshot at close (May 28, 11:59 PT). Hold through to qualify.</p>
                      <div>
                        <div className="font-bold text-[10px]">Moments holders (50 per overlord):</div>
                        <ul className="ml-1 mt-1 space-y-0.5">
                          <li>&rarr; Each Moment = one raffle entry</li>
                          <li>&rarr; Every win triggers an overlord raffle</li>
                        </ul>
                      </div>
                      <div>
                        <div className="font-bold text-[10px]">Kinetic holders (10 per overlord):</div>
                        <ul className="ml-1 mt-1 space-y-0.5">
                          <li>&rarr; 1 free NFT per Community Pick of your overlord</li>
                          <li>&rarr; Dedicated Kinetic-only raffle per Curator&rsquo;s Pick</li>
                        </ul>
                      </div>
                      <p className="italic text-[10px]">One win per wallet. Draws run Curator&rsquo;s 1 &rarr; 2 &rarr; Community. Winning wallets removed from later draws. No sweeps.</p>
                    </div>
                  </details>

                  {/* THE VARIANT — collapsible */}
                  <details className="border-t border-black/10 pt-3 group">
                    <summary className="font-bold uppercase tracking-widest text-[10px] cursor-pointer select-none flex items-center justify-between">
                      <span>The Variant</span>
                      <span className="text-black/40 group-open:rotate-90 transition-transform">&rsaquo;</span>
                    </summary>
                    <p className="mt-2 text-[10px]">
                      After winners are announced, Coldie creates a 1/1 Variant in response: a fully kinetic 3D piece with a unique control layer found in no other work. One Variant per SUBJ event, held as a dedicated series for institutional and gallery presentation.
                    </p>
                  </details>

                  {/* PROMISE / Sign-off */}
                  <div className="border-t border-black/10 pt-3">
                    <p className="font-bold text-[10px] uppercase tracking-widest">The Promise</p>
                    <p className="mt-1 text-[10px]">
                      Artist-first, collector-rewarding. Winners keep 80%. Nearly half of every drop returns to the collector community.
                    </p>
                    <p className="mt-2 font-bold text-black text-xs">The Singularity has five faces. Pick yours.</p>
                  </div>
                </div>
              </div>
            </aside>

          </div>
        </div>
      </section>

      <div className="line-accent" />

      {/* ── Submissions Gallery + Voting ── */}
      <section className="py-8 md:py-12 section-padding">
        <div className="page-container">
          <ScrollReveal>
            <div className="mb-6">
              <div className="classified-header">Submitted for Consideration</div>
              <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-[0.03em]">
                Community Vote
              </h2>
              <p className="font-mono text-sm text-white mt-3">
                One vote per visitor, per day. The piece with the most votes when the event closes wins the Community Pick.
              </p>
            </div>
          </ScrollReveal>

          <UserExports
            overlordNames={overlordNames}
            overlordSlugs={overlordSlugs}
            category="general submission"
          />
        </div>
      </section>
    </div>
  )
}
