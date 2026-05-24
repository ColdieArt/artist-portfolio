-- Image voting / Elo schema for D1
-- Apply with: npx wrangler d1 execute te-vs --file=./schema.sql --remote

CREATE TABLE IF NOT EXISTS images (
  id          TEXT PRIMARY KEY,           -- R2 key, e.g. exports/abc.jpg
  overlord    TEXT NOT NULL DEFAULT 'unknown',
  title       TEXT DEFAULT '',
  image_url   TEXT NOT NULL,
  elo         REAL NOT NULL DEFAULT 1500,
  votes       INTEGER NOT NULL DEFAULT 0, -- total appearances (wins + losses)
  wins        INTEGER NOT NULL DEFAULT 0,
  losses      INTEGER NOT NULL DEFAULT 0,
  status      TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
  created_at  INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_images_status_overlord ON images(status, overlord);
CREATE INDEX IF NOT EXISTS idx_images_status_votes ON images(status, votes);
CREATE INDEX IF NOT EXISTS idx_images_status_elo ON images(status, elo);

CREATE TABLE IF NOT EXISTS votes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  winner_id   TEXT NOT NULL,
  loser_id    TEXT NOT NULL,
  overlord    TEXT NOT NULL DEFAULT 'all',
  voter_hash  TEXT NOT NULL,              -- sha256(ip + ua)
  ts          INTEGER NOT NULL,
  FOREIGN KEY (winner_id) REFERENCES images(id),
  FOREIGN KEY (loser_id) REFERENCES images(id)
);

CREATE INDEX IF NOT EXISTS idx_votes_ts ON votes(ts);
CREATE INDEX IF NOT EXISTS idx_votes_pair_voter ON votes(voter_hash, winner_id, loser_id);
