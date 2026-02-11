import { createPublicClient, http, type PublicClient } from 'viem'
import { defaultChain, getChainById } from './chains'

const clientCache = new Map<number, PublicClient>()

/**
 * Returns a PublicClient for the given chain ID.
 * Clients are cached per chain so repeated calls are free.
 * Falls back to defaultChain when no chainId is provided.
 */
export function getPublicClient(chainId?: number): PublicClient {
  const chain = chainId ? (getChainById(chainId) ?? defaultChain) : defaultChain
  const cached = clientCache.get(chain.id)
  if (cached) return cached

  const rpcUrl = chain.testnet
    ? (process.env.NEXT_PUBLIC_RPC_TESTNET || undefined)
    : (process.env.NEXT_PUBLIC_RPC_MAINNET || undefined)

  const client = createPublicClient({ chain, transport: http(rpcUrl) })
  clientCache.set(chain.id, client)
  return client
}

/** @deprecated Use getPublicClient(chainId) instead for multi-chain support */
export const publicClient = getPublicClient()
