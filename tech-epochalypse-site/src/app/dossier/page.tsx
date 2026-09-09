import Link from 'next/link'
import dynamic from 'next/dynamic'
import ScrollReveal from '@/components/ScrollReveal'
import SubjVoteCta from '@/components/SubjVoteCta'
import overlords from '@/data/overlords.json'
import { ACTIVE_SUBJ } from '@/data/subj-events'
import { SUBJ_01_WINNERS } from '@/data/subj-01-archive'
import { getSubj01EntryImages } from '@/lib/dossier-entries'

const SubjEntriesGallery = dynamic(() => import('@/components/SubjEntriesGallery'), {
  ssr: false,
  loading: () => null,
})

export const metadata = {
  title: 'DOSSIER — SUBJ Competition Case Files | Tech Epochalypse',
  description:
    'The working case file of the Tech Epochalypse SUBJ design competitions. The active investigation is filed first; closed cases are sealed in the archive tabs.',
}

/* ────────────────────────────────────────────────────────────────────
   DOSSIER — the front page of the SUBJ competition case files.
   Structure:
     cover  →  Tab 02 (active: SUBJ:02 brief sheet + live evidence wall)
            →  Tab 01 (archived: folder link to /dossier/01)
   When SUBJ:02 closes, build /dossier/02 the same way /dossier/01 was
   built, demote its section here to a folder link, and promote SUBJ:03.
   ──────────────────────────────────────────────────────────────────── */
