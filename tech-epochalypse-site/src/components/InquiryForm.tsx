'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string
          callback: (token: string) => void
          'expired-callback'?: () => void
          'error-callback'?: () => void
          theme?: 'light' | 'dark' | 'auto'
          size?: 'normal' | 'compact'
        }
      ) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
  }
}

interface InquiryFormProps {
  open: boolean
  onClose: () => void
  subject?: string
}

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'
const CONTACT_API_URL = process.env.NEXT_PUBLIC_CONTACT_API_URL || ''

export default function InquiryForm({ open, onClose, subject }: InquiryFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [inquiryType, setInquiryType] = useState(subject || 'Full Set')
  const [turnstileToken, setTurnstileToken] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const turnstileRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // Load Turnstile script
  useEffect(() => {
    if (document.getElementById('cf-turnstile-script')) return
    const script = document.createElement('script')
    script.id = 'cf-turnstile-script'
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad'
    script.async = true
    document.head.appendChild(script)
  }, [])

  // Render Turnstile widget when modal opens
  const renderWidget = useCallback(() => {
    if (!turnstileRef.current || !window.turnstile) return
    if (widgetIdRef.current) {
      window.turnstile.remove(widgetIdRef.current)
      widgetIdRef.current = null
    }
    widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      callback: (token: string) => setTurnstileToken(token),
      'expired-callback': () => setTurnstileToken(''),
      'error-callback': () => setTurnstileToken(''),
      theme: 'dark',
    })
  }, [])

  useEffect(() => {
    if (!open) return

    // Reset form state when opening
    setStatus('idle')
    setErrorMsg('')
    setTurnstileToken('')
    if (subject) setInquiryType(subject)

    // Wait for Turnstile to be available, then render
    const interval = setInterval(() => {
      if (window.turnstile && turnstileRef.current) {
        renderWidget()
        clearInterval(interval)
      }
    }, 200)

    return () => {
      clearInterval(interval)
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, [open, subject, renderWidget])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!turnstileToken) {
      setErrorMsg('Please complete the CAPTCHA verification.')
      return
    }

    setStatus('sending')
    setErrorMsg('')

    try {
      const res = await fetch(CONTACT_API_URL || '/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          inquiryType,
          message,
          turnstileToken,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to send inquiry')
      }

      setStatus('sent')
      setName('')
      setEmail('')
      setMessage('')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[9000] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-abyss border border-white/10 overflow-hidden">
        {/* Top accent line */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/50 mb-1">
              Secure Channel
            </p>
            <h2 className="font-display text-xl text-white uppercase tracking-[0.05em]">
              Collect Inquiry
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/50 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
          {status === 'sent' ? (
            <div className="text-center py-8">
              <p className="font-display text-2xl text-white uppercase tracking-[0.05em] mb-3">
                Inquiry Sent
              </p>
              <p className="font-mono text-sm text-white/70 mb-6">
                Your message has been transmitted. Expect a response within 24&ndash;48 hours.
              </p>
              <button
                onClick={onClose}
                className="font-mono text-xs uppercase tracking-[0.15em] text-white border border-white/20 px-6 py-3 hover:bg-white/5 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
              {/* Inquiry Type */}
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 mb-2">
                  Inquiry Type
                </label>
                <select
                  value={inquiryType}
                  onChange={(e) => setInquiryType(e.target.value)}
                  className="w-full bg-charcoal border border-white/10 text-white font-mono text-sm px-3 py-2.5 focus:outline-none focus:border-white/30 transition-colors appearance-none cursor-pointer"
                >
                  <option value="Full Set">Full Set (All 10 editions of one Overlord)</option>
                  <option value="Individual Token">Individual Token</option>
                  <option value="General Inquiry">General Inquiry</option>
                </select>
              </div>

              {/* Name */}
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-charcoal border border-white/10 text-white font-mono text-sm px-3 py-2.5 focus:outline-none focus:border-white/30 transition-colors placeholder:text-white/20"
                  placeholder="Your name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-charcoal border border-white/10 text-white font-mono text-sm px-3 py-2.5 focus:outline-none focus:border-white/30 transition-colors placeholder:text-white/20"
                  placeholder="you@example.com"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 mb-2">
                  Message
                </label>
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full bg-charcoal border border-white/10 text-white font-mono text-sm px-3 py-2.5 focus:outline-none focus:border-white/30 transition-colors resize-none placeholder:text-white/20"
                  placeholder="Tell us about your interest in collecting..."
                />
              </div>

              {/* Turnstile CAPTCHA */}
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 mb-2">
                  Verification
                </label>
                <div ref={turnstileRef} />
              </div>

              {/* Error */}
              {errorMsg && (
                <p className="font-mono text-xs text-red-400">{errorMsg}</p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full font-mono text-xs uppercase tracking-[0.15em] text-black bg-white px-4 py-3 hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'sending' ? 'Transmitting...' : 'Send Inquiry'}
              </button>
            </form>
          )}
        </div>

        {/* Bottom accent line */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
    </div>
  )
}
