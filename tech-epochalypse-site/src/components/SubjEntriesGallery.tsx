'use client'

import { useEffect, useState, type ReactNode } from 'react'

// Lightweight, read-only gallery for a SUBJ event's approved entries.
// No voting, no metadata noise — just thumbnails.
//
// Data comes from the gallery worker's GET /entries?category=<category>,
// which reads Airtable server-side (Approved = 1, Category = <category>)
// and returns the same {records: [...]} shape as the old /api proxy. The
// site is a static export, so there is no Next API route to proxy through.

const WORKER_URL =
  process.env.NEXT_PUBLIC_GALLERY_WORKER_URL ||
  'https://te-gallery-api.coldieart.workers.dev'

interface AirtableThumb {
  small?: { url: string }
  large?: { url: string }
  full?: { url: string }
}
interface AirtableAttachment {
  url: string
  thumbnails?: AirtableThumb
}
interface Record {
  id: string
  fields: {
    Title?: string
    Image?: AirtableAttachment[]
    Approved?: boolean
  }
}

interface Entry {
  id: string
  src: string
  title: string
}

export default function SubjEntriesGallery({
  category,
  eventLabel,
  theme = 'noir',
  emptyState,
}: {
  /** Airtable "Category" value that tags this event's entries, e.g. 'subj-02'. */
  category: string
  /** Display label, e.g. '02'. */
  eventLabel: string
  /** 'noir' = black section w/ white type (SUBJ pages); 'dossier' = transparent, paper-desk palette. */
  theme?: 'noir' | 'dossier'
  /** Rendered instead of null when there are zero entries. */
  emptyState?: ReactNode
}) {
  const dossier = theme === 'dossier'
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch(`${WORKER_URL}/entries?category=${encodeURIComponent(category)}`, {
          cache: 'no-store',
        })
        if (!res.ok) throw new Error('fetch failed')
        const data = await res.json()
        if (cancelled) return
        const items: Entry[] = (data.records ?? [])
          .filter((r: Record) => r.fields.Approved && r.fields.Image && r.fields.Image.length > 0)
          .map((r: Record) => {
            const att = r.fields.Image![0]
            return {
              id: r.id,
              src: att.thumbnails?.large?.url ?? att.thumbnails?.full?.url ?? att.url,
              title: r.fields.Title ?? '',
            }
          })
        setEntries(items)
      } catch {
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [category])

  if (loading) {
    return (
      <div className={`text-center py-10 font-mono text-xs uppercase tracking-wider ${dossier ? 'text-[#9a9684]' : 'text-white/40'}`}>
        Loading entries…
      </div>
    )
  }
  if (error) {
    // Surface failure in dev console; render nothing on page.
    if (typeof window !== 'undefined') console.warn('SubjEntriesGallery: failed to load entries')
    return null
  }
  if (entries.length === 0) {
    return emptyState ? <>{emptyState}</> : null
  }

  return (
    <section className={dossier ? 'relative py-8' : 'relative py-16 md:py-20 section-padding bg-black'}>
      <div className={dossier ? '' : 'page-container'}>
        <div className="text-center mb-8 md:mb-10">
          <p className={`font-mono text-xs uppercase tracking-[0.4em] mb-3 ${dossier ? 'text-[#8c2b22]' : 'text-white/60'}`}>
            Live Entries
          </p>
          <h2 className={dossier
            ? 'font-stencil text-3xl sm:text-4xl uppercase tracking-[0.03em] text-[#ece6d4] mb-3'
            : 'font-display text-3xl md:text-5xl text-white uppercase tracking-[0.05em] mb-3'}>
            SUBJ:&nbsp;{eventLabel} Submissions
          </h2>
          <p className={`font-mono text-xs md:text-sm max-w-xl mx-auto ${dossier ? 'text-[#9a9684]' : 'text-white/60'}`}>
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'} so far.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3 max-w-6xl mx-auto">
          {entries.map((e) => (
            <div
              key={e.id}
              className={dossier ? 'photo-print aspect-square overflow-hidden' : 'aspect-square overflow-hidden border border-white/10 bg-black'}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={e.src}
                alt={e.title || `SUBJ:${eventLabel} entry`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
