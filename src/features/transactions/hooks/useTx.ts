'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { type Hash } from 'viem'
import { getTxStatus, waitForTx } from '../services/txService'
import type { TxStatusType } from '../types/transaction.types'

export function useTx(hash: Hash | null) {
  const [status, setStatus] = useState<TxStatusType>('pending')
  const [isWaiting, setIsWaiting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hashRef = useRef(hash)

  useEffect(() => {
    hashRef.current = hash
  }, [hash])

  const checkStatus = useCallback(async () => {
    if (!hash) return
    try {
      const result = await getTxStatus(hash)
      setStatus(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check status')
    }
  }, [hash])

  const waitForConfirmation = useCallback(async () => {
    if (!hash) return
    setIsWaiting(true)
    setError(null)

    try {
      const receipt = await waitForTx(hash)
      setStatus(receipt.status === 'success' ? 'confirmed' : 'failed')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed')
      setStatus('failed')
    } finally {
      setIsWaiting(false)
    }
  }, [hash])

  useEffect(() => {
    if (hash) {
      checkStatus()
    }
  }, [hash, checkStatus])

  return { status, isWaiting, error, checkStatus, waitForConfirmation }
}
