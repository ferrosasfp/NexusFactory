'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { type Abi, type Address } from 'viem'
import { getPublicClient } from '@/shared/lib/web3/client'

interface UseContractReadParams {
  address: Address
  abi: Abi
  functionName: string
  args?: readonly unknown[]
  enabled?: boolean
  chainId?: number
}

export function useContractRead({ address, abi, functionName, args = [], enabled = true, chainId }: UseContractReadParams) {
  const [data, setData] = useState<unknown>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Stabilize array/object references to prevent infinite re-renders
  const argsKey = JSON.stringify(args)
  const stableArgs = useMemo(() => args, [argsKey]) // eslint-disable-line react-hooks/exhaustive-deps
  const abiRef = useRef(abi)
  abiRef.current = abi

  const refetch = useCallback(async () => {
    if (!enabled) return

    setIsLoading(true)
    setError(null)

    try {
      const client = getPublicClient(chainId)
      const result = await client.readContract({
        address,
        abi: abiRef.current,
        functionName,
        args: stableArgs as unknown[],
      })
      setData(result)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Contract read failed'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [address, functionName, stableArgs, enabled, chainId])

  useEffect(() => {
    if (enabled) {
      refetch()
    }
  }, [enabled, refetch])

  return { data, isLoading, error, refetch }
}
