import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-void">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-display text-2xl text-white mb-4">
              Tech Epochalypse
            </h3>
            <p className="text-steel text-sm leading-relaxed max-w-xs">
              Five overlords. One network. Infinite iterations. An interactive
              digital art series by Coldie.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-[0.15em] text-silver mb-4">
              Navigate
            </h4>
            <div className="flex flex-col gap-3">
              {[
                { href: '/overlords', label: 'Overlords' },
                { href: '/gallery', label: 'Community Gallery' },
                { href: '/collectors', label: 'Patrons & Collectors' },
                { href: '/about', label: 'About' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-steel text-sm hover:text-neon-green transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-[0.15em] text-silver mb-4">
              Connect
            </h4>
            <div className="flex flex-col gap-3">
              <a
                href="https://twitter.com/Coldie"
                target="_blank"
                rel="noopener noreferrer"
                className="text-steel text-sm hover:text-neon-green transition-colors duration-300"
              >
                Twitter / X
              </a>
              <a
                href="https://instagram.com/coldie"
                target="_blank"
                rel="noopener noreferrer"
                className="text-steel text-sm hover:text-neon-green transition-colors duration-300"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="line-accent mt-12 mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-steel/50 text-xs font-mono">
            &copy; {new Date().getFullYear()} Coldie. All rights reserved.
          </p>
          <p className="text-steel/30 text-xs font-mono">
            Digital art, endlessly reimagined
          </p>
        </div>
      </div>
    </footer>
  )
}
