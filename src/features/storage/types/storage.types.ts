export interface UploadResult {
  cid: string
  url: string
}

export interface StorageProvider {
  upload(file: File, metadata?: Record<string, string>): Promise<UploadResult>
  retrieve(cid: string): Promise<string>
  delete(cid: string): Promise<void>
}

export interface StorageFile {
  cid: string
  name: string
  size: number
  mimeType: string
  url: string
  createdAt: string
}
