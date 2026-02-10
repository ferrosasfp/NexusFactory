import { z } from 'zod'
import { isAddress } from 'viem'
import { supportedChains } from './chains'

/** Validates an EVM address using Viem's isAddress */
export const addressSchema = z.string().refine(
  (val) => isAddress(val),
  { message: 'Invalid EVM address' }
)

/** Validates a transaction hash (0x + 64 hex chars) */
export const txHashSchema = z.string().regex(
  /^0x[a-fA-F0-9]{64}$/,
  'Invalid transaction hash'
)

/** Validates a chain ID against supported chains */
export const chainIdSchema = z.number().refine(
  (val) => supportedChains.some((chain) => chain.id === val),
  { message: `Chain ID must be one of: ${supportedChains.map((c) => c.id).join(', ')}` }
)

/** Validates a positive amount string (for token amounts) */
export const amountSchema = z.string().refine(
  (val) => {
    try {
      const num = BigInt(val)
      return num > 0n
    } catch {
      return false
    }
  },
  { message: 'Amount must be a positive integer' }
)

/** Validates a hex string */
export const hexSchema = z.string().regex(
  /^0x[a-fA-F0-9]*$/,
  'Invalid hex string'
)
