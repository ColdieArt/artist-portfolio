'use client'

import { useState, useCallback } from 'react'

const WALLET_RE = /^0x[0-9a-fA-F]{40}$/

type EligibilityState =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'eligible'; token_count: number }
  | { status: 'ineligible'; reason: string }
  | { status: 'error' }

export default function ContestSubmissionForm() {
  const [name, setName] = useState('')
  const [wallet, setWallet] = useState('')
  const [overlord, setOverlord] = useState('')
  const [eligibility, setEligibility] = useState<EligibilityState>({ status: 'idle' })
  const [submitted, setSubmitted] = useState(false)

  const checkEligibility = useCallback(async (address: string) => {
    if (!WALLET_RE.test(address)) {
      setEligibility({ status: 'idle' })
      return
    }

    setEligibility({ status: 'checking' })

    try {
      const res = await fetch('/api/check-eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: address }),
      })
      const data = await res.json()

      if (data.eligible) {
        setEligibility({ status: 'eligible', token_count: data.token_count })
      } else {
        setEligibility({ status: 'ineligible', reason: data.reason })
      }
    } catch {
      setEligibility({ status: 'error' })
    }
  }, [])

  const handleWalletBlur = () => {
    checkEligibility(wallet.trim())
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (eligibility.status !== 'eligible') return

    // Build mailto link with pre-filled subject/body
    const subject = encodeURIComponent(`Contest Entry — ${overlord || 'Tech Epochalypse'}`)
    const body = encodeURIComponent(
      `Name/Alias: ${name}\nWallet: ${wallet}\nOverlord: ${overlord || 'N/A'}\n\nPlease attach your exported JPEG or MP4 file.`
    )
    window.location.href = `mailto:gallery@techepochalypse.com?subject=${subject}&body=${body}`
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <p className="font-mono text-sm text-white/60">
          Your email client should have opened with a pre-filled contest entry.
          Attach your exported file and send it.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-4 font-mono text-xs text-white/30 hover:text-white/50 underline transition-colors"
        >
          Submit another entry
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
      {/* Name */}
      <div>
        <label className="block font-mono text-xs uppercase tracking-[0.2em] text-white/40 mb-2">
          Name / Alias
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 font-mono text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors"
          placeholder="Your name or alias"
        />
      </div>

      {/* Wallet Address */}
      <div>
        <label className="block font-mono text-xs uppercase tracking-[0.2em] text-white/40 mb-2">
          Your ETH Wallet Address
        </label>
        <input
          type="text"
          value={wallet}
          onChange={(e) => {
            setWallet(e.target.value)
            setEligibility({ status: 'idle' })
          }}
          onBlur={handleWalletBlur}
          required
          className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 font-mono text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors"
          placeholder="0x..."
        />
        <p className="font-mono text-[10px] text-white/20 mt-1">
          Required for contest entries. Must hold a Tech Epochalypse Moments token.
        </p>

        {/* Eligibility feedback */}
        {eligibility.status === 'checking' && (
          <div className="mt-2 flex items-center gap-2">
            <div className="w-3 h-3 border border-white/20 border-t-white/60 rounded-full animate-spin" />
            <span className="font-mono text-xs text-white/40">Verifying holder status...</span>
          </div>
        )}
        {eligibility.status === 'eligible' && (
          <div className="mt-2 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 8l3.5 3.5L13 5" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="font-mono text-xs text-green-400">
              Verified holder — {eligibility.token_count} token{eligibility.token_count !== 1 ? 's' : ''}
            </span>
          </div>
        )}
        {eligibility.status === 'ineligible' && (
          <div className="mt-3 bg-white/5 border border-white/10 rounded p-4">
            <p className="font-mono text-xs text-white/50 leading-relaxed">
              Contest entries are exclusive to Tech Epochalypse Moments holders. To participate, you need to hold at least one token in your wallet.
            </p>
            <a
              href="https://opensea.io/collection/tech-epochalypse-moments-decentral-eyes"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 font-mono text-xs text-white/70 hover:text-white underline transition-colors"
            >
              Don&apos;t have one yet? Collect on OpenSea &rarr;
            </a>
          </div>
        )}
        {eligibility.status === 'error' && (
          <p className="mt-2 font-mono text-xs text-red-400/70">
            Could not verify wallet. Please try again.
          </p>
        )}
      </div>

      {/* Overlord */}
      <div>
        <label className="block font-mono text-xs uppercase tracking-[0.2em] text-white/40 mb-2">
          Overlord
        </label>
        <select
          value={overlord}
          onChange={(e) => setOverlord(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 font-mono text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
        >
          <option value="" className="bg-black">Select overlord...</option>
          <option value="Elon Musk" className="bg-black">I — Elon Musk</option>
          <option value="Mark Zuckerberg" className="bg-black">II — Mark Zuckerberg</option>
          <option value="Sam Altman" className="bg-black">III — Sam Altman</option>
          <option value="Jeff Bezos" className="bg-black">IV — Jeff Bezos</option>
          <option value="Jensen Huang" className="bg-black">V — Jensen Huang</option>
        </select>
      </div>

      {/* Instructions */}
      <p className="font-mono text-[10px] text-white/20 leading-relaxed">
        After submitting, your email client will open with a pre-filled entry.
        Attach your exported JPEG or MP4 file and send.
      </p>

      {/* Submit */}
      <button
        type="submit"
        disabled={eligibility.status !== 'eligible'}
        className={`w-full py-3 rounded font-mono text-sm uppercase tracking-wider transition-all ${
          eligibility.status === 'eligible'
            ? 'bg-white/10 text-white hover:bg-white/20 cursor-pointer'
            : 'bg-white/5 text-white/20 cursor-not-allowed'
        }`}
      >
        Submit Contest Entry
      </button>
    </form>
  )
}
