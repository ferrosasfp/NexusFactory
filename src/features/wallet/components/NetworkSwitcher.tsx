'use client'

import { useTranslations } from 'next-intl'
import { useNetwork } from '../hooks/useNetwork'

export function NetworkSwitcher() {
  const t = useTranslations('wallet')
  const { currentChain, supportedChains, switchToChain } = useNetwork()

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium">{t('switchNetwork')}</span>
      <div className="flex flex-wrap gap-2">
        {supportedChains.map((chain) => (
          <button
            key={chain.id}
            onClick={() => switchToChain(chain.id)}
            className={`rounded-md px-3 py-1 text-sm ${
              currentChain?.id === chain.id
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 hover:bg-gray-100'
            }`}
          >
            {chain.name}
          </button>
        ))}
      </div>
    </div>
  )
}
