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
  const lightboxRef = useRef<HTMLDivElement>(null)

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
    if (!lightboxRef.current) return
    try {
      if (!fsElement()) {
        await fsRequest(lightboxRef.current)
        setIsFullscreen(true)
      } else {
        fsExit()
        setIsFullscreen(false)
      }
    } catch {
      // Fullscreen not supported (e.g. some mobile browsers) — ignore
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

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
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
  }, [lightboxOpen, closeLightbox, goNext, goPrev, toggleFullscreen])

  // Slideshow auto-advance
  useEffect(() => {
    if (!slideshow || !lightboxOpen) return
    const id = setInterval(goNextSlideshow, 4000)
    return () => clearInterval(id)
  }, [slideshow, lightboxOpen, goNextSlideshow])

  // Fullscreen change listener — only updates the flag, does NOT close lightbox
  useEffect(() => {
    const handler = () => setIsFullscreen(!!fsElement())
    document.addEventListener('fullscreenchange', handler)
    document.addEventListener('webkitfullscreenchange', handler)
    return () => {
      document.removeEventListener('fullscreenchange', handler)
      document.removeEventListener('webkitfullscreenchange', handler)
    }
  }, [])

  // Lock body scroll when lightbox is open — use position:fixed to truly
  // prevent scroll on mobile, preserving the scroll position for restore.
  const savedScrollY = useRef(0)
  useEffect(() => {
    if (lightboxOpen) {
      savedScrollY.current = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${savedScrollY.current}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.overflow = ''
      window.scrollTo(0, savedScrollY.current)
    }
    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.overflow = ''
    }
  }, [lightboxOpen])

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

      {/* ── Lightbox Modal ── */}
      {lightboxIndex !== null && currentItem && (
        <div
          ref={lightboxRef}
          className="fixed inset-0 z-[9999] bg-black flex flex-col"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLightbox()
          }}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 md:px-8 py-3 md:py-4 bg-black/90 border-b border-white/5 shrink-0">
            <div className="flex items-center gap-2 md:gap-4 min-w-0">
              <p className="font-mono text-xs md:text-sm text-white truncate">
                {currentItem.title}
              </p>
              <span className="font-mono text-xs text-white/30 hidden md:inline">
                by {currentItem.contributor}
              </span>
              {slideshow && (
                <span className="font-mono text-[10px] uppercase tracking-wider text-white/20 bg-white/5 border border-white/10 px-2 py-0.5">
                  Slideshow
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 md:gap-2 shrink-0">
              <span className="font-mono text-[10px] md:text-xs text-white/25 mr-1 md:mr-2">
                {lightboxIndex + 1} / {activeList.length}
              </span>

              {/* Slideshow toggle */}
              <button
                onClick={() => setSlideshow(!slideshow)}
                className={`p-2 transition-colors ${
                  slideshow ? 'text-white' : 'text-white/30 hover:text-white/60'
                }`}
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

              {/* Fullscreen toggle — hidden on mobile where it's unsupported */}
              <button
                onClick={toggleFullscreen}
                className="p-2 text-white/30 hover:text-white/60 transition-colors hidden md:block"
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
                className="p-2 text-white/30 hover:text-white/60 transition-colors ml-1 md:ml-2"
                title="Close (Esc)"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Image area */}
          <div className="flex-1 min-h-0 flex items-center justify-center relative overflow-hidden">
            {/* Previous button */}
            <button
              onClick={(e) => { e.stopPropagation(); goPrev() }}
              className="absolute left-1 md:left-6 z-10 p-3 text-white/20 hover:text-white/60 transition-colors"
              title="Previous (Left arrow)"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            {/* Image — 100% width, vertically centered */}
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={currentItem.src}
                alt={currentItem.title}
                className="w-full h-auto object-contain transition-opacity duration-300"
                style={{ filter: 'contrast(1.1)' }}
              />
              {/* Contributor name overlay */}
              <span className="absolute bottom-3 right-3 font-mono text-xs text-white/50 bg-black/60 px-2 py-1">
                {currentItem.contributor}
              </span>
            </div>

            {/* Next button */}
            <button
              onClick={(e) => { e.stopPropagation(); goNext() }}
              className="absolute right-1 md:right-6 z-10 p-3 text-white/20 hover:text-white/60 transition-colors"
              title="Next (Right arrow)"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>

            {/* Slideshow progress bar */}
            {slideshow && (
              <div className="absolute bottom-0 left-0 right-0 h-px bg-white/5">
                <div
                  className="h-full bg-white/30"
                  style={{
                    animation: 'slideshowProgress 4s linear infinite',
                  }}
                />
              </div>
            )}
          </div>

          {/* Bottom info */}
          <div className="flex items-center justify-between px-4 md:px-8 py-2 md:py-3 bg-black/90 border-t border-white/5 shrink-0">
            <div className="flex items-center gap-3 md:gap-4">
              <span className="font-mono text-[10px] md:text-xs uppercase tracking-wider text-white/30">
                {overlordNames[currentItem.overlord] ?? currentItem.overlord}
              </span>
              <span className="font-mono text-[10px] md:text-xs text-white/20">
                {currentItem.date}
              </span>
            </div>
            <div className="font-mono text-[10px] text-white/15 hidden md:flex items-center gap-4">
              <span>Arrow keys to navigate</span>
              <span>F for fullscreen</span>
              <span>Esc to close</span>
            </div>
          </div>
        </div>
      )}

      {/* Slideshow progress keyframe */}
      <style jsx>{`
        @keyframes slideshowProgress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </>
  )
}
