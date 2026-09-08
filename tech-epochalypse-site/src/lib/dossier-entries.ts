import fs from 'fs'
import path from 'path'

// Read every entry image dropped into public/dossier/entries/ at build time.
// Static export runs this on the server during `next build`, so the resulting
// list is baked into the page — a frozen snapshot of the competition.
// Server components only (uses fs).
export function getSubj01EntryImages(): string[] {
  const dir = path.join(process.cwd(), 'public', 'dossier', 'entries')
  try {
    return fs
      .readdirSync(dir)
      .filter((f) => /\.(jpe?g|png|webp|avif|gif)$/i.test(f))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map((f) => `/dossier/entries/${f}`)
  } catch {
    return []
  }
}
