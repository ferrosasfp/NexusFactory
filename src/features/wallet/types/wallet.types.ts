import type { Address, Chain } from 'viem'

export interface WalletState {
  address: Address | null
  smartAccountAddress: Address | null
  chain: Chain | null
  isConnected: boolean
  isConnecting: boolean
}

export interface SmartAccountInfo {
  address: Address
  isDeployed: boolean
  owner: Address
}
