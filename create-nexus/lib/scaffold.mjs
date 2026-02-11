import { cpSync, readFileSync, writeFileSync, rmSync, existsSync, mkdirSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'
import { HYBRID_ONLY, HYBRID_DEPS, HYBRID_SCRIPTS } from './config.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Finds the NexusFactory template root directory.
 * Supports multiple scenarios:
 *   1. NEXUS_TEMPLATE_ROOT env var (explicit override)
 *   2. Relative to __dirname (when running from inside the repo)
 *   3. .template-root marker file (written by postinstall when npm install -g)
 */
function findTemplateRoot() {
  // 1. Explicit env var (highest priority)
  if (process.env.NEXUS_TEMPLATE_ROOT) {
    const envRoot = resolve(process.env.NEXUS_TEMPLATE_ROOT)
    if (existsSync(join(envRoot, 'package.json'))) {
      return envRoot
    }
  }

  // 2. Relative path from __dirname (works when running from repo)
  const relativeRoot = resolve(__dirname, '..', '..')
  const relPkgPath = join(relativeRoot, 'package.json')
  if (existsSync(relPkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(relPkgPath, 'utf-8'))
      if (pkg.name === 'nexus-factory') {
        return relativeRoot
      }
    } catch {
      // ignore parse errors
    }
  }

  // 3. Fallback: .template-root marker (written by postinstall on global install)
  const markerPath = resolve(__dirname, '..', '.template-root')
  if (existsSync(markerPath)) {
    const root = readFileSync(markerPath, 'utf-8').trim()
    if (existsSync(join(root, 'package.json'))) {
      return root
    }
  }

  // 4. No template found - show clear error
  console.error('')
  console.error('  Error: No se encontro el template de NexusFactory.')
  console.error('')
  console.error('  Opciones:')
  console.error('    1. Ejecuta create-nexus desde dentro del repo NexusFactory')
  console.error('    2. Exporta NEXUS_TEMPLATE_ROOT=/ruta/al/repo')
  console.error('    3. Reinstala: cd /ruta/repo/create-nexus && npm install -g .')
  console.error('')
  process.exit(1)
}

const TEMPLATE_ROOT = findTemplateRoot()

