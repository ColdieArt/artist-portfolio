'use client'

import { useEffect, useState } from 'react'
import GalleryViewer, { type GalleryItem } from './GalleryViewer'

// Records are now fetched through a server-side proxy at /api/airtable-records
// which uses the AIRTABLE_PAT / BASE_ID / TABLE_NAME server-side env vars.
// No NEXT_PUBLIC_* token is needed in the client bundle.

interface AirtableAttachment {
  id: string
  url: string
  filename: string
  size: number
  type: string
  thumbnails?: {
    small: { url: string; width: number; height: number }
    large: { url: string; width: number; height: number }
    full: { url: string; width: number; height: number }
  }
}

interface GalleryRecord {
  id: string
  fields: {
    Title?: string
    Image?: AirtableAttachment[]
    Overlord?: string
    Date?: string
    Contributor?: string
    Approved?: boolean
    Category?: string
  }
  createdTime: string
}

function toSlug(value: string): string {
  return value.toLowerCase().replace(/\s+/g, '-')
}

function parseRecords(records: GalleryRecord[], nameToSlug: Record<string, string>): GalleryItem[] {
  return records
    .filter((r) => r.fields.Approved && r.fields.Image && r.fields.Image.length > 0)
    .map((r) => {
      const raw = r.fields.Overlord ?? 'unknown'
      // Normalize overlord to slug: check reverse name map first, then slugify
      const overlord = nameToSlug[raw.toLowerCase()] ?? toSlug(raw)
      return {
        id: r.id,
        type: 'image' as const,
        src: r.fields.Image![0].thumbnails?.full?.url ?? r.fields.Image![0].url,
        title: r.fields.Title ?? 'Untitled Export',
        overlord,
        date: r.fields.Date ?? r.createdTime.split('T')[0],
        contributor: r.fields.Contributor ?? 'Visitor',
      }
    })
    .sort((a, b) => b.date.localeCompare(a.date))
}

interface Props {
  overlordNames: Record<string, string>
  overlordSlugs: string[]
  category?: string
  headerText?: string
}

export default function UserExports({ overlordNames, overlordSlugs, category, headerText }: Props) {
  // Reverse mapping: overlord name -> slug (e.g. "Elon Musk" -> "elon-musk")
  const nameToSlug: Record<string, string> = {}
  for (const [slug, name] of Object.entries(overlordNames)) {
    nameToSlug[name.toLowerCase()] = slug
  }
  const [exports, setExports] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchGallery() {
      try {
        const qs = category ? `?category=${encodeURIComponent(category)}` : ''
        const res = await fetch(`/api/airtable-records${qs}`, { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setExports(parseRecords(data.records ?? [], nameToSlug))
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchGallery()
  }, [])

  if (loading) {
    return (
      <div className="mb-16 text-center py-12">
        <div className="w-6 h-6 border border-white/20 border-t-white/60 rounded-full animate-spin mx-auto mb-3" />
        <p className="font-mono text-xs text-white uppercase tracking-wider">Loading community exports...</p>
      </div>
    )
  }

  if (error || exports.length === 0) return null

  return (
    <div className="mb-20">
      <div className="flex items-center gap-4 mb-8">
        <h2 className="font-mono text-sm uppercase tracking-[0.2em] text-white">
          {headerText ?? 'Items of interest collected via community submissions. Still to be dissected and classified. Viewer discretion advised. Data unfiltered. Create something. Touch the art. Submit the creation.'}
        </h2>
        <div className="flex-1 h-px bg-white/5" />
        <span className="font-mono text-xs text-white">
          {exports.length} submission{exports.length !== 1 ? 's' : ''}
        </span>
      </div>

      <GalleryViewer
        items={exports}
        overlordNames={overlordNames}
        overlordSlugs={overlordSlugs}
      />
    </div>
  )
}