export default function DossierPage() {
  const active = ACTIVE_SUBJ
  const subject = overlords.find((o) => o.slug === active.overlordSlugs[0])!
  const subj01Entries = getSubj01EntryImages()

  return (
    <div className="dossier-desk min-h-screen">
      {/* ══════════ COVER ══════════ */}
      <section className="relative pt-28 md:pt-36 pb-12 section-padding overflow-hidden">
        <div className="page-container">
          <ScrollReveal>
            <div className="relative mx-auto max-w-5xl">
              <div className="flex">
                <div className="paper-manila paper-fibre tw-label text-xs sm:text-sm uppercase tracking-[0.25em] px-6 py-2 rounded-t-md -mb-px shadow-[0_-6px_16px_-8px_rgba(0,0,0,0.7)]">
                  Case File 00{active.id.replace(/^0/, '')}
                </div>
              </div>

              <div className="paper-sheet paper-fibre relative px-7 sm:px-14 py-12 sm:py-16">
                <div className="punch-holes hidden sm:flex">
                  <i /><i /><i />
                </div>
                <div className="confidential-stripe absolute top-0 right-0 h-2 w-40" />
                <span className="tape" style={{ top: '-14px', left: '50%', transform: 'translateX(-50%) rotate(-2deg)' }} />

                <div className="sm:pl-10 text-center sm:text-left">
                  <p className="tw-label text-[11px] sm:text-xs uppercase tracking-[0.45em] text-[#8c2b22]">
                    Tech Epochalypse — Case Files
                  </p>
                  <h1 className="font-stencil text-6xl sm:text-8xl uppercase tracking-[0.04em] text-[#1c1a14] mt-3 leading-[0.95]">
                    Dossier
                  </h1>
                  <p className="tw-label text-base sm:text-lg uppercase tracking-[0.2em] text-[#3a3528] mt-4">
                    SUBJ Design Competition — Records of Record
                  </p>

                  <div className="mt-7 max-w-2xl mx-auto sm:mx-0">
                    <p className="font-mono text-sm leading-relaxed text-[#2a261c]">
                      The working case file of the Tech Epochalypse SUBJ
                      competitions. The active investigation is filed first.
                      Closed cases are sealed &mdash; winning selections, the
                      jurors&rsquo; marks, and every submission entered into
                      evidence &mdash; and moved to the archive tabs below.
                    </p>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center gap-4 justify-center sm:justify-start">
                    <span className="rubber-stamp rubber-stamp--blue text-2xl sm:text-3xl" style={{ transform: 'rotate(-7deg)' }}>
                      Case Open
                    </span>
                    <span className="tw-label text-xs uppercase tracking-[0.25em] text-[#4a4537]">
                      SUBJ:{active.id} in progress · Opened Sep 2026
                    </span>
                  </div>
                </div>

                <span className="coffee-ring" style={{ bottom: '24px', right: '40px' }} />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ══════════ DIVIDER TAB: SUBJ:02 (ACTIVE) ══════════ */}
      <section className="section-padding">
        <div className="page-container max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="flex items-end gap-1 border-b-2 border-[#243f6b]/50">
              <div className="paper-manila paper-fibre tw-label uppercase tracking-[0.25em] text-[#2a2415] px-6 sm:px-8 py-3 rounded-t-md text-sm sm:text-base">
                Tab {active.id} — SUBJ:{active.id}
              </div>
              <div className="hidden sm:block flex-1 pb-2 pl-4 tw-label text-xs uppercase tracking-[0.3em] text-[#6b6450]">
                “{active.title}” · {subject.name} · Open
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ══════════ ACTIVE CASE SHEET ══════════ */}
      <section className="pt-10 pb-12 section-padding">
        <div className="page-container max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="paper-sheet paper-fibre relative p-6 sm:p-10">
              <span className="tape" style={{ top: '-12px', left: '48px', transform: 'rotate(-5deg)', width: '110px' }} />
              <span className="tape" style={{ top: '-12px', right: '48px', transform: 'rotate(4deg)', width: '110px' }} />
              <div className="absolute -top-4 right-6 sm:right-10 z-10">
                <span className="rubber-stamp rubber-stamp--blue text-xl sm:text-2xl" style={{ transform: 'rotate(7deg)' }}>
                  Accepting Entries
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-10">
                {/* Subject photo */}
                <div className="md:col-span-2">
                  <Link
                    href={subject.artworkFile ?? `/subj/${active.id}`}
                    className="photo-print block group lift focus:outline-none focus:ring-2 focus:ring-[#8c2b22]"
                    style={{ transform: 'rotate(-1.5deg)' }}
                    aria-label={`Open the ${subject.name} editor and enter SUBJ:${active.id}`}
                  >
                    <div className="aspect-square overflow-hidden bg-[#0a0a0a]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={subject.previewImage ?? '/images/placeholder.png'}
                        alt={`${subject.name} — subject of SUBJ:${active.id}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  </Link>
                  <p className="tw-label text-[10px] uppercase tracking-[0.25em] text-[#8c2b22] mt-4">
                    Subject {subject.number} — {subject.title}
                  </p>
                  <p className="tw-label text-xl leading-tight text-[#1c1a14] mt-1">{subject.name}</p>
                </div>

                {/* Case details */}
                <div className="md:col-span-3 font-mono text-[#2a261c]">
                  <p className="tw-label text-xs uppercase tracking-[0.35em] text-[#8c2b22]">
                    Case Summary — SUBJ:{active.id}
                  </p>
                  <h2 className="font-stencil text-4xl sm:text-5xl uppercase tracking-[0.03em] text-[#1c1a14] mt-2 leading-[0.95]">
                    {active.title}
                  </h2>
                  <p className="text-sm leading-relaxed mt-4">{active.shortDescription}</p>

                  <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm mt-6 border-t border-[#1c1a14]/15 pt-5">
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.2em] text-[#6b6450]">Opens</dt>
                      <dd className="tw-label text-sm">{active.dates.opens}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.2em] text-[#6b6450]">Submissions close</dt>
                      <dd className="tw-label text-sm">{active.dates.closes}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.2em] text-[#6b6450]">Community vote</dt>
                      <dd className="tw-label text-sm">{active.dates.voting}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.2em] text-[#6b6450]">Winners</dt>
                      <dd className="tw-label text-sm">{active.dates.winners}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.2em] text-[#6b6450]">Mints + raffles</dt>
                      <dd className="tw-label text-sm">{active.dates.mints}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.2em] text-[#6b6450]">Selections</dt>
                      <dd className="tw-label text-sm">3 (2 Curator · 1 Community)</dd>
                    </div>
                  </dl>

                  <p className="text-[11px] leading-relaxed text-[#4a4537] mt-5">
                    Curator&rsquo;s Picks minted as editions of 10, the Community
                    Pick as an edition of 42. Winning artists keep 80% of
                    primary sales and secondary royalties. Free to enter, one
                    submission per person.
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Link
                      href={`/subj/${active.id}`}
                      className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] bg-[#1c1a14] text-[#ece6d4] hover:bg-[#8c2b22] transition-colors px-5 py-3"
                    >
                      Read the Brief &amp; Enter →
                    </Link>
                    <Link
                      href={subject.artworkFile ?? `/subj/${active.id}`}
                      className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#1c1a14] border border-[#1c1a14]/40 hover:bg-[#1c1a14] hover:text-[#ece6d4] transition-colors px-5 py-3"
                    >
                      Open the Kinetic 3D Collage Machine →
                    </Link>
                  </div>
                </div>
              </div>

              <span className="coffee-ring" style={{ bottom: '18px', left: '36px' }} />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ══════════ COMMUNITY VOTE CTA (switches on at close) ══════════ */}
      <section className="pb-4 section-padding">
        <div className="page-container max-w-5xl mx-auto">
          <ScrollReveal>
            <SubjVoteCta
              voteOpen={active.voteOpen}
              voteClose={active.voteClose}
              votingLabel={active.dates.voting}
              eventLabel={`SUBJ:${active.id}`}
            />
          </ScrollReveal>
        </div>
      </section>

      {/* ══════════ DIVIDER TAB: EVIDENCE (LIVE ENTRIES) ══════════ */}
      <section className="section-padding pt-6">
        <div className="page-container max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="flex items-end gap-1 border-b-2 border-[#243f6b]/50">
              <div className="paper-manila paper-fibre tw-label uppercase tracking-[0.25em] text-[#2a2415] px-6 sm:px-8 py-3 rounded-t-md text-sm sm:text-base">
                Exhibit A — Evidence Incoming
              </div>
              <div className="hidden sm:block flex-1 pb-2 pl-4 tw-label text-xs uppercase tracking-[0.3em] text-[#6b6450]">
                Submissions logged as they are approved
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
      <section className="pb-8 section-padding">
        <div className="page-container max-w-6xl mx-auto">
          <SubjEntriesGallery
            category={active.category}
            eventLabel={active.id}
            theme="dossier"
            emptyState={
              <div className="text-center py-12">
                <span className="rubber-stamp text-xl sm:text-2xl inline-block" style={{ transform: 'rotate(-4deg)' }}>
                  Awaiting Evidence
                </span>
                <p className="font-mono text-xs text-[#9a9684] mt-5 max-w-md mx-auto leading-relaxed">
                  No approved submissions on file yet. Entries appear here as
                  they clear review. Be the first exhibit.
                </p>
              </div>
            }
          />
        </div>
      </section>

      {/* ══════════ ARCHIVE: TAB 01 — SUBJ:01 (folder link) ══════════ */}
      <section className="section-padding pt-10">
        <div className="page-container max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="flex items-end gap-1 border-b-2 border-[#8c2b22]/40">
              <Link
                href="/dossier/01"
                className="paper-manila paper-fibre tw-label uppercase tracking-[0.25em] text-[#2a2415] px-6 sm:px-8 py-3 rounded-t-md text-sm sm:text-base hover:brightness-105 transition"
              >
                Tab 01 — SUBJ:01
              </Link>
              <div className="hidden sm:block flex-1 pb-2 pl-4 tw-label text-xs uppercase tracking-[0.3em] text-[#6b6450]">
                “The Singularity” · Five Overlords · Closed · Archived
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
      <section className="pt-8 pb-24 section-padding">
        <div className="page-container max-w-5xl mx-auto">
          <ScrollReveal>
            <Link
              href="/dossier/01"
              className="group block paper-manila paper-fibre relative px-6 sm:px-10 py-7 sm:py-8 rounded-md shadow-[0_10px_24px_-14px_rgba(0,0,0,0.8)] hover:-translate-y-0.5 transition-transform"
              aria-label="Open Case File 001 — SUBJ:01 The Singularity archive"
            >
              <span className="tape" style={{ top: '-12px', left: '32px', transform: 'rotate(-6deg)', width: '90px' }} />
              <div className="absolute -top-3 right-6 z-10">
                <span className="rubber-stamp text-lg sm:text-xl" style={{ transform: 'rotate(8deg)' }}>
                  Case Closed
                </span>
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
                {/* Winner thumbnails peeking out of the folder */}
                <div className="flex -space-x-6 shrink-0">
                  {SUBJ_01_WINNERS.map((w, i) => (
                    <div
                      key={w.artist}
                      className="photo-print w-20 h-20 sm:w-24 sm:h-24 shrink-0"
                      style={{ transform: `rotate(${[-6, 3, -2][i]}deg)`, zIndex: 3 - i }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={w.image} alt={`SUBJ:01 winner ${w.artist}`} />
                    </div>
                  ))}
                </div>

                <div className="flex-1">
                  <p className="tw-label text-[11px] uppercase tracking-[0.4em] text-[#8c2b22]">
                    Case File 001 — Archived
                  </p>
                  <h2 className="font-stencil text-3xl sm:text-4xl uppercase tracking-[0.03em] text-[#1c1a14] mt-2 leading-none">
                    SUBJ:01 — The Singularity
                  </h2>
                  <p className="font-mono text-xs leading-relaxed text-[#3a3528] mt-3 max-w-xl">
                    Five overlords, {subj01Entries.length > 0 ? subj01Entries.length : '41'} submissions logged, three
                    winning selections minted. Sealed June 2026. The full
                    record &mdash; winners, mint pages, and every entry
                    &mdash; is preserved in the archive.
                  </p>
                </div>

                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#1c1a14] border border-[#1c1a14]/40 group-hover:bg-[#1c1a14] group-hover:text-[#ece6d4] transition-colors px-4 py-2 shrink-0 w-fit">
                  Open the File →
                </span>
              </div>
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}
