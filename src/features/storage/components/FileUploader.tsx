'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useStorage } from '../hooks/useStorage'

export function FileUploader() {
  const t = useTranslations('storage')
  const { upload, isUploading, error, clearError } = useStorage()
  const [dragActive, setDragActive] = useState(false)
  const [lastUpload, setLastUpload] = useState<{ cid: string; name: string } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    clearError()
    setLastUpload(null)
    const result = await upload(file)
    if (result) {
      setLastUpload({ cid: result.cid, name: result.name })
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="space-y-4">
      <div
        className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          onChange={handleChange}
          className="hidden"
          disabled={isUploading}
        />

        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            {t('dragOrClick')}
          </p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isUploading ? t('uploading') : t('selectFile')}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {lastUpload && (
        <div className="rounded-md border border-green-200 bg-green-50 p-3">
          <p className="text-sm text-green-800">
            {t('uploadSuccess', { name: lastUpload.name })}
          </p>
          <p className="mt-1 font-mono text-xs text-green-700">
            CID: {lastUpload.cid}
          </p>
        </div>
      )}
    </div>
  )
}
