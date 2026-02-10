'use client'

import { useTranslations } from 'next-intl'
import type { TxHistoryEntry } from '../types/transaction.types'

const statusStyles = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
} as const

interface TxHistoryProps {
  entries: TxHistoryEntry[]
}

export function TxHistory({ entries }: TxHistoryProps) {
  const t = useTranslations('transactions')

  if (entries.length === 0) {
    return (
      <p className="text-sm text-gray-500">{t('history')}: --</p>
    )
  }

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">{t('history')}</h3>
      <ul className="space-y-2">
        {entries.map((entry) => (
          <li key={entry.hash} className="flex items-center justify-between rounded-md border border-gray-200 p-3">
            <div>
              <p className="text-sm">{entry.description}</p>
              <p className="font-mono text-xs text-gray-500">
                {entry.hash.slice(0, 10)}...{entry.hash.slice(-8)}
              </p>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[entry.status]}`}>
              {t(entry.status)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
