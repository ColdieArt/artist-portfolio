'use client'

import { useState } from 'react'
import Link from 'next/link'
import ScrollReveal from '@/components/ScrollReveal'
import InquiryForm from '@/components/InquiryForm'
import overlords from '@/data/overlords.json'

const OPENSEA_COLLECTION_SLUG = 'tech-epochalypse-moments-decentral-eyes'
const OPENSEA_COLLECTION_URL = `https://opensea.io/collection/${OPENSEA_COLLECTION_SLUG}`

const KINETIC_3D_COLLECTION_SLUG = 'tech-epochalypse-by-coldie'
const KINETIC_3D_COLLECTION_URL = `https://opensea.io/collection/${KINETIC_3D_COLLECTION_SLUG}`
// Per-overlord Trail collection listing URLs (to be filled in)
const OVERLORD_COLLECT_URLS: Record<string, string> = {
  'elon-musk': 'https://opensea.io/collection/tech-epochalypse-moments-decentral-eyes?traits=[{%22traitType%22:%22Overlord%22,%22values%22:[%22Elon+Musk%22]}]',
  'mark-zuckerberg': 'https://opensea.io/collection/tech-epochalypse-moments-decentral-eyes?traits=%5B%7B%22traitType%22%3A%22Overlord%22%2C%22values%22%3A%5B%22Mark%20Zuckerberg%22%5D%7D%5D',
  'sam-altman': 'https://opensea.io/collection/tech-epochalypse-moments-decentral-eyes?traits=[{%22traitType%22:%22Overlord%22,%22values%22:[%22Sam+Altman%22]}]',
  'jeff-bezos': 'https://opensea.io/collection/tech-epochalypse-moments-decentral-eyes?traits=[{%22traitType%22:%22Overlord%22,%22values%22:[%22Jeff+Bezos%22]}]',
  'jensen-huang': 'https://opensea.io/collection/tech-epochalypse-moments-decentral-eyes?traits=[{%22traitType%22:%22Overlord%22,%22values%22:[%22Jensen+Huang%22]}]',
}

