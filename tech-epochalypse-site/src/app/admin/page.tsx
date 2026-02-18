'use client'

import { useState } from 'react'

interface Holder {
  id: string
  wallet_address: string
  token_count: number
  token_ids: string
  is_active_holder: boolean
  eligible_for_contests: boolean
  first_seen?: string
  last_verified?: string
  display_name?: string
}

interface HoldersResponse {
  total_records: number
  active_holders: number
  total_tokens: number
  holders: Holder[]
}

interface SnapshotResult {
  totalHolders: number
  newHolders: number
  updatedHolders: number
  deactivatedHolders: number
  timestamp: string
}

export default function AdminPage() {
  const [secret, setSecret] = useState('')
  const [authenticated, setAuthenticated] = useState(false)

  const [holders, setHolders] = useState<HoldersResponse | null>(null)
  const [loadingHolders, setLoadingHolders] = useState(false)

  const [snapshotResult, setSnapshotResult] = useState<SnapshotResult | null>(null)
  const [snapshotRunning, setSnapshotRunning] = useState(false)
  const [snapshotError, setSnapshotError] = useState('')

  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<'token_count' | 'last_verified'>('token_count')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const authHeaders = { Authorization: `Bearer ${secret}` }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoadingHolders(true)
    try {
      const res = await fetch('/api/admin/holders', { headers: authHeaders })
      if (res.status === 401) {
        alert('Invalid admin secret')
        return
      }
      const data = await res.json()
      setHolders(data)
      setAuthenticated(true)
    } catch {
      alert('Failed to connect')
    } finally {
      setLoadingHolders(false)
    }
  }

  async function refreshHolders() {
    setLoadingHolders(true)
    try {
      const res = await fetch('/api/admin/holders', { headers: authHeaders })
      const data = await res.json()
      setHolders(data)
    } catch {
      // ignore
    } finally {
      setLoadingHolders(false)
    }
  }

  async function runSnapshot() {
    setSnapshotRunning(true)
    setSnapshotError('')
    setSnapshotResult(null)
    try {
      const res = await fetch('/api/admin/snapshot', {
        method: 'POST',
        headers: authHeaders,
      })
      if (!res.ok) {
        const err = await res.json()
        setSnapshotError(err.error || 'Snapshot failed')
        return
      }
      const result = await res.json()
      setSnapshotResult(result)
      // Refresh the holders list
      await refreshHolders()
    } catch {
      setSnapshotError('Network error')
    } finally {
      setSnapshotRunning(false)
    }
  }

  function toggleSort(field: 'token_count' | 'last_verified') {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  function truncateWallet(addr: string) {
    if (addr.length <= 13) return addr
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  // Filter and sort holders
  const filteredHolders = (holders?.holders ?? [])
    .filter((h) => {
      if (!search) return true
      const q = search.toLowerCase()
      return (
        h.wallet_address.toLowerCase().includes(q) ||
        (h.display_name ?? '').toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      if (sortField === 'token_count') return (a.token_count - b.token_count) * dir
      const aVal = a.last_verified ?? ''
      const bVal = b.last_verified ?? ''
      return aVal.localeCompare(bVal) * dir
    })

  if (!authenticated) {
    return (
      <section className="pt-28 md:pt-36 pb-24 section-padding bg-black min-h-screen">
        <div className="max-w-md mx-auto">
          <h1 className="font-display text-3xl text-white mb-8 uppercase tracking-[0.03em] text-center">
            Admin Access
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Admin secret"
              className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 font-mono text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30"
            />
            <button
              type="submit"
              disabled={loadingHolders}
              className="w-full py-3 bg-white/10 text-white font-mono text-sm uppercase tracking-wider rounded hover:bg-white/20 transition-colors disabled:opacity-50"
            >
              {loadingHolders ? 'Connecting...' : 'Enter'}
            </button>
          </form>
        </div>
      </section>
    )
  }

  return (
    <section className="pt-28 md:pt-36 pb-24 section-padding bg-black min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-white/40 mb-2">
              Admin Panel
            </p>
            <h1 className="font-display text-3xl md:text-4xl text-white uppercase tracking-[0.03em]">
              Token Holders
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={runSnapshot}
              disabled={snapshotRunning}
              className="px-5 py-2.5 bg-white/10 text-white font-mono text-xs uppercase tracking-wider rounded hover:bg-white/20 transition-colors disabled:opacity-50"
            >
              {snapshotRunning ? 'Refreshing...' : 'Refresh Token Holders'}
            </button>
          </div>
        </div>

        {/* Snapshot reminder */}
        <div className="bg-white/5 border border-white/10 rounded p-4 mb-6">
          <p className="font-mono text-xs text-white/50 leading-relaxed">
            Tip: Refresh your token holder list before starting a new contest to make sure recent buyers can participate.
          </p>
          {holders && holders.holders.length > 0 && (
            <p className="font-mono text-[10px] text-white/25 mt-1">
              Last refreshed: {holders.holders[0]?.last_verified
                ? new Date(holders.holders[0].last_verified).toLocaleString()
                : 'Unknown'}
            </p>
          )}
        </div>

        {/* Snapshot result */}
        {snapshotResult && (
          <div className="bg-green-500/10 border border-green-500/20 rounded p-4 mb-6">
            <p className="font-mono text-xs text-green-400">
              Snapshot complete — {snapshotResult.totalHolders} active holders,{' '}
              {snapshotResult.newHolders} new, {snapshotResult.deactivatedHolders} no longer holding
            </p>
          </div>
        )}
        {snapshotError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded p-4 mb-6">
            <p className="font-mono text-xs text-red-400">Error: {snapshotError}</p>
          </div>
        )}

        {/* Stats */}
        {holders && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white/5 border border-white/10 rounded p-4">
              <p className="font-mono text-xs text-white/40 uppercase tracking-wider mb-1">Total Records</p>
              <p className="font-display text-2xl text-white">{holders.total_records}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded p-4">
              <p className="font-mono text-xs text-white/40 uppercase tracking-wider mb-1">Active Holders</p>
              <p className="font-display text-2xl text-white">{holders.active_holders}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded p-4">
              <p className="font-mono text-xs text-white/40 uppercase tracking-wider mb-1">Total Tokens</p>
              <p className="font-display text-2xl text-white">{holders.total_tokens}</p>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by wallet or name..."
            className="w-full max-w-md bg-white/5 border border-white/10 rounded px-4 py-2 font-mono text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10">
                <th className="font-mono text-[10px] uppercase tracking-wider text-white/40 pb-3 pr-4">Wallet</th>
                <th className="font-mono text-[10px] uppercase tracking-wider text-white/40 pb-3 pr-4">Display Name</th>
                <th
                  className="font-mono text-[10px] uppercase tracking-wider text-white/40 pb-3 pr-4 cursor-pointer hover:text-white/60"
                  onClick={() => toggleSort('token_count')}
                >
                  Tokens {sortField === 'token_count' ? (sortDir === 'desc' ? '\u2193' : '\u2191') : ''}
                </th>
                <th className="font-mono text-[10px] uppercase tracking-wider text-white/40 pb-3 pr-4">Status</th>
                <th
                  className="font-mono text-[10px] uppercase tracking-wider text-white/40 pb-3 cursor-pointer hover:text-white/60"
                  onClick={() => toggleSort('last_verified')}
                >
                  Last Verified {sortField === 'last_verified' ? (sortDir === 'desc' ? '\u2193' : '\u2191') : ''}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredHolders.map((h) => (
                <tr key={h.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-3 pr-4 font-mono text-xs text-white/70">{truncateWallet(h.wallet_address)}</td>
                  <td className="py-3 pr-4 font-mono text-xs text-white/50">{h.display_name || '—'}</td>
                  <td className="py-3 pr-4 font-mono text-xs text-white/70">{h.token_count}</td>
                  <td className="py-3 pr-4">
                    {h.is_active_holder ? (
                      <span className="font-mono text-[10px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded">Active</span>
                    ) : (
                      <span className="font-mono text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded">Inactive</span>
                    )}
                  </td>
                  <td className="py-3 font-mono text-[10px] text-white/30">
                    {h.last_verified ? new Date(h.last_verified).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
              {filteredHolders.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center font-mono text-xs text-white/30">
                    {search ? 'No holders match your search' : 'No holder records yet. Run a snapshot to populate.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
