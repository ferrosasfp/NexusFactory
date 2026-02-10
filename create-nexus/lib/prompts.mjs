import { createInterface } from 'readline'
import { CHAINS } from './config.mjs'

const rl = createInterface({ input: process.stdin, output: process.stdout })

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()))
  })
}

function printHeader() {
  console.log('')
  console.log('  ╔══════════════════════════════════════╗')
  console.log('  ║       NexusFactory CLI               ║')
  console.log('  ║    El nexo entre Web2 y Web3         ║')
  console.log('  ╚══════════════════════════════════════╝')
  console.log('')
}

export async function runWizard(projectNameArg, modeArg) {
  printHeader()

  // Step 1: Project name
  let projectName = projectNameArg
  if (!projectName) {
    projectName = await ask('  Paso 1: Nombre del proyecto\n  > ')
    if (!projectName) {
      console.log('  Project name is required.')
      rl.close()
      process.exit(1)
    }
  } else {
    console.log(`  Paso 1: Nombre del proyecto → ${projectName}`)
  }

  // Step 2: Mode
  let mode = modeArg
  if (!mode) {
    console.log('')
    console.log('  Paso 2: Modo')
    console.log('    (1) Web2 - Solo Supabase + Next.js  [default]')
    console.log('    (2) Hybrid - Web2 + Blockchain + IPFS')
    const modeChoice = await ask('  > ')
    mode = modeChoice === '2' ? 'hybrid' : 'web2'
  } else {
    console.log(`  Paso 2: Modo → ${mode}`)
  }

  const config = {
    projectName,
    mode,
    chain: 'avalanche',
    rpcMainnet: CHAINS.avalanche.rpcMainnet,
    rpcTestnet: CHAINS.avalanche.rpcTestnet,
    alchemyKey: '',
    storageProvider: 'pinata',
    pinataJwt: '',
    storageGateway: '',
    useAA: true,
    bundlerUrl: '',
    paymasterUrl: '',
    defaultLocale: 'en',
  }

  if (mode === 'hybrid' && !modeArg) {
    // Step 3: Blockchain
    console.log('')
    console.log('  Paso 3: Blockchain (EVM)')
    console.log('    (1) Avalanche (C-Chain + Fuji)  [default]')
    console.log('    (2) Polygon (Mainnet + Amoy)')
    console.log('    (3) Base (Mainnet + Sepolia)')
    console.log('    (4) Ethereum (Mainnet + Sepolia)')
    console.log('    (5) Otra (ingresar RPC manualmente)')
    const chainChoice = await ask('  > ')

    const chainMap = { '1': 'avalanche', '2': 'polygon', '3': 'base', '4': 'ethereum' }
    if (chainChoice === '5') {
      config.chain = 'custom'
      config.rpcMainnet = await ask('  RPC Mainnet URL: ')
      config.rpcTestnet = await ask('  RPC Testnet URL: ')
    } else {
      const key = chainMap[chainChoice] ?? 'avalanche'
      config.chain = key
      config.rpcMainnet = CHAINS[key].rpcMainnet
      config.rpcTestnet = CHAINS[key].rpcTestnet
    }

    // Step 4: RPC Provider
    console.log('')
    console.log('  Paso 4: RPC Provider')
    console.log('    (1) RPC publico (gratis, rate-limited)  [default]')
    console.log('    (2) Alchemy (ingresar API key)')
    console.log('    (3) Otro (ingresar URL manualmente)')
    const rpcChoice = await ask('  > ')
    if (rpcChoice === '2') {
      config.alchemyKey = await ask('  Alchemy API Key: ')
    } else if (rpcChoice === '3') {
      config.rpcMainnet = await ask('  Custom RPC Mainnet URL: ')
      config.rpcTestnet = await ask('  Custom RPC Testnet URL: ')
    }

    // Step 5: Storage
    console.log('')
    console.log('  Paso 5: Storage Descentralizado')
    console.log('    (1) Pinata (IPFS)  [default]')
    console.log('    (2) Ninguno por ahora (configurar despues)')
    const storageChoice = await ask('  > ')
    if (storageChoice !== '2') {
      config.storageProvider = 'pinata'
      config.pinataJwt = await ask('  Pinata JWT (Enter para saltar): ')
      if (config.pinataJwt) {
        config.storageGateway = await ask('  Storage Gateway URL (Enter para default): ')
      }
    } else {
      config.storageProvider = ''
    }

    // Step 6: Account Abstraction
    console.log('')
    console.log('  Paso 6: Account Abstraction (ERC-4337)')
    console.log('    (1) Si, con Pimlico (Bundler)  [default]')
    console.log('        → Gratis: 1M creditos/mes (~1,300 ops). Sin tarjeta.')
    console.log('        → Crear cuenta en dashboard.pimlico.io')
    console.log('    (2) Sin Account Abstraction (solo wallet externa)')
    const aaChoice = await ask('  > ')
    config.useAA = aaChoice !== '2'
    if (config.useAA) {
      config.bundlerUrl = await ask('  Pimlico Bundler URL (Enter para saltar): ')
      if (config.bundlerUrl) {
        config.paymasterUrl = await ask('  Paymaster URL (Enter para saltar, opcional): ')
      }
    }
  }

  // Last step: Language (same for both modes)
  const langStep = mode === 'hybrid' && !modeArg ? '7' : '3'
  console.log('')
  console.log(`  Paso ${langStep}: Idioma por defecto`)
  console.log('    (1) English  [default]')
  console.log('    (2) Espanol')
  const langChoice = modeArg ? '' : await ask('  > ')
  config.defaultLocale = langChoice === '2' ? 'es' : 'en'

  // Summary
  console.log('')
  console.log('  ══════════════════════════════════════')
  console.log('  Resumen:')
  console.log(`    Proyecto: ${config.projectName}`)
  console.log(`    Modo: ${config.mode}`)
  if (config.mode === 'hybrid') {
    const chainName = CHAINS[config.chain]?.name ?? 'Custom'
    console.log(`    Blockchain: ${chainName}`)
    console.log(`    Storage: ${config.storageProvider || 'Ninguno'}`)
    console.log(`    Account Abstraction: ${config.useAA ? 'Si (Pimlico)' : 'No'}`)
  }
  console.log(`    Idioma default: ${config.defaultLocale === 'es' ? 'Espanol' : 'English'}`)
  console.log('  ══════════════════════════════════════')
  console.log('')

  if (!modeArg) {
    const confirm = await ask('  Confirmar? (Y/n) > ')
    if (confirm.toLowerCase() === 'n') {
      console.log('  Cancelado.')
      rl.close()
      process.exit(0)
    }
  }

  rl.close()
  return config
}
