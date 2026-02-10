'use client'

import { useTranslations } from 'next-intl'
import { useWallet } from '../hooks/useWallet'

export function ConnectWallet() {
  const t = useTranslations('wallet')
  const { address, isConnected, isConnecting, connectWallet, disconnect } = useWallet()

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <span className="rounded-md bg-green-100 px-3 py-1 text-sm text-green-800">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100"
        >
          {t('disconnect')}
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={connectWallet}
      disabled={isConnecting}
      className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
    >
      {isConnecting ? '...' : t('connect')}
    </button>
  )
}
