import { createPublicClient, http } from 'viem'
import { defaultChain } from './chains'

/**
 * Public client for read-only on-chain operations.
 * Does not require a wallet connection.
 */
export const publicClient = createPublicClient({
  chain: defaultChain,
  transport: http(process.env.NEXT_PUBLIC_RPC_TESTNET || undefined),
})
