'use client'

import { useEffect, useRef, type ReactNode } from 'react'

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  delay?: number
}

export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Check if element is already in viewport on mount (e.g. after
    // client-side navigation). Without this, content stays invisible
    // because IntersectionObserver may not fire for elements that are
    // already visible when the observer is first created.
    const rect = el.getBoundingClientRect()
    const alreadyVisible =
      rect.top < window.innerHeight && rect.bottom > 0

    if (alreadyVisible) {
      setTimeout(() => {
        el.classList.add('visible')
      }, delay)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.classList.add('visible')
          }, delay)
          observer.unobserve(el)
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px 50px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  )
}
