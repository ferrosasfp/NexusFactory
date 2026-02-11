'use client'

import { useState, useCallback } from 'react'
import { isAAConfigured } from '@/shared/lib/web3/aa'
import type { Address } from 'viem'

/**
 * Hook for Smart Account (ERC-4337) operations.
 * Requires Pimlico bundler to be configured.
 *
 * @wip This hook is a STUB implementation. The createSmartAccount function
 * does not yet perform actual smart account creation. It is a placeholder
 * for future integration with Supabase auth and Pimlico bundler.
 * See the relevant PRP for the full implementation plan.
 */
export function useSmartAccount() {
  const [smartAccountAddress, setSmartAccountAddress] = useState<Address | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isConfigured = isAAConfigured()

  const createSmartAccount = useCallback(async (ownerAddress: Address) => {
    console.warn(
      '[WIP] Smart Account creation not yet implemented. See PRP for implementation plan.',
      { ownerAddress }
    )

    if (!isConfigured) {
      setError('Account Abstraction not configured. Set NEXT_PUBLIC_BUNDLER_URL in .env.local')
      return null
    }

    setIsCreating(true)
    setError(null)

    try {
      // TODO: Implement actual Smart Account creation with Pimlico bundler
      // This will include:
      // 1. Create smart account using permissionless SDK
      // 2. Link to Supabase auth user
      // 3. Store smart account address in database
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
    isWip: true,
    error,
    createSmartAccount,
  }
}
