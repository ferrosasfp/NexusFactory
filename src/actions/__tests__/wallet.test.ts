import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks - declared before imports so hoisting works correctly
// ---------------------------------------------------------------------------

// Chainable query builder mock that mirrors Supabase's fluent API:
//   supabase.from('table').select('...').eq('col', val).neq('col', val).maybeSingle()
//   supabase.from('table').update({...}).eq('col', val)
//   supabase.from('table').select('...').eq('col', val).single()

const mockMaybeSingle = vi.fn()
const mockSingle = vi.fn()
const mockNeq = vi.fn(() => ({ maybeSingle: mockMaybeSingle }))
const mockEq = vi.fn(() => ({
  neq: mockNeq,
  maybeSingle: mockMaybeSingle,
  single: mockSingle,
}))
const mockSelect = vi.fn(() => ({ eq: mockEq }))
const mockUpdate = vi.fn(() => ({ eq: mockEq }))

const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(() => ({
    select: mockSelect,
    update: mockUpdate,
  })),
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}))

// ---------------------------------------------------------------------------
// Imports under test (after mocks)
// ---------------------------------------------------------------------------

import {
  linkWallet,
  unlinkWallet,
  saveSmartAccount,
  getWalletInfo,
} from '../wallet'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VALID_ADDRESS = '0x742d35cc6634c0532925a3b844bc9e7595f2bd18'
const USER_ID = 'user-abc-123'

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Wallet Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default: authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: USER_ID } },
    })

    // Default: no existing record, no DB errors
    mockMaybeSingle.mockResolvedValue({ data: null })
    mockSingle.mockResolvedValue({ data: null, error: null })
    mockEq.mockReturnValue({
      neq: mockNeq,
      maybeSingle: mockMaybeSingle,
      single: mockSingle,
    })
    // For update().eq() chain - resolve without error by default
    mockUpdate.mockReturnValue({
      eq: vi.fn(() => Promise.resolve({ error: null })),
    })
  })

  // =========================================================================
  // linkWallet
  // =========================================================================
  describe('linkWallet', () => {
    it('should return error for invalid address without 0x prefix', async () => {
      // Arrange
      const badAddress = '742d35cc6634c0532925a3b844bc9e7595f2bd18'

      // Act
      const result = await linkWallet(badAddress)

      // Assert
      expect(result).toEqual({ error: 'Invalid Ethereum address' })
      expect(mockSupabase.auth.getUser).not.toHaveBeenCalled()
    })

    it('should return error for short address', async () => {
      // Arrange
      const shortAddress = '0x742d35'

      // Act
      const result = await linkWallet(shortAddress)

      // Assert
      expect(result).toEqual({ error: 'Invalid Ethereum address' })
    })

    it('should return error when not authenticated', async () => {
      // Arrange
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
      })

      // Act
      const result = await linkWallet(VALID_ADDRESS)

      // Assert
      expect(result).toEqual({ error: 'Not authenticated' })
    })

    it('should return error when wallet is already linked to another user', async () => {
      // Arrange
      mockMaybeSingle.mockResolvedValue({ data: { id: 'other-user-456' } })

      // Act
      const result = await linkWallet(VALID_ADDRESS)

      // Assert
      expect(result).toEqual({
        error: 'This wallet address is already linked to another account',
      })
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
      expect(mockSelect).toHaveBeenCalledWith('id')
    })

    it('should successfully link valid address', async () => {
      // Arrange
      mockMaybeSingle.mockResolvedValue({ data: null })
      const updateEqFn = vi.fn(() => Promise.resolve({ error: null }))
      mockUpdate.mockReturnValue({ eq: updateEqFn })

      // Act
      const result = await linkWallet(VALID_ADDRESS)

      // Assert
      expect(result).toEqual({ success: true })
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ wallet_address: VALID_ADDRESS }),
      )
      expect(updateEqFn).toHaveBeenCalledWith('id', USER_ID)
    })

    it('should return error when database update fails', async () => {
      // Arrange
      mockMaybeSingle.mockResolvedValue({ data: null })
      const updateEqFn = vi.fn(() =>
        Promise.resolve({ error: { message: 'DB write error' } }),
      )
      mockUpdate.mockReturnValue({ eq: updateEqFn })

      // Act
      const result = await linkWallet(VALID_ADDRESS)

      // Assert
      expect(result).toEqual({ error: 'DB write error' })
    })
  })

  // =========================================================================
  // unlinkWallet
  // =========================================================================
  describe('unlinkWallet', () => {
    it('should return error when not authenticated', async () => {
      // Arrange
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
      })

      // Act
      const result = await unlinkWallet()

      // Assert
      expect(result).toEqual({ error: 'Not authenticated' })
    })

    it('should successfully unlink wallet', async () => {
      // Arrange
      const updateEqFn = vi.fn(() => Promise.resolve({ error: null }))
      mockUpdate.mockReturnValue({ eq: updateEqFn })

      // Act
      const result = await unlinkWallet()

      // Assert
      expect(result).toEqual({ success: true })
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ wallet_address: null }),
      )
      expect(updateEqFn).toHaveBeenCalledWith('id', USER_ID)
    })

    it('should return error when database update fails', async () => {
      // Arrange
      const updateEqFn = vi.fn(() =>
        Promise.resolve({ error: { message: 'Unlink failed' } }),
      )
      mockUpdate.mockReturnValue({ eq: updateEqFn })

      // Act
      const result = await unlinkWallet()

      // Assert
      expect(result).toEqual({ error: 'Unlink failed' })
    })
  })

  // =========================================================================
  // saveSmartAccount
  // =========================================================================
  describe('saveSmartAccount', () => {
    it('should return error for invalid address', async () => {
      // Arrange
      const badAddress = 'not-an-address'

      // Act
      const result = await saveSmartAccount(badAddress)

      // Assert
      expect(result).toEqual({ error: 'Invalid Ethereum address' })
      expect(mockSupabase.auth.getUser).not.toHaveBeenCalled()
    })

    it('should return error when not authenticated', async () => {
      // Arrange
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
      })

      // Act
      const result = await saveSmartAccount(VALID_ADDRESS)

      // Assert
      expect(result).toEqual({ error: 'Not authenticated' })
    })

    it('should return error when smart account already linked to another user', async () => {
      // Arrange
      mockMaybeSingle.mockResolvedValue({ data: { id: 'other-user-789' } })

      // Act
      const result = await saveSmartAccount(VALID_ADDRESS)

      // Assert
      expect(result).toEqual({
        error: 'This smart account address is already linked to another account',
      })
    })

    it('should successfully save smart account', async () => {
      // Arrange
      mockMaybeSingle.mockResolvedValue({ data: null })
      const updateEqFn = vi.fn(() => Promise.resolve({ error: null }))
      mockUpdate.mockReturnValue({ eq: updateEqFn })

      // Act
      const result = await saveSmartAccount(VALID_ADDRESS)

      // Assert
      expect(result).toEqual({ success: true })
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ smart_account_address: VALID_ADDRESS }),
      )
      expect(updateEqFn).toHaveBeenCalledWith('id', USER_ID)
    })
  })

  // =========================================================================
  // getWalletInfo
  // =========================================================================
  describe('getWalletInfo', () => {
    it('should return error when not authenticated', async () => {
      // Arrange
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
      })

      // Act
      const result = await getWalletInfo()

      // Assert
      expect(result).toEqual({ error: 'Not authenticated' })
    })

    it('should return wallet info for authenticated user', async () => {
      // Arrange
      mockSingle.mockResolvedValue({
        data: {
          wallet_address: VALID_ADDRESS,
          smart_account_address: '0x1234567890abcdef1234567890abcdef12345678',
        },
        error: null,
      })

      // Act
      const result = await getWalletInfo()

      // Assert
      expect(result).toEqual({
        walletAddress: VALID_ADDRESS,
        smartAccountAddress: '0x1234567890abcdef1234567890abcdef12345678',
      })
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
      expect(mockSelect).toHaveBeenCalledWith('wallet_address, smart_account_address')
    })

    it('should return error when database query fails', async () => {
      // Arrange
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Profile not found' },
      })

      // Act
      const result = await getWalletInfo()

      // Assert
      expect(result).toEqual({ error: 'Profile not found' })
    })
  })
})
