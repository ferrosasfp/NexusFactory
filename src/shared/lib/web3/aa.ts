/**
 * Account Abstraction (ERC-4337) Configuration
 * Uses permissionless (by Pimlico) for Smart Account creation.
 *
 * Setup:
 * 1. Create account at https://dashboard.pimlico.io (free, no card)
 * 2. Copy API key to .env.local → NEXT_PUBLIC_BUNDLER_URL
 *
 * Free tier: 1M credits/month (~1,300 operations)
 */

export const AA_CONFIG = {
  /** Bundler URL for ERC-4337 operations */
  bundlerUrl: process.env.NEXT_PUBLIC_BUNDLER_URL ?? '',

  /** Optional: Paymaster for gasless transactions */
  paymasterUrl: process.env.NEXT_PUBLIC_PAYMASTER_URL ?? '',

  /** EntryPoint address (v0.7 standard) */
  entryPoint: '0x0000000071727De22E5E9d8BAf0edAc6f37da032' as const,
} as const

export function isAAConfigured(): boolean {
  return AA_CONFIG.bundlerUrl.length > 0
}
