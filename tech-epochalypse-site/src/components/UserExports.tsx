'use client'

import { useEffect, useState } from 'react'

interface GalleryExport {
  id: string
  image: string
  overlord: string
  date: string
  type: string
}

export default function UserExports({ overlordNames }: { overlordNames: Record<string, string> }) {
  const [exports, setExports] = useState<GalleryExport[]>([])

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('te-gallery') || '[]')
      setExports(stored)
    } catch {
      setExports([])
    }
  }, [])

  if (exports.length === 0) return null

  return (
    <div className="mb-16">
      <div className="flex items-center gap-4 mb-8">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-neon-green/60">
          Your Exports
        </h2>
        <div className="flex-1 h-px bg-white/5" />
        <button
          onClick={() => {
            if (confirm('Clear all your exported gallery items?')) {
              localStorage.removeItem('te-gallery')
              setExports([])
            }
          }}
          className="font-mono text-[10px] uppercase tracking-wider text-steel/40 hover:text-red-400 transition-colors"
        >
          Clear All
        </button>
      </div>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        {exports.map((item, i) => (
          <div
            key={item.id}
            className="break-inside-avoid group relative bg-charcoal/30 border border-white/5 overflow-hidden card-hover"
          >
            <div className="aspect-[4/5] relative overflow-hidden bg-charcoal">
              <img
                src={item.image}
                alt={`Export of ${overlordNames[item.overlord] ?? item.overlord}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-void/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-silver">You</span>
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
