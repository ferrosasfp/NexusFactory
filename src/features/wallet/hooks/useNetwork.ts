'use client'

import { useAccount, useSwitchChain } from 'wagmi'
import { supportedChains, defaultChain, getChainById } from '@/shared/lib/web3/chains'

export function useNetwork() {
  const { chain } = useAccount()
  const { switchChain } = useSwitchChain()

  const isCorrectNetwork = chain?.id === defaultChain.id

  function switchToDefault() {
    switchChain({ chainId: defaultChain.id })
  }

  function switchToChain(chainId: number) {
    switchChain({ chainId })
  }

  return {
    currentChain: chain,
    isCorrectNetwork,
    supportedChains,
    defaultChain,
    getChainById,
    switchToDefault,
    switchToChain,
  }
}
