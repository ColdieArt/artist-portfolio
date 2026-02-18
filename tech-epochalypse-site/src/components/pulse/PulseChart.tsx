'use client'

import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

const ACCENT_COLORS: Record<string, string> = {
  musk: '#5b8cf7',
  zuckerberg: '#00d4ff',
  altman: '#f5e6a3',
  bezos: '#ff9900',
  huang: '#76b900',
}

const OVERLORD_NAMES: Record<string, string> = {
  musk: 'Musk',
  zuckerberg: 'Zuckerberg',
  altman: 'Altman',
  bezos: 'Bezos',
  huang: 'Huang',
}

interface HistoryData {
  days: number
  data: Record<string, { date: string; count: number }[]>
}

interface ChartEntry {
  date: string
  [key: string]: string | number
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { dataKey: string; value: number; color: string }[]
  label?: string
}) {
  if (!active || !payload) return null

  return (
    <div className="bg-black/95 border border-white/10 p-3 font-mono text-[10px]">
      <p className="text-white/50 mb-1.5">{label}</p>
      {payload
        .sort((a, b) => b.value - a.value)
        .map((entry) => (
          <div
            key={entry.dataKey}
            className="flex items-center gap-2 py-0.5"
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-white/60">
              {OVERLORD_NAMES[entry.dataKey] || entry.dataKey}:
            </span>
            <span className="text-white">{entry.value}</span>
          </div>
        ))}
    </div>
  )
}

export default function PulseChart() {
  const [chartData, setChartData] = useState<ChartEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [overlordKeys, setOverlordKeys] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/pulse/history?days=90')
      .then((res) => res.json())
      .then((data: HistoryData) => {
        const keys = Object.keys(data.data || {})
        setOverlordKeys(keys)

        // Merge all overlord data into unified date entries
        const dateMap: Record<string, ChartEntry> = {}
        for (const [key, entries] of Object.entries(data.data || {})) {
          for (const entry of entries) {
            if (!dateMap[entry.date]) {
              dateMap[entry.date] = {
                date: new Date(entry.date + 'T00:00:00').toLocaleDateString(
                  'en-US',
                  { month: 'short', day: 'numeric' }
                ),
              }
            }
            dateMap[entry.date][key] = entry.count
          }
        }

        const sorted = Object.entries(dateMap)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([, v]) => v)

        setChartData(sorted)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="font-mono text-xs text-white/30 animate-pulse">
          Loading historical data...
        </p>
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="font-mono text-xs text-white/30">
          No historical data available yet. Run the pulse job to start collecting data.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4">
        {overlordKeys.map((key) => (
          <div key={key} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-0.5 rounded-full"
              style={{ backgroundColor: ACCENT_COLORS[key] || '#666' }}
            />
            <span className="font-mono text-[10px] text-white/40 uppercase tracking-wider">
              {OVERLORD_NAMES[key] || key}
            </span>
          </div>
        ))}
      </div>

      <div className="h-72 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.03)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              stroke="rgba(255,255,255,0.15)"
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="rgba(255,255,255,0.15)"
              tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={30}
            />
            <Tooltip content={<CustomTooltip />} />
            {overlordKeys.map((key) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={ACCENT_COLORS[key] || '#666'}
                strokeWidth={1.5}
                dot={false}
                activeDot={{
                  r: 3,
                  stroke: ACCENT_COLORS[key] || '#666',
                  fill: '#000',
                }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
