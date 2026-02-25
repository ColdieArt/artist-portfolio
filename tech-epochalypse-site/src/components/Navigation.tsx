'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinks = [
  { href: '/overlords', label: 'OVERLORDS' },
  { href: '/series', label: 'SERIES' },
  { href: '/mainframe', label: 'MAINFRAME' },
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
        mobileOpen
          ? 'bg-black border-b border-white/5'
          : scrolled
            ? 'bg-black/95 backdrop-blur-sm border-b border-white/5'
            : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-14 md:h-16">
        <div className="flex items-center gap-4 md:gap-6">
          <Link
            href="/"
            className="font-display text-base md:text-lg tracking-[0.15em] text-white hover:text-white transition-colors duration-300 uppercase"
          >
            Tech Epochalypse
          </Link>
          <span className="hidden md:inline text-white/20">|</span>
          <Link
            href="/overlords"
            className="hidden md:inline font-mono text-[10px] uppercase tracking-[0.2em] text-white hover:text-white transition-colors duration-300"
          >
            Kinetic 3D Experience
          </Link>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/mainframe#exploits"
            className="font-mono text-xs uppercase tracking-[0.2em] bg-white text-black px-3 py-1 hover:bg-white/90 transition-colors duration-300"
          >
            Current Exploit
          </Link>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-mono text-xs uppercase tracking-[0.2em] transition-colors duration-300 ${
                pathname === link.href || pathname?.startsWith(link.href + '/')
                  ? 'text-white'
                  : 'text-white'
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
            className={`w-5 h-px bg-white transition-all duration-300 ${
              mobileOpen ? 'rotate-45 translate-y-[3.5px]' : ''
            }`}
          />
          <span
            className={`w-5 h-px bg-white transition-all duration-300 ${
              mobileOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`w-5 h-px bg-white transition-all duration-300 ${
              mobileOpen ? '-rotate-45 -translate-y-[3.5px]' : ''
            }`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden fixed inset-0 top-14 bg-black transition-all duration-300 ${
          mobileOpen
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="flex flex-col py-6 px-6 gap-4">
          <Link
            href="/mainframe#exploits"
            className="font-mono text-sm uppercase tracking-[0.2em] bg-white text-black px-3 py-2 inline-block w-fit hover:bg-white/90 transition-colors duration-300"
          >
            Current Exploit
          </Link>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-mono text-sm uppercase tracking-[0.2em] py-2 transition-colors duration-300 ${
                pathname === link.href
                  ? 'text-white'
                  : 'text-white'
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
