'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinks = [
  { href: '/overlords', label: 'Overlords' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/collectors', label: 'Collectors' },
  { href: '/about', label: 'About' },
]

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-void/90 backdrop-blur-md border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-16 md:h-20">
        <Link
          href="/"
          className="font-display text-lg md:text-xl tracking-wide text-white hover:text-neon-green transition-colors duration-300"
        >
          Tech Epochalypse
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-mono text-xs uppercase tracking-[0.15em] transition-colors duration-300 ${
                pathname === link.href || pathname?.startsWith(link.href + '/')
                  ? 'text-neon-green'
                  : 'text-steel hover:text-silver'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="Toggle menu"
        >
          <span
            className={`w-5 h-px bg-silver transition-all duration-300 ${
              mobileOpen ? 'rotate-45 translate-y-[3.5px]' : ''
            }`}
          />
          <span
            className={`w-5 h-px bg-silver transition-all duration-300 ${
              mobileOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`w-5 h-px bg-silver transition-all duration-300 ${
              mobileOpen ? '-rotate-45 -translate-y-[3.5px]' : ''
            }`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 bg-void/95 backdrop-blur-lg border-b border-white/5 transition-all duration-300 ${
          mobileOpen
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="flex flex-col py-6 px-6 gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-mono text-sm uppercase tracking-[0.15em] py-2 transition-colors duration-300 ${
                pathname === link.href
                  ? 'text-neon-green'
                  : 'text-steel hover:text-silver'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
