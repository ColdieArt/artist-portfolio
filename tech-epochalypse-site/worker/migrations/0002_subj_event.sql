-- SUBJ event scoping (SUBJ:02 — "AGI Has Arrived").
-- Apply once, remotely:
--   cd worker && npx wrangler d1 execute te-vs --file=./migrations/0002_subj_event.sql --remote
-- Every pre-existing row is a SUBJ:01 entry/vote, hence the default.
ALTER TABLE images ADD COLUMN event TEXT NOT NULL DEFAULT 'subj-01';
ALTER TABLE votes  ADD COLUMN event TEXT NOT NULL DEFAULT 'subj-01';
CREATE INDEX IF NOT EXISTS idx_images_event_status ON images(event, status);
CREATE INDEX IF NOT EXISTS idx_votes_event_voter   ON votes(event, voter_hash);
