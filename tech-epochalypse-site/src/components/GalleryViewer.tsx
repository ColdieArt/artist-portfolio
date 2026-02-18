'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export interface GalleryItem {
  id: string
  type: 'image' | 'video'
  src: string
  title: string
  contributor: string
  date: string
  overlord: string
}

interface Props {
  items: GalleryItem[]
  overlordNames: Record<string, string>
  overlordSlugs: string[]
}

/**
 * Cross-browser fullscreen helpers — handles webkit prefix for iOS Safari.
 */
function fsElement(): Element | null {
  if (typeof document === 'undefined') return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return document.fullscreenElement || (document as any).webkitFullscreenElement || null
}

async function fsRequest(el: HTMLElement): Promise<void> {
  if (el.requestFullscreen) {
    await el.requestFullscreen()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } else if ((el as any).webkitRequestFullscreen) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (el as any).webkitRequestFullscreen()
  }
}

function fsExit(): void {
  if (document.exitFullscreen) {
    document.exitFullscreen()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } else if ((document as any).webkitExitFullscreen) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(document as any).webkitExitFullscreen()
  }
}

export default function GalleryViewer({ items, overlordNames, overlordSlugs }: Props) {
  const [filter, setFilter] = useState<string>('all')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [slideshow, setSlideshow] = useState(false)
  const [slideshowFilter, setSlideshowFilter] = useState<string>('all')
  const [showSlideshowMenu, setShowSlideshowMenu] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)

  const lightboxOpen = lightboxIndex !== null

  const filtered = filter === 'all'
    ? items
    : items.filter((i) => i.overlord === filter)

  const slideshowItems = slideshowFilter === 'all'
    ? items
    : items.filter((i) => i.overlord === slideshowFilter)

  const activeList = slideshow ? slideshowItems : filtered

  // Keep a ref to activeList length so callbacks stay stable
  const activeListLenRef = useRef(activeList.length)
  activeListLenRef.current = activeList.length

  const slideshowItemsLenRef = useRef(slideshowItems.length)
  slideshowItemsLenRef.current = slideshowItems.length

  const goNext = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null) return null
      return (prev + 1) % activeListLenRef.current
    })
  }, [])

  const goPrev = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null) return null
      return (prev - 1 + activeListLenRef.current) % activeListLenRef.current
    })
  }, [])

  const goNextSlideshow = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null) return null
      return ((prev ?? 0) + 1) % slideshowItemsLenRef.current
    })
  }, [])

  const toggleFullscreen = useCallback(async () => {
    if (!dialogRef.current) return
    try {
      if (!fsElement()) {
        await fsRequest(dialogRef.current)
        setIsFullscreen(true)
      } else {
        fsExit()
        setIsFullscreen(false)
      }
    } catch {
      // Fullscreen not supported — ignore
    }
  }, [])

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null)
    setSlideshow(false)
    if (fsElement()) {
      try { fsExit() } catch { /* ignore */ }
    }
    setIsFullscreen(false)
  }, [])

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index)
    setSlideshow(false)
  }, [])

  const startSlideshow = useCallback((overlordFilter: string) => {
    setSlideshowFilter(overlordFilter)
    setShowSlideshowMenu(false)
    const pool = overlordFilter === 'all'
      ? items
      : items.filter((i) => i.overlord === overlordFilter)
    if (pool.length === 0) return
    setLightboxIndex(0)
    setSlideshow(true)
  }, [items])

  // Open/close the native <dialog> when lightbox state changes.
  // showModal() renders in the browser's top-layer — above all z-indexes.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (lightboxOpen && !dialog.open) {
      dialog.showModal()
    } else if (!lightboxOpen && dialog.open) {
      dialog.close()
    }
  }, [lightboxOpen])

  // Handle native dialog cancel (browser Escape key fires this)
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const onCancel = (e: Event) => {
      e.preventDefault()
      closeLightbox()
    }
    dialog.addEventListener('cancel', onCancel)
    return () => dialog.removeEventListener('cancel', onCancel)
  }, [closeLightbox])

  // Keyboard navigation (arrows, space, F key)
  useEffect(() => {
    if (!lightboxOpen) return

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        goNext()
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goPrev()
      }
      if (e.key === 'f') toggleFullscreen()
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxOpen, goNext, goPrev, toggleFullscreen])

  // Slideshow auto-advance
  useEffect(() => {
    if (!slideshow || !lightboxOpen) return
    const id = setInterval(goNextSlideshow, 4000)
    return () => clearInterval(id)
  }, [slideshow, lightboxOpen, goNextSlideshow])

  // Fullscreen change listener
  useEffect(() => {
    const handler = () => setIsFullscreen(!!fsElement())
    document.addEventListener('fullscreenchange', handler)
    document.addEventListener('webkitfullscreenchange', handler)
    return () => {
      document.removeEventListener('fullscreenchange', handler)
      document.removeEventListener('webkitfullscreenchange', handler)
    }
  }, [])

  const currentItem = lightboxIndex !== null ? activeList[lightboxIndex] : null

  return (
    <>
      {/* ── Filter Bar ── */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/30 mr-2">
          Filter:
        </span>
        <button
          onClick={() => setFilter('all')}
          className={`font-mono text-xs uppercase tracking-wider px-4 py-2 border transition-colors ${
            filter === 'all'
              ? 'border-white/30 text-white/70 bg-white/5'
              : 'border-white/5 text-white/25 hover:border-white/15 hover:text-white/45'
          }`}
        >
          All
        </button>
        {overlordSlugs.map((slug) => (
          <button
            key={slug}
            onClick={() => setFilter(slug)}
            className={`font-mono text-xs uppercase tracking-wider px-4 py-2 border transition-colors ${
              filter === slug
                ? 'border-white/30 text-white/70 bg-white/5'
                : 'border-white/5 text-white/25 hover:border-white/15 hover:text-white/45'
            }`}
          >
            {overlordNames[slug] ?? slug}
          </button>
        ))}
      </div>

      {/* ── Slideshow Button ── */}
      <div className="flex justify-center mb-10 relative">
        <div className="relative">
          <button
            onClick={() => setShowSlideshowMenu(!showSlideshowMenu)}
            className="btn-secondary flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            <span>Play Slideshow</span>
          </button>

          {/* Slideshow filter dropdown */}
          {showSlideshowMenu && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-black border border-white/15 z-50 min-w-[200px]">
              <button
                onClick={() => startSlideshow('all')}
                className="w-full text-left px-4 py-3 font-mono text-xs uppercase tracking-wider text-white/60 hover:bg-white/5 hover:text-white transition-colors border-b border-white/5"
              >
                All Overlords
              </button>
              {overlordSlugs.map((slug) => (
                <button
                  key={slug}
                  onClick={() => startSlideshow(slug)}
                  className="w-full text-left px-4 py-3 font-mono text-xs uppercase tracking-wider text-white/60 hover:bg-white/5 hover:text-white transition-colors border-b border-white/5 last:border-b-0"
                >
                  {overlordNames[slug] ?? slug}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Close slideshow menu on outside click */}
      {showSlideshowMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowSlideshowMenu(false)}
        />
      )}

      {/* ── Gallery Grid — 16:9 ── */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filtered.map((item, i) => (
            <button
              key={item.id}
              onClick={() => openLightbox(i)}
              className="group relative bg-charcoal/30 border border-white/5 overflow-hidden card-hover text-left cursor-pointer focus:outline-none focus:border-white/20"
            >
              <div className="aspect-video relative overflow-hidden bg-charcoal" style={{ aspectRatio: '16/9' }}>
                <img
                  src={item.src}
                  alt={item.title}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 opacity-70 group-hover:opacity-90"
                  loading="lazy"
                  style={{ filter: 'contrast(1.15)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 border border-white/40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                    </svg>
                  </div>
                </div>

                {/* Bottom info */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="font-mono text-sm text-white mb-1 truncate">
                    {item.title}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-white/40">
                      {item.contributor}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-white/25">
                      {overlordNames[item.overlord] ?? item.overlord}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-white/5">
          <p className="font-mono text-sm text-white/30">
            No pieces found for this filter.
          </p>
        </div>
      )}

      {/* ── Lightbox — native <dialog> renders in browser top-layer ── */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
      <dialog
        ref={dialogRef}
        className="lightbox-dialog"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeLightbox()
        }}
      >
        {currentItem && (
          <>
            {/* Top bar */}
            <div className="lightbox-bar" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                <p className="font-mono" style={{ fontSize: '13px', color: 'white', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentItem.title}
                </p>
                <span className="font-mono" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
                  by {currentItem.contributor}
                </span>
                {slideshow && (
                  <span className="font-mono" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '2px 8px' }}>
                    Slideshow
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                <span className="font-mono" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginRight: '8px' }}>
                  {lightboxIndex! + 1} / {activeList.length}
                </span>

                {/* Slideshow toggle */}
                <button
                  onClick={() => setSlideshow(!slideshow)}
                  style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer', color: slideshow ? 'white' : 'rgba(255,255,255,0.3)' }}
                  title={slideshow ? 'Stop slideshow' : 'Start slideshow'}
                >
                  {slideshow ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>

                {/* Fullscreen toggle */}
                <button
                  onClick={toggleFullscreen}
                  style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)' }}
                  title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                >
                  {isFullscreen ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                    </svg>
                  )}
                </button>

                {/* Close */}
                <button
                  onClick={closeLightbox}
                  style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', marginLeft: '4px' }}
                  title="Close (Esc)"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Image area — grid cell centers the image */}
            <div className="lightbox-image-area">
              {/* Previous button */}
              <button
                onClick={(e) => { e.stopPropagation(); goPrev() }}
                className="lightbox-nav lightbox-nav-prev"
                title="Previous (Left arrow)"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>

              {/* The image */}
              <img
                key={currentItem.id}
                src={currentItem.src}
                alt={currentItem.title}
                className="lightbox-img"
              />

              {/* Contributor overlay */}
              <span className="font-mono" style={{ position: 'absolute', bottom: '12px', right: '12px', fontSize: '11px', color: 'rgba(255,255,255,0.5)', background: 'rgba(0,0,0,0.6)', padding: '2px 8px', zIndex: 2 }}>
                {currentItem.contributor}
              </span>

              {/* Next button */}
              <button
                onClick={(e) => { e.stopPropagation(); goNext() }}
                className="lightbox-nav lightbox-nav-next"
                title="Next (Right arrow)"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>

              {/* Slideshow progress bar */}
              {slideshow && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'rgba(255,255,255,0.05)', zIndex: 2 }}>
                  <div className="lightbox-slideshow-bar" />
                </div>
              )}
            </div>

            {/* Bottom bar */}
            <div className="lightbox-bar" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span className="font-mono" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)' }}>
                  {overlordNames[currentItem.overlord] ?? currentItem.overlord}
                </span>
                <span className="font-mono" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>
                  {currentItem.date}
                </span>
              </div>
              <div className="font-mono" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.15)', display: 'flex', gap: '16px' }}>
                <span>Arrow keys to navigate</span>
                <span>F for fullscreen</span>
                <span>Esc to close</span>
              </div>
            </div>
          </>
        )}
      </dialog>

      {/* Lightbox styles — all in one place, no Tailwind dependencies for the modal */}
      <style jsx>{`
        .lightbox-dialog {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100dvh;
          max-width: none;
          max-height: none;
          margin: 0;
          padding: 0;
          border: none;
          background: black;
          color: white;
          overflow: hidden;
        }
        .lightbox-dialog::backdrop {
          background: black;
        }
        .lightbox-dialog[open] {
          display: grid;
          grid-template-rows: auto 1fr auto;
          animation: lightbox-fade-in 0.2s ease-out;
        }
        @keyframes lightbox-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .lightbox-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          background: rgba(0, 0, 0, 0.9);
          flex-shrink: 0;
        }
        @media (min-width: 768px) {
          .lightbox-bar {
            padding: 14px 32px;
          }
        }
        .lightbox-image-area {
          position: relative;
          display: grid;
          place-items: center;
          overflow: hidden;
          min-height: 0;
        }
        .lightbox-img {
          max-width: 100%;
          max-height: 100%;
          width: auto;
          height: auto;
          object-fit: contain;
          display: block;
          filter: contrast(1.1);
        }
        .lightbox-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 2;
          padding: 12px;
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.2);
          transition: color 0.2s;
        }
        .lightbox-nav:hover {
          color: rgba(255, 255, 255, 0.6);
        }
        .lightbox-nav-prev {
          left: 4px;
        }
        .lightbox-nav-next {
          right: 4px;
        }
        @media (min-width: 768px) {
          .lightbox-nav-prev { left: 24px; }
          .lightbox-nav-next { right: 24px; }
        }
        .lightbox-slideshow-bar {
          height: 100%;
          background: rgba(255, 255, 255, 0.3);
          animation: slideshow-progress 4s linear infinite;
        }
        @keyframes slideshow-progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </>
  )
}
