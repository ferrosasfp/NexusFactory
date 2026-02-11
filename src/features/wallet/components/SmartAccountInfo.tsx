'use client'

import { useTranslations } from 'next-intl'
import { useAccount } from 'wagmi'
import { useSmartAccount } from '../hooks/useSmartAccount'

export function SmartAccountInfo() {
  const t = useTranslations('wallet')
  const { isConnected } = useAccount()
  const {
    smartAccountAddress,
    isCreating,
    isConfigured,
    error,
    createSmartAccount,
  } = useSmartAccount()

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
    <div className="rounded-lg border border-gray-200 p-4 space-y-3">
      <span className="text-sm font-medium">{t('smartAccount')}</span>

      {smartAccountAddress ? (
        <p className="font-mono text-sm break-all">{smartAccountAddress}</p>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-gray-500">No smart account linked</p>
          <button
            type="button"
            onClick={createSmartAccount}
            disabled={!isConnected || isCreating}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCreating ? 'Creating...' : 'Create Smart Account'}
          </button>
          {!isConnected && (
            <p className="text-xs text-gray-400">Connect your wallet first</p>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
