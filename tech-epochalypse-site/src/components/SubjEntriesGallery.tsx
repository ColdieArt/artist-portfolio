'use client'

import { useEffect, useState } from 'react'

// Lightweight, read-only gallery for active SUBJ entries.
// No voting, no metadata noise — just thumbnails.
// Pulls from the existing /api/airtable-records proxy filtered to the
// "general submission" category, matching how the subj page tags entries.

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
}: {
  category?: string
}) {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        // No category filter by default — SUBJ:01 is the only active event,
        // so every approved record is a SUBJ:01 entry. Pass `category` only
        // when filtering for a specific competition.
        const qs = category ? `?category=${encodeURIComponent(category)}` : ''
        const res = await fetch(`/api/airtable-records${qs}`, { cache: 'no-store' })
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
      <div className="text-center py-10 font-mono text-xs text-white/40 uppercase tracking-wider">
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
    return null
  }

  return (
    <section className="relative py-16 md:py-20 section-padding bg-black">
      <div className="page-container">
        <div className="text-center mb-8 md:mb-10">
          <p className="font-mono text-xs uppercase tracking-[0.4em] text-white/60 mb-3">
            Live Entries
          </p>
          <h2 className="font-display text-3xl md:text-5xl text-white uppercase tracking-[0.05em] mb-3">
            SUBJ:&nbsp;01 Submissions
          </h2>
          <p className="font-mono text-xs md:text-sm text-white/60 max-w-xl mx-auto">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'} so far. Submissions
            close at midnight tonight.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3 max-w-6xl mx-auto">
          {entries.map((e) => (
            <div
              key={e.id}
              className="aspect-square overflow-hidden border border-white/10 bg-black"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={e.src}
                alt={e.title || 'SUBJ:01 entry'}
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
