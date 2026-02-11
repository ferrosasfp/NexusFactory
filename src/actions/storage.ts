'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createStorageProvider } from '@/features/storage/services/storageProvider'

// Security constants
const MAX_FILE_SIZE = 10_000_000 // 10MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'application/json',
] as const

// Zod schemas for validation
const cidSchema = z.string().regex(
  /^(Qm[1-9A-HJ-NP-Za-km-z]{44,}|bafy[a-z2-7]{55,})$/,
  'Invalid IPFS CID format'
)

const metadataSchema = z.record(z.string(), z.string()).optional()

const fileSchema = z.object({
  size: z.number().max(MAX_FILE_SIZE, `File size must not exceed ${MAX_FILE_SIZE / 1_000_000}MB`),
  type: z.enum(ALLOWED_MIME_TYPES, {
    error: `File type must be one of: ${ALLOWED_MIME_TYPES.join(', ')}`,
  }),
})

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

  // Validate file size and MIME type
  const fileValidation = fileSchema.safeParse({
    size: file.size,
    type: file.type,
  })

  if (!fileValidation.success) {
    return { error: fileValidation.error.issues[0].message }
  }

  // Parse and validate metadata
  let metadata: Record<string, string> | undefined
  const metadataStr = formData.get('metadata') as string | null

  if (metadataStr) {
    try {
      const parsedMetadata = JSON.parse(metadataStr) as unknown
      const metadataValidation = metadataSchema.safeParse(parsedMetadata)

      if (!metadataValidation.success) {
        return { error: 'Invalid metadata format' }
      }

      metadata = metadataValidation.data
    } catch {
      return { error: 'Invalid JSON in metadata field' }
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

export async function deleteFile(cid: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Validate CID format
  const cidValidation = cidSchema.safeParse(cid)

  if (!cidValidation.success) {
    return { error: cidValidation.error.issues[0].message }
  }

  try {
    const provider = createStorageProvider()
    await provider.delete(cidValidation.data)
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Delete failed'
    return { error: message }
  }
}

export async function getFileUrl(cid: string) {
  // Validate CID format
  const cidValidation = cidSchema.safeParse(cid)

  if (!cidValidation.success) {
    return { error: cidValidation.error.issues[0].message }
  }

  try {
    const provider = createStorageProvider()
    const url = await provider.retrieve(cidValidation.data)
    return { url }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get URL'
    return { error: message }
  }
}
