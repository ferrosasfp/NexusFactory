'use client'

import { useTranslations } from 'next-intl'
import { formatUnits } from 'viem'
import { useWallet } from '../hooks/useWallet'
import { useBalance } from 'wagmi'

export function WalletInfo() {
  const t = useTranslations('wallet')
  const { address, isConnected, chain } = useWallet()
  const { data: balance } = useBalance({ address: address ?? undefined })

  if (!isConnected || !address) return null

  return (
    <div className="rounded-lg border border-gray-200 p-4 space-y-3">
      <div>
        <span className="text-sm text-gray-500">{t('address')}</span>
        <p className="font-mono text-sm break-all">{address}</p>
      </div>
      {balance && (
        <div>
          <span className="text-sm text-gray-500">{t('balance')}</span>
          <p className="text-lg font-semibold">
            {parseFloat(formatUnits(balance.value, balance.decimals)).toFixed(4)} {balance.symbol}
          </p>
        </div>
      )}
      {chain && (
        <div>
          <span className="text-sm text-gray-500">{t('network')}</span>
          <p className="text-sm">{chain.name} (ID: {chain.id})</p>
        </div>
      )}
    </div>
  )
}
