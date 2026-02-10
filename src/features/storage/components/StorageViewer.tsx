'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useStorage } from '../hooks/useStorage'

export function StorageViewer() {
  const t = useTranslations('storage')
  const { getUrl } = useStorage()
  const [cid, setCid] = useState('')
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleRetrieve(e: React.FormEvent) {
    e.preventDefault()
    if (!cid.trim()) return

    setLoading(true)
    setUrl(null)

    const result = await getUrl(cid.trim())
    setUrl(result ?? null)
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleRetrieve} className="flex gap-2">
        <input
          type="text"
          value={cid}
          onChange={(e) => setCid(e.target.value)}
          placeholder={t('enterCid')}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading || !cid.trim()}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? t('loading') : t('retrieve')}
        </button>
      </form>

      {url && (
        <div className="rounded-md border border-gray-200 p-4">
          <p className="mb-2 text-sm font-medium">{t('fileUrl')}</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-sm text-blue-600 hover:underline"
          >
            {url}
          </a>
        </div>
      )}
    </div>
  )
}
