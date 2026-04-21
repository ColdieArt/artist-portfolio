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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.transientlabs.xyz" />
        <link rel="preconnect" href="https://cdn.transientlabs.xyz" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Special+Elite&family=Black+Ops+One&display=swap"
        />
      </head>
      <body className="bg-black text-bone">
        <Script id="tl-css" strategy="afterInteractive">
          {`var l=document.createElement('link');l.rel='stylesheet';l.crossOrigin='anonymous';l.href='https://cdn.transientlabs.xyz/embeds/v1.7.0/index.css';document.head.appendChild(l);`}
        </Script>
        <Script id="tl-config" strategy="afterInteractive">
          {`window.tlConfig = {
            mode: "dark",
            appName: "KnowYourOverlord.art",
            appDescription: "Tech Epochalypse by Coldie - Kinetic 3D Portraits",
            rpcUrls: { ethereum: "" }
          }`}
        </Script>
        <Script id="tl-embeds" strategy="lazyOnload">
          {`var s=document.createElement('script');s.type='module';s.src='https://cdn.transientlabs.xyz/embeds/v1.7.0/index.js';document.body.appendChild(s);`}
        </Script>
        <div className="grain-overlay" />
        <div className="scanline" />
        <Navigation />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