export async function scaffold(config) {
  const targetDir = resolve(process.cwd(), config.projectName)

  if (existsSync(targetDir)) {
    console.log(`  Error: Directory "${config.projectName}" already exists.`)
    process.exit(1)
  }

  // Step 1: Copy all files
  console.log('  Copiando archivos...')
  cpSync(TEMPLATE_ROOT, targetDir, {
    recursive: true,
    filter: (src) => {
      const rel = src.replace(TEMPLATE_ROOT, '').replace(/\\/g, '/')
      // Skip build artifacts, VCS, factory-internal tooling, and CLI itself
      if (
        rel.includes('/node_modules') ||
        rel.includes('/.git') ||
        rel.includes('/.next') ||
        rel.includes('/create-nexus/') ||
        rel.includes('/.claude') ||
        rel.includes('/.agent') ||
        rel === '/CLAUDE.md' ||
        rel === '/GEMINI.md' ||
        rel === '/ANTIGRAVITY_SETUP.md' ||
        rel.endsWith('.mcp_config.example.json') ||
        rel === '/tsconfig.tsbuildinfo'
      ) {
        return false
      }
      return true
    },
  })

  // Step 2: If web2, remove hybrid-only files
  if (config.mode === 'web2') {
    console.log('  Removiendo archivos hybrid...')
    for (const path of HYBRID_ONLY) {
      const fullPath = join(targetDir, path)
      if (existsSync(fullPath)) {
        rmSync(fullPath, { recursive: true, force: true })
      }
    }

    // Clean package.json: remove hybrid deps and scripts
    const pkgPath = join(targetDir, 'package.json')
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))

    for (const dep of HYBRID_DEPS) {
      delete pkg.dependencies[dep]
    }
    for (const script of HYBRID_SCRIPTS) {
      delete pkg.scripts[script]
    }

    // Remove Web3Provider wrap from locale layout
    const layoutPath = join(targetDir, 'src/app/[locale]/layout.tsx')
    if (existsSync(layoutPath)) {
      let layout = readFileSync(layoutPath, 'utf-8')
      // Use regex to handle both \n and \r\n line endings (Windows/Unix)
      layout = layout.replace(/import\s*\{[^}]*Web3Provider[^}]*\}\s*from\s*['"][^'"]*['"]\r?\n?/, '')
      layout = layout.replace(/\s*<Web3Provider>\r?\n?/, '\n')
      layout = layout.replace(/\s*<\/Web3Provider>\r?\n?/, '\n')
      writeFileSync(layoutPath, layout)
    }

    pkg.name = config.projectName
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
  } else {
    // Hybrid: just rename
    const pkgPath = join(targetDir, 'package.json')
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
    pkg.name = config.projectName
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
  }

  // Step 3: Generate .env.local
  console.log('  Configurando .env.local...')
  generateEnv(targetDir, config)

  // Step 4: Install dependencies
  console.log('  Instalando dependencias (npm install)...')
  try {
    execSync('npm install', { cwd: targetDir, stdio: 'pipe' })
    console.log('  ✓ Dependencias instaladas')
  } catch {
    console.log('  ⚠ npm install fallo. Ejecuta "npm install" manualmente.')
  }

  // Step 5: Success message
  console.log('')
  console.log('  ✓ Proyecto creado exitosamente!')
  console.log('')
  console.log('  Proximos pasos:')
  console.log(`    cd ${config.projectName}`)
  console.log('    npm run dev')
  console.log('')
  console.log('  Configurar servicios:')
  console.log('    → Supabase: https://supabase.com (crear proyecto, copiar URL + Key en .env.local)')
  console.log('    → Google OAuth: ver README.md seccion "Setup Google OAuth"')

  if (config.mode === 'hybrid') {
    if (config.storageProvider === 'pinata' && !config.pinataJwt) {
      console.log('    → Pinata: https://pinata.cloud (configurar JWT en .env.local)')
    }
    if (config.useAA && !config.bundlerUrl) {
      console.log('    → Pimlico: https://dashboard.pimlico.io (configurar Bundler URL en .env.local)')
    }
    console.log('    → Foundry: curl -L https://foundry.paradigm.xyz | bash && foundryup')
  }

  console.log('')
}

function generateEnv(targetDir, config) {
  const lines = [
    '# Supabase',
    'NEXT_PUBLIC_SUPABASE_URL=',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY=',
    `NEXT_PUBLIC_SITE_URL=http://localhost:3000`,
    '',
    '# i18n',
    `NEXT_PUBLIC_DEFAULT_LOCALE=${config.defaultLocale}`,
  ]

  if (config.mode === 'hybrid') {
    lines.push(
      '',
      '# Web3 (EVM)',
      `NEXT_PUBLIC_DEFAULT_NETWORK=${config.chain}`,
      `NEXT_PUBLIC_RPC_MAINNET=${config.rpcMainnet}`,
      `NEXT_PUBLIC_RPC_TESTNET=${config.rpcTestnet}`,
      `NEXT_PUBLIC_ALCHEMY_API_KEY=${config.alchemyKey}`,
      '',
      '# Account Abstraction (ERC-4337)',
      `NEXT_PUBLIC_BUNDLER_URL=${config.bundlerUrl}`,
      `NEXT_PUBLIC_PAYMASTER_URL=${config.paymasterUrl}`,
      '',
      '# Storage',
      `STORAGE_PROVIDER=${config.storageProvider}`,
      `PINATA_JWT=${config.pinataJwt}`,
      `NEXT_PUBLIC_STORAGE_GATEWAY=${config.storageGateway}`,
    )
  }

  writeFileSync(join(targetDir, '.env.local'), lines.join('\n') + '\n')
}
