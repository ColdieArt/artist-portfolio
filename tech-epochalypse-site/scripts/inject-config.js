const fs = require('fs')
const path = require('path')

// Load .env.local if present (on Vercel, env vars are already set)
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match && !process.env[match[1].trim()]) {
      process.env[match[1].trim()] = match[2].trim()
    }
  }
}

const pat = process.env.AIRTABLE_TOKEN || process.env.NEXT_PUBLIC_AIRTABLE_TOKEN || ''
const baseId = process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || ''
const table = process.env.AIRTABLE_SUBMISSIONS_TABLE || 'Submissions'

const configJs = `// Auto-generated at build time — do not edit
window.AIRTABLE_PAT = ${JSON.stringify(pat)};
window.AIRTABLE_BASE_ID = ${JSON.stringify(baseId)};
window.AIRTABLE_TABLE_NAME = ${JSON.stringify(table)};
`

const outPath = path.join(__dirname, '..', 'public', 'artworks', 'airtable-config.js')
fs.writeFileSync(outPath, configJs, 'utf8')

if (pat) {
  console.log('✓ Airtable config injected into public/artworks/airtable-config.js')
} else {
  console.warn('⚠ AIRTABLE_TOKEN not set — submissions will not work')
}
