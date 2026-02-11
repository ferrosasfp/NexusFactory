'use client'

import { useState, useCallback } from 'react'
import { type Abi, type Address, type Hash } from 'viem'
import { useWalletClient } from 'wagmi'
import { getPublicClient } from '@/shared/lib/web3/client'

interface UseContractWriteParams {
  address: Address
  abi: Abi
  functionName: string
  chainId?: number
}

export function useContractWrite({ address, abi, functionName, chainId }: UseContractWriteParams) {
  const { data: walletClient } = useWalletClient()
  const [hash, setHash] = useState<Hash | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const write = useCallback(async (args: readonly unknown[] = []) => {
    if (!walletClient) {
      setError('Wallet not connected')
      return null
    }

    setIsLoading(true)
    setError(null)
    setHash(null)

    try {
      const client = getPublicClient(chainId)
      const { request } = await client.simulateContract({
        address,
        abi,
        functionName,
        args: args as unknown[],
        account: walletClient.account,
      })

      const txHash = await walletClient.writeContract(request)
      setHash(txHash)
      return txHash
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Contract write failed'
      setError(message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [address, abi, functionName, walletClient, chainId])

  return { hash, isLoading, error, write }
}
