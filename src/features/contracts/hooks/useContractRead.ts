'use client'

import { useState, useCallback, useEffect } from 'react'
import { type Abi, type Address } from 'viem'
import { publicClient } from '@/shared/lib/web3/client'

interface UseContractReadParams {
  address: Address
  abi: Abi
  functionName: string
  args?: readonly unknown[]
  enabled?: boolean
}

export function useContractRead({ address, abi, functionName, args = [], enabled = true }: UseContractReadParams) {
  const [data, setData] = useState<unknown>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!enabled) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await publicClient.readContract({
        address,
        abi,
        functionName,
        args: args as unknown[],
      })
      setData(result)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Contract read failed'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [address, abi, functionName, args, enabled])

  useEffect(() => {
    if (enabled) {
      refetch()
    }
  }, [enabled, refetch])

  return { data, isLoading, error, refetch }
}
