'use client'

// One-click "share this piece on X" button. Builds a tweet-intent URL with
// pre-filled copy + a deep link pointing at /share/<recordId>, which the
// Vercel function at /api/share/[recordId] renders with proper OG/Twitter
// meta tags so the X preview card shows the actual artwork.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.knowyouroverlord.art'

interface Props {
  recordId: string
  title: string
  contributor: string
  size?: 'sm' | 'lg'
}

export default function ShareButton({ recordId, title, contributor, size = 'sm' }: Props) {
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    const shareUrl = `${SITE_URL}/share/${recordId}`
    const cleanContributor = contributor && contributor !== 'Anonymous' ? `by ${contributor}` : ''
    const text = `Voted for "${title}" ${cleanContributor} in @coldie's SUBJ:01 — The Singularity remix competition ⚡ Cast yours: #KnowYourOverlord`
      .replace(/\s+/g, ' ')
      .trim()
    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`
    window.open(intent, '_blank', 'noopener,noreferrer')
  }

  const isLarge = size === 'lg'
  const px = isLarge ? '10px 14px' : '6px 10px'
  const iconSize = isLarge ? 14 : 11

  return (
    <button
      type="button"
      onClick={handleShare}
      title="Share this piece on X"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: px,
        background: 'rgba(0,0,0,0.55)',
        border: '1px solid rgba(255,255,255,0.2)',
        color: '#fff',
        fontFamily: 'monospace',
        cursor: 'pointer',
        transition: 'background 0.15s, border-color 0.15s',
        backdropFilter: 'blur(2px)',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.55)' }}
    >
      {/* X (Twitter) logo */}
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    </button>
  )
}
