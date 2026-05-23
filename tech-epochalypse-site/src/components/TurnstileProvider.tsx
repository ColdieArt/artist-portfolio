'use client'

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'

// Cloudflare Turnstile script + invisible widget shared across the page.
// Children call `useTurnstile().execute()` to get a fresh token on demand.

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''

// We deliberately don't extend the global Window.turnstile type here —
// InquiryForm.tsx declares a stricter version. Cast locally as needed.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ts(): any { return (typeof window !== 'undefined' ? (window as any).turnstile : undefined) }

type Ctx = {
  ready: boolean
  enabled: boolean
  execute: () => Promise<string>
}

const TurnstileContext = createContext<Ctx>({
  ready: false,
  enabled: false,
  execute: async () => { throw new Error('Turnstile not configured') },
})

export function useTurnstile() {
  return useContext(TurnstileContext)
}

export default function TurnstileProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const widgetIdRef = useRef<string | null>(null)
  const pendingRef = useRef<{ resolve: (t: string) => void; reject: (e: Error) => void } | null>(null)

  useEffect(() => {
    if (!SITE_KEY) return
    if (typeof window === 'undefined') return

    // Inject script once
    if (!document.querySelector('script[data-turnstile]')) {
      const s = document.createElement('script')
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      s.async = true
      s.defer = true
      s.setAttribute('data-turnstile', '1')
      document.head.appendChild(s)
    }

    // Host element for the invisible widget
    let host = document.getElementById('turnstile-host')
    if (!host) {
      host = document.createElement('div')
      host.id = 'turnstile-host'
      host.style.position = 'fixed'
      host.style.bottom = '-9999px'
      host.style.left = '-9999px'
      document.body.appendChild(host)
    }

    let cancelled = false
    const tryRender = () => {
      if (cancelled) return
      const t = ts()
      if (!t || !host) { setTimeout(tryRender, 200); return }
      try {
        widgetIdRef.current = t.render(host, {
          sitekey: SITE_KEY,
          // 'execute' appearance keeps the widget hidden until execute() is called.
          // Don't pass size: 'invisible' — Cloudflare removed it; valid sizes are
          // 'normal' | 'compact' | 'flexible'. Width is clamped via the offscreen
          // host element instead.
          appearance: 'execute',
          callback: (token: string) => {
            const p = pendingRef.current
            if (p) { pendingRef.current = null; p.resolve(token) }
          },
          'error-callback': () => {
            const p = pendingRef.current
            if (p) { pendingRef.current = null; p.reject(new Error('Turnstile error')) }
          },
          'expired-callback': () => {
            // Token expired — just no-op, next execute will fetch a fresh one.
          },
        })
        setReady(true)
      } catch (e) {
        console.warn('Turnstile render failed:', e)
        setTimeout(tryRender, 500)
      }
    }
    tryRender()

    return () => { cancelled = true }
  }, [])

  // Serialize execute() so back-to-back calls (or a click while one is in-flight)
  // share the same Turnstile execution instead of triggering "already executing".
  const inFlightRef = useRef<Promise<string> | null>(null)

  const execute = (): Promise<string> => {
    if (inFlightRef.current) return inFlightRef.current

    const p = new Promise<string>((resolve, reject) => {
      if (!SITE_KEY) { reject(new Error('Turnstile not configured')); return }
      if (!ts() || !widgetIdRef.current) { reject(new Error('Turnstile not ready')); return }

      pendingRef.current = {
        resolve: (t: string) => { inFlightRef.current = null; resolve(t) },
        reject: (e: Error) => { inFlightRef.current = null; reject(e) },
      }

      const startExecute = () => {
        try { ts().execute(widgetIdRef.current) }
        catch (err) {
          const p = pendingRef.current; pendingRef.current = null; inFlightRef.current = null
          if (p) p.reject(err as Error)
        }
      }

      // Reset clears any prior token. Give the widget a tick to settle before execute().
      try { ts().reset(widgetIdRef.current) } catch (_) { /* may not be resettable; ignore */ }
      setTimeout(startExecute, 50)

      // Safety timeout — 15s should be way more than enough.
      setTimeout(() => {
        if (pendingRef.current) {
          const p = pendingRef.current; pendingRef.current = null; inFlightRef.current = null
          p.reject(new Error('Turnstile timed out'))
        }
      }, 15000)
    })

    inFlightRef.current = p
    return p
  }

  const value: Ctx = { ready, enabled: !!SITE_KEY, execute }

  return <TurnstileContext.Provider value={value}>{children}</TurnstileContext.Provider>
}
