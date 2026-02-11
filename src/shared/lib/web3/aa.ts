/**
 * Account Abstraction (ERC-4337) Configuration
 * Uses permissionless (by Pimlico) for Smart Account creation.
 *
 * Setup:
 * 1. Create account at https://dashboard.pimlico.io (free, no card)
 * 2. Copy API key to .env.local → NEXT_PUBLIC_BUNDLER_URL
 *
 * Free tier: 1M credits/month (~1,300 operations)
 */

import {
  type Account,
  type Address,
  type Chain,
  type Transport,
  type WalletClient,
  http,
} from 'viem'
import { entryPoint07Address } from 'viem/account-abstraction'
import { createSmartAccountClient } from 'permissionless'
import { toSimpleSmartAccount } from 'permissionless/accounts'
import { createPimlicoClient } from 'permissionless/clients/pimlico'
import { getPublicClient } from './client'

export const AA_CONFIG = {
  /** Bundler URL for ERC-4337 operations */
  bundlerUrl: process.env.NEXT_PUBLIC_BUNDLER_URL ?? '',

  /** Optional: Paymaster for gasless transactions */
  paymasterUrl: process.env.NEXT_PUBLIC_PAYMASTER_URL ?? '',

  /** EntryPoint address (v0.7 standard) */
  entryPoint: entryPoint07Address,
} as const

export function isAAConfigured(): boolean {
  return AA_CONFIG.bundlerUrl.length > 0
}

/**
 * Derives the counterfactual Smart Account address for an owner wallet.
 * This does NOT deploy the account -- it only computes the deterministic
 * address that would be created for this owner.
 */
export async function getSmartAccountAddress(
  owner: WalletClient<Transport, Chain, Account>,
): Promise<Address> {
  if (!isAAConfigured()) {
    throw new Error(
      'Account Abstraction not configured. Set NEXT_PUBLIC_BUNDLER_URL in .env.local',
    )
  }

  const chainId = owner.chain?.id
  const publicClient = getPublicClient(chainId)

  const simpleAccount = await toSimpleSmartAccount({
    client: publicClient,
    owner,
    entryPoint: {
      address: AA_CONFIG.entryPoint,
      version: '0.7',
    },
  })

  return simpleAccount.address
}

/**
 * Creates a full Smart Account client capable of sending UserOperations.
 * The returned client can call `sendTransaction`, `writeContract`, etc.
 * and they will be routed through the ERC-4337 bundler.
 */
export async function createAAClient(
  owner: WalletClient<Transport, Chain, Account>,
) {
  if (!isAAConfigured()) {
    throw new Error(
      'Account Abstraction not configured. Set NEXT_PUBLIC_BUNDLER_URL in .env.local',
    )
  }

  const chain = owner.chain
  if (!chain) {
    throw new Error('WalletClient must be connected to a chain')
  }

  const publicClient = getPublicClient(chain.id)

  const simpleAccount = await toSimpleSmartAccount({
    client: publicClient,
    owner,
    entryPoint: {
      address: AA_CONFIG.entryPoint,
      version: '0.7',
    },
  })

  const pimlicoClient = createPimlicoClient({
    transport: http(AA_CONFIG.bundlerUrl),
    entryPoint: {
      address: AA_CONFIG.entryPoint,
      version: '0.7',
    },
  })

  const smartAccountClient = createSmartAccountClient({
    account: simpleAccount,
    chain,
    bundlerTransport: http(AA_CONFIG.bundlerUrl),
    paymaster: pimlicoClient,
    userOperation: {
      estimateFeesPerGas: async () => {
        return (await pimlicoClient.getUserOperationGasPrice()).fast
      },
    },
  })

  return smartAccountClient
}
