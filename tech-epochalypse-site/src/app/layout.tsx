import type { Metadata } from 'next'
import Script from 'next/script'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import './globals.css'

export const metadata: Metadata = {
  title: 'KnowYourOverlord.art',
  description:
    'Five overlords. One network. Infinite iterations. An interactive digital art series featuring kinetic 3D portraits of technology\'s most influential figures.',
  keywords: ['digital art', 'NFT', 'interactive art', '3D', 'Coldie', 'Tech Epochalypse', 'crypto art'],
  openGraph: {
    title: 'KnowYourOverlord.art',
    description:
      'Five overlords. One network. Infinite iterations. Explore kinetic 3D portraits you can interact with, remix, and export.',
    type: 'website',
    siteName: 'KnowYourOverlord.art',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KnowYourOverlord.art',
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
      <head>
        <link
          rel="stylesheet"
          crossOrigin="anonymous"
          href="https://cdn.transientlabs.xyz/embeds/v1.7.0/index.css"
        />
      </head>
      <body className="bg-black text-bone">
        <Script id="tl-config" strategy="beforeInteractive">
          {`window.tlConfig = {
            mode: "dark",
            appName: "KnowYourOverlord.art",
            appDescription: "Tech Epochalypse by Coldie - Kinetic 3D Portraits",
            rpcUrls: { ethereum: "" }
          }`}
        </Script>
        <Script
          id="tl-embeds"
          src="https://cdn.transientlabs.xyz/embeds/v1.7.0/index.js"
          strategy="afterInteractive"
        />
        <div className="grain-overlay" />
        <div className="scanline" />
        <Navigation />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
