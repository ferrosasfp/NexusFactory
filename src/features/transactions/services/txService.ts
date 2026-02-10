import { type Hash } from 'viem'
import { publicClient } from '@/shared/lib/web3/client'
import type { TxStatusType } from '../types/transaction.types'

export async function getTxStatus(hash: Hash): Promise<TxStatusType> {
  try {
    const receipt = await publicClient.getTransactionReceipt({ hash })
    return receipt.status === 'success' ? 'confirmed' : 'failed'
  } catch {
    return 'pending'
  }
}

export async function waitForTx(hash: Hash) {
  return publicClient.waitForTransactionReceipt({ hash })
}

export async function getTxDetails(hash: Hash) {
  const [tx, receipt] = await Promise.all([
    publicClient.getTransaction({ hash }),
    publicClient.getTransactionReceipt({ hash }).catch(() => null),
  ])

  return {
    hash: tx.hash,
    from: tx.from,
    to: tx.to,
    value: tx.value.toString(),
    status: receipt ? (receipt.status === 'success' ? 'confirmed' : 'failed') : 'pending' as TxStatusType,
    blockNumber: receipt?.blockNumber ?? null,
  }
}
