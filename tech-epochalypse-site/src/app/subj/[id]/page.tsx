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
      'The first remix competition in the Subject Series, under Tech Epochalypse. Five tech overlords, each a face of the Singularity. Pick one, remix it in Coldie’s editor, and submit your own parallax collage.',
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
      {/* ── Header ── */}
      <section className="pt-28 pb-12 section-padding">
        <div className="page-container">
          <ScrollReveal>
            <div className="mb-8">
              <div className="classified-header">
                {event.subtitle}
              </div>
              <h1 className="font-display text-3xl md:text-5xl text-white uppercase tracking-[0.03em]">
                SUBJ:{event.id} &mdash; {event.title}
              </h1>
              <p className="font-mono text-sm text-white/70 leading-relaxed mt-4 max-w-3xl">
                {event.shortDescription}
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="line-accent" />

      {/* ── The Five Overlords (cards) ── */}
      <section className="py-12 md:py-16 section-padding">
        <div className="page-container">
          <ScrollReveal>
            <div className="mb-8">
              <div className="classified-header">Pick Your Overlord</div>
              <h2 className="font-display text-2xl md:text-3xl text-white uppercase tracking-[0.03em]">
                The Five Faces of the Singularity
              </h2>
              <p className="font-mono text-sm text-white/70 leading-relaxed mt-4">
                Pick one. Your choice locks your entry&rsquo;s category for the event.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {listedOverlords.map((o) => (
              <Link
                key={o.slug}
                href={o.artworkFile}
                className="group relative bg-charcoal/30 border border-white/5 hover:border-white/20 overflow-hidden transition-all duration-300"
              >
                <div className="aspect-video relative overflow-hidden bg-charcoal" style={{ aspectRatio: '16/9' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={o.previewImage ?? '/images/placeholder.png'}
                    alt={o.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60 mb-1">
                      SUBJECT {o.number} &mdash; {o.title}
                    </div>
                    <div className="font-display text-xl md:text-2xl text-white uppercase tracking-[0.03em]">
                      {o.name}
                    </div>
                    <div className="font-mono text-[11px] text-white/70 mt-1">
                      {o.tagline}
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 font-mono text-[10px] uppercase tracking-wider text-white/80 bg-black/60 border border-white/20 px-2 py-1">
                    Remix &rarr;
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="line-accent" />

      {/* ── Competition Details (full overview) ── */}
      <section className="py-12 md:py-16 section-padding">
        <div className="page-container">
          <ScrollReveal>
            <div className="mb-8">
              <div className="classified-header">Brief</div>
              <h2 className="font-display text-2xl md:text-3xl text-white uppercase tracking-[0.03em]">
                The Competition
              </h2>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="bg-white p-8 md:p-12">
              <div className="font-mono text-sm text-black leading-relaxed space-y-8">

                {/* WHAT IT IS */}
                <div>
                  <h3 className="font-display text-xl md:text-2xl text-black uppercase tracking-[0.03em] mb-3">
                    What It Is
                  </h3>
                  <p>
                    The first remix competition in the Subject Series, under Tech Epochalypse. Five tech overlords, each a face of the Singularity. Pick one, remix it in Coldie&rsquo;s editor, and submit your own parallax collage. Two ways to play: use Coldie&rsquo;s overlord assets, or upload your own art and remix it in. Both compete equally.
                  </p>
                </div>

                {/* THE FIVE OVERLORDS */}
                <div className="border-t border-black/10 pt-8">
                  <h3 className="font-display text-xl md:text-2xl text-black uppercase tracking-[0.03em] mb-4">
                    The Five Overlords
                  </h3>
                  <ul className="space-y-2 ml-1 mb-4">
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span><strong>Musk</strong> &mdash; the physical substrate</span></li>
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span><strong>Altman</strong> &mdash; the intelligence layer</span></li>
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span><strong>Zuckerberg</strong> &mdash; the identity layer</span></li>
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span><strong>Bezos</strong> &mdash; the logistics</span></li>
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span><strong>Huang</strong> &mdash; the silicon</span></li>
                  </ul>
                  <p className="italic">Pick one. Your choice locks your entry&rsquo;s category for the event.</p>
                </div>

                {/* HOW TO ENTER */}
                <div className="border-t border-black/10 pt-8">
                  <h3 className="font-display text-xl md:text-2xl text-black uppercase tracking-[0.03em] mb-4">
                    How to Enter
                  </h3>
                  <ol className="space-y-2 ml-1 mb-4">
                    <li className="flex gap-2"><span className="shrink-0 font-bold">1.</span><span>Go to <Link href={`/subj/${event.id}`} className="underline">knowyouroverlord.art/subj/{event.id}</Link></span></li>
                    <li className="flex gap-2"><span className="shrink-0 font-bold">2.</span><span>Pick your overlord</span></li>
                    <li className="flex gap-2"><span className="shrink-0 font-bold">3.</span><span>Use the editor&rsquo;s depth and motion controls to build your parallax collage (remix Coldie&rsquo;s assets, upload your own, or both)</span></li>
                    <li className="flex gap-2"><span className="shrink-0 font-bold">4.</span><span>Submit before the deadline</span></li>
                  </ol>
                  <p>
                    <strong>Requirements:</strong> Follow <a href="https://x.com/coldie" target="_blank" rel="noopener noreferrer" className="underline">@coldie</a> on X. Repost the announcement. One submission per person. Free to enter. Wallet or email both accepted.
                  </p>
                </div>

                {/* KEY DATES */}
                <div className="border-t border-black/10 pt-8">
                  <h3 className="font-display text-xl md:text-2xl text-black uppercase tracking-[0.03em] mb-4">
                    Key Dates
                  </h3>
                  <ul className="space-y-2 ml-1">
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span><strong>Opens:</strong> Saturday, May 23 &mdash; 9:00 AM ET</span></li>
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span><strong>Closes:</strong> Wednesday, May 28 &mdash; 11:59 PT</span></li>
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span><strong>Winners announced:</strong> Thursday, June 4 &mdash; 10:00 AM ET</span></li>
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span><strong>Mints + raffles:</strong> Monday, June 15</span></li>
                  </ul>
                </div>

                {/* WINNERS */}
                <div className="border-t border-black/10 pt-8">
                  <h3 className="font-display text-xl md:text-2xl text-black uppercase tracking-[0.03em] mb-4">
                    Winners
                  </h3>
                  <p className="mb-4">Three winners, chosen across all five overlords.</p>
                  <ul className="space-y-2 ml-1 mb-4">
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span><strong>Curator&rsquo;s Pick 1</strong> (chosen by Coldie) &mdash; Edition of 10</span></li>
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span><strong>Curator&rsquo;s Pick 2</strong> (chosen by Coldie) &mdash; Edition of 10</span></li>
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span><strong>Community Pick</strong> (most public votes) &mdash; Edition of 42</span></li>
                  </ul>
                  <p className="mb-3">All winning artists receive 80% of public primary sales and 80% of secondary royalties on their edition.</p>
                  <p className="italic">What wins: Use of depth. Surprising use of the upload feature. Risk over polish. Make work only this medium could produce.</p>
                </div>

                {/* EDITION BREAKDOWN */}
                <div className="border-t border-black/10 pt-8">
                  <h3 className="font-display text-xl md:text-2xl text-black uppercase tracking-[0.03em] mb-4">
                    Edition Breakdown
                  </h3>
                  <p className="font-bold mb-2 text-xs uppercase tracking-widest">Curator&rsquo;s Pick 1 &amp; 2 (edition of 10 each):</p>
                  <ul className="space-y-2 ml-1 mb-6">
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span>1 to the artist</span></li>
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span>1 to Coldie</span></li>
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span>1 raffled to Moments holders of that overlord</span></li>
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span>1 raffled to Kinetic holders of that overlord</span></li>
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span>6 available to the public</span></li>
                  </ul>
                  <p className="font-bold mb-2 text-xs uppercase tracking-widest">Community Pick (edition of 42):</p>
                  <ul className="space-y-2 ml-1">
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span>Up to 10 to Kinetic holders of that overlord</span></li>
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span>10 raffled to Moments holders of that overlord</span></li>
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span>The remainder available to the public</span></li>
                  </ul>
                </div>

                {/* COLLECTOR REWARDS */}
                <div className="border-t border-black/10 pt-8">
                  <h3 className="font-display text-xl md:text-2xl text-black uppercase tracking-[0.03em] mb-4">
                    Collector Rewards
                  </h3>
                  <p className="mb-4">A snapshot of holder wallets is taken when the competition closes (May 28, 11:59 PT). Hold through then to qualify.</p>

                  <p className="font-bold mb-2 text-xs uppercase tracking-widest">Moments holders (50 per overlord)</p>
                  <ul className="space-y-2 ml-1 mb-6">
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span>Each Moment held = one raffle entry</span></li>
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span>Every winning piece triggers a raffle of that overlord&rsquo;s Moments holders</span></li>
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span>Raffle pools align to the winning overlord</span></li>
                  </ul>

                  <p className="font-bold mb-2 text-xs uppercase tracking-widest">Kinetic holders (10 per overlord)</p>
                  <ul className="space-y-2 ml-1 mb-6">
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span>1 free NFT for each Community Pick win matching your overlord</span></li>
                    <li className="flex gap-2"><span className="shrink-0">&rarr;</span><span>Entry into a dedicated Kinetic-only raffle for each Curator&rsquo;s Pick of your overlord</span></li>
                  </ul>

                  <p className="italic">One win per wallet across the entire event. Raffles draw in order &mdash; Curator&rsquo;s Pick 1, Curator&rsquo;s Pick 2, then Community Pick &mdash; and winning wallets are removed from later drawings. More collectors win. No sweeps.</p>
                </div>

                {/* THE VARIANT */}
                <div className="border-t border-black/10 pt-8">
                  <h3 className="font-display text-xl md:text-2xl text-black uppercase tracking-[0.03em] mb-4">
                    The Variant
                  </h3>
                  <p>
                    After winners are announced, Coldie creates a 1/1 Variant in response to the competition: a fully kinetic work with a complete 3D scene, built with a unique control layer found in no other piece. Each SUBJ event produces exactly one Variant. These are held as a dedicated series, reserved for future institutional and gallery presentation.
                  </p>
                </div>

                {/* THE PROMISE */}
                <div className="border-t border-black/10 pt-8">
                  <h3 className="font-display text-xl md:text-2xl text-black uppercase tracking-[0.03em] mb-4">
                    The Promise
                  </h3>
                  <p className="mb-4">
                    Artist-first, collector-rewarding. Winners keep 80%. Nearly half of every drop goes back to the collector community. SUBJ:{event.id} is built to elevate artists who make great work and reward the collectors who&rsquo;ve been here from the start.
                  </p>
                  <p className="font-bold text-base">The Singularity has five faces. Pick yours.</p>
                </div>

              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="line-accent" />

      {/* ── Submissions Gallery + Voting ── */}
      <section className="py-12 md:py-16 section-padding">
        <div className="page-container">
          <ScrollReveal>
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="classified-header">
                  Transmissions Collected Data Packets
                </div>
                <h2 className="font-display text-2xl md:text-3xl text-white uppercase tracking-[0.03em]">
                  SUBJ:{event.id} &mdash; {event.title} &mdash; Submitted for Consideration
                </h2>
                <p className="font-mono text-sm text-white/60 mt-3">
                  Vote on entries below. One vote per piece per 24h. Community Pick winner has the most votes when the event closes.
                </p>
              </div>
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
