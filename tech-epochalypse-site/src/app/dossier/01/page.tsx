import Link from 'next/link'
import ScrollReveal from '@/components/ScrollReveal'
import DossierGallery from '@/components/DossierGallery'
import { SUBJ_01_WINNERS, SUBJ_01_MINT_CONTRACT, DESIGNATION_META } from '@/data/subj-01-archive'
import { getSubj01EntryImages } from '@/lib/dossier-entries'

export const metadata = {
  title: 'DOSSIER — Case File 001: SUBJ:01 The Singularity | Tech Epochalypse',
  description:
    'The sealed case file of SUBJ:01 “The Singularity” — three winning selections and the complete record of every submission entered into evidence.',
}

/* ────────────────────────────────────────────────────────────────────
   CASE FILE 001 — SUBJ:01 (archived)
   Moved here from /dossier when SUBJ:02 opened. The main /dossier page
   now carries the active case and links to this file via "Tab 01".
   Sections: cover → Tab 01 divider → Winning Selections → Exhibit A
   divider → Submission Record → Case Summary footer.
   ──────────────────────────────────────────────────────────────────── */
export default function DossierSubj01Page() {
  const entries = getSubj01EntryImages()

  return (
    <div className="dossier-desk min-h-screen">
      {/* ══════════ COVER ══════════ */}
      <section className="relative pt-28 md:pt-36 pb-12 section-padding overflow-hidden">
        <div className="page-container">
          <ScrollReveal>
            <div className="relative mx-auto max-w-5xl">
              <div className="flex items-end justify-between">
                <div className="paper-manila paper-fibre tw-label text-xs sm:text-sm uppercase tracking-[0.25em] px-6 py-2 rounded-t-md -mb-px shadow-[0_-6px_16px_-8px_rgba(0,0,0,0.7)]">
                  Case File 001
                </div>
                <Link
                  href="/dossier"
                  className="tw-label text-[11px] uppercase tracking-[0.25em] text-[#9a9684] hover:text-[#ece6d4] transition-colors pb-2"
                >
                  &larr; Back to the Dossier
                </Link>
              </div>

              <div className="paper-sheet paper-fibre relative px-7 sm:px-14 py-10 sm:py-14">
                <div className="punch-holes hidden sm:flex">
                  <i /><i /><i />
                </div>
                <div className="confidential-stripe absolute top-0 right-0 h-2 w-40" />
                <span className="tape" style={{ top: '-14px', left: '50%', transform: 'translateX(-50%) rotate(-2deg)' }} />

                <div className="sm:pl-10 text-center sm:text-left">
                  <p className="tw-label text-[11px] sm:text-xs uppercase tracking-[0.45em] text-[#8c2b22]">
                    Tech Epochalypse — Permanent Archive
                  </p>
                  <h1 className="font-stencil text-5xl sm:text-7xl uppercase tracking-[0.04em] text-[#1c1a14] mt-3 leading-[0.95]">
                    SUBJ:01
                  </h1>
                  <p className="tw-label text-base sm:text-lg uppercase tracking-[0.2em] text-[#3a3528] mt-4">
                    “The Singularity” · Five Overlords
                  </p>

                  <div className="mt-6 max-w-2xl mx-auto sm:mx-0">
                    <p className="font-mono text-sm leading-relaxed text-[#2a261c]">
                      Five tech overlords, each a face of the Singularity.
                      Entrants picked one, remixed it in Coldie&rsquo;s editor,
                      and submitted a parallax collage. Filed here in full: the
                      three winning selections, the jurors&rsquo; marks, and
                      the complete record of every submission entered into
                      evidence.
                    </p>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center gap-4 justify-center sm:justify-start">
                    <span className="rubber-stamp text-2xl sm:text-3xl" style={{ transform: 'rotate(-7deg)' }}>
                      Case Closed
                    </span>
                    <span className="tw-label text-xs uppercase tracking-[0.25em] text-[#4a4537]">
                      Filed June 2026
                    </span>
                  </div>
                </div>

                <span className="coffee-ring" style={{ bottom: '24px', right: '40px' }} />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ══════════ DIVIDER TAB: SUBJ:01 ══════════ */}
      <section className="section-padding">
        <div className="page-container max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="flex items-end gap-1 border-b-2 border-[#8c2b22]/40">
              <div className="paper-manila paper-fibre tw-label uppercase tracking-[0.25em] text-[#2a2415] px-6 sm:px-8 py-3 rounded-t-md text-sm sm:text-base">
                Tab 01 — SUBJ:01
              </div>
              <div className="hidden sm:block flex-1 pb-2 pl-4 tw-label text-xs uppercase tracking-[0.3em] text-[#6b6450]">
                “The Singularity” · Five Overlords · Closed
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ══════════ WINNING SELECTIONS ══════════ */}
      <section className="pt-10 pb-16 section-padding">
        <div className="page-container max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="mb-10 text-center">
              <p className="tw-label text-xs uppercase tracking-[0.4em] text-[#8c2b22]">
                Entered Into Evidence
              </p>
              <h2 className="font-stencil text-4xl sm:text-5xl uppercase tracking-[0.03em] text-[#ece6d4] mt-3">
                Winning Selections
              </h2>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#9a9684] mt-3">
                Two by Coldie · One by Community Vote · All 1:1
              </p>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#8c2b22] mt-2">
                Editions Minted · Now Collectible
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
            {SUBJ_01_WINNERS.map((w, i) => {
              const meta = DESIGNATION_META[w.designation]
              const tilt = [-2.2, 1.4, -1.1][i] ?? 0
              return (
                <ScrollReveal key={i} delay={i * 120}>
                  <article
                    className="paper-sheet paper-fibre lift relative p-4 pb-6"
                    style={{ transform: `rotate(${tilt}deg)` }}
                  >
                    <span className="tape" style={{ top: '-12px', left: '24px', transform: 'rotate(-8deg)', width: '90px' }} />
                    <span className="tape" style={{ top: '-12px', right: '24px', transform: 'rotate(7deg)', width: '90px' }} />

                    <div className="absolute -top-3 right-3 z-10">
                      <span className={`rubber-stamp ${meta.stampClass} text-lg`} style={{ transform: 'rotate(8deg)' }}>
                        {meta.stamp}
                      </span>
                    </div>

                    <a
                      href={w.mint}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="photo-print block group focus:outline-none focus:ring-2 focus:ring-[#8c2b22]"
                      aria-label={`Collect “${w.title}” by ${w.artist} on Transient`}
                    >
                      <div className="aspect-square overflow-hidden bg-[#0a0a0a] flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={w.image}
                          alt={`SUBJ:01 winning selection by ${w.artist}`}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                    </a>

                    <div className="px-1 pt-4">
                      <p className="tw-label text-[10px] uppercase tracking-[0.25em] text-[#8c2b22]">
                        {meta.kicker}
                      </p>
                      <h3 className="tw-label text-xl leading-tight text-[#1c1a14] mt-1">
                        {w.artist}
                      </h3>
                      <p className="font-mono text-[11px] leading-snug text-[#4a4537] mt-1">
                        {w.title}
                      </p>

                      <a
                        href={w.mint}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#1c1a14] border border-[#1c1a14]/40 hover:bg-[#1c1a14] hover:text-[#ece6d4] transition-colors px-4 py-2"
                      >
                        Collect · {w.price} →
                      </a>
                    </div>
                  </article>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══════════ DIVIDER TAB: SUBMISSION RECORD ══════════ */}
      <section className="section-padding pt-6">
        <div className="page-container max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="flex items-end gap-1 border-b-2 border-[#8c2b22]/40">
              <div className="paper-manila paper-fibre tw-label uppercase tracking-[0.25em] text-[#2a2415] px-6 sm:px-8 py-3 rounded-t-md text-sm sm:text-base">
                Exhibit A — Full Record
              </div>
              <div className="hidden sm:block flex-1 pb-2 pl-4 tw-label text-xs uppercase tracking-[0.3em] text-[#6b6450]">
                {entries.length > 0 ? `${entries.length} Submissions Logged` : 'Awaiting Evidence'}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ══════════ ALL ENTRIES GALLERY ══════════ */}
      <section className="pt-10 pb-20 section-padding">
        <div className="page-container max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="mb-10 text-center">
              <h2 className="font-stencil text-3xl sm:text-4xl uppercase tracking-[0.03em] text-[#ece6d4]">
                The Submission Record
              </h2>
              <p className="font-mono text-xs leading-relaxed text-[#9a9684] mt-3 max-w-xl mx-auto">
                Every entry submitted to SUBJ:01, archived in full. Click any
                exhibit to enlarge.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <DossierGallery images={entries} />
          </ScrollReveal>
        </div>
      </section>

      {/* ══════════ CASE METADATA FOOTER ══════════ */}
      <section className="section-padding pb-24">
        <div className="page-container max-w-3xl mx-auto">
          <ScrollReveal>
            <div className="paper-sheet paper-fibre paper-ruled relative p-8 sm:p-10" style={{ transform: 'rotate(-0.4deg)' }}>
              <span className="tape" style={{ top: '-12px', right: '40px', transform: 'rotate(5deg)' }} />
              <p className="tw-label text-xs uppercase tracking-[0.35em] text-[#8c2b22] mb-5">
                Case Summary — SUBJ:01
              </p>
              <dl className="grid grid-cols-2 gap-x-8 gap-y-4 font-mono text-sm text-[#2a261c]">
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.2em] text-[#6b6450]">Title</dt>
                  <dd className="tw-label text-base">The Singularity</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.2em] text-[#6b6450]">Status</dt>
                  <dd className="tw-label text-base text-[#8c2b22]">Closed · Final</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.2em] text-[#6b6450]">Submissions</dt>
                  <dd className="tw-label text-base">{entries.length > 0 ? entries.length : '—'}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.2em] text-[#6b6450]">Selections</dt>
                  <dd className="tw-label text-base">3 (2 Curator · 1 Community)</dd>
                </div>
              </dl>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/subj/01"
                  className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#1c1a14] border border-[#1c1a14]/40 hover:bg-[#1c1a14] hover:text-[#ece6d4] transition-colors px-4 py-2"
                >
                  View SUBJ:01 Brief →
                </Link>
                <a
                  href={SUBJ_01_MINT_CONTRACT}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#1c1a14] border border-[#1c1a14]/40 hover:bg-[#1c1a14] hover:text-[#ece6d4] transition-colors px-4 py-2"
                >
                  Collect the Winners →
                </a>
                <Link
                  href="/dossier"
                  className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#1c1a14] border border-[#1c1a14]/40 hover:bg-[#1c1a14] hover:text-[#ece6d4] transition-colors px-4 py-2"
                >
                  ← Back to the Dossier
                </Link>
              </div>

              <span className="rubber-stamp absolute bottom-6 right-8 text-xl" style={{ transform: 'rotate(-12deg)' }}>
                Final
              </span>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}
