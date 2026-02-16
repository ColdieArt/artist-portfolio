import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tech Epochalypse — Interactive Digital Art by Coldie',
  description:
    'Five overlords. One network. Infinite iterations. An interactive digital art series featuring kinetic 3D portraits of technology\'s most influential figures.',
  keywords: ['digital art', 'NFT', 'interactive art', '3D', 'Coldie', 'Tech Epochalypse', 'crypto art'],
  openGraph: {
    title: 'Tech Epochalypse — Interactive Digital Art by Coldie',
    description:
      'Five overlords. One network. Infinite iterations. Explore kinetic 3D portraits you can interact with, remix, and export.',
    type: 'website',
    siteName: 'Tech Epochalypse',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tech Epochalypse — Interactive Digital Art by Coldie',
    description:
      'Five overlords. One network. Infinite iterations.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="grain-overlay" />
        <div className="scanline" />
        <Navigation />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
