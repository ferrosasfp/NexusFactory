import type { Abi, Address } from 'viem'

export interface ContractConfig {
  address: Address
  abi: Abi
  chainId?: number
}

export interface ContractReadResult<T = unknown> {
  data: T | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export interface ContractWriteResult {
  hash: string | null
  isLoading: boolean
  error: string | null
  write: () => void
}
