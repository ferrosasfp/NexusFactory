import { createConfig, http } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { supportedChains, defaultChain } from './chains'

export const wagmiConfig = createConfig({
  chains: supportedChains,
  connectors: [
    injected(), // MetaMask, Core, etc.
  ],
  transports: Object.fromEntries(
    supportedChains.map((chain) => [
      chain.id,
      http(
        chain.id === defaultChain.id
          ? (process.env.NEXT_PUBLIC_RPC_TESTNET || undefined)
          : (process.env.NEXT_PUBLIC_RPC_MAINNET || undefined)
      ),
    ])
  ) as Record<number, ReturnType<typeof http>>,
})