export default function SeriesPage() {
  const [inquiryOpen, setInquiryOpen] = useState(false)
  const [inquirySubject, setInquirySubject] = useState('Full Set')

  return (
    <div className="min-h-screen bg-void">
      {/* ── Header ── */}
      <section className="pt-28 md:pt-36 pb-16 section-padding">
        <div className="page-container">
          <ScrollReveal>
            <div className="text-center">
              <p className="font-mono text-xs uppercase tracking-[0.4em] text-white mb-4">
                Digital Art Collections
              </p>
              <h1 className="font-display text-4xl md:text-6xl text-white uppercase tracking-[0.05em] mt-4">
                The Series
              </h1>
              <div className="flex items-center justify-center gap-3 mt-4">
                <div className="w-12 h-px bg-white/10" />
                <span className="font-mono text-[9px] text-white uppercase tracking-wider">
                  Catalogued &mdash; <span className="redacted">On-Chain</span>
                </span>
                <div className="w-12 h-px bg-white/10" />
              </div>
              <p className="font-mono text-sm text-white mt-6 max-w-2xl mx-auto leading-relaxed">
                Each series within Tech Epochalypse lives on-chain as a permanent
                record. These are not prints. They are artifacts &mdash; kinetic
                stills captured from interactive 3D portraits, each one unique.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="line-accent" />

      {/* ── Main Series: Kinetic 3D Portraits ── */}
      <section className="py-16 md:py-24 section-padding">
        <div className="page-container">
          <ScrollReveal>
            <div className="classified-header">
              Primary Series &mdash;{' '}
              <span className="redacted">Kinetic 3D</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 mt-6">
              {/* Left: Series overview */}
              <div className="flex-1">
                <h2 className="font-display text-3xl md:text-4xl text-white uppercase tracking-[0.03em] mb-2">
                  Tech Epochalypse
                </h2>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50 mb-6">
                  Kinetic 3D Portraits &bull; Interactive &bull; Ethereum
                </p>

                <div className="space-y-4 text-white text-sm font-mono leading-relaxed max-w-xl">
                  <p>
                    The core of Tech Epochalypse &mdash; fully interactive kinetic
                    3D portraits of the five Overlords who shape our digital
                    reality. These are not static images. Each portrait is a
                    living, breathing composition that responds to the viewer.
                  </p>
                  <p>
                    Rotate, zoom, and explore each subject in real-time 3D.
                    Every angle reveals new detail, new critique, new commentary
                    on the systems of power built by these figures. The portraits
                    are the source material from which all other series are
                    derived.
                  </p>
                  <p>
                    Built by{' '}
                    <span className="text-white">Coldie</span>{' '}
                    as the definitive statement on tech power &mdash; the
                    Kinetic 3D series is the foundation of the entire
                    Epochalypse universe.
                  </p>
                </div>

                {/* CTA */}
                <div className="flex flex-wrap gap-4 mt-8">
                  <a
                    href={KINETIC_3D_COLLECTION_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-6 py-3 bg-white text-black font-mono text-sm uppercase tracking-[0.15em] hover:bg-white/90 transition-colors"
                  >
                    <svg width="20" height="20" viewBox="0 0 90 90" fill="currentColor">
                      <path d="M90 45C90 69.8514 69.8514 90 45 90C20.1486 90 0 69.8514 0 45C0 20.1486 20.1486 0 45 0C69.8566 0 90 20.1486 90 45Z" fill="currentColor" fillOpacity="0.1"/>
                      <path d="M22.2011 46.512L22.3953 46.2017L34.1016 27.8114C34.2726 27.5765 34.6587 27.5765 34.7961 27.8296C36.7867 31.6768 38.4988 36.3745 37.7577 39.3428C37.4357 40.6228 36.5261 42.3514 35.4971 43.9588C35.3479 44.234 35.1825 44.5036 35.0113 44.7614C34.9193 44.8988 34.7635 44.9801 34.5961 44.9801H22.5765C22.2997 44.9801 22.1337 44.7165 22.2011 46.512Z"/>
                      <path d="M74.38 49.9149V52.8236C74.38 52.987 74.2826 53.1314 74.1368 53.1986C73.191 53.6152 69.8426 55.1734 68.4894 57.007C65.0564 61.6986 62.4134 68.4078 56.9546 68.4078H34.4462C26.3468 68.4078 19.7812 61.8422 19.7812 53.7322V53.4806C19.7812 53.2556 19.9636 53.0732 20.1886 53.0732H33.3168C33.5754 53.0732 33.7688 53.3072 33.7468 53.5644C33.6548 54.4042 33.8336 55.2608 34.2726 56.0308C35.1308 57.5594 36.7208 58.4892 38.4328 58.4892H44.7266V53.5812H38.5076C38.2256 53.5812 38.0606 53.2682 38.2192 53.0416C38.2854 52.9368 38.3634 52.826 38.4504 52.6986C39.073 51.8026 39.9682 50.457 40.8582 48.922C41.4698 47.8592 42.0628 46.7118 42.536 45.5574C42.6448 45.3048 42.734 45.047 42.8236 44.7952C42.9716 44.3526 43.1242 43.9382 43.236 43.5238C43.3478 43.163 43.437 42.784 43.5266 42.4226C43.7888 41.217 43.9068 39.9474 43.9068 38.6408C43.9068 38.1266 43.8838 37.5936 43.8378 37.0796C43.8148 36.5106 43.7498 35.9416 43.6848 35.3726C43.642 34.8934 43.5584 34.4236 43.4748 33.937C43.3478 33.1924 43.1786 32.4534 42.986 31.731L42.9246 31.4944C42.7786 30.9672 42.6556 30.4578 42.4868 29.9306C41.9726 28.2186 41.3874 26.549 40.7642 24.985C40.5396 24.3984 40.2886 23.8314 40.0376 23.2646C39.6548 22.3728 39.2636 21.5574 38.9056 20.7888C38.7254 20.4408 38.5628 20.1228 38.4002 19.7954C38.2136 19.4224 38.017 19.0494 37.8304 18.699C37.6918 18.4346 37.5374 18.1878 37.4154 17.941L36.5934 16.5282C36.4614 16.3016 36.696 16.0342 36.9392 16.1142L43.58 18.2516H43.5984C43.6098 18.2516 43.6164 18.257 43.6214 18.257L44.5126 18.5284L45.4948 18.8304L45.8268 18.9282V15.0864C45.8268 13.3806 47.2056 12 48.9066 12C49.7572 12 50.524 12.3504 51.0714 12.9134C51.6188 13.4764 51.987 14.243 51.987 15.0864V20.5572L52.7082 20.7618C52.7644 20.7788 52.8184 20.8024 52.8666 20.838C53.0202 20.9498 53.2452 21.126 53.5266 21.345C53.7474 21.5304 53.9884 21.7524 54.2694 21.9864C54.829 22.4694 55.4828 23.0724 56.1854 23.7684C56.3822 23.9538 56.5736 24.1446 56.7652 24.3522C57.6826 25.3052 58.7278 26.42 59.714 27.6802C59.989 28.0422 60.2576 28.4096 60.5264 28.799C60.7954 29.1928 61.0818 29.5864 61.3338 29.98C61.6618 30.5014 62.0124 31.0416 62.3188 31.6008C62.4678 31.8712 62.6342 32.1504 62.7832 32.4208C63.1662 33.1152 63.4886 33.8252 63.7886 34.5352C63.9032 34.8132 64.0182 35.1134 64.11 35.4088C64.397 36.2106 64.6226 37.0308 64.7516 37.8688C64.7928 38.0654 64.8178 38.2788 64.8302 38.4868V38.5374C64.8706 38.8812 64.8876 39.2424 64.8876 39.6098C64.8876 40.8308 64.7196 42.0726 64.3502 43.2768C64.2042 43.7566 64.0296 44.2178 63.832 44.6904C63.6396 45.1464 63.4242 45.6192 63.1762 46.0722C62.8482 46.7148 62.4868 47.3398 62.0826 47.933C61.9402 48.1636 61.7738 48.405 61.6074 48.6356C61.4236 48.8836 61.2346 49.1204 61.057 49.3514C60.8148 49.6568 60.5616 49.9734 60.3026 50.261C60.0716 50.5664 59.835 50.8664 59.5804 51.1372C59.2198 51.5472 58.8698 51.9348 58.5028 52.3112C58.3132 52.5208 58.1102 52.7358 57.9074 52.9346C57.7102 53.1462 57.5076 53.3406 57.322 53.5236C57.0264 53.8118 56.7758 54.0468 56.5606 54.2456L55.9562 54.7994C55.8726 54.8722 55.7636 54.9124 55.6504 54.9124H51.987V58.4892H56.6858C57.7752 58.4892 58.808 58.1 59.6358 57.3936C59.9046 57.1548 61.3046 55.931 62.9652 54.2334C63.0178 54.1752 63.0866 54.1316 63.1662 54.1142L73.8378 51.0174C74.0976 50.9416 74.38 51.1354 74.38 49.9149Z"/>
                    </svg>
                    View Full Series on OpenSea
                  </a>
                </div>
              </div>

              {/* Right: Collect */}
              <div className="lg:w-96 shrink-0">
                <div className="bg-charcoal/30 border border-white/5 p-6">
                  <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-white mb-6 border-b border-white/10 pb-3">
                    Collection Overview
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-baseline">
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">Overlords</span>
                      <span className="font-display text-lg text-white">5</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">Editions / Overlord</span>
                      <span className="font-display text-lg text-white">10</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">Price</span>
                      <span className="font-display text-lg text-white">$6,000 <span className="font-mono text-[10px] text-white/50">(in ETH)</span></span>
                    </div>
                  </div>
                </div>

                {/* Full Sets */}
                <div className="bg-charcoal/30 border border-white/5 p-6 mt-4">
                  <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-white mb-4 border-b border-white/10 pb-3">
                    Full Sets
                  </h3>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-mono text-sm text-white">5 Total</span>
                    <span className="font-mono text-sm text-white">3 Available</span>
                  </div>
                  <p className="font-mono text-[10px] text-white/40 mb-5">
                    Set of 5 Overlords
                  </p>
                  <button
                    onClick={() => { setInquirySubject('Full Set'); setInquiryOpen(true) }}
                    className="block w-full text-center font-mono text-xs uppercase tracking-[0.15em] text-black bg-white px-4 py-3 hover:bg-white/90 transition-colors"
                  >
                    Inquire to Collect Full Set
                  </button>
                </div>

                {/* Individual Tokens */}
                <div className="bg-charcoal/30 border border-white/5 p-6 mt-4">
                  <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-white mb-4 border-b border-white/10 pb-3">
                    Individual Tokens
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-baseline">
                      <span className="font-mono text-sm text-white">Elon Musk</span>
                      <span className="font-mono text-[11px] text-white/60">5 ed. &mdash; <span className="text-white">2 avail</span></span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="font-mono text-sm text-white">Mark Zuckerberg</span>
                      <span className="font-mono text-[11px] text-white/60">5 ed. &mdash; <span className="text-white">3 avail</span></span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="font-mono text-sm text-white">Sam Altman</span>
                      <span className="font-mono text-[11px] text-white/60">5 ed. &mdash; <span className="text-white">4 avail</span></span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="font-mono text-sm text-white">Jensen Huang</span>
                      <span className="font-mono text-[11px] text-white/60">5 ed. &mdash; <span className="text-white">4 avail</span></span>
                    </div>
                  </div>
                  <div className="mt-5">
                    <a
                      href="https://gallery.transientlabs.xyz/shape-study"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center font-mono text-xs uppercase tracking-[0.15em] text-white border border-white/20 px-4 py-3 hover:bg-white/5 transition-colors"
                    >
                      View Available Individual Tokens
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="line-accent" />

      {/* ── Collection: Moments — Decentral Eyes ── */}
      <section className="py-16 md:py-24 section-padding">
        <div className="page-container">
          <ScrollReveal>
            <div className="classified-header">
              Series 001 &mdash;{' '}
              <span className="redacted">Active Collection</span>
            </div>
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 mt-6">
              {/* Left: Collection details */}
              <div className="flex-1">
                <h2 className="font-display text-3xl md:text-4xl text-white uppercase tracking-[0.03em] mb-2">
                  Tech Epochalypse Moments
                </h2>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50 mb-6">
                  Decentral Eyes &bull; 250 Items &bull; Ethereum
                </p>

                <div className="space-y-4 text-white text-sm font-mono leading-relaxed max-w-xl">
                  <p>
                    250 curated 1/1 stills from the kinetic 3D portrait series.
                    Each Moment is a still-frame capture from the interactive
                    Overlord portraits &mdash; frozen instances of a composition
                    that never sits still.
                  </p>
                  <p>
                    Built on the{' '}
                    <span className="text-white">
                      Transient Labs ERC-7160 token standard
                    </span>
                    , these pieces critique tech power, blockchain, and the
                    systems shaping modern life. Five subjects. Five nodes. 250
                    fragments of the network, scattered across collectors
                    worldwide.
                  </p>
                  <p>
                    Coldie created this series to start the conversation about
                    what we are getting (and giving away) in trade for the
                    technology we have become dependent upon.
                  </p>
                </div>

                {/* CTA buttons */}
                <div className="flex flex-wrap gap-4 mt-8">
                  <a
                    href={OPENSEA_COLLECTION_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-6 py-3 bg-white text-black font-mono text-sm uppercase tracking-[0.15em] hover:bg-white/90 transition-colors"
                  >
                    <svg width="20" height="20" viewBox="0 0 90 90" fill="currentColor">
                      <path d="M90 45C90 69.8514 69.8514 90 45 90C20.1486 90 0 69.8514 0 45C0 20.1486 20.1486 0 45 0C69.8566 0 90 20.1486 90 45Z" fill="currentColor" fillOpacity="0.1"/>
                      <path d="M22.2011 46.512L22.3953 46.2017L34.1016 27.8114C34.2726 27.5765 34.6587 27.5765 34.7961 27.8296C36.7867 31.6768 38.4988 36.3745 37.7577 39.3428C37.4357 40.6228 36.5261 42.3514 35.4971 43.9588C35.3479 44.234 35.1825 44.5036 35.0113 44.7614C34.9193 44.8988 34.7635 44.9801 34.5961 44.9801H22.5765C22.2997 44.9801 22.1337 44.7165 22.2011 46.512Z"/>
                      <path d="M74.38 49.9149V52.8236C74.38 52.987 74.2826 53.1314 74.1368 53.1986C73.191 53.6152 69.8426 55.1734 68.4894 57.007C65.0564 61.6986 62.4134 68.4078 56.9546 68.4078H34.4462C26.3468 68.4078 19.7812 61.8422 19.7812 53.7322V53.4806C19.7812 53.2556 19.9636 53.0732 20.1886 53.0732H33.3168C33.5754 53.0732 33.7688 53.3072 33.7468 53.5644C33.6548 54.4042 33.8336 55.2608 34.2726 56.0308C35.1308 57.5594 36.7208 58.4892 38.4328 58.4892H44.7266V53.5812H38.5076C38.2256 53.5812 38.0606 53.2682 38.2192 53.0416C38.2854 52.9368 38.3634 52.826 38.4504 52.6986C39.073 51.8026 39.9682 50.457 40.8582 48.922C41.4698 47.8592 42.0628 46.7118 42.536 45.5574C42.6448 45.3048 42.734 45.047 42.8236 44.7952C42.9716 44.3526 43.1242 43.9382 43.236 43.5238C43.3478 43.163 43.437 42.784 43.5266 42.4226C43.7888 41.217 43.9068 39.9474 43.9068 38.6408C43.9068 38.1266 43.8838 37.5936 43.8378 37.0796C43.8148 36.5106 43.7498 35.9416 43.6848 35.3726C43.642 34.8934 43.5584 34.4236 43.4748 33.937C43.3478 33.1924 43.1786 32.4534 42.986 31.731L42.9246 31.4944C42.7786 30.9672 42.6556 30.4578 42.4868 29.9306C41.9726 28.2186 41.3874 26.549 40.7642 24.985C40.5396 24.3984 40.2886 23.8314 40.0376 23.2646C39.6548 22.3728 39.2636 21.5574 38.9056 20.7888C38.7254 20.4408 38.5628 20.1228 38.4002 19.7954C38.2136 19.4224 38.017 19.0494 37.8304 18.699C37.6918 18.4346 37.5374 18.1878 37.4154 17.941L36.5934 16.5282C36.4614 16.3016 36.696 16.0342 36.9392 16.1142L43.58 18.2516H43.5984C43.6098 18.2516 43.6164 18.257 43.6214 18.257L44.5126 18.5284L45.4948 18.8304L45.8268 18.9282V15.0864C45.8268 13.3806 47.2056 12 48.9066 12C49.7572 12 50.524 12.3504 51.0714 12.9134C51.6188 13.4764 51.987 14.243 51.987 15.0864V20.5572L52.7082 20.7618C52.7644 20.7788 52.8184 20.8024 52.8666 20.838C53.0202 20.9498 53.2452 21.126 53.5266 21.345C53.7474 21.5304 53.9884 21.7524 54.2694 21.9864C54.829 22.4694 55.4828 23.0724 56.1854 23.7684C56.3822 23.9538 56.5736 24.1446 56.7652 24.3522C57.6826 25.3052 58.7278 26.42 59.714 27.6802C59.989 28.0422 60.2576 28.4096 60.5264 28.799C60.7954 29.1928 61.0818 29.5864 61.3338 29.98C61.6618 30.5014 62.0124 31.0416 62.3188 31.6008C62.4678 31.8712 62.6342 32.1504 62.7832 32.4208C63.1662 33.1152 63.4886 33.8252 63.7886 34.5352C63.9032 34.8132 64.0182 35.1134 64.11 35.4088C64.397 36.2106 64.6226 37.0308 64.7516 37.8688C64.7928 38.0654 64.8178 38.2788 64.8302 38.4868V38.5374C64.8706 38.8812 64.8876 39.2424 64.8876 39.6098C64.8876 40.8308 64.7196 42.0726 64.3502 43.2768C64.2042 43.7566 64.0296 44.2178 63.832 44.6904C63.6396 45.1464 63.4242 45.6192 63.1762 46.0722C62.8482 46.7148 62.4868 47.3398 62.0826 47.933C61.9402 48.1636 61.7738 48.405 61.6074 48.6356C61.4236 48.8836 61.2346 49.1204 61.057 49.3514C60.8148 49.6568 60.5616 49.9734 60.3026 50.261C60.0716 50.5664 59.835 50.8664 59.5804 51.1372C59.2198 51.5472 58.8698 51.9348 58.5028 52.3112C58.3132 52.5208 58.1102 52.7358 57.9074 52.9346C57.7102 53.1462 57.5076 53.3406 57.322 53.5236C57.0264 53.8118 56.7758 54.0468 56.5606 54.2456L55.9562 54.7994C55.8726 54.8722 55.7636 54.9124 55.6504 54.9124H51.987V58.4892H56.6858C57.7752 58.4892 58.808 58.1 59.6358 57.3936C59.9046 57.1548 61.3046 55.931 62.9652 54.2334C63.0178 54.1752 63.0866 54.1316 63.1662 54.1142L73.8378 51.0174C74.0976 50.9416 74.38 51.1354 74.38 49.9149Z"/>
                    </svg>
                    View on OpenSea
                  </a>
                </div>
              </div>

              {/* Right: Details */}
              <div className="lg:w-80 shrink-0">

                {/* Blockchain details */}
                <div className="bg-charcoal/30 border border-white/5 p-6 mt-4">
                  <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-white mb-4 border-b border-white/10 pb-3">
                    On-Chain Details
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 mb-1">
                        Blockchain
                      </p>
                      <p className="font-mono text-sm text-white">Ethereum</p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 mb-1">
                        Token Standard
                      </p>
                      <p className="font-mono text-sm text-white">ERC-7160</p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 mb-1">
                        Protocol
                      </p>
                      <p className="font-mono text-sm text-white">
                        Transient Labs
                      </p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 mb-1">
                        Supply
                      </p>
                      <p className="font-mono text-sm text-white">
                        250 &times; 1/1
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="line-accent" />

      {/* ── Overlord Breakdown ── */}
      <section className="py-16 md:py-24 section-padding">
        <div className="page-container">
          <ScrollReveal>
            <div className="mb-12">
              <div className="classified-header">
                Network Nodes &mdash;{' '}
                <span className="redacted">Five Subjects</span>
              </div>
              <h2 className="font-display text-2xl md:text-3xl text-white uppercase tracking-[0.03em]">
                The Five Overlords
              </h2>
              <p className="font-mono text-sm text-white/70 leading-relaxed mt-4 max-w-xl">
                Each Overlord is a fully interactive kinetic 3D portrait. The
                Moments collection captures 50 unique stills from each subject
                &mdash; 250 fragments total.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {overlords.map((overlord, i) => (
              <ScrollReveal key={overlord.slug} delay={i * 100}>
                <div className="group relative bg-charcoal/30 border border-white/5 hover:border-white/10 overflow-hidden transition-all duration-500">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={overlord.previewImage}
                      alt={overlord.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      style={{ filter: 'grayscale(1) contrast(1.1)' }}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60 mb-1">
                        Node {overlord.number}
                      </p>
                      <h3 className="font-display text-lg text-white uppercase tracking-[0.03em]">
                        {overlord.name}
                      </h3>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-white/50">
                        {overlord.title}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col gap-2">
                    <p className="font-mono text-[10px] text-white/40 uppercase tracking-wider">
                      50 Moments
                    </p>
                    <div className="flex gap-2">
                      <Link
                        href={`/overlords/${overlord.slug}`}
                        className="flex-1 text-center font-mono text-[10px] uppercase tracking-wider text-white border border-white/10 px-3 py-2 hover:bg-white/5 transition-colors"
                      >
                        Interact
                      </Link>
                      {OVERLORD_COLLECT_URLS[overlord.slug] ? (
                        <a
                          href={OVERLORD_COLLECT_URLS[overlord.slug]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-center font-mono text-[10px] uppercase tracking-wider text-black bg-white px-3 py-2 hover:bg-white/90 transition-colors"
                        >
                          Collect
                        </a>
                      ) : (
                        <a
                          href={`${OPENSEA_COLLECTION_URL}?search[stringTraits][0][name]=Overlord&search[stringTraits][0][values][0]=${encodeURIComponent(overlord.name)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-center font-mono text-[10px] uppercase tracking-wider text-black bg-white px-3 py-2 hover:bg-white/90 transition-colors"
                        >
                          Collect
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <div className="line-accent" />

      {/* ── Collect CTA ── */}
      <section className="py-16 md:py-24 section-padding">
        <div className="page-container text-center">
          <ScrollReveal>
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-white mb-6">
              Join the Network
            </p>
            <h2 className="font-display text-3xl md:text-5xl text-white mb-6 uppercase tracking-[0.03em]">
              Collect a Moment
            </h2>
            <p className="text-white text-sm font-mono max-w-lg mx-auto mb-8 leading-relaxed">
              Own a fragment of the Epochalypse. Each Moment is a unique 1/1
              artifact &mdash; a still from a kinetic portrait that never stops
              moving.
            </p>
            <a
              href={OPENSEA_COLLECTION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-mono text-sm uppercase tracking-[0.2em] hover:bg-white/90 transition-colors"
            >
              Browse Collection on OpenSea
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </ScrollReveal>
        </div>
      </section>

      <div className="h-16" />

      <InquiryForm
        open={inquiryOpen}
        onClose={() => setInquiryOpen(false)}
        subject={inquirySubject}
      />
    </div>
  )
}
