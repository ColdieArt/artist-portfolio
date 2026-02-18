'use client'

const NAMES: Record<string, string> = {
  musk: 'Musk',
  zuckerberg: 'Zuckerberg',
  altman: 'Altman',
  bezos: 'Bezos',
  huang: 'Huang',
}

interface OverlordData {
  key: string
  name: string
  pulse_7day: number
  trend_direction: string
  trend_percent: number
  avg_sentiment_7day: number
  sentiment_label: string
}

interface PulseNarrativeProps {
  overlords: OverlordData[]
  hottest: string | null
  biggest_surge: string | null
  most_negative: string | null
  quietest: string | null
}

export default function PulseNarrative({
  overlords,
  hottest,
  biggest_surge,
  most_negative,
  quietest,
}: PulseNarrativeProps) {
  if (overlords.length === 0) return null

  const hottestO = overlords.find((o) => o.key === hottest)
  const surgeO = overlords.find((o) => o.key === biggest_surge)
  const negativeO = overlords.find((o) => o.key === most_negative)
  const quietO = overlords.find((o) => o.key === quietest)

  const lines: string[] = []

  if (hottestO && hottestO.trend_direction === 'surging') {
    lines.push(
      `${hottestO.name} is commanding the news cycle. ${hottestO.pulse_7day} articles this week and climbing.`
    )
  } else if (hottestO) {
    lines.push(
      `${hottestO.name} leads the cycle with ${hottestO.pulse_7day} articles this week.`
    )
  }

  if (negativeO && negativeO.avg_sentiment_7day < -0.3) {
    lines.push(
      `${negativeO.name} is under fire. The coverage is turning hostile.`
    )
  } else if (negativeO && negativeO.avg_sentiment_7day < 0) {
    lines.push(
      `${negativeO.name} faces headwinds. Sentiment is trending negative.`
    )
  }

  if (quietO && quietO.pulse_7day < 10) {
    lines.push(
      `${quietO.name} has gone dark. ${quietO.pulse_7day} mentions this week. What are they planning?`
    )
  }

  if (surgeO && surgeO.key !== hottest && surgeO.trend_percent > 20) {
    lines.push(
      `${surgeO.name} is rising fast. Up ${surgeO.trend_percent.toFixed(0)}% this week. The Overlord takes notice.`
    )
  }

  if (lines.length === 0) {
    lines.push('The network hums. All overlords hold steady. For now.')
  }

  return (
    <div className="border border-white/5 bg-white/[0.02] p-6 md:p-8">
      <div className="classified-header">
        Transmission &mdash;{' '}
        <span className="redacted-partial">Analysis</span>
      </div>
      <div className="space-y-3">
        {lines.map((line, i) => (
          <p
            key={i}
            className="font-mono text-sm text-white/50 leading-relaxed italic"
          >
            &ldquo;{line}&rdquo;
          </p>
        ))}
      </div>
      <p className="font-mono text-[9px] text-white/15 mt-4 uppercase tracking-widest">
        // Auto-generated from pulse data
      </p>
    </div>
  )
}
