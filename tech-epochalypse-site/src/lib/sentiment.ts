const POSITIVE_KEYWORDS = [
  'launches', 'launch', 'breakthrough', 'record', 'partnership', 'innovation',
  'growth', 'profit', 'revenue', 'deal', 'expansion', 'milestone',
  'success', 'surges', 'gains', 'unveils', 'announces', 'wins',
  'approval', 'bullish', 'upgrade', 'boost', 'soars',
]

const NEGATIVE_KEYWORDS = [
  'lawsuit', 'controversy', 'investigation', 'layoffs', 'scandal',
  'crash', 'sued', 'fine', 'fined', 'penalty', 'probe', 'antitrust',
  'fraud', 'violation', 'hack', 'breach', 'loses', 'decline',
  'downturn', 'failure', 'fired', 'resign', 'subpoena', 'bearish',
]

export interface Article {
  title: string | null
  description: string | null
  source: { name: string } | null
  url: string | null
  publishedAt: string | null
}

export function calculateSentiment(articles: Article[]): number {
  let positiveCount = 0
  let negativeCount = 0

  for (const article of articles) {
    const text = [article.title || '', article.description || '']
      .join(' ')
      .toLowerCase()

    for (const keyword of POSITIVE_KEYWORDS) {
      if (text.includes(keyword)) positiveCount++
    }
    for (const keyword of NEGATIVE_KEYWORDS) {
      if (text.includes(keyword)) negativeCount++
    }
  }

  const total = positiveCount + negativeCount
  if (total === 0) return 0.0
  return (positiveCount - negativeCount) / total
}

export function getSentimentLabel(score: number): string {
  if (score > 0.3) return 'positive'
  if (score > 0.0) return 'leaning positive'
  if (score === 0.0) return 'neutral'
  if (score > -0.3) return 'leaning negative'
  return 'negative'
}

export function getTrendDirection(trendPercent: number): string {
  if (trendPercent > 20) return 'surging'
  if (trendPercent > 5) return 'rising'
  if (trendPercent >= -5) return 'stable'
  if (trendPercent > -20) return 'cooling'
  return 'quiet'
}
