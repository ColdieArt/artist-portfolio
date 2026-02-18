'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (el?: HTMLElement) => void
      }
    }
  }
}

interface TwitterFeedProps {
  handle: string
  name: string
}

export default function TwitterFeed({ handle, name }: TwitterFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://platform.twitter.com/widgets.js'
    script.async = true
    script.charset = 'utf-8'

    script.onload = () => {
      if (window.twttr && containerRef.current) {
        window.twttr.widgets.load(containerRef.current)
      }
    }

    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [handle])

  return (
    <div ref={containerRef} className="twitter-feed-wrapper">
      <a
        className="twitter-timeline"
        data-tweet-limit="5"
        data-theme="dark"
        data-chrome="noheader nofooter noborders transparent"
        data-link-color="#ffffff"
        href={`https://x.com/${handle}`}
      >
        Loading posts by @{handle}...
      </a>
    </div>
  )
}
