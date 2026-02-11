import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPublicClient, http } from 'viem'
import { avalanche, avalancheFuji } from 'viem/chains'

// Mock viem to return identifiable mock clients
vi.mock('viem', () => {
  const mockClients = new Map()
  return {
    createPublicClient: vi.fn(({ chain }: { chain: { id: number } }) => {
      const client = { chainId: chain.id, readContract: vi.fn() }
      mockClients.set(chain.id, client)
      return client
    }),
    http: vi.fn((url?: string) => `transport:${url}`),
  }
})

describe('Web3 Client', () => {
  beforeEach(() => {
    // Reset modules to clear the module-level clientCache between tests
    vi.resetModules()
    vi.mocked(createPublicClient).mockClear()
    vi.mocked(http).mockClear()
    // Clear env vars
    delete process.env.NEXT_PUBLIC_RPC_TESTNET
    delete process.env.NEXT_PUBLIC_RPC_MAINNET
  })

  it('should return a client for default chain when no chainId provided', async () => {
    // Arrange
    const { getPublicClient } = await import('../client')

    // Act
    const client = getPublicClient()

    // Assert
    expect(client).toBeDefined()
    expect(client).toHaveProperty('chainId', avalancheFuji.id)
  })

  it('should return a client for Avalanche mainnet (43114)', async () => {
    // Arrange
    const { getPublicClient } = await import('../client')

    // Act
    const client = getPublicClient(avalanche.id)

    // Assert
    expect(client).toBeDefined()
    expect(client).toHaveProperty('chainId', avalanche.id)
  })

  it('should return a client for Fuji testnet (43113)', async () => {
    // Arrange
    const { getPublicClient } = await import('../client')

    // Act
    const client = getPublicClient(avalancheFuji.id)

    // Assert
    expect(client).toBeDefined()
    expect(client).toHaveProperty('chainId', avalancheFuji.id)
  })

  it('should return cached client on second call with same chainId', async () => {
    // Arrange
    const { getPublicClient } = await import('../client')

    // Act
    const firstCall = getPublicClient(avalanche.id)
    const secondCall = getPublicClient(avalanche.id)

    // Assert
    expect(firstCall).toBe(secondCall)
    // createPublicClient is called once for module-level publicClient + once for our call
    // The second call with the same chainId should NOT trigger another createPublicClient
    const callsForAvalanche = vi.mocked(createPublicClient).mock.calls.filter(
      (call) => (call[0] as { chain: { id: number } }).chain.id === avalanche.id
    )
    expect(callsForAvalanche).toHaveLength(1)
  })

  it('should return defaultChain client for unknown chainId', async () => {
    // Arrange
    const { getPublicClient } = await import('../client')

    // Act
    const client = getPublicClient(99999)

    // Assert
    // Unknown chainId should fall back to defaultChain (avalancheFuji)
    expect(client).toHaveProperty('chainId', avalancheFuji.id)
  })

  it('should use NEXT_PUBLIC_RPC_TESTNET for testnet chains', async () => {
    // Arrange
    const testnetUrl = 'https://my-testnet-rpc.example.com'
    process.env.NEXT_PUBLIC_RPC_TESTNET = testnetUrl
    const { getPublicClient } = await import('../client')

    // Act
    getPublicClient(avalancheFuji.id)

    // Assert
    expect(http).toHaveBeenCalledWith(testnetUrl)
  })

  it('should use NEXT_PUBLIC_RPC_MAINNET for mainnet chains', async () => {
    // Arrange
    const mainnetUrl = 'https://my-mainnet-rpc.example.com'
    process.env.NEXT_PUBLIC_RPC_MAINNET = mainnetUrl
    const { getPublicClient } = await import('../client')

    // Act
    getPublicClient(avalanche.id)

    // Assert
    expect(http).toHaveBeenCalledWith(mainnetUrl)
  })

  it('publicClient export should be the default chain client', async () => {
    // Arrange & Act
    const { publicClient, getPublicClient } = await import('../client')

    // Assert
    // publicClient is created at module level with getPublicClient() (no args)
    // so it should be the default chain client (avalancheFuji)
    expect(publicClient).toBeDefined()
    expect(publicClient).toHaveProperty('chainId', avalancheFuji.id)

    // Calling getPublicClient() again should return the same cached instance
    const defaultClient = getPublicClient()
    expect(publicClient).toBe(defaultClient)
  })
})
