'use client'

import { useEffect, useState } from 'react'

// Update this after deploying your Cloudflare Worker
const GALLERY_API = 'https://te-gallery-api.YOUR_SUBDOMAIN.workers.dev'

interface GalleryExport {
  id: string
  key: string
  imageUrl: string
  overlord: string
  date: string
  size: number
}

export default function UserExports({ overlordNames }: { overlordNames: Record<string, string> }) {
  const [exports, setExports] = useState<GalleryExport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchGallery() {
      try {
        const res = await fetch(GALLERY_API + '/gallery')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setExports(data)
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
                src={GALLERY_API + item.imageUrl}
                alt={`Export of ${overlordNames[item.overlord] ?? item.overlord}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-void/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-silver">Visitor</span>
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
