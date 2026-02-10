'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { type Abi, type Address } from 'viem'
import { useContractRead } from '../hooks/useContractRead'

interface ContractReaderProps {
  address?: Address
  abi?: Abi
}

export function ContractReader({ address: defaultAddress, abi: defaultAbi }: ContractReaderProps) {
  const t = useTranslations('contracts')
  const [address, setAddress] = useState(defaultAddress ?? '' as Address)
  const [functionName, setFunctionName] = useState('')
  const [enabled, setEnabled] = useState(false)

  const { data, isLoading, error, refetch } = useContractRead({
    address: address as Address,
    abi: defaultAbi ?? [],
    functionName,
    enabled: enabled && !!address && !!functionName,
  })

  function handleRead(e: React.FormEvent) {
    e.preventDefault()
    setEnabled(true)
    refetch()
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">{t('read')}</h3>

      <form onSubmit={handleRead} className="space-y-3">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value as Address)}
          placeholder={t('address')}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />

        <input
          type="text"
          value={functionName}
          onChange={(e) => setFunctionName(e.target.value)}
          placeholder="Function name (e.g. balanceOf)"
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />

        <button
          type="submit"
          disabled={isLoading || !address || !functionName}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? '...' : t('read')}
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {data !== null && (
        <pre className="overflow-auto rounded-md bg-gray-100 p-3 text-sm">
          {typeof data === 'bigint' ? data.toString() : JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  )
}
