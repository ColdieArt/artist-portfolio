'use client'

import type { OverlordPulse } from '@/lib/pulse-client'

interface Props {
  overlords: OverlordPulse[]
  hottest: string | null
  most_negative: string | null
  quietest: string | null
}

export default function PulseNarrative({
  overlords,
  hottest,
  most_negative,
  quietest,
}: Props) {
  const hottestO = overlords.find((o) => o.key === hottest)
  const negO = overlords.find((o) => o.key === most_negative)
  const quietO = overlords.find((o) => o.key === quietest)

  const lines: string[] = []

  if (hottestO) {
    lines.push(
      `${hottestO.name} leads the cycle with ${hottestO.pulse_count} articles this week.`
    )
  }

  if (negO && negO.sentiment_score < -0.05) {
    lines.push(
      `${negO.name} faces headwinds. Sentiment is trending ${negO.sentiment_label}.`
    )
  }

  if (quietO && quietO.key !== hottest) {
    const ratio = hottestO && hottestO.pulse_count > 0
      ? Math.round((quietO.pulse_count / hottestO.pulse_count) * 100)
      : 0
    if (ratio < 60) {
      lines.push(
        `${quietO.name} is running quiet at ${quietO.pulse_count} articles \u2014 ${ratio}% of the leader.`
      )
    }
  }

  // Find any surging overlord
  const surging = overlords.find(
    (o) => o.trend_direction === 'surging' && o.key !== hottest
  )
  if (surging) {
    lines.push(
      `${surging.name} is surging. The Overlord takes notice.`
    )
  }

  if (lines.length === 0) {
    lines.push('The network is quiet. All overlords within normal parameters.')
  }

  return (
    <div className="border border-white/5 bg-white/[0.01] p-6 md:p-8">
      <div className="classified-header">
        Transmission &mdash; <span className="redacted-partial">IS</span>
      </div>
      <div className="space-y-4 mt-4">
        {lines.map((line, i) => (
          <p
            key={i}
            className="font-mono text-sm text-white/50 italic leading-relaxed"
          >
            &ldquo;{line}&rdquo;
          </p>
        ))}
      </div>
      <p className="font-mono text-[10px] text-white/15 mt-6 uppercase tracking-widest">
        // Auto-generated from Pulse data
      </p>
    </div>
  )
}
