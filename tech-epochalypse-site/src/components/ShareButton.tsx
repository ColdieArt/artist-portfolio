'use client'

// One-click "share this piece on X" button.
//
// MOBILE: tries the Web Share API with the actual image attached as a file.
// On iOS/Android the system share sheet appears — picking X opens compose
// with the image already on the post (not just a link preview).
//
// DESKTOP / browsers without file-sharing: falls back to the X tweet-intent
// URL with a deep link to /share/<recordId>. The Vercel function at that
// route returns OG/Twitter card meta tags so X still renders a rich preview
// card with the artwork beneath the tweet text.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.knowyouroverlord.art'

interface Props {
  recordId: string
  title: string
  contributor: string
  imageUrl?: string
  size?: 'sm' | 'lg'
}

function buildTweetText(title: string, contributor: string) {
  const cleanContributor = contributor && contributor !== 'Anonymous' ? `by ${contributor}` : ''
  return `Voted for "${title}" ${cleanContributor} in @coldie's SUBJ:01 — The Singularity remix competition ⚡ Cast yours: #KnowYourOverlord`
    .replace(/\s+/g, ' ')
    .trim()
}

function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return false
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nav: any = navigator
  // Modern UA-Client-Hints API (Chrome/Edge/Android)
  if (nav.userAgentData && nav.userAgentData.mobile === true) return true
  const ua = navigator.userAgent || ''
  // Standard mobile UA sniff (Android Mobile, iPhone, iPad, etc.)
  if (/Android.*Mobile|iPhone|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)) return true
  // iPadOS 13+ identifies as Macintosh in UA but has touch — disambiguate via maxTouchPoints
  if (ua.includes('Macintosh') && (nav.maxTouchPoints || 0) > 1) return true
  // iPad with normal UA
  if (/iPad/i.test(ua)) return true
  return false
}

async function tryNativeShareWithImage(
  imageUrl: string | undefined,
  text: string,
  shareUrl: string,
  filename: string,
): Promise<boolean> {
  if (!imageUrl) return false
  if (typeof navigator === 'undefined') return false
  // Desktop browsers ALSO support navigator.share (macOS Safari opens the
  // system share sheet, Windows opens the share charm) — but X isn't a
  // first-class target in those sheets, so the result is worse than just
  // opening the X tweet-intent URL. Only use Web Share on real mobile.
  if (!isMobileDevice()) return false
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nav: any = navigator
  if (typeof nav.share !== 'function') return false

  // canShare with files is the right capability check; absence means the
  // mobile browser can't attach files (rare these days).
  let canShareFiles = false
  try {
    canShareFiles = typeof nav.canShare === 'function' && nav.canShare({ files: [new File([new Blob()], 'probe.jpg', { type: 'image/jpeg' })] })
  } catch { canShareFiles = false }
  if (!canShareFiles) return false

  try {
    // Fetch the image (must be CORS-permitted; Airtable thumbnails + our R2 worker URL both are).
    const resp = await fetch(imageUrl, { mode: 'cors' })
    if (!resp.ok) return false
    const blob = await resp.blob()
    const file = new File([blob], filename, { type: blob.type || 'image/jpeg' })
    const data: ShareData & { files?: File[] } = { text, url: shareUrl, files: [file] }
    if (typeof nav.canShare === 'function' && !nav.canShare(data)) return false
    await nav.share(data)
    return true
  } catch (err) {
    // User cancelled, or CORS, or share failed — fall back to intent URL.
    const e = err as Error
    if (e && e.name === 'AbortError') return true // user dismissed; don't open fallback
    console.warn('Web Share with image failed; falling back to intent URL:', e)
    return false
  }
}

function openTweetIntent(text: string, shareUrl: string) {
  const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`
  window.open(intent, '_blank', 'noopener,noreferrer')
}

export default function ShareButton({ recordId, title, contributor, imageUrl, size = 'sm' }: Props) {
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    const shareUrl = `${SITE_URL}/share/${recordId}`
    const text = buildTweetText(title, contributor)
    const filename = `subj01-${recordId}.jpg`

    const shared = await tryNativeShareWithImage(imageUrl, text, shareUrl, filename)
    if (!shared) openTweetIntent(text, shareUrl)
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
