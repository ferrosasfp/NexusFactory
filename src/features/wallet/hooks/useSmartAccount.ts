'use client'

import { useState, useCallback } from 'react'
import { isAAConfigured } from '@/shared/lib/web3/aa'
import type { Address } from 'viem'

/**
 * Hook for Smart Account (ERC-4337) operations.
 * Requires Pimlico bundler to be configured.
 */
export function useSmartAccount() {
  const [smartAccountAddress, setSmartAccountAddress] = useState<Address | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isConfigured = isAAConfigured()

  const createSmartAccount = useCallback(async (ownerAddress: Address) => {
    if (!isConfigured) {
      setError('Account Abstraction not configured. Set NEXT_PUBLIC_BUNDLER_URL in .env.local')
      return null
    }

    setIsCreating(true)
    setError(null)

    try {
      // Smart Account creation will be implemented when linking with Supabase auth
      // For now, this is a placeholder that the auth flow will call
      setSmartAccountAddress(null)
      return null
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create smart account'
      setError(message)
      return null
    } finally {
      setIsCreating(false)
    }
  }, [isConfigured])

  return {
    smartAccountAddress,
    isCreating,
    isConfigured,
    error,
    createSmartAccount,
  }
}
