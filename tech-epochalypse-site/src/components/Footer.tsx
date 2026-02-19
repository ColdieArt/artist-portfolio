import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-black">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-display text-xl text-white mb-4 uppercase tracking-[0.1em]">
              Tech Epochalypse
            </h3>
            <p className="text-white text-sm font-mono leading-relaxed max-w-xs">
              Five overlords. One network. Infinite iterations.
              <br />
              An interactive digital art series by{' '}
              <span className="text-white">Coldie</span>.
            </p>
            <div className="mt-4 font-mono text-xs text-white uppercase tracking-[0.15em]">
              Classification: <span className="redacted-white">LEVEL 5</span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-white mb-4 border-b border-white/10 pb-2">
              Navigate
            </h4>
            <div className="flex flex-col gap-3">
              {[
                { href: '/overlords', label: 'Overlords' },
                { href: '/mainframe', label: 'Mainframe' },
                { href: '/collectors', label: 'Collectors' },
                { href: '/about', label: 'Dossier' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-white text-sm font-mono hover:text-white transition-colors duration-300 uppercase tracking-wider"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-white mb-4 border-b border-white/10 pb-2">
              Connect
            </h4>
            <div className="flex flex-col gap-3">
              <a
                href="https://twitter.com/Coldie"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white text-sm font-mono hover:text-white transition-colors duration-300 uppercase tracking-wider"
              >
                Twitter / X
              </a>
              <a
                href="https://instagram.com/coldie"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white text-sm font-mono hover:text-white transition-colors duration-300 uppercase tracking-wider"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="line-accent mt-12 mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white text-xs font-mono uppercase tracking-wider">
            &copy; {new Date().getFullYear()} Coldie. All rights reserved.
          </p>
          <p className="text-white text-xs font-mono uppercase tracking-wider">
            Digital art, endlessly reimagined
          </p>
        </div>
      </div>
    </footer>
  )
}
