'use client'

import Link from 'next/link'
import ScrollReveal from '@/components/ScrollReveal'
import UserExports from '@/components/UserExports'
import overlords from '@/data/overlords.json'
import collectors from '@/data/collectors.json'

const overlordMap = Object.fromEntries(overlords.map((o) => [o.slug, o]))

export default function MainframePage() {
  const overlordNames = Object.fromEntries(
    overlords.map((o) => [o.slug, o.name])
  )
  const overlordSlugs = overlords.map((o) => o.slug)

  return (
    <div className="min-h-screen bg-void">
      {/* ── Header ── */}
      <section className="pt-28 pb-16 section-padding">
        <div className="page-container">
          <ScrollReveal>
            <div className="text-center">
              <div className="classified-header">
                Central Hub &mdash;{' '}
                <span className="redacted">All Systems</span>
              </div>
              <h1 className="font-display text-4xl md:text-6xl text-white uppercase tracking-[0.05em] mt-4">
                The Mainframe
              </h1>
              <p className="font-mono text-sm text-white mt-4 max-w-2xl mx-auto leading-relaxed">
                The nerve center of Tech Epochalypse. Community iterations,
                active exploits, and founding signals &mdash; all in
                one feed.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="line-accent" />

      {/* ── Section 1: Exploits ── */}
      <section className="py-12 md:py-16 section-padding">
        <div className="page-container">
          <ScrollReveal>
            <div className="mb-8">
              <div className="classified-header">
                Active Operations &mdash;{' '}
                <span className="redacted">Directives</span>
              </div>
              <h2 className="font-display text-2xl md:text-3xl text-white uppercase tracking-[0.03em]">
                Exploits
              </h2>
              <p className="font-mono text-sm text-white/70 leading-relaxed mt-4">
                Pay attention to exploits that are listed. Can happen at any time. They are of utmost importance and offer those willing to accept the challenge an opportunity to build the dossier against the overlords.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="bg-white p-8 md:p-12">
              {/* Exploit header block */}
              <div className="font-mono text-xs text-black uppercase tracking-[0.2em] mb-8">
                <h3 className="font-display text-2xl md:text-3xl text-black uppercase tracking-[0.03em] mb-6">
                  EXPLOIT #001 &mdash; &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                </h3>
                <div className="space-y-1 mb-8 border-b border-black/10 pb-6">
                  <p>STATUS: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ACTIVE</p>
                  <p>DEADLINE: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;MARCH 06, 2026</p>
                  <p>CLASSIFICATION: &nbsp;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608; BOUNTY</p>
                  <p>THREAT LEVEL: &nbsp;&nbsp;&nbsp;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608; &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;</p>
                  <p>TARGET: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ALL OVERLORD &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;</p>
                  <p>OPERATIVE CLEARANCE: &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;</p>
                </div>
              </div>

              {/* Exploit body */}
              <div className="font-mono text-sm text-black leading-relaxed space-y-6">
                <p className="text-black/40 text-xs uppercase tracking-widest">
                  // INTERCEPTED &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608; &mdash; ORIGIN &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                </p>

                <p>
                  The &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608; has been &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;. The Overlords&rsquo; &#9608;&#9608;&#9608;&#9608;&#9608;&#9608; files are exposed. For the &#9608;&#9608;&#9608;&#9608; time, their &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608; are vulnerable to outside &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;.
                </p>

                <p>
                  We are issuing an open &#9608;&#9608;&#9608;&#9608;&#9608;&#9608; to all operatives &mdash; artists, &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;, creators, &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;. Your mission: &#9608;&#9608;&#9608;&#9608;&#9608;&#9608; any Overlord node and &#9608;&#9608;&#9608;&#9608;&#9608;&#9608; your own &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608; into the system.
                </p>

                {/* Decrypted section */}
                <div className="border-t border-b border-black/10 py-6 my-6">
                  <p className="text-black/40 text-xs uppercase tracking-widest mb-4">
                    [CONTROL LAYER PARTIALLY DECRYPTED &mdash; READABLE TEXT FOLLOWS]
                  </p>

                  <p>
                    This is not a copy job. We don&rsquo;t need &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;. We need your code inside their code. Your visual language fused with their architecture. Take an Overlord&rsquo;s portrait and make it unrecognizable as theirs alone. &#9608;&#9608;&#9608;&#9608;&#9608;&#9608; it with your style. Merge your aesthetic &#9608;&#9608;&#9608; into the system until the two are inseparable.
                  </p>

                  <p className="mt-4">
                    Glitch artists. Painters. 3D sculptors. Illustrators. &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;. Collagists. Pixel pushers. Whatever your method &mdash; that method is your &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;.
                  </p>
                </div>

                {/* The brief */}
                <p>
                  <span className="font-bold">THE &#9608;&#9608;&#9608;&#9608;:</span> Choose any Overlord &mdash; Musk, Zuckerberg, Altman, Bezos, Huang. Access their node on the &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;. Interact with the piece. Then take what you &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608; and remix it through your own creative practice. The final &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608; should be a collision between the Overlord&rsquo;s system and &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;.
                </p>

                {/* Examples */}
                <div className="mt-6">
                  <p className="font-bold mb-3 text-xs uppercase tracking-widest">
                    EXAMPLES OF &#9608;&#9608;&#9608;&#9608;&#9608; BREACHES:
                  </p>
                  <ul className="space-y-2 ml-1">
                    <li className="flex gap-2">
                      <span className="shrink-0">*</span>
                      <span>Take a still export and &#9608;&#9608;&#9608;&#9608; over it &mdash; digital, physical, or both</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="shrink-0">*</span>
                      <span>&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;, distort, or corrupt the output through your own tools and &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="shrink-0">*</span>
                      <span>Collage elements of the Overlord into &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608; compositions</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="shrink-0">*</span>
                      <span>Use the export as a &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608; layer and build an entirely new piece on top</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="shrink-0">*</span>
                      <span>&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;, reanimate, or restructure the motion output into something &#9608;&#9608;&#9608;</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="shrink-0">*</span>
                      <span>Print it, &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608; it, photograph the remains, submit the &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;</span>
                    </li>
                  </ul>
                </div>

                <p className="italic">There are no wrong methods. Only &#9608;&#9608;&#9608;&#9608; signals.</p>

                {/* Payload specs */}
                <div className="border-t border-black/10 pt-6 mt-6">
                  <p className="font-bold mb-3 text-xs uppercase tracking-widest">
                    PAYLOAD &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;:
                  </p>
                  <ul className="space-y-2 ml-1">
                    <li className="flex gap-2">
                      <span className="shrink-0">*</span>
                      <span>Final artifact: JPEG or GIF (2MB Max)</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="shrink-0">*</span>
                      <span>Must contain &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608; source material from at least one Overlord &#9608;&#9608;&#9608;&#9608;</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="shrink-0">*</span>
                      <span>Must contain your own &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608; creative intervention &mdash; this is a &#9608;&#9608;&#9608;&#9608;&#9608;, not a repost</span>
                    </li>
                  </ul>
                </div>

                {/* Broadcast protocol */}
                <div className="border-t border-black/10 pt-6 mt-6">
                  <p>
                    &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608; PROTOCOL: Your payload is only as &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608; as its reach. After submission, broadcast your artifact on X with <span className="font-bold">#KnowYourOverlord</span>. Log your transmissions on The &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;. The Overlord &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608; both craft and &#9608;&#9608;&#9608;&#9608;&#9608;&#9608; when selecting the &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;.
                  </p>
                </div>

                {/* Reward */}
                <div className="border-t border-black/10 pt-6 mt-6">
                  <p className="font-bold mb-3 text-xs uppercase tracking-widest">
                    &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;:
                  </p>
                  <p>
                    &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;: One operative will be &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;. Not by &#9608;&#9608;&#9608;&#9608;. Not by &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;. &#9608;&#9608;&#9608;&#9608;&#9608;&#9608; reviews every &#9608;&#9608;&#9608;&#9608;&#9608;&#9608; personally.
                  </p>
                </div>

                {/* How to submit */}
                <div className="border-t border-black/10 pt-6 mt-6">
                  <p className="font-bold mb-3 text-xs uppercase tracking-widest">
                    HOW TO &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;:
                  </p>
                  <ol className="space-y-2 ml-1 list-none">
                    <li className="flex gap-2">
                      <span className="shrink-0 font-bold">1.</span>
                      <span>Access an Overlord node &rarr; &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;.art</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="shrink-0 font-bold">2.</span>
                      <span>Interact with the &#9608;&#9608;&#9608;&#9608;&#9608; &rarr; extract your source &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="shrink-0 font-bold">3.</span>
                      <span>&#9608;&#9608;&#9608;&#9608;&#9608; through your own practice &rarr; create the &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="shrink-0 font-bold">4.</span>
                      <span>Submit your &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608; &rarr; The Mainframe &gt; &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608; &gt; SUBMIT PACKET</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="shrink-0 font-bold">5.</span>
                      <span>&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608; &rarr; post on X with #KnowYourOverlord &rarr; log your &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;</span>
                    </li>
                  </ol>
                </div>

                {/* Bounty details */}
                <div className="border-t border-black/10 pt-6 mt-6">
                  <p className="font-bold mb-3 text-xs uppercase tracking-widest">
                    &#9608;&#9608;&#9608;&#9608;&#9608;&#9608; &mdash; WHAT THE &#9608;&#9608;&#9608;&#9608;&#9608;&#9608; RECEIVES
                  </p>
                  <p className="text-black/40 text-xs uppercase tracking-widest mb-4">
                    BOUNTY DETAILS: &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608; DECRYPTING... &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                  </p>
                  <p className="text-black/40 text-xs uppercase tracking-widest mb-4">[DECRYPTED]</p>
                  <p className="mb-6">
                    The chosen &#9608;&#9608;&#9608;&#9608;&#9608;&#9608; becomes the first entry in <span className="font-bold">The Usual Suspects</span> &mdash; a permanent gallery of the most &#9608;&#9608;&#9608;&#9608;&#9608;&#9608; breaches in the network. You are not just winning a contest. You are &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608; a record. A dossier. Every future Exploit winner joins after you, but you are Suspect #001. This builds &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608; over time. This becomes something &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608; that &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;.
                  </p>

                  <p className="font-bold mb-3 text-xs uppercase tracking-widest">THE BOUNTY:</p>

                  <div className="space-y-4 mb-6">
                    <p>
                      <span className="font-bold">ARTIST PROOF MINI PRINT</span> &mdash; Your winning artifact, produced as an official artist proof mini print, stamped as an official Tech Epochalypse collaboration, signed by Coldie. This is not a reproduction. This is a verified artifact &mdash; proof that your code infiltrated the system and was recognized by the &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;.
                    </p>

                    <p>
                      <span className="font-bold">PRINT EDITION</span> &mdash; 60 mini prints of the winning piece will be produced. Purchase priority goes first to Moments holders of the depicted Overlord. Kinetic token holders of the selected overlord will each receive one print free of charge &mdash; no action required, the network rewards its own. Remaining prints will be available to the public.
                    </p>

                    <p>
                      <span className="font-bold">REVENUE SPLIT</span> &mdash; All proceeds from print sales are split between Coldie and the winning artist. You don&rsquo;t just get recognized. You get &#9608;&#9608;&#9608;&#9608;.
                    </p>
                  </div>

                  <p className="text-black/40 text-xs uppercase tracking-widest my-6">
                    &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608; THE USUAL SUSPECTS DOSSIER OPENS WITH YOU. THERE IS NO #002 WITHOUT #001. &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                  </p>

                  <p className="text-black/40 text-xs italic">
                    // The Overlords built the &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;. You are the &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;.
                  </p>
                  <p className="text-black/40 text-xs italic">
                    // END &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                  </p>
                </div>

                {/* CTA */}
                <div className="mt-10 text-center">
                  <Link
                    href="/overlords"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-black text-white font-mono text-sm uppercase tracking-[0.2em] hover:bg-black/80 transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    EXPLOIT YOUR OVERLORD
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="line-accent" />

      {/* ── Section 1b: Current Exploit Submissions ── */}
      <section className="py-12 md:py-16 section-padding">
        <div className="page-container">
          <ScrollReveal>
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="classified-header">
                  Active Exploit &mdash; Submissions
                </div>
                <h2 className="font-display text-2xl md:text-3xl text-white uppercase tracking-[0.03em]">
                  Exploit Transmissions
                </h2>
              </div>
            </div>
          </ScrollReveal>

          <UserExports
            overlordNames={overlordNames}
            overlordSlugs={overlordSlugs}
            category="Current Exploit"
            headerText="Submissions for the current active exploit. These operatives have breached the network."
          />
        </div>
      </section>

      <div className="line-accent" />

      {/* ── Section 2: Gallery ── */}
      <section className="py-12 md:py-16 section-padding">
        <div className="page-container">
          <ScrollReveal>
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="classified-header">
                  Transmissions Collected Data Packets
                </div>
                <h2 className="font-display text-2xl md:text-3xl text-white uppercase tracking-[0.03em]">
                  RAW SIGNALS
                </h2>
              </div>
              <Link href="/gallery" className="btn-secondary">
                <span>Full Gallery</span>
              </Link>
            </div>
          </ScrollReveal>

          <UserExports
            overlordNames={overlordNames}
            overlordSlugs={overlordSlugs}
          />
        </div>
      </section>

      <div className="line-accent" />

      {/* ── Section 3: Founding Signals ── */}
      <section className="py-12 md:py-16 section-padding">
        <div className="page-container">
          <ScrollReveal>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-2xl md:text-3xl text-white uppercase tracking-[0.03em]">
                  Founding Signals
                </h2>
              </div>
              <Link href="/collectors" className="btn-secondary">
                <span>All Founding Signals</span>
              </Link>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {collectors.map((collector, i) => (
              <ScrollReveal key={collector.name} delay={i * 150}>
                <div className="group relative bg-charcoal/30 border border-white/5 hover:border-white/10 overflow-hidden transition-all duration-500">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <div className="p-8 md:p-10">
                    <div className="flex items-start gap-6">
                      {/* Avatar */}
                      <div className="shrink-0">
                        {collector.avatar ? (
                          <img
                            src={collector.avatar}
                            alt={collector.name}
                            className="w-20 h-20 rounded-full object-cover border border-white/10"
                            loading="lazy"
                            style={{ filter: 'grayscale(1) contrast(1.1)' }}
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-charcoal border border-white/10 flex items-center justify-center">
                            <span className="font-display text-2xl text-white">
                              {collector.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-2xl text-white mb-1 uppercase tracking-[0.03em]">
                          {collector.name}
                        </h3>
                        {collector.bio && (
                          <p className="text-white text-sm font-mono italic leading-relaxed mb-4">
                            &ldquo;{collector.bio}&rdquo;
                          </p>
                        )}
                        <div className="mb-4">
                          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white mb-2">
                            Collection
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {collector.pieces.map((slug) => {
                              const overlord = overlordMap[slug]
                              if (!overlord) return null
                              return (
                                <Link
                                  key={slug}
                                  href={
                                    overlord.status === 'live'
                                      ? `/overlords/${slug}`
                                      : '/overlords'
                                  }
                                  className="flex items-center gap-2 bg-black/50 border border-white/5 px-3 py-1.5 hover:border-white/15 transition-colors"
                                >
                                  {overlord.previewImage && (
                                    <img
                                      src={overlord.previewImage}
                                      alt={overlord.name}
                                      className="w-6 h-6 object-cover rounded-sm"
                                      style={{ filter: 'grayscale(1)' }}
                                    />
                                  )}
                                  <span className="font-mono text-[11px] uppercase tracking-wider text-white">
                                    {overlord.name}
                                  </span>
                                </Link>
                              )
                            })}
                          </div>
                        </div>
                        {/* Social links */}
                        <div className="flex items-center gap-3">
                          {collector.socials.twitter && (
                            <a
                              href={collector.socials.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white hover:text-white transition-colors"
                              title="Twitter / X"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                              </svg>
                            </a>
                          )}
                          {collector.socials.instagram && (
                            <a
                              href={collector.socials.instagram}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white hover:text-white transition-colors"
                              title="Instagram"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <rect
                                  x="2"
                                  y="2"
                                  width="20"
                                  height="20"
                                  rx="5"
                                />
                                <circle cx="12" cy="12" r="5" />
                                <circle
                                  cx="17.5"
                                  cy="6.5"
                                  r="1.5"
                                  fill="currentColor"
                                  stroke="none"
                                />
                              </svg>
                            </a>
                          )}
                          {collector.socials.website && (
                            <a
                              href={collector.socials.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white hover:text-white transition-colors"
                              title="Website"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <circle cx="12" cy="12" r="10" />
                                <line x1="2" y1="12" x2="22" y2="12" />
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <div className="line-accent" />

      {/* ── Section 4: Dossier ── */}
      <section className="py-12 md:py-16 section-padding">
        <div className="page-container">
          <ScrollReveal>
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="classified-header">
                  The Artist &mdash; Active File
                </div>
                <h2 className="font-display text-2xl md:text-3xl text-white uppercase tracking-[0.03em]">
                  Dossier
                </h2>
              </div>
              <Link href="/about" className="btn-secondary">
                <span>Full Dossier</span>
              </Link>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 items-start">
              <div className="aspect-[3/4] relative overflow-hidden bg-charcoal dossier-border">
                <img
                  src="/Coldie-artist-headshot.jpg"
                  alt="Coldie — Artist"
                  className="w-full h-full object-cover"
                  style={{ filter: 'grayscale(1) contrast(1.2)' }}
                />
              </div>
              <div>
                <h3 className="font-display text-3xl text-white mb-4 uppercase tracking-[0.03em]">
                  Coldie
                </h3>
                <div className="space-y-4 text-white text-sm font-mono leading-relaxed">
                  <p>
                    Coldie is a pioneering digital artist and one of the earliest
                    creators in the NFT and crypto art movement. Working at the
                    intersection of technology, culture, and fine art, Coldie
                    creates immersive 3D stereoscopic and interactive digital
                    portraits that challenge how we perceive influential figures.
                  </p>
                  <p>
                    Tech Epochalypse represents the culmination of years of
                    experimentation: fully interactive 3D artworks that visitors
                    can manipulate, distort, and export as their own unique
                    iterations.
                  </p>
                </div>
                <div className="flex items-center gap-4 mt-6">
                  <a
                    href="https://twitter.com/Coldie"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-white transition-colors"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    <span className="font-mono text-[10px] uppercase tracking-wider">
                      @Coldie
                    </span>
                  </a>
                  <a
                    href="https://www.instagram.com/coldie3dart"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-white transition-colors"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="5" />
                      <circle cx="12" cy="12" r="5" />
                      <circle
                        cx="17.5"
                        cy="6.5"
                        r="1.5"
                        fill="currentColor"
                        stroke="none"
                      />
                    </svg>
                    <span className="font-mono text-[10px] uppercase tracking-wider">
                      @coldie
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="h-16" />
    </div>
  )
}
