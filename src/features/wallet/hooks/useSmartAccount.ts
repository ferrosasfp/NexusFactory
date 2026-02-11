'use client'

import { useState, useCallback } from 'react'
import { useWalletClient } from 'wagmi'
import { isAAConfigured, getSmartAccountAddress } from '@/shared/lib/web3/aa'
import { saveSmartAccount } from '@/actions/wallet'
import type { Address } from 'viem'

/**
 * Hook for Smart Account (ERC-4337) operations.
 * Requires Pimlico bundler to be configured (NEXT_PUBLIC_BUNDLER_URL).
 *
 * Does NOT create the account on mount -- the user must call
 * `createSmartAccount()` explicitly to derive and persist the address.
 */
export function useSmartAccount() {
  const [smartAccountAddress, setSmartAccountAddress] = useState<Address | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: walletClient } = useWalletClient()
  const isConfigured = isAAConfigured()

  const createSmartAccount = useCallback(async () => {
    if (!isConfigured) {
      setError('Account Abstraction not configured. Set NEXT_PUBLIC_BUNDLER_URL in .env.local')
      return null
    }

    if (!walletClient) {
      setError('Wallet not connected. Please connect your wallet first.')
      return null
    }

    setIsCreating(true)
    setError(null)

    try {
      const address = await getSmartAccountAddress(walletClient)
      setSmartAccountAddress(address)

      // Persist the derived address to the user's profile in Supabase
      const result = await saveSmartAccount(address)
      if (result.error) {
        // Address was derived successfully but persistence failed.
        // We still show the address and surface the save error.
        setError(`Smart account derived but failed to save: ${result.error}`)
      }

      return address
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create smart account'
      setError(message)
      return null
    } finally {
      setIsCreating(false)
    }
  }, [isConfigured, walletClient])

  return {
    smartAccountAddress,
    isCreating,
    isConfigured,
    error,
    createSmartAccount,
  }
}
