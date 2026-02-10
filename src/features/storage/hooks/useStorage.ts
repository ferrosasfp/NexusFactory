'use client'

import { useState, useCallback } from 'react'
import { uploadFile, deleteFile, getFileUrl } from '@/actions/storage'
import type { StorageFile } from '../types/storage.types'

export function useStorage() {
  const [files, setFiles] = useState<StorageFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upload = useCallback(async (file: File, metadata?: Record<string, string>) => {
    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata))
      }

      const result = await uploadFile(formData)

      if ('error' in result) {
        setError(result.error as string)
        return null
      }

      const { cid, url } = result as { cid: string; url: string }

      const newFile: StorageFile = {
        cid,
        name: file.name,
        size: file.size,
        mimeType: file.type,
        url,
        createdAt: new Date().toISOString(),
      }

      setFiles(prev => [newFile, ...prev])
      return newFile
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      setError(message)
      return null
    } finally {
      setIsUploading(false)
    }
  }, [])

  const remove = useCallback(async (cid: string) => {
    setError(null)

    try {
      const result = await deleteFile(cid)

      if ('error' in result) {
        setError(result.error as string)
        return false
      }

      setFiles(prev => prev.filter(f => f.cid !== cid))
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Delete failed'
      setError(message)
      return false
    }
  }, [])

  const getUrl = useCallback(async (cid: string) => {
    const result = await getFileUrl(cid)
    if ('error' in result) {
      setError(result.error as string)
      return null
    }
    return (result as { url: string }).url
  }, [])

  return {
    files,
    isUploading,
    error,
    upload,
    remove,
    getUrl,
    clearError: () => setError(null),
  }
}
