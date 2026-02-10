import type { StorageProvider } from '../types/storage.types'
import { PinataProvider } from './pinataProvider'

/**
 * Factory that returns the configured storage provider.
 * Set STORAGE_PROVIDER env var to change provider.
 *
 * To add a new provider:
 * 1. Create a class implementing StorageProvider
 * 2. Add a case here
 * 3. Set STORAGE_PROVIDER=your-provider in .env.local
 */
export function createStorageProvider(): StorageProvider {
  const provider = process.env.STORAGE_PROVIDER ?? 'pinata'

  switch (provider) {
    case 'pinata':
      return new PinataProvider()
    default:
      throw new Error(
        `Unknown storage provider: "${provider}". ` +
        `Supported: pinata. Set STORAGE_PROVIDER in .env.local`
      )
  }
}
