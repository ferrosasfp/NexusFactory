# NexusFactory

**El nexo entre Web2 y Web3.** Base universal para aplicaciones modernas con Next.js 16 + Supabase, extensible a blockchain EVM con un solo CLI.

---

## Dos Modos, Un Comando

| Modo | Stack | Para Quién |
|------|-------|------------|
| **Web2** | Next.js 16 + Supabase + Tailwind + i18n | Apps SaaS, dashboards, plataformas B2B |
| **Hybrid** | Web2 + Viem/Wagmi + Foundry + IPFS + AA | dApps, marketplaces NFT, DeFi, tokenización |

```bash
npx create-nexus mi-proyecto
# Paso 1: Nombre → Paso 2: web2 o hybrid → Listo
```

---

## Golden Path

Un solo stack perfeccionado. Sin decisiones técnicas.

### Base (ambos modos)

| Capa | Tecnología |
|------|------------|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Auth | Supabase (Google OAuth + Email/Password) |
| Database | Supabase PostgreSQL + RLS |
| Estilos | Tailwind CSS 3.4 |
| i18n | next-intl v4 (EN + ES, rutas `[locale]`) |
| Validación | Zod v4 |
| Testing | Vitest + Playwright |

### Hybrid (adicional)

| Capa | Tecnología |
|------|------------|
| Blockchain | Viem 2 + Wagmi (EVM agnóstico, Avalanche default) |
| Account Abstraction | permissionless / Pimlico (ERC-4337) |
| Smart Contracts | Foundry + OpenZeppelin |
| Storage | Agnóstico (Pinata/IPFS default) |
| Security | Slither + Zod validation on-chain inputs |

Agregar una chain EVM = 1 línea en `src/shared/lib/web3/chains.ts`.

---

## Arquitectura Feature-First

```
src/
├── app/[locale]/                # Rutas bajo locale dinámico (i18n)
│   ├── (auth)/                  # login, signup, callback, forgot-password
│   └── (main)/                  # dashboard, wallet*, contracts*, storage*
│
├── features/
│   ├── auth/                    # Google OAuth + Email/Password
│   ├── wallet/                  # * Connect, network, smart account
│   ├── contracts/               # * Reader, Writer, ABIs
│   ├── transactions/            # * TxStatus, TxHistory
│   └── storage/                 # * FileUploader, StorageViewer
│
├── shared/
│   ├── lib/supabase/            # Supabase client (server/browser)
│   ├── lib/web3/                # * Viem, Wagmi, chains, AA, validation
│   └── providers/               # * Web3Provider
│
├── actions/                     # Server Actions
│   ├── auth.ts                  # login, signup, signInWithGoogle
│   ├── wallet.ts                # * linkWallet, saveSmartAccount
│   └── storage.ts               # * uploadFile, deleteFile
│
├── i18n/                        # next-intl config
└── types/                       # Database types

contracts/                       # * Foundry workspace
├── src/                         # SampleToken.sol, SampleNFT.sol
├── test/                        # Forge tests
├── script/                      # Deploy scripts
└── foundry.toml

create-nexus/                    # CLI scaffolder interactivo

* = Solo en modo hybrid
```

---

## Quick Start

### 1. Clonar e instalar

```bash
git clone https://github.com/ferrosasfp/NexusFactory.git
cd NexusFactory
npm install
```

### 2. Configurar ambiente

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales:

