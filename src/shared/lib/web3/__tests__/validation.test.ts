import { describe, it, expect } from 'vitest'
import { addressSchema, txHashSchema, chainIdSchema, amountSchema, hexSchema } from '../validation'

describe('Web3 Validation Schemas', () => {
  describe('addressSchema', () => {
    it('accepts valid Ethereum address', () => {
      const result = addressSchema.safeParse('0x742d35cc6634c0532925a3b844bc9e7595f2bd18')
      expect(result.success).toBe(true)
    })

    it('rejects address without 0x prefix', () => {
      const result = addressSchema.safeParse('742d35Cc6634C0532925a3b844Bc9e7595f2bD18')
      expect(result.success).toBe(false)
    })

    it('rejects short address', () => {
      const result = addressSchema.safeParse('0x742d35')
      expect(result.success).toBe(false)
    })

    it('rejects empty string', () => {
      const result = addressSchema.safeParse('')
      expect(result.success).toBe(false)
    })
  })

  describe('txHashSchema', () => {
    it('accepts valid tx hash', () => {
      const hash = '0x' + 'a'.repeat(64)
      const result = txHashSchema.safeParse(hash)
      expect(result.success).toBe(true)
    })

    it('rejects short hash', () => {
      const result = txHashSchema.safeParse('0xabc')
      expect(result.success).toBe(false)
    })
  })

  describe('chainIdSchema', () => {
    it('accepts Avalanche mainnet', () => {
      const result = chainIdSchema.safeParse(43114)
      expect(result.success).toBe(true)
    })

    it('accepts Fuji testnet', () => {
      const result = chainIdSchema.safeParse(43113)
      expect(result.success).toBe(true)
    })

    it('rejects unsupported chain', () => {
      const result = chainIdSchema.safeParse(99999)
      expect(result.success).toBe(false)
    })
  })

  describe('amountSchema', () => {
    it('accepts valid amount string', () => {
      const result = amountSchema.safeParse('1000000000000000000')
      expect(result.success).toBe(true)
    })

    it('rejects zero (must be positive)', () => {
      const result = amountSchema.safeParse('0')
      expect(result.success).toBe(false)
    })

    it('rejects negative amount', () => {
      const result = amountSchema.safeParse('-1')
      expect(result.success).toBe(false)
    })

    it('rejects non-numeric string', () => {
      const result = amountSchema.safeParse('abc')
      expect(result.success).toBe(false)
    })
  })

  describe('hexSchema', () => {
    it('accepts valid hex string', () => {
      // Arrange & Act
      const result = hexSchema.safeParse('0xdeadbeef')

      // Assert
      expect(result.success).toBe(true)
    })

    it('accepts empty hex 0x', () => {
      // Arrange & Act
      const result = hexSchema.safeParse('0x')

      // Assert
      expect(result.success).toBe(true)
    })

    it('rejects string without 0x prefix', () => {
      // Arrange & Act
      const result = hexSchema.safeParse('deadbeef')

      // Assert
      expect(result.success).toBe(false)
    })

    it('rejects non-hex characters', () => {
      // Arrange & Act
      const result = hexSchema.safeParse('0xGHIJ')

      // Assert
      expect(result.success).toBe(false)
    })
  })
})
