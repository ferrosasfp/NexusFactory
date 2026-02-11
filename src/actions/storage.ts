'use server'

import { createClient } from '@/lib/supabase/server'
import { createStorageProvider } from '@/features/storage/services/storageProvider'

export async function uploadFile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const file = formData.get('file') as File | null
  if (!file) {
    return { error: 'No file provided' }
  }

  const metadataStr = formData.get('metadata') as string | null
  let metadata: Record<string, string> | undefined
  if (metadataStr) {
    try {
      const parsed: unknown = JSON.parse(metadataStr)
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        metadata = parsed as Record<string, string>
      } else {
        return { error: 'Metadata must be a JSON object' }
      }
    } catch {
      return { error: 'Invalid metadata JSON' }
    }
  }

  try {
    const provider = createStorageProvider()
    const result = await provider.upload(file, metadata)
    return { cid: result.cid, url: result.url }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed'
    return { error: message }
  }
}

// TODO: Add a `user_files` table + RLS to track CID ownership per user.
// Currently any authenticated user can delete any pinned CID.
export async function deleteFile(cid: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  if (!cid || typeof cid !== 'string') {
    return { error: 'Invalid CID' }
  }

  try {
    const provider = createStorageProvider()
    await provider.delete(cid)
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Delete failed'
    return { error: message }
  }
}

export async function getFileUrl(cid: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  if (!cid || typeof cid !== 'string') {
    return { error: 'Invalid CID' }
  }

  try {
    const provider = createStorageProvider()
    const url = await provider.retrieve(cid)
    return { url }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get URL'
    return { error: message }
  }
}
