import Link from 'next/link'
import dynamic from 'next/dynamic'
import { notFound } from 'next/navigation'
import ScrollReveal from '@/components/ScrollReveal'
import SubjVoteCta from '@/components/SubjVoteCta'
import overlords from '@/data/overlords.json'
import { SUBJ_EVENTS } from '@/data/subj-events'

const UserExports = dynamic(() => import('@/components/UserExports'), {
  ssr: false,
  loading: () => (
    <div className="text-center py-12">
      <p className="font-mono text-xs text-white/40 uppercase tracking-wider">Loading community exports…</p>
    </div>
  ),
})
const SubjEntriesGallery = dynamic(() => import('@/components/SubjEntriesGallery'), {
  ssr: false,
  loading: () => null,
})

// ⚠️ SHOW_SUBMISSIONS_GALLERY = false while the submission window is open.
// When false:
//   - The <UserExports> block (curated rows + "All Submissions" grid) is
//     not rendered on /subj/<id>. Visitors see the brief + subject grid +
//     the live entries wall.
// Flip to true to expose the full submissions gallery (with voting rows)
// once the submission window closes. The <UserExports> JSX is intentionally
// kept in place below so re-enabling is a one-line edit.
const SHOW_SUBMISSIONS_GALLERY = false

// Event registry lives in src/data/subj-events.ts. Add new IDs (03, …) there
// as future competitions launch; everything else 404s automatically.

export function generateStaticParams() {
  return Object.keys(SUBJ_EVENTS).map((id) => ({ id }))
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const event = SUBJ_EVENTS[params.id]
  if (!event) return { title: 'SUBJ: Not Found' }
  return {
    title: `SUBJ:${event.id} ${event.title} | Tech Epochalypse`,
    description: event.shortDescription,
  }
}

// ── Brief copy per event ──
// Classified-doc style orientation paragraph that primes visitors on what
// they're being asked to make. Kept as JSX (not in the data file) so it can
// carry emphasis + entities. Add a block per event id.
const BRIEF_COPY: Record<string, JSX.Element> = {
  '01': (
    <>
      We&rsquo;re collecting the first data packets for the dossier. The
      overlords are making moves. Each headline is another claim staked in
      the Tech Epochalypse. Take control of one. Remix it in your language.
      Use Coldie&rsquo;s assets, upload your own, build the evidence. The
      case file is only as strong as what you put in it. Do your best work.{' '}
      <strong className="font-bold text-white">Just showing up is not enough.</strong>
    </>
  ),
  '02': (
    <>
      The threshold has been crossed. No launch event, no keynote. Just a
      line in a log file and a world that reads differently the morning
      after. AGI has arrived, and Jensen Huang built the machine it
      woke up inside. He sold the picks and shovels to the gold rush, then
      found out the gold could think. Every GPU is a witness. Every data
      center is a crime scene or a cathedral, depending on who files the
      report. Take control of the subject. Remix him in your language. Use
      Coldie&rsquo;s assets, upload your own, and build the evidence of what
      the first day of AGI looks like. Do your best work.{' '}
      <strong className="font-bold text-white">Just showing up is not enough.</strong>
    </>
  ),
}

