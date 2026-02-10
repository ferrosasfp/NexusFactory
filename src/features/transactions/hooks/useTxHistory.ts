'use client'

import { useState, useCallback } from 'react'
import type { Hash } from 'viem'
import type { TxHistoryEntry, TxStatusType } from '../types/transaction.types'

export function useTxHistory() {
  const [entries, setEntries] = useState<TxHistoryEntry[]>([])

  const addEntry = useCallback((hash: Hash, description: string) => {
    const entry: TxHistoryEntry = {
      hash,
      status: 'pending',
      description,
      timestamp: Date.now(),
    }
    setEntries(prev => [entry, ...prev])
  }, [])

  const updateStatus = useCallback((hash: Hash, status: TxStatusType) => {
    setEntries(prev =>
      prev.map(entry =>
        entry.hash === hash ? { ...entry, status } : entry
      )
    )
  }, [])

  const clearHistory = useCallback(() => {
    setEntries([])
  }, [])

  return { entries, addEntry, updateStatus, clearHistory }
}
