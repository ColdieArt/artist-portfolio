import type { Metadata } from 'next'
import ScrollReveal from '@/components/ScrollReveal'
import MintEmbed from '@/components/MintEmbed'
import drops from '@/data/mint-drops.json'

const drop = drops.find((d) => d.slug === 'shape-study')!

export const metadata: Metadata = {
  title: `${drop.name} — Mint | Tech Epochalypse`,
  description: drop.description,
  openGraph: {
    title: `${drop.name} — Mint`,
    description: drop.description,
  },
}

export default function ShapeStudyMintPage() {
  return (
    <div className="min-h-screen bg-void">
      {/* Header */}
      <section className="pt-28 md:pt-36 pb-16 section-padding">
        <div className="page-container">
          <ScrollReveal>
            <div className="text-center">
              <p className="font-mono text-xs uppercase tracking-[0.4em] text-white mb-4">
                Live Mint &mdash; {drop.chainName}
              </p>
              <h1 className="font-display text-4xl md:text-6xl text-white uppercase tracking-[0.05em] mt-4">
                {drop.name}
              </h1>
              <div className="flex items-center justify-center gap-3 mt-4">
                <div className="w-12 h-px bg-white/10" />
                <span className="font-mono text-[9px] text-white uppercase tracking-wider">
                  {drop.tokenStandard} &mdash; <span className="redacted">On-Chain</span>
                </span>
                <div className="w-12 h-px bg-white/10" />
              </div>
              <p className="font-mono text-sm text-white mt-6 max-w-2xl mx-auto leading-relaxed">
                {drop.description}
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="line-accent" />

      {/* Mint Section */}
      <section className="py-16 md:py-24 section-padding">
        <div className="page-container">
          <ScrollReveal>
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
              {/* Left: Mint embed */}
              <div className="flex-1">
                <div className="classified-header">
                  Active Drop &mdash; <span className="redacted">Mint Now</span>
                </div>
                <div className="mt-6 bg-charcoal/30 border border-white/5 p-6 md:p-8">
                  <MintEmbed
                    chainId={drop.chainId}
                    contractAddress={drop.contractAddress}
                    mintContractAddress={drop.mintContractAddress}
                    allowlistUrl={drop.allowlistUrl}
                    slug={drop.slug}
                    refreshInterval={drop.refreshInterval}
                  />
                </div>
              </div>

              {/* Right: Drop details */}
              <div className="lg:w-80 shrink-0">
                <div className="bg-charcoal/30 border border-white/5 p-6">
                  <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-white mb-6 border-b border-white/10 pb-3">
                    Drop Details
                  </h3>
                  <div className="space-y-5">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 mb-1">
                        Collection
                      </p>
                      <p className="font-display text-lg text-white">{drop.name}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 mb-1">
                        Artist
                      </p>
                      <p className="font-mono text-sm text-white">{drop.artist}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 mb-1">
                        Blockchain
                      </p>
                      <p className="font-mono text-sm text-white">{drop.chainName}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 mb-1">
                        Token Standard
                      </p>
                      <p className="font-mono text-sm text-white">{drop.tokenStandard}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 mb-1">
                        Protocol
                      </p>
                      <p className="font-mono text-sm text-white">Transient Labs</p>
                    </div>
                  </div>
                </div>

                {/* Contract info */}
                <div className="bg-charcoal/30 border border-white/5 p-6 mt-4">
                  <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-white mb-4 border-b border-white/10 pb-3">
                    Contract
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 mb-1">
                        Token Contract
                      </p>
                      <a
                        href={`https://basescan.org/address/${drop.contractAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[11px] text-white/70 hover:text-white break-all transition-colors"
                      >
                        {drop.contractAddress}
                      </a>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 mb-1">
                        Mint Contract
                      </p>
                      <a
                        href={`https://basescan.org/address/${drop.mintContractAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[11px] text-white/70 hover:text-white break-all transition-colors"
                      >
                        {drop.mintContractAddress}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="h-16" />
    </div>
  )
}
