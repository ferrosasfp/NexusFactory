import { avalanche, avalancheFuji } from 'viem/chains'
import type { Chain } from 'viem'

/**
 * EVM Chain Registry
 * Avalanche is the default. To add a new chain:
 * 1. Import it from 'viem/chains'
 * 2. Add to supportedChains array
 * 3. Update chainIdSchema in validation.ts
 *
 * Example: import { polygon, polygonAmoy } from 'viem/chains'
 */

export const supportedChains: readonly [Chain, ...Chain[]] = [
  avalancheFuji,
  avalanche,
  // polygon,
  // polygonAmoy,
  // base,
  // baseSepolia,
  // mainnet,
  // sepolia,
]

export const defaultChain = avalancheFuji

export function getChainById(chainId: number): Chain | undefined {
  return supportedChains.find((chain) => chain.id === chainId)
}

export const testnetChains = supportedChains.filter((chain) =>
  chain.testnet === true
)

export const mainnetChains = supportedChains.filter((chain) =>
  chain.testnet !== true
)
