'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'

export function useWallet() {
  const { address, isConnected, isConnecting, chain } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  function connectWallet() {
    connect({ connector: injected() })
  }

  return {
    address,
    isConnected,
    isConnecting,
    chain,
    connectWallet,
    disconnect,
  }
}
