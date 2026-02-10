'use client'

import { useTranslations } from 'next-intl'
import { useSmartAccount } from '../hooks/useSmartAccount'

export function SmartAccountInfo() {
  const t = useTranslations('wallet')
  const { smartAccountAddress, isConfigured, error } = useSmartAccount()

  if (!isConfigured) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <p className="text-sm text-yellow-800">
          {t('smartAccount')}: Not configured. Set NEXT_PUBLIC_BUNDLER_URL in .env.local
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 p-4 space-y-2">
      <span className="text-sm font-medium">{t('smartAccount')}</span>
      {smartAccountAddress ? (
        <p className="font-mono text-sm break-all">{smartAccountAddress}</p>
      ) : (
        <p className="text-sm text-gray-500">No smart account linked</p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
