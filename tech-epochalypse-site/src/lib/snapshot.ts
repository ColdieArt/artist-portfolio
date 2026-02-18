import { fetchAllHolders, batchCreateRecords, batchUpdateRecords } from './airtable'

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY ?? ''
const NFT_CONTRACT_ADDRESS =
  process.env.NFT_CONTRACT_ADDRESS ?? '0x0D1edb24225Cd549B70a94Ccf10A3754513C8C49'

interface AlchemyOwner {
  ownerAddress: string
  tokenBalances: { tokenId: string; balance: string }[]
}

export interface SnapshotResult {
  totalHolders: number
  newHolders: number
  updatedHolders: number
  deactivatedHolders: number
  timestamp: string
}

interface HolderData {
  tokenCount: number
  tokenIds: string[]
}

async function fetchHoldersFromAlchemy(): Promise<Record<string, HolderData>> {
  const url = `https://eth-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getOwnersForContract?contractAddress=${NFT_CONTRACT_ADDRESS}&withTokenBalances=true`
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Alchemy API failed: ${res.status} ${body}`)
  }
  const data = await res.json()
  const owners: AlchemyOwner[] = data.owners ?? []

  const holders: Record<string, HolderData> = {}
  for (const owner of owners) {
    const wallet = owner.ownerAddress.toLowerCase()
    const tokenIds = owner.tokenBalances.map((t) => t.tokenId)
    holders[wallet] = { tokenCount: tokenIds.length, tokenIds }
  }
  return holders
}

export async function runSnapshot(): Promise<SnapshotResult> {
  const now = new Date().toISOString()

  // 1. Fetch current holders from blockchain
  const blockchainHolders = await fetchHoldersFromAlchemy()
  const blockchainWallets = Object.keys(blockchainHolders)

  // 2. Fetch existing records from Airtable
  const existingRecords = await fetchAllHolders()
  const existingByWallet: Record<string, (typeof existingRecords)[0]> = {}
  for (const rec of existingRecords) {
    existingByWallet[rec.fields.wallet_address.toLowerCase()] = rec
  }

  const toCreate: { fields: Record<string, unknown> }[] = []
  const toUpdate: { id: string; fields: Record<string, unknown> }[] = []
  let newCount = 0
  let updatedCount = 0

  // 3. Process blockchain holders
  for (const wallet of blockchainWallets) {
    const holderData = blockchainHolders[wallet]
    const existing = existingByWallet[wallet]
    const tokenIdsStr = holderData.tokenIds.join(', ')

    if (existing) {
      toUpdate.push({
        id: existing.id,
        fields: {
          token_count: holderData.tokenCount,
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
          token_count: holderData.tokenCount,
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
  let deactivatedCount = 0
  const toDeactivate: { id: string; fields: Record<string, unknown> }[] = []
  for (const wallet of Object.keys(existingByWallet)) {
    if (!blockchainHolders[wallet] && existingByWallet[wallet].fields.is_active_holder) {
      toDeactivate.push({
        id: existingByWallet[wallet].id,
        fields: {
          is_active_holder: false,
          eligible_for_contests: false,
        },
      })
      deactivatedCount++
    }
  }

  // 5. Execute Airtable operations
  if (toCreate.length > 0) await batchCreateRecords(toCreate)
  if (toUpdate.length > 0) await batchUpdateRecords(toUpdate)
  if (toDeactivate.length > 0) await batchUpdateRecords(toDeactivate)

  return {
    totalHolders: blockchainWallets.length,
    newHolders: newCount,
    updatedHolders: updatedCount,
    deactivatedHolders: deactivatedCount,
    timestamp: now,
  }
}
