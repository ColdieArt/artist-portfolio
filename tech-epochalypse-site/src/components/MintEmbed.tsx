'use client'

interface MintEmbedProps {
  chainId: number
  contractAddress: string
  mintContractAddress: string
  allowlistUrl: string
  slug: string
  refreshInterval: number
}

export default function MintEmbed({
  chainId,
  contractAddress,
  mintContractAddress,
  allowlistUrl,
  slug,
  refreshInterval,
}: MintEmbedProps) {
  const html = `<tl-mint-page-721 chain-id="${chainId}" contract-address="${contractAddress}" mint-contract-address="${mintContractAddress}" allowlist-url="${allowlistUrl}" slug="${slug}" refresh-interval="${refreshInterval}"></tl-mint-page-721>`

  return (
    <div
      className="tl-mint-wrapper"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
