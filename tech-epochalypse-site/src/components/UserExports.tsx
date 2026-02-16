'use client'

import { useEffect, useState } from 'react'

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
  }
  createdTime: string
}

interface GalleryExport {
  id: string
  title: string
  imageUrl: string
  overlord: string
  date: string
  contributor: string
}

function parseRecords(records: GalleryRecord[]): GalleryExport[] {
  return records
    .filter((r) => r.fields.Image && r.fields.Image.length > 0)
    .map((r) => ({
      id: r.id,
      title: r.fields.Title ?? '',
      imageUrl: r.fields.Image![0].thumbnails?.full?.url ?? r.fields.Image![0].url,
      overlord: r.fields.Overlord ?? 'unknown',
      date: r.fields.Date ?? r.createdTime.split('T')[0],
      contributor: r.fields.Contributor ?? 'Visitor',
    }))
    .sort((a, b) => b.date.localeCompare(a.date))
}

export default function UserExports({ overlordNames }: { overlordNames: Record<string, string> }) {
  const [exports, setExports] = useState<GalleryExport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchGallery() {
      try {
        const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE)}?sort%5B0%5D%5Bfield%5D=Date&sort%5B0%5D%5Bdirection%5D=desc`
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${AIRTABLE_TOKEN}`,
          },
        })
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setExports(parseRecords(data.records ?? []))
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
        <div className="w-6 h-6 border border-neon-green/30 border-t-neon-green rounded-full animate-spin mx-auto mb-3" />
        <p className="font-mono text-xs text-steel/50 uppercase tracking-wider">Loading gallery...</p>
      </div>
    )
  }

  if (error || exports.length === 0) return null

  return (
    <div className="mb-16">
      <div className="flex items-center gap-4 mb-8">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-neon-green/60">
          Community Exports
        </h2>
        <div className="flex-1 h-px bg-white/5" />
        <span className="font-mono text-[10px] text-steel/40">
          {exports.length} submission{exports.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        {exports.map((item) => (
          <div
            key={item.id}
            className="break-inside-avoid group relative bg-charcoal/30 border border-white/5 overflow-hidden card-hover"
          >
            <div className="aspect-[4/5] relative overflow-hidden bg-charcoal">
              <img
                src={item.imageUrl}
                alt={item.title || `Export of ${overlordNames[item.overlord] ?? item.overlord}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-void/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-silver">
                  {item.contributor}
                </span>
                <span className="font-mono text-[10px] text-steel/50">
                  {item.date}
                </span>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-neon-green/50">
                {overlordNames[item.overlord] ?? item.overlord}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
