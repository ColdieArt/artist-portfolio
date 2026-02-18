import Database from 'better-sqlite3'
import path from 'path'

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (db) return db

  const dbPath = path.join(process.cwd(), 'data', 'pulse.db')
  db = new Database(dbPath)

  // Enable WAL mode for better concurrent read performance
  db.pragma('journal_mode = WAL')

  // Create tables if they don't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS pulse_snapshots (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      overlord        TEXT NOT NULL,
      date            TEXT NOT NULL,
      article_count   INTEGER NOT NULL DEFAULT 0,
      sentiment_score REAL DEFAULT 0.0,
      top_headlines   TEXT,
      created_at      TEXT DEFAULT (datetime('now')),
      UNIQUE(overlord, date)
    );

    CREATE INDEX IF NOT EXISTS idx_pulse_overlord_date
      ON pulse_snapshots(overlord, date DESC);

    CREATE TABLE IF NOT EXISTS pulse_cache (
      overlord            TEXT PRIMARY KEY,
      pulse_7day          INTEGER DEFAULT 0,
      pulse_30day         INTEGER DEFAULT 0,
      trend_percent       REAL DEFAULT 0.0,
      trend_direction     TEXT DEFAULT 'stable',
      avg_sentiment_7day  REAL DEFAULT 0.0,
      sentiment_label     TEXT DEFAULT 'neutral',
      top_headlines       TEXT,
      peak_day_30d        TEXT,
      peak_count_30d      INTEGER DEFAULT 0,
      updated_at          TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS pulse_job_log (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      ran_at      TEXT DEFAULT (datetime('now')),
      status      TEXT NOT NULL,
      summary     TEXT,
      error       TEXT
    );
  `)

  return db
}

// ── Snapshot operations ──

export interface Headline {
  title: string
  source_name: string
  url: string
  published_at: string
  description: string
}

export interface PulseSnapshot {
  overlord: string
  date: string
  article_count: number
  sentiment_score: number
  top_headlines: Headline[]
}

export function upsertSnapshot(snapshot: PulseSnapshot): void {
  const db = getDb()
  db.prepare(`
    INSERT INTO pulse_snapshots (overlord, date, article_count, sentiment_score, top_headlines)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(overlord, date) DO UPDATE SET
      article_count = excluded.article_count,
      sentiment_score = excluded.sentiment_score,
      top_headlines = excluded.top_headlines,
      created_at = datetime('now')
  `).run(
    snapshot.overlord,
    snapshot.date,
    snapshot.article_count,
    snapshot.sentiment_score,
    JSON.stringify(snapshot.top_headlines)
  )
}

// ── Cache operations ──

export interface PulseCacheRow {
  overlord: string
  pulse_7day: number
  pulse_30day: number
  trend_percent: number
  trend_direction: string
  avg_sentiment_7day: number
  sentiment_label: string
  top_headlines: string | null
  peak_day_30d: string | null
  peak_count_30d: number
  updated_at: string
}

export function recalculateCache(overlordKey: string): void {
  const db = getDb()
  const today = new Date().toISOString().split('T')[0]

  // 7-day total
  const sum7 = db.prepare(`
    SELECT COALESCE(SUM(article_count), 0) as total
    FROM pulse_snapshots
    WHERE overlord = ? AND date >= date(?, '-7 days')
  `).get(overlordKey, today) as { total: number }

  // 30-day total
  const sum30 = db.prepare(`
    SELECT COALESCE(SUM(article_count), 0) as total
    FROM pulse_snapshots
    WHERE overlord = ? AND date >= date(?, '-30 days')
  `).get(overlordKey, today) as { total: number }

  // This week vs last week for trend
  const thisWeek = sum7.total
  const lastWeekRow = db.prepare(`
    SELECT COALESCE(SUM(article_count), 0) as total
    FROM pulse_snapshots
    WHERE overlord = ? AND date >= date(?, '-14 days') AND date < date(?, '-7 days')
  `).get(overlordKey, today, today) as { total: number }
  const lastWeek = lastWeekRow.total

  let trendPercent: number
  if (lastWeek === 0) {
    trendPercent = thisWeek > 0 ? 100 : 0
  } else {
    trendPercent = ((thisWeek - lastWeek) / lastWeek) * 100
  }

  let trendDirection: string
  if (trendPercent > 20) trendDirection = 'surging'
  else if (trendPercent > 5) trendDirection = 'rising'
  else if (trendPercent >= -5) trendDirection = 'stable'
  else if (trendPercent > -20) trendDirection = 'cooling'
  else trendDirection = 'quiet'

  // Average sentiment over 7 days
  const avgSent = db.prepare(`
    SELECT COALESCE(AVG(sentiment_score), 0.0) as avg_score
    FROM pulse_snapshots
    WHERE overlord = ? AND date >= date(?, '-7 days')
  `).get(overlordKey, today) as { avg_score: number }

  let sentimentLabel: string
  if (avgSent.avg_score > 0.3) sentimentLabel = 'positive'
  else if (avgSent.avg_score > 0.0) sentimentLabel = 'leaning positive'
  else if (avgSent.avg_score === 0.0) sentimentLabel = 'neutral'
  else if (avgSent.avg_score > -0.3) sentimentLabel = 'leaning negative'
  else sentimentLabel = 'negative'

  // Most recent headlines
  const latestSnap = db.prepare(`
    SELECT top_headlines FROM pulse_snapshots
    WHERE overlord = ? ORDER BY date DESC LIMIT 1
  `).get(overlordKey) as { top_headlines: string } | undefined

  // Peak day in last 30 days
  const peakRow = db.prepare(`
    SELECT date, article_count FROM pulse_snapshots
    WHERE overlord = ? AND date >= date(?, '-30 days')
    ORDER BY article_count DESC LIMIT 1
  `).get(overlordKey, today) as { date: string; article_count: number } | undefined

  db.prepare(`
    INSERT INTO pulse_cache (overlord, pulse_7day, pulse_30day, trend_percent, trend_direction,
      avg_sentiment_7day, sentiment_label, top_headlines, peak_day_30d, peak_count_30d, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(overlord) DO UPDATE SET
      pulse_7day = excluded.pulse_7day,
      pulse_30day = excluded.pulse_30day,
      trend_percent = excluded.trend_percent,
      trend_direction = excluded.trend_direction,
      avg_sentiment_7day = excluded.avg_sentiment_7day,
      sentiment_label = excluded.sentiment_label,
      top_headlines = excluded.top_headlines,
      peak_day_30d = excluded.peak_day_30d,
      peak_count_30d = excluded.peak_count_30d,
      updated_at = datetime('now')
  `).run(
    overlordKey,
    sum7.total,
    sum30.total,
    Math.round(trendPercent * 10) / 10,
    trendDirection,
    Math.round(avgSent.avg_score * 100) / 100,
    sentimentLabel,
    latestSnap?.top_headlines || '[]',
    peakRow?.date || null,
    peakRow?.article_count || 0
  )
}

export function getAllCacheRows(): PulseCacheRow[] {
  const db = getDb()
  return db.prepare('SELECT * FROM pulse_cache ORDER BY pulse_7day DESC').all() as PulseCacheRow[]
}

export function getCacheRow(overlordKey: string): PulseCacheRow | undefined {
  const db = getDb()
  return db.prepare('SELECT * FROM pulse_cache WHERE overlord = ?').get(overlordKey) as PulseCacheRow | undefined
}

export function getDailyHistory(overlordKey: string, days: number): { date: string; article_count: number; sentiment_score: number }[] {
  const db = getDb()
  const today = new Date().toISOString().split('T')[0]
  return db.prepare(`
    SELECT date, article_count, sentiment_score
    FROM pulse_snapshots
    WHERE overlord = ? AND date >= date(?, '-' || ? || ' days')
    ORDER BY date ASC
  `).all(overlordKey, today, days) as { date: string; article_count: number; sentiment_score: number }[]
}

export function getAllDailyHistory(days: number): Record<string, { date: string; count: number }[]> {
  const db = getDb()
  const today = new Date().toISOString().split('T')[0]
  const rows = db.prepare(`
    SELECT overlord, date, article_count as count
    FROM pulse_snapshots
    WHERE date >= date(?, '-' || ? || ' days')
    ORDER BY date ASC
  `).all(today, days) as { overlord: string; date: string; count: number }[]

  const result: Record<string, { date: string; count: number }[]> = {}
  for (const row of rows) {
    if (!result[row.overlord]) result[row.overlord] = []
    result[row.overlord].push({ date: row.date, count: row.count })
  }
  return result
}

export function logJobRun(status: string, summary: string, error?: string): void {
  const db = getDb()
  db.prepare(`
    INSERT INTO pulse_job_log (status, summary, error) VALUES (?, ?, ?)
  `).run(status, summary, error || null)
}

export function getRecentJobLogs(limit = 10): { id: number; ran_at: string; status: string; summary: string; error: string | null }[] {
  const db = getDb()
  return db.prepare(`
    SELECT * FROM pulse_job_log ORDER BY id DESC LIMIT ?
  `).all(limit) as { id: number; ran_at: string; status: string; summary: string; error: string | null }[]
}
