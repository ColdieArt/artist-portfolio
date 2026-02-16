'use client'

import { useState } from 'react'

interface Overlord {
  slug: string
  name: string
  number: string
  artworkFile: string | null
  previewImage: string | null
}

export default function ArtworkViewer({ overlord }: { overlord: Overlord }) {
  const [loaded, setLoaded] = useState(false)

  if (!overlord.artworkFile) return null

  return (
    <div className="relative w-full" style={{ height: 'calc(100vh - 8.5rem)' }}>
      {/* Loading state */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-void z-10">
          <div className="text-center">
            <div className="w-8 h-8 border border-neon-green/30 border-t-neon-green rounded-full animate-spin mb-4 mx-auto" />
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-steel">
              Loading artwork...
            </p>
          </div>
        </div>
      )}

      {/* Desktop/Tablet: full iframe */}
      <div className="hidden md:block w-full h-full">
        <iframe
          src={overlord.artworkFile}
          title={`${overlord.name} — Interactive Artwork`}
          className="w-full h-full border-0"
          allow="autoplay; fullscreen"
          onLoad={() => setLoaded(true)}
        />
      </div>

      {/* Mobile: preview with message */}
      <div className="md:hidden w-full h-full flex flex-col items-center justify-center px-6 text-center">
        {overlord.previewImage && (
          <div className="w-full max-w-sm aspect-[3/4] relative mb-8 overflow-hidden">
            <img
              src={overlord.previewImage}
              alt={overlord.name}
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-void via-void/40 to-transparent" />
          </div>
        )}
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-neon-green/60 mb-3">
          Interactive Artwork
        </p>
        <p className="text-steel text-sm max-w-xs leading-relaxed">
          This interactive 3D artwork is best experienced on a desktop or tablet.
          Visit on a larger screen to drag, rotate, and export your own
          iteration.
        </p>
      </div>
    </div>
  )
}
