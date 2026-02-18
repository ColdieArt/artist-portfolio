const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY ?? ''
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID ?? ''
const AIRTABLE_HOLDERS_TABLE = process.env.AIRTABLE_HOLDERS_TABLE ?? 'Token Holders'

const BASE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_HOLDERS_TABLE)}`

function headers() {
  return {
    Authorization: `Bearer ${AIRTABLE_API_KEY}`,
    'Content-Type': 'application/json',
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export interface HolderRecord {
  id?: string
  wallet_address: string
  token_count: number
  token_ids: string
  is_active_holder: boolean
  eligible_for_contests: boolean
  first_seen?: string
  last_verified?: string
  display_name?: string
}

interface AirtableRecord {
  id: string
  fields: Record<string, unknown>
}

export async function fetchAllHolders(): Promise<{ id: string; fields: HolderRecord }[]> {
  const results: { id: string; fields: HolderRecord }[] = []
  let offset: string | undefined

  do {
    const url = offset ? `${BASE_URL}?offset=${offset}` : BASE_URL
    const res = await fetch(url, { headers: headers(), cache: 'no-store' })
    if (!res.ok) throw new Error(`Airtable fetch failed: ${res.status}`)
    const data = await res.json()

    for (const rec of data.records as AirtableRecord[]) {
      results.push({
        id: rec.id,
        fields: {
          wallet_address: (rec.fields.wallet_address as string) ?? '',
          token_count: (rec.fields.token_count as number) ?? 0,
          token_ids: (rec.fields.token_ids as string) ?? '',
          is_active_holder: (rec.fields.is_active_holder as boolean) ?? false,
          eligible_for_contests: (rec.fields.eligible_for_contests as boolean) ?? false,
          first_seen: rec.fields.first_seen as string | undefined,
          last_verified: rec.fields.last_verified as string | undefined,
          display_name: rec.fields.display_name as string | undefined,
        },
      })
    }
    offset = data.offset
    if (offset) await delay(220) // rate limit: ~5 req/s
  } while (offset)

  return results
}

export async function batchCreateRecords(
  records: { fields: Record<string, unknown> }[]
): Promise<void> {
  for (let i = 0; i < records.length; i += 10) {
    const batch = records.slice(i, i + 10)
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ records: batch }),
    })
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Airtable create failed: ${res.status} ${body}`)
    }
    await delay(220)
  }
}

export async function batchUpdateRecords(
  records: { id: string; fields: Record<string, unknown> }[]
): Promise<void> {
  for (let i = 0; i < records.length; i += 10) {
    const batch = records.slice(i, i + 10)
    const res = await fetch(BASE_URL, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ records: batch }),
    })
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Airtable update failed: ${res.status} ${body}`)
    }
    await delay(220)
  }
}

export async function findByWallet(
  walletAddress: string
): Promise<{ id: string; fields: HolderRecord } | null> {
  const formula = encodeURIComponent(`{wallet_address}='${walletAddress.toLowerCase()}'`)
  const url = `${BASE_URL}?filterByFormula=${formula}&maxRecords=1`
  const res = await fetch(url, { headers: headers(), cache: 'no-store' })
  if (!res.ok) throw new Error(`Airtable lookup failed: ${res.status}`)
  const data = await res.json()
  const rec = (data.records as AirtableRecord[])[0]
  if (!rec) return null

  return {
    id: rec.id,
    fields: {
      wallet_address: (rec.fields.wallet_address as string) ?? '',
      token_count: (rec.fields.token_count as number) ?? 0,
      token_ids: (rec.fields.token_ids as string) ?? '',
      is_active_holder: (rec.fields.is_active_holder as boolean) ?? false,
      eligible_for_contests: (rec.fields.eligible_for_contests as boolean) ?? false,
      first_seen: rec.fields.first_seen as string | undefined,
      last_verified: rec.fields.last_verified as string | undefined,
      display_name: rec.fields.display_name as string | undefined,
    },
  }
}
