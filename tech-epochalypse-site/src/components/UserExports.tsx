'use client'

import { useEffect, useState } from 'react'
import GalleryViewer, { type GalleryItem } from './GalleryViewer'

const AIRTABLE_BASE_ID = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID ?? ''
const AIRTABLE_TABLE = process.env.NEXT_PUBLIC_AIRTABLE_TABLE ?? 'Gallery'
const AIRTABLE_TOKEN = process.env.NEXT_PUBLIC_AIRTABLE_TOKEN ?? ''

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
}

export default function UserExports({ overlordNames, overlordSlugs }: Props) {
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
        const filter = encodeURIComponent('{Approved}=1')
        const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE)}?sort%5B0%5D%5Bfield%5D=Date&sort%5B0%5D%5Bdirection%5D=desc&filterByFormula=${filter}`
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${AIRTABLE_TOKEN}`,
          },
          cache: 'no-store',
        })
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
          The Tribute Wall
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
