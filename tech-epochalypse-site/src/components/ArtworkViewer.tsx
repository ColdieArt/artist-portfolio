'use client'

interface Overlord {
  slug: string
  name: string
  number: string
  artworkFile: string | null
  previewImage: string | null
}

export default function ArtworkViewer({ overlord }: { overlord: Overlord }) {
  if (!overlord.artworkFile) return null

  return (
    <div className="w-full flex flex-col items-center justify-center py-16 px-6">
      <a
        href={overlord.artworkFile}
        className="group relative inline-flex items-center gap-3 px-8 py-4 border border-white/20 hover:border-white/50 text-white/70 hover:text-white font-mono text-sm uppercase tracking-[0.2em] transition-all duration-300 hover:bg-white/5"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="transition-transform group-hover:scale-110">
          <path d="M5 3l14 9-14 9V3z" fill="currentColor" />
        </svg>
        LAUNCH KINETIC 3D ARTWORK
      </a>
      <p className="mt-4 font-mono text-[10px] text-white/15 tracking-wider uppercase">
        Opens as full-page experience &mdash; drag, rotate, export
      </p>
    </div>
  )
}
