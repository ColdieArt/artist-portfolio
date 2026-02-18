#!/usr/bin/env node

/**
 * Standalone script to fetch Tech Epochalypse Moments holders from Alchemy
 * and sync them to the Airtable "Token Holders" table.
 *
 * Usage:
 *   node scripts/snapshot-holders.js
 *
 * Requires env vars: ALCHEMY_API_KEY, AIRTABLE_API_KEY, AIRTABLE_BASE_ID,
 *                    AIRTABLE_HOLDERS_TABLE, NFT_CONTRACT_ADDRESS
 */

require('dotenv').config({ path: '.env.local' })

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY
const NFT_CONTRACT_ADDRESS =
  process.env.NFT_CONTRACT_ADDRESS || '0x0D1edb24225Cd549B70a94Ccf10A3754513C8C49'
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
const AIRTABLE_HOLDERS_TABLE = process.env.AIRTABLE_HOLDERS_TABLE || 'Token Holders'

const BASE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_HOLDERS_TABLE)}`

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function airtableHeaders() {
  return {
    Authorization: `Bearer ${AIRTABLE_API_KEY}`,
    'Content-Type': 'application/json',
  }
}

async function fetchHoldersFromAlchemy() {
  console.log('Fetching holders from Alchemy...')
  const url = `https://eth-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getOwnersForContract?contractAddress=${NFT_CONTRACT_ADDRESS}&withTokenBalances=true`
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Alchemy API failed: ${res.status} ${body}`)
  }
  const data = await res.json()
  const owners = data.owners || []

  const holders = new Map()
  for (const owner of owners) {
    const wallet = owner.ownerAddress.toLowerCase()
    const tokenIds = owner.tokenBalances.map((t) => t.tokenId)
    holders.set(wallet, { tokenCount: tokenIds.length, tokenIds })
  }
  console.log(`Found ${holders.size} holders`)
  return holders
}

async function fetchAllAirtableRecords() {
  console.log('Fetching existing Airtable records...')
  const results = []
  let offset

  do {
    const url = offset ? `${BASE_URL}?offset=${offset}` : BASE_URL
    const res = await fetch(url, { headers: airtableHeaders() })
    if (!res.ok) throw new Error(`Airtable fetch failed: ${res.status}`)
    const data = await res.json()
    results.push(...data.records)
    offset = data.offset
    if (offset) await delay(220)
  } while (offset)

  console.log(`Found ${results.length} existing records`)
  return results
}

async function batchCreate(records) {
  for (let i = 0; i < records.length; i += 10) {
    const batch = records.slice(i, i + 10)
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: airtableHeaders(),
      body: JSON.stringify({ records: batch }),
    })
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Airtable create failed: ${res.status} ${body}`)
    }
    await delay(220)
  }
}

async function batchUpdate(records) {
  for (let i = 0; i < records.length; i += 10) {
    const batch = records.slice(i, i + 10)
    const res = await fetch(BASE_URL, {
      method: 'PATCH',
      headers: airtableHeaders(),
      body: JSON.stringify({ records: batch }),
    })
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Airtable update failed: ${res.status} ${body}`)
    }
    await delay(220)
  }
}

async function main() {
  if (!ALCHEMY_API_KEY || ALCHEMY_API_KEY === 'your_alchemy_api_key_here') {
    console.error('Error: Set ALCHEMY_API_KEY in .env.local')
    process.exit(1)
  }
  if (!AIRTABLE_API_KEY) {
    console.error('Error: Set AIRTABLE_API_KEY in .env.local')
    process.exit(1)
  }

  const now = new Date().toISOString()

  // 1. Fetch blockchain holders
  const blockchainHolders = await fetchHoldersFromAlchemy()

  // 2. Fetch existing Airtable records
  const existingRecords = await fetchAllAirtableRecords()
  const existingByWallet = new Map()
  for (const rec of existingRecords) {
    const wallet = (rec.fields.wallet_address || '').toLowerCase()
    if (wallet) existingByWallet.set(wallet, rec)
  }

  const toCreate = []
  const toUpdate = []
  let newCount = 0
  let updatedCount = 0

  // 3. Process blockchain holders
  for (const [wallet, data] of blockchainHolders) {
    const existing = existingByWallet.get(wallet)
    const tokenIdsStr = data.tokenIds.join(', ')

    if (existing) {
      toUpdate.push({
        id: existing.id,
        fields: {
          token_count: data.tokenCount,
          token_ids: tokenIdsStr,
          is_active_holder: true,
          eligible_for_contests: true,
          last_verified: now,
        },
      })
      updatedCount++
    } else {
      toCreate.push({
        fields: {
          wallet_address: wallet,
          token_count: data.tokenCount,
          token_ids: tokenIdsStr,
          is_active_holder: true,
          eligible_for_contests: true,
          first_seen: now,
          last_verified: now,
        },
      })
      newCount++
    }
  }

  // 4. Deactivate holders no longer in snapshot
  const toDeactivate = []
  let deactivatedCount = 0
  for (const [wallet, record] of existingByWallet) {
    if (!blockchainHolders.has(wallet) && record.fields.is_active_holder) {
      toDeactivate.push({
        id: record.id,
        fields: {
          is_active_holder: false,
          eligible_for_contests: false,
        },
      })
      deactivatedCount++
    }
  }

  // 5. Execute
  if (toCreate.length > 0) {
    console.log(`Creating ${toCreate.length} new records...`)
    await batchCreate(toCreate)
  }
  if (toUpdate.length > 0) {
    console.log(`Updating ${toUpdate.length} existing records...`)
    await batchUpdate(toUpdate)
  }
  if (toDeactivate.length > 0) {
    console.log(`Deactivating ${toDeactivate.length} records...`)
    await batchUpdate(toDeactivate)
  }

  console.log('\nSnapshot complete:')
  console.log(`  ${blockchainHolders.size} active holders`)
  console.log(`  ${newCount} new since last snapshot`)
  console.log(`  ${updatedCount} updated`)
  console.log(`  ${deactivatedCount} no longer holding`)
}

main().catch((err) => {
  console.error('Snapshot failed:', err.message)
  process.exit(1)
})
