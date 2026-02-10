import type { StorageProvider, UploadResult } from '../types/storage.types'

/**
 * Pinata IPFS storage provider (default).
 * Requires PINATA_JWT (server-side only) and NEXT_PUBLIC_STORAGE_GATEWAY.
 */
export class PinataProvider implements StorageProvider {
  private jwt: string
  private gateway: string

  constructor() {
    this.jwt = process.env.PINATA_JWT ?? ''
    this.gateway = process.env.NEXT_PUBLIC_STORAGE_GATEWAY ?? 'https://gateway.pinata.cloud/ipfs'

    if (!this.jwt) {
      console.warn('PINATA_JWT not set. Storage uploads will fail.')
    }
  }

  async upload(file: File, metadata?: Record<string, string>): Promise<UploadResult> {
    const formData = new FormData()
    formData.append('file', file)

    if (metadata) {
      formData.append('pinataMetadata', JSON.stringify({
        name: file.name,
        keyvalues: metadata,
      }))
    } else {
      formData.append('pinataMetadata', JSON.stringify({ name: file.name }))
    }

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.jwt}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Pinata upload failed: ${(errorData as Record<string, string>).error ?? response.statusText}`)
    }

    const data = await response.json() as { IpfsHash: string }
    const cid = data.IpfsHash

    return {
      cid,
      url: `${this.gateway}/${cid}`,
    }
  }

  async retrieve(cid: string): Promise<string> {
    return `${this.gateway}/${cid}`
  }

  async delete(cid: string): Promise<void> {
    const response = await fetch(`https://api.pinata.cloud/pinning/unpin/${cid}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.jwt}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Pinata unpin failed: ${response.statusText}`)
    }
  }
}
