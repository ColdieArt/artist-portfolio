'use client'

import { useMemo } from 'react'
import type { OverlordPulse } from '@/lib/pulse-client'

/**
 * Simple SVG-based chart — no external charting library needed.
 * Renders a horizontal bar chart of overlord pulse counts.
 * This avoids the recharts dependency to keep the bundle safe.
 */
interface Props {
  overlords: OverlordPulse[]
}

export default function PulseChart({ overlords }: Props) {
  const maxCount = useMemo(
    () => Math.max(...overlords.map((o) => o.pulse_count), 1),
    [overlords]
  )

  const barHeight = 32
  const gap = 12
  const labelWidth = 120
  const chartWidth = 600
  const totalHeight = overlords.length * (barHeight + gap) - gap + 20

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${labelWidth + chartWidth + 80} ${totalHeight}`}
        className="w-full h-auto"
        style={{ minWidth: 500 }}
      >
        {overlords.map((overlord, i) => {
          const y = i * (barHeight + gap)
          const barW = (overlord.pulse_count / maxCount) * chartWidth

          return (
            <g key={overlord.key}>
              {/* Label */}
              <text
                x={labelWidth - 8}
                y={y + barHeight / 2 + 4}
                textAnchor="end"
                className="font-mono"
                fill="white"
                fontSize="11"
              >
                {overlord.name.toUpperCase()}
              </text>

              {/* Background bar */}
              <rect
                x={labelWidth}
                y={y}
                width={chartWidth}
                height={barHeight}
                fill="rgba(255,255,255,0.02)"
              />

              {/* Data bar */}
              <rect
                x={labelWidth}
                y={y}
                width={barW}
                height={barHeight}
                fill={overlord.color}
                opacity={0.6}
                rx={1}
              >
                <animate
                  attributeName="width"
                  from="0"
                  to={barW}
                  dur="1s"
                  fill="freeze"
                />
              </rect>

              {/* Count label */}
              <text
                x={labelWidth + barW + 8}
                y={y + barHeight / 2 + 4}
                fill="white"
                fontSize="11"
                className="font-mono"
              >
                {overlord.pulse_count}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
