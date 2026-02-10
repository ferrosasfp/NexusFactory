import type { Hash, Address } from 'viem'

export type TxStatusType = 'pending' | 'confirmed' | 'failed'

export interface Transaction {
  hash: Hash
  from: Address
  to: Address | null
  value: string
  status: TxStatusType
  blockNumber: bigint | null
  timestamp: number
}

export interface TxHistoryEntry {
  hash: Hash
  status: TxStatusType
  description: string
  timestamp: number
}