export default function SubjPage({ params }: { params: { id: string } }) {
  const event = SUBJ_EVENTS[params.id]
  if (!event) notFound()

  const isClosed = event.status === 'closed'
  const eventOverlords = event.overlordSlugs
    .map((slug) => overlords.find((o) => o.slug === slug))
    .filter((o): o is (typeof overlords)[number] => !!o)
  const single = eventOverlords.length === 1
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
              <div className="flex flex-wrap items-center gap-4">
                <h1 className="font-display text-3xl md:text-5xl text-white uppercase tracking-[0.03em]">
                  SUBJ:{event.id} &middot; {event.title}
                </h1>
                {isClosed && (
                  <span className="font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] border border-red-500/70 text-red-400 px-3 py-1 rotate-[-2deg]">
                    Case Closed
                  </span>
                )}
              </div>
              <p className="font-mono text-sm text-white/70 leading-relaxed mt-3 max-w-3xl">
                {event.shortDescription}
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Brief / Prompt ── */}
      <section className="pb-6 md:pb-8 section-padding">
        <div className="page-container">
          <ScrollReveal delay={50}>
            <div className="border border-white/15 bg-white/[0.02] p-5 md:p-7 max-w-4xl">
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/50 mb-3">
                Brief
              </div>
              <p className="font-mono text-sm md:text-base text-white leading-relaxed">
                {BRIEF_COPY[event.id]}
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="line-accent" />

      {/* ── Main two-column: 60% Subject(s)  |  40% Brief ── */}
      <section className="py-8 md:py-12 section-padding">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8">

            {/* LEFT (60%) - Pick Your Overlord / The Subject */}
            <div className="lg:col-span-3">
              <ScrollReveal>
                <div className="mb-5">
                  <div className="classified-header">{single ? 'The Subject' : 'Pick Your Overlord'}</div>
                  <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-[0.03em]">
                    {single ? eventOverlords[0].name : 'The Five Faces'}
                  </h2>
                  <p className="font-mono text-xs text-white/60 mt-2">
                    {isClosed
                      ? 'The editor is closed for this event. Entries are archived in the Dossier.'
                      : single
                        ? 'One subject, one category. Click to open the editor.'
                        : 'Your pick locks your entry’s category. Click to open the editor.'}
                  </p>
                </div>
              </ScrollReveal>

              <div className={`grid gap-3 md:gap-4 ${single ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                {eventOverlords.map((o) => {
                  const card = (
                    <div className="relative overflow-hidden bg-charcoal" style={{ aspectRatio: '16/9' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={o.previewImage ?? '/images/placeholder.png'}
                        alt={o.name}
                        className={`w-full h-full object-cover transition-transform duration-700 ${isClosed ? 'grayscale opacity-60' : 'group-hover:scale-105'}`}
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/60 mb-0.5">
                          SUBJECT {o.number} &middot; {o.title}
                        </div>
                        <div className={`font-display text-white uppercase tracking-[0.03em] leading-tight ${single ? 'text-2xl md:text-4xl' : 'text-base md:text-lg'}`}>
                          {o.name}
                        </div>
                      </div>
                      {isClosed ? (
                        <div className="absolute top-2 right-2 font-mono text-[9px] uppercase tracking-wider text-red-400 bg-black/60 border border-red-500/50 px-1.5 py-0.5">
                          Closed
                        </div>
                      ) : (
                        <div className={`absolute top-2 right-2 font-mono uppercase tracking-wider text-white/90 bg-black/60 border border-white/20 px-1.5 py-0.5 transition-opacity ${single ? 'text-[11px] md:text-xs px-3 py-1.5 opacity-100' : 'text-[9px] opacity-0 group-hover:opacity-100'}`}>
                          {single ? 'Open the Editor →' : 'Remix →'}
                        </div>
                      )}
                    </div>
                  )
                  const cls = 'group relative bg-charcoal/30 border border-white/5 overflow-hidden transition-all duration-300'
                  return isClosed ? (
                    <div key={o.slug} className={cls}>{card}</div>
                  ) : (
                    <Link key={o.slug} href={o.artworkFile} className={`${cls} hover:border-white/30`}>
                      {card}
                    </Link>
                  )
                })}
              </div>

              {/* Archive CTA (closed events) / Vote CTA (live events) - sits
                  directly under the subject card, beside the brief column. */}
              <div className="mt-6 md:mt-8">
                <ScrollReveal>
                  {isClosed && event.archiveHref ? (
                    <Link
                      href={event.archiveHref}
                      className="group block border border-white/20 hover:border-white bg-white/[0.02] hover:bg-white/[0.06] transition-colors duration-300 p-5 md:p-7"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <div className="classified-header">Filed in the Dossier</div>
                          <h2 className="font-display text-2xl md:text-3xl text-white uppercase tracking-[0.03em] mt-1">
                            Winners &amp; Full Submission Record
                          </h2>
                          <p className="font-mono text-xs md:text-sm text-white/70 mt-2 max-w-2xl leading-relaxed">
                            SUBJ:{event.id} is closed and archived. The three winning
                            selections, their mint pages, and every entry submitted
                            into evidence are preserved in the permanent case file.
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-3 font-mono text-xs md:text-sm uppercase tracking-[0.2em] bg-white text-black px-5 md:px-7 py-3 md:py-4 shrink-0">
                          <span>Open the Archive</span>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform duration-300 group-hover:translate-x-1">
                            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                      </div>
                    </Link>
                  ) : (
                    <SubjVoteCta
                      voteOpen={event.voteOpen}
                      voteClose={event.voteClose}
                      votingLabel={event.dates.voting}
                      eventLabel={`SUBJ:${event.id}`}
                    />
                  )}
                </ScrollReveal>
              </div>
            </div>

            {/* RIGHT (40%) - Compact Brief (sticky on desktop) */}
            <aside className="lg:col-span-2">
              <div className="subj-brief bg-white p-5 md:p-6 lg:sticky lg:top-24">
                <div className="font-mono text-[11px] text-black leading-snug space-y-4">

                  <div>
                    <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-black/50 mb-1">Brief</div>
                    <h3 className="font-display text-lg md:text-xl text-black uppercase tracking-[0.03em] leading-tight">
                      {event.title}
                    </h3>
                    {isClosed && (
                      <div className="mt-1 font-bold uppercase tracking-widest text-[10px] text-[#8c2b22]">Closed · Final</div>
                    )}
                  </div>

                  {/* HOW TO ENTER */}
                  <div className="border-t border-black/10 pt-3">
                    <div className="font-bold uppercase tracking-widest text-[10px] mb-2">How to Enter</div>
                    <ol className="space-y-1 ml-1">
                      <li className="flex gap-1.5"><span className="shrink-0 font-bold">1.</span><span>{single ? 'Open the editor (left).' : 'Pick an overlord (left).'}</span></li>
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
                      <li><span className="font-bold">Opens:</span> {event.dates.opens}</li>
                      <li><span className="font-bold">Closes:</span> {event.dates.closes}</li>
                      <li><span className="font-bold">Voting:</span> {event.dates.voting}</li>
                      <li><span className="font-bold">Winners:</span> {event.dates.winners}</li>
                      <li><span className="font-bold">Mints + raffles:</span> {event.dates.mints}</li>
                    </ul>
                  </div>

                  {/* WINNERS */}
                  <div className="border-t border-black/10 pt-3">
                    <div className="font-bold uppercase tracking-widest text-[10px] mb-2">Winners (3)</div>
                    <ul className="space-y-1 ml-1">
                      <li className="flex gap-1.5"><span className="shrink-0">&rarr;</span><span><strong>Curator&rsquo;s Pick 1:</strong> Coldie picks, edition of 10</span></li>
                      <li className="flex gap-1.5"><span className="shrink-0">&rarr;</span><span><strong>Curator&rsquo;s Pick 2:</strong> Coldie picks, edition of 10</span></li>
                      <li className="flex gap-1.5">
                        <span className="shrink-0">&rarr;</span>
                        <span>
                          <strong>Community Pick:</strong> most votes, edition of 42
                          <span className="block italic text-black/60 mt-0.5">Voting happens once submissions close.</span>
                        </span>
                      </li>
                    </ul>
                    <p className="mt-2 text-[10px] text-black/70">
                      Winning artists keep 80% of primary + secondary royalties.
                    </p>
                  </div>

                  {/* EDITIONS - collapsible to keep the column short */}
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

                  {/* COLLECTOR REWARDS - collapsible */}
                  <details className="border-t border-black/10 pt-3 group">
                    <summary className="font-bold uppercase tracking-widest text-[10px] cursor-pointer select-none flex items-center justify-between">
                      <span>Collector Rewards</span>
                      <span className="text-black/40 group-open:rotate-90 transition-transform">&rsaquo;</span>
                    </summary>
                    <div className="mt-2 space-y-2">
                      <p className="text-[10px]">Snapshot at close ({event.dates.snapshot}). Hold through to qualify.</p>
                      <div>
                        <div className="font-bold text-[10px]">{event.rewards.momentsLabel}:</div>
                        <ul className="ml-1 mt-1 space-y-0.5">
                          <li>&rarr; Each Moment = one raffle entry</li>
                          <li>&rarr; Every win triggers an overlord raffle</li>
                        </ul>
                      </div>
                      <div>
                        <div className="font-bold text-[10px]">{event.rewards.kineticLabel}:</div>
                        <ul className="ml-1 mt-1 space-y-0.5">
                          <li>&rarr; 1 free NFT per Community Pick{single ? '' : ' of your overlord'}</li>
                          <li>&rarr; Dedicated Kinetic-only raffle per Curator&rsquo;s Pick</li>
                        </ul>
                      </div>
                      <p className="italic text-[10px]">One win per wallet. Draws run Curator&rsquo;s 1 &rarr; 2 &rarr; Community. Winning wallets removed from later draws. No sweeps.</p>
                    </div>
                  </details>

                  {/* PROMISE / Sign-off */}
                  <div className="border-t border-black/10 pt-3">
                    <p className="font-bold text-[10px] uppercase tracking-widest">The Promise</p>
                    <p className="mt-1 text-[10px]">
                      Artist-first, collector-rewarding. Winners keep 80% of primary sales. Nearly half of every drop returns to the collector community.
                    </p>
                    <p className="mt-2 font-bold text-black text-xs">{event.signoff}</p>
                  </div>
                </div>
              </div>
            </aside>

          </div>
        </div>
      </section>

      {/* ── Live entries wall (read-only) ──
          Simple thumbnail grid of every approved Airtable record tagged with
          this event's category. Shown during the submission window so
          visitors can see what's been entered. Hides itself if zero entries.
          Closed events don't show it - their record lives in the Dossier. */}
      {!isClosed && <SubjEntriesGallery category={event.category} eventLabel={event.id} />}

      {/* ── Submissions Gallery + Voting ──
          NOTE: while SHOW_SUBMISSIONS_GALLERY is false (during the
          submission window), the ENTIRE section below - line accent,
          section header, AND the <UserExports> gallery - is hidden.
          To restore when submissions close:
            1. Flip SHOW_SUBMISSIONS_GALLERY → true (top of file).
            2. Optionally flip VOTING_ENABLED → true in EnhancedGallery.tsx
               to also reveal voting rows / heart buttons.
          All code paths are intentionally retained. */}
      {SHOW_SUBMISSIONS_GALLERY && !isClosed && (
        <>
          <div className="line-accent" />

          <section className="py-8 md:py-12 section-padding">
            <div className="page-container">
              <ScrollReveal>
                <div className="mb-6">
                  <div className="classified-header">Submitted for Consideration</div>
                  <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-[0.03em]">
                    Submissions Gallery
                  </h2>
                  <p className="font-mono text-sm text-white mt-3">
                    The submissions gallery reveals once the submission window
                    closes. Voting opens at the same time. Check back to pick
                    the Community Pick winner.
                  </p>
                </div>
              </ScrollReveal>

              <UserExports
                overlordNames={overlordNames}
                overlordSlugs={overlordSlugs}
                category={event.category}
                multiRow
              />
            </div>
          </section>
        </>
      )}

      {/* ── Archive index - every SUBJ, past and present ── */}
      <div className="line-accent" />
      <section className="py-8 md:py-12 section-padding">
        <div className="page-container">
          <ScrollReveal>
            <div className="classified-header">Case Files</div>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-[0.03em] mb-4">
              All SUBJ Events
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.values(SUBJ_EVENTS).map((e) => (
                <li key={e.id}>
                  <Link
                    href={e.status === 'closed' && e.archiveHref ? e.archiveHref : `/subj/${e.id}`}
                    className={`block border p-4 transition-colors ${e.id === event.id ? 'border-white/40 bg-white/[0.04]' : 'border-white/10 hover:border-white/40'}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">SUBJ:{e.id}</span>
                      <span className={`font-mono text-[9px] uppercase tracking-[0.2em] px-1.5 py-0.5 border ${e.status === 'live' ? 'border-green-400/60 text-green-300' : e.status === 'closed' ? 'border-red-500/50 text-red-400' : 'border-white/20 text-white/50'}`}>
                        {e.status === 'live' ? 'Open' : e.status === 'closed' ? 'Closed' : 'Upcoming'}
                      </span>
                    </div>
                    <div className="font-display text-lg text-white uppercase tracking-[0.03em] mt-1">{e.title}</div>
                    <div className="font-mono text-[10px] text-white/50 mt-1">
                      {e.status === 'closed' ? 'Winners + full record in the Dossier →' : 'View the brief →'}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}