| Variable | Dónde obtenerla |
|----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | [supabase.com](https://supabase.com) → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Misma ubicación |

#### Variables adicionales (Hybrid)

| Variable | Servicio | Tier Gratuito |
|----------|----------|---------------|
| `NEXT_PUBLIC_BUNDLER_URL` | [dashboard.pimlico.io](https://dashboard.pimlico.io) | 1M créditos/mes, sin tarjeta |
| `PINATA_JWT` | [pinata.cloud](https://pinata.cloud) | 500 uploads/mes |

### 3. Configurar Google OAuth

1. [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
2. Crear OAuth 2.0 Client ID (Web application)
3. Redirect URI: `http://localhost:3000/en/callback`
4. En Supabase Dashboard → Authentication → Providers → Google → Pegar Client ID y Secret

### 4. Ejecutar migraciones

```bash
npx supabase db push
```

### 5. Desarrollo

```bash
npm run dev
```

---

## Comandos

### Desarrollo

| Comando | Acción |
|---------|--------|
| `npm run dev` | Servidor de desarrollo (Turbopack) |
| `npm run build` | Build producción |
| `npm run typecheck` | Verificar tipos TypeScript |
| `npm run lint` | ESLint |
| `npm run qa` | typecheck + lint + test + build |

### Testing

| Comando | Acción |
|---------|--------|
| `npm run test` | Vitest (unit + component) |
| `npm run test:watch` | Vitest watch mode |
| `npm run test:coverage` | Cobertura de código |
| `npm run test:e2e` | Playwright E2E |

### i18n

| Comando | Acción |
|---------|--------|
| `npm run i18n:sync` | Detecta claves faltantes entre EN y ES |

### Smart Contracts (solo Hybrid)

| Comando | Acción |
|---------|--------|
| `npm run contracts:build` | Compilar contratos con Forge |
| `npm run contracts:test` | Tests de contratos |
| `npm run contracts:slither` | Análisis de seguridad estático |
| `npm run contracts:sync-abi` | Copiar ABIs compilados al frontend |
| `npm run contracts:deploy:fuji` | Deploy a Avalanche Fuji testnet |
| `npm run qa:hybrid` | QA completo (Web2 + contratos) |

---

## CLI: create-nexus

El scaffolder interactivo que genera proyectos listos para usar.

### Instalación global

```bash
cd create-nexus
npm install -g .
```

### Uso

```bash
# Interactivo (wizard completo)
create-nexus

# Rápido (sin preguntas)
create-nexus mi-app web2
create-nexus mi-dapp hybrid
```

### Flujo del Wizard

**Web2 (3 pasos):**
1. Nombre del proyecto
2. Modo → Web2
3. Idioma default (EN/ES)

**Hybrid (7 pasos):**
1. Nombre del proyecto
2. Modo → Hybrid
3. Blockchain (Avalanche, Polygon, Base, Ethereum, custom)
4. RPC Provider (público, Alchemy, custom)
5. Storage (Pinata o configurar después)
6. Account Abstraction (Pimlico o sin AA)
7. Idioma default

El CLI genera `.env.local` pre-configurado y ejecuta `npm install`.

---

## Features Incluidas

### Auth (Google OAuth + Email/Password)

- Login/Signup con formularios validados (Zod)
- Google OAuth con callback automático
- Forgot password + update password
- Check email confirmation
- Middleware combinado: next-intl (locale) + Supabase (auth)
- Rutas protegidas: `/dashboard`, `/wallet`, `/contracts`, `/storage`

### Wallet (Hybrid)

- ConnectWallet: MetaMask, Core Wallet, injected
- WalletInfo: dirección, balance, red actual
- NetworkSwitcher: cambiar entre chains soportadas
- SmartAccountInfo: estado de la Smart Account (ERC-4337)
- Server actions: linkWallet, unlinkWallet, saveSmartAccount

### Contracts (Hybrid)

- SampleToken.sol: ERC-20 + Permit + Ownable (OpenZeppelin)
- SampleNFT.sol: ERC-721 + URIStorage + Ownable
- Tests completos con Forge
- Scripts de deploy para Fuji/Mainnet
- ContractReader: lee funciones view desde el frontend
- ContractWriter: ejecuta transacciones con simulación previa
- sync-abi.mjs: sincroniza ABIs compilados al frontend

### Storage (Hybrid)

- Interface `StorageProvider` agnóstica
- Implementación Pinata (IPFS) incluida
- FileUploader con drag & drop
- StorageViewer: recuperar archivos por CID
- Server actions (PINATA_JWT nunca expuesto al cliente)

### Transactions (Hybrid)

- TxStatus: seguimiento de transacciones (pending/confirmed/failed)
- TxHistory: historial de transacciones de la sesión
- useTx hook: checkStatus + waitForConfirmation
- txService: getTxDetails, waitForTx

### i18n

- next-intl v4 con rutas `[locale]`
- EN + ES completos (auth, dashboard, wallet, contracts, storage, transactions)
- Script `i18n:sync` para detectar claves faltantes
- Locale-aware redirects en middleware

---

## Dual-Brain AI Architecture

NexusFactory opera con dos cerebros de IA sobre el mismo código:

| Motor | Archivo de Identidad | Ubicación |
|-------|---------------------|-----------|
| **Claude Code** (Anthropic) | `CLAUDE.md` | `.claude/` (commands, agents, PRPs, skills) |
| **Antigravity** (Google) | `GEMINI.md` | `.agent/` (workflows, skills, rules) |

### Agentes Especializados

| Agente | Archivo | Función |
|--------|---------|---------|
| Web3 Specialist | `.claude/agents/web3-specialist.md` | Viem, Wagmi, AA, chains |
| Solidity Specialist | `.claude/agents/solidity-specialist.md` | Foundry, OpenZeppelin, Slither |

### Comandos

| Comando | Función |
|---------|---------|
| `/new-app` | Wizard de negocio (pregunta modo Web2/Hybrid) |
| `/translate` | Sincronizar traducciones entre locales |
| `/generar-prp` | Crear especificación de nueva feature |
| `/ejecutar-prp` | Implementar feature aprobada |

---

## Costos Aproximados (Producción)

### Web2

| Servicio | Free Tier | Pro |
|----------|-----------|-----|
| Supabase | 500MB DB, 50K auth users | $25/mes |
| Vercel | 100GB bandwidth | $20/mes |

### Hybrid (adicional)

| Servicio | Free Tier | Notas |
|----------|-----------|-------|
| Pimlico | 1M créditos/mes (~1,300 ops) | Sin tarjeta requerida |
| Pinata | 500 uploads/mes, 100MB | API key gratuita |
| Avalanche Fuji | Testnet gratuita | Faucet: faucet.avax.network |
| Avalanche C-Chain | Fees: ~$0.01/tx | Gas bajo vs Ethereum |

---

## Troubleshooting

### Puerto ocupado

```bash
npm run dev
# Turbopack auto-detecta puerto disponible
```

### TypeScript errors después de cambiar tsconfig

```bash
rm -rf .next/types tsconfig.tsbuildinfo
npx tsc --noEmit
```

### BigInt literals no disponibles

El target es `ES2022`. Si ves errores con `0n`, verifica que `tsconfig.json` tenga `"target": "ES2022"`.

### Foundry no instalado

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
cd contracts && forge install OpenZeppelin/openzeppelin-contracts --no-commit
```

---

## Próximos Pasos

1. Configura Supabase y Google OAuth
2. Ejecuta `npm run dev` y navega a `http://localhost:3000`
3. Para Hybrid: configura Pimlico y Pinata en `.env.local`
4. Crea tu primera feature con `/generar-prp`
5. Deploy a Vercel: `npx vercel`

---

## Créditos

- **SaaS Factory**: La arquitectura original Feature-First y el concepto de "Fábrica" fueron creados por **[Daniel](https://github.com/daniel-carreon)**, cuyo trabajo desde la V1 hasta la V3 sirve de base e inspiración para NexusFactory.

---

**NexusFactory** | El nexo entre Web2 y Web3

## Licencia

MIT
