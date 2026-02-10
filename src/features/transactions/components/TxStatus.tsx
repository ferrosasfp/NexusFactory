'use client'

import { useTranslations } from 'next-intl'
import { type Hash } from 'viem'
import { useTx } from '../hooks/useTx'

interface TxStatusProps {
  hash: Hash
}

const statusStyles = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
} as const

export function TxStatus({ hash }: TxStatusProps) {
  const t = useTranslations('transactions')
  const { status, isWaiting, waitForConfirmation } = useTx(hash)

  return (
    <div className="rounded-md border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs text-gray-500">
            {hash.slice(0, 10)}...{hash.slice(-8)}
          </p>
          <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[status]}`}>
            {t(status)}
          </span>
        </div>

        {status === 'pending' && !isWaiting && (
          <button
            onClick={waitForConfirmation}
            className="text-sm text-blue-600 hover:underline"
          >
            {t('status')}
          </button>
        )}

        {isWaiting && (
          <span className="text-sm text-gray-500">...</span>
        )}
      </div>
    </div>
  )
}
