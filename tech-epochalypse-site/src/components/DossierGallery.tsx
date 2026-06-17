'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

interface DossierGalleryProps {
  /** Public-path image srcs for every competition entry, e.g. "/dossier/entries/0001.jpg" */
  images: string[]
}

// Deterministic pseudo-random rotation/offset per index so the "scattered
// evidence" look is stable across renders (no hydration mismatch) and never
// needs Math.random().
// Display label for an entry = its filename without the extension.
// Filenames are the artist handles (e.g. "@BoyaGeorge.jpeg" → "@BoyaGeorge").
function labelFromSrc(src: string) {
  const base = src.split('/').pop() ?? src
  return base.replace(/\.[^.]+$/, '')
}

function jitter(i: number) {
  const r = Math.sin(i * 12.9898) * 43758.5453
  const frac = r - Math.floor(r)
  // Round to 2 decimals so the serialized inline-style string is byte-identical
  // on server and client (avoids React hydration mismatch warnings).
  return {
    rot: Math.round((frac - 0.5) * 5 * 100) / 100, // -2.5deg .. 2.5deg
    pinLeft: Math.round((20 + Math.abs(Math.cos(i * 7.13)) * 60) * 100) / 100, // 20% .. 80%
  }
}

export default function DossierGallery({ images }: DossierGalleryProps) {
  const [active, setActive] = useState<number | null>(null)
  // Portal target — only available after mount (client). Guards SSR.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const close = useCallback(() => setActive(null), [])
  const go = useCallback(
    (dir: number) => {
      setActive((cur) => {
        if (cur === null) return cur
        return (cur + dir + images.length) % images.length
      })
    },
    [images.length]
  )

  useEffect(() => {
    if (active === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    // Lock scroll while the lightbox is open.
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [active, close, go])

  if (images.length === 0) {
    return (
      <div className="paper-sheet paper-fibre p-10 text-center">
        <p className="tw-label text-sm uppercase tracking-[0.2em] text-[#6b6450]">
          [ Awaiting evidence ] — drop entry images into
          <br />
          <code className="text-[#8c2b22]">public/dossier/entries/</code>
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Contact sheet — pinned photographic prints. */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-7">
        {images.map((src, i) => {
          const j = jitter(i)
          return (
            <button
              key={src}
              onClick={() => setActive(i)}
              className="group relative photo-print lift block focus:outline-none focus:ring-2 focus:ring-[#8c2b22]"
              style={{ transform: `rotate(${j.rot}deg)` }}
              aria-label={`Open entry ${i + 1}`}
            >
              {/* Push-pin */}
              <span
                className="absolute -top-2 z-10 -translate-x-1/2"
                style={{ left: `${j.pinLeft}%` }}
                aria-hidden
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="9" r="6" fill="#9a1f1f" />
                  <circle cx="10" cy="7" r="2" fill="#e87b7b" />
                  <rect x="11" y="13" width="2" height="8" fill="#5a5044" />
                </svg>
              </span>
              <div className="aspect-square overflow-hidden bg-[#0a0a0a]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`SUBJ:01 entry — ${labelFromSrc(src)}`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  style={{ filter: 'saturate(0.92) contrast(1.04)' }}
                />
              </div>
              <div className="pt-2 flex items-center justify-between gap-2">
                <span className="tw-label text-[10px] tracking-[0.05em] text-[#4a4537] truncate">
                  {labelFromSrc(src)}
                </span>
                <span className="tw-label text-[10px] text-[#9a1f1f] shrink-0">●</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Lightbox — portaled to <body> so `position: fixed` resolves against
          the viewport, not the transformed ScrollReveal ancestor. */}
      {active !== null && mounted && createPortal(
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/92 backdrop-blur-sm p-4 sm:p-10"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={close}
            className="absolute top-5 right-5 font-mono text-xs uppercase tracking-[0.2em] text-white/70 hover:text-white border border-white/20 hover:border-white px-4 py-2"
          >
            Close ✕
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              go(-1)
            }}
            className="absolute left-3 sm:left-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-3"
            aria-label="Previous"
          >
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
              <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <figure className="max-w-[88vw] max-h-[86vh] photo-print" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[active]}
              alt={`SUBJ:01 entry — ${labelFromSrc(images[active])}`}
              className="max-w-[84vw] max-h-[74vh] object-contain bg-[#0a0a0a]"
            />
            <figcaption className="pt-3 flex items-center justify-between gap-3">
              <span className="tw-label text-sm tracking-[0.05em] text-[#1c1a14] truncate">
                {labelFromSrc(images[active])}
              </span>
              <span className="tw-label text-[10px] uppercase tracking-[0.2em] text-[#8c2b22]">
                SUBJ:01 — Submission Record
              </span>
            </figcaption>
          </figure>

          <button
            onClick={(e) => {
              e.stopPropagation()
              go(1)
            }}
            className="absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-3"
            aria-label="Next"
          >
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
              <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>,
        document.body
      )}
    </>
  )
}
