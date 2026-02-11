import { type Hash } from 'viem'
import { getPublicClient } from '@/shared/lib/web3/client'
import type { TxStatusType } from '../types/transaction.types'

export async function getTxStatus(hash: Hash, chainId?: number): Promise<TxStatusType> {
  try {
    const client = getPublicClient(chainId)
    const receipt = await client.getTransactionReceipt({ hash })
    return receipt.status === 'success' ? 'confirmed' : 'failed'
  } catch {
    return 'pending'
  }
}

export async function waitForTx(hash: Hash, chainId?: number) {
  const client = getPublicClient(chainId)
  return client.waitForTransactionReceipt({ hash })
}

export async function getTxDetails(hash: Hash, chainId?: number) {
  const client = getPublicClient(chainId)
  const [tx, receipt] = await Promise.all([
    client.getTransaction({ hash }),
    client.getTransactionReceipt({ hash }).catch(() => null),
  ])

  return {
    hash: tx.hash,
    from: tx.from,
    to: tx.to,
    value: tx.value.toString(),
    status: (receipt ? (receipt.status === 'success' ? 'confirmed' : 'failed') : 'pending') as TxStatusType,
    blockNumber: receipt?.blockNumber ?? null,
  }
}
