import { createPublicClient, http, type PublicClient } from 'viem'
import { defaultChain, getChainById, testnetChains } from './chains'

/**
 * Cache for public clients, keyed by chainId.
 * Prevents creating duplicate clients for the same chain.
 */
const clientCache = new Map<number, PublicClient>()

/**
 * Factory function to get a public client for a specific chain.
 *
 * @param chainId - The chain ID to get a client for
 * @returns A cached PublicClient instance for the chain
 *
 * @example
 * ```typescript
 * import { getPublicClient } from '@/shared/lib/web3/client'
 * import { avalanche } from 'viem/chains'
 *
 * const client = getPublicClient(avalanche.id)
 * const balance = await client.getBalance({ address: '0x...' })
 * ```
 */
export function getPublicClient(chainId?: number): PublicClient {
  const targetChain = chainId ? getChainById(chainId) : defaultChain
  const chain = targetChain || defaultChain

  // Return cached client if it exists
  if (clientCache.has(chain.id)) {
    return clientCache.get(chain.id)!
  }

  // Determine which RPC URL to use based on chain type
  const isTestnet = testnetChains.some((c) => c.id === chain.id)
  const rpcUrl = isTestnet
    ? process.env.NEXT_PUBLIC_RPC_TESTNET
    : process.env.NEXT_PUBLIC_RPC_MAINNET

  // Create and cache new client
  const client = createPublicClient({
    chain,
    transport: http(rpcUrl || undefined),
  })

  clientCache.set(chain.id, client)
  return client
}

/**
 * Default public client (uses defaultChain from chains.ts).
 * For backward compatibility with existing code.
 *
 * @deprecated Use `getPublicClient(chainId)` instead for multi-chain support
 */
export const publicClient = getPublicClient()
