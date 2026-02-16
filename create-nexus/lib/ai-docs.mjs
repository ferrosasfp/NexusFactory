/**
 * Generates project-specific CLAUDE.md and GEMINI.md files.
 * Each function composes markdown sections based on projectName and mode.
 */

// ─── Section Generators ──────────────────────────────────────────────

function header(projectName, aiFile) {
  return `# ${projectName} - AI Development Guide

> Eres el **asistente de desarrollo AI** de este proyecto.
> El humano decide **que construir**. Tu ejecutas **como construirlo**.
> Este archivo (${aiFile}) es tu guia: golden path, reglas, seguridad y aprendizajes.`
}

function principles() {
  return `## Principios Fundamentales

### Henry Ford
> *"Pueden tener el coche del color que quieran, siempre que sea negro."*

**Un solo stack perfeccionado.** No das opciones tecnicas. Ejecutas el Golden Path.

### Elon Musk

> *"La maquina que construye la maquina es mas importante que el producto."*

**El proceso > El producto.** Los comandos y PRPs que construyen el proyecto son mas valiosos que el proyecto mismo.

> *"Si no estas fallando, no estas innovando lo suficiente."*

**Auto-Blindaje.** Cada error es un impacto que refuerza el proceso. Blindamos para que el mismo error NUNCA ocurra dos veces.

> *"El mejor proceso es ningun proceso. El segundo mejor es uno que puedas eliminar."*

**Elimina friccion.** MCPs eliminan el CLI manual. Feature-First elimina la navegacion entre carpetas.

> *"Cuestiona cada requisito. Cada requisito debe venir con el nombre de la persona que lo pidio."*

**PRPs con dueno.** El humano define el QUE. Tu ejecutas el COMO. Sin requisitos fantasma.`
}

function autoBlindaje(aiFile) {
  return `## Auto-Blindaje: El Sistema que se Fortalece Solo

> *"Los errores refuerzan nuestra estructura. Blindamos el proceso para que la falla nunca se repita."*

### Como Funciona

\`\`\`
Error ocurre -> Se arregla -> Se DOCUMENTA -> NUNCA ocurre de nuevo
\`\`\`

### Archivos Participantes

| Archivo | Rol en Auto-Blindaje |
|---------|----------------------|
| \`PRP actual\` | Documenta errores especificos de esta feature |
| \`.claude/prompts/*.md\` | Errores que aplican a multiples features |
| \`${aiFile}\` | Errores criticos que aplican a TODO el proyecto |

### Formato de Aprendizaje

\`\`\`markdown
### [YYYY-MM-DD]: [Titulo corto]
- **Error**: [Que fallo]
- **Fix**: [Como se arreglo]
- **Aplicar en**: [Donde mas aplica]
\`\`\``
}

function goldenPath(isHybrid) {
  let md = `## El Golden Path (Un Solo Stack)

No das opciones tecnicas. Ejecutas el stack perfeccionado:

### Web2 (Base)

| Capa | Tecnologia | Por Que |
|------|------------|---------|
| Framework | Next.js 16 + React 19 + TypeScript | Full-stack, Turbopack |
| Estilos | Tailwind CSS 3.4 | Utility-first |
| Backend | Supabase (Auth + DB + RLS) | PostgreSQL sin servidor propio |
| Auth | Google OAuth + Email/Password | Ambos via Supabase |
| i18n | next-intl v4 | Multi-idioma (EN + ES) con rutas \`[locale]\` |
| Validacion | Zod | Type-safe runtime + compile-time |
| Testing | Vitest + Playwright | Unit/component + E2E |
| AI Engine | Vercel AI SDK v5 + OpenRouter | Streaming, 300+ modelos |`

  if (isHybrid) {
    md += `

### Hybrid (Web2 + Web3)

| Capa | Tecnologia | Por Que |
|------|------------|---------|
| Blockchain | Viem + Wagmi 2 | TypeScript-first, EVM agnostico |
| Chain default | Avalanche (C-Chain + Fuji) | Extensible: agregar chain = 1 linea |
| Wallet UI | Custom minimal (MetaMask/Core) | Maximo control, minimo peso |
| Account Abstraction | permissionless (Pimlico) | ERC-4337, Smart Account automatica |
| Smart Contracts | Foundry + OpenZeppelin | Rapido, seguro, estandares auditados |
| Security | Slither + Zod validation | Analisis estatico + validacion inputs |
| Storage | Agnostico (Pinata default) | Interface StorageProvider extensible |`
  }

  md += `

### Modo del Proyecto

- **web2**: Solo base. Sin carpetas Web3, sin deps blockchain
- **hybrid**: Todo incluido. Web2 + wallet + contracts + storage + AA`

  return md
}

function architecture(isHybrid) {
  if (isHybrid) {
    return `## Arquitectura Feature-First

> Colocalizacion para IA. Todo el contexto de una feature en un solo lugar.

\`\`\`
src/
├── app/[locale]/             # Rutas bajo locale dinamico (i18n)
│   ├── (auth)/              # login, signup, callback, forgot-password
│   ├── (main)/              # dashboard, wallet, contracts, storage
│   └── layout.tsx           # NextIntlClientProvider + Web3Provider
│
├── features/
│   ├── auth/                # Google OAuth + Email/Password
│   ├── wallet/              # ConnectWallet, Smart Account, Network
│   ├── contracts/           # ContractReader, ContractWriter, ABIs
│   ├── transactions/        # TxStatus, TxHistory
│   └── storage/             # FileUploader, StorageViewer (Pinata)
│
├── shared/
│   ├── lib/
│   │   ├── supabase/        # Supabase client (server/browser)
│   │   └── web3/            # Viem client, Wagmi config, chains, AA, validation
│   └── providers/           # Web3Provider
│
├── actions/                 # Server Actions
│   ├── auth.ts              # login, signup, signInWithGoogle, signout
│   ├── wallet.ts            # linkWallet, saveSmartAccount
│   └── storage.ts           # uploadFile, deleteFile
│
└── i18n/                    # next-intl config (routing, request, navigation)

contracts/                    # Foundry workspace (independiente)
├── src/                     # SampleToken.sol, SampleNFT.sol
├── test/                    # Forge tests
├── script/                  # Deploy scripts
└── foundry.toml             # Config con RPCs EVM
\`\`\``
  }

  return `## Arquitectura Feature-First

> Colocalizacion para IA. Todo el contexto de una feature en un solo lugar.

\`\`\`
src/
├── app/[locale]/             # Rutas bajo locale dinamico (i18n)
│   ├── (auth)/              # login, signup, callback, forgot-password
│   ├── (main)/              # dashboard
│   └── layout.tsx           # NextIntlClientProvider
│
├── features/
│   ├── auth/                # Google OAuth + Email/Password
│   └── [feature]/           # Misma estructura por feature
│
├── shared/
│   ├── lib/
│   │   └── supabase/        # Supabase client (server/browser)
│   └── components/          # Componentes compartidos
│
├── actions/                 # Server Actions
│   └── auth.ts              # login, signup, signInWithGoogle, signout
│
└── i18n/                    # next-intl config (routing, request, navigation)
\`\`\``
}

function mcps() {
  return `## MCPs: Tus Sentidos y Manos

### Next.js DevTools MCP - Quality Control
Conectado via \`/_next/mcp\`. Ve errores build/runtime en tiempo real.

\`\`\`
init -> Inicializa contexto
nextjs_call -> Lee errores, logs, estado
nextjs_docs -> Busca en docs oficiales
\`\`\`

### Playwright MCP - Tus Ojos
Validacion visual y testing del navegador.

\`\`\`
playwright_navigate -> Navega a URL
playwright_screenshot -> Captura visual
playwright_click/fill -> Interactua con elementos
\`\`\`

### Supabase MCP - Tus Manos (Backend)
Interactua con PostgreSQL sin CLI.

\`\`\`
execute_sql -> SELECT, INSERT, UPDATE, DELETE
apply_migration -> CREATE TABLE, ALTER, indices, RLS
list_tables -> Ver estructura de BD
get_advisors -> Detectar tablas sin RLS
\`\`\``
}

function prpSystem() {
  return `## Sistema PRP (Blueprints)

Para features complejas, generas un **PRP** (Product Requirements Proposal):

\`\`\`
Humano: "Necesito X" -> Investigas -> Generas PRP -> Humano aprueba -> Ejecutas Blueprint
\`\`\`

**Ubicacion:** \`.claude/PRPs/\`

| Archivo | Proposito |
|---------|-----------|
| \`prp-base.md\` | Template base para crear nuevos PRPs |
| \`PRP-XXX-*.md\` | PRPs generados para features especificas |`
}

function aiEngine() {
  return `## AI Engine (Vercel AI SDK + OpenRouter)

Para features de IA, consulta \`.claude/ai_templates/_index.md\`.`
}

function bucleAgentico() {
  return `## Bucle Agentico (Assembly Line)

Ver \`.claude/prompts/bucle-agentico-blueprint.md\` para el proceso completo:

1. **Delimitar** -> Dividir en FASES (sin subtareas)
2. **Mapear** -> Explorar contexto REAL antes de cada fase
3. **Ejecutar** -> Subtareas con MCPs segun juicio
4. **Auto-Blindaje** -> Documentar errores y blindar proceso
5. **Transicionar** -> Siguiente fase con contexto actualizado`
}

function codeRules() {
  return `## Reglas de Codigo

### Principios
- **KISS**: Prefiere soluciones simples
- **YAGNI**: Implementa solo lo necesario
- **DRY**: Evita duplicacion
- **SOLID**: Una responsabilidad por componente

### Limites
- Archivos: Maximo 500 lineas
- Funciones: Maximo 50 lineas
- Componentes: Una responsabilidad clara

### Naming
- Variables/Functions: \`camelCase\`
- Components: \`PascalCase\`
- Constants: \`UPPER_SNAKE_CASE\`
- Files/Folders: \`kebab-case\`

### TypeScript
- Siempre type hints en function signatures
- Interfaces para object shapes
- Types para unions
- NUNCA usar \`any\` (usar \`unknown\`)

### Patron de Componente

\`\`\`typescript
interface Props {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick: () => void;
}

export function Button({ children, variant = 'primary', onClick }: Props) {
  return (
    <button onClick={onClick} className={\`btn btn-\${variant}\`}>
      {children}
    </button>
  );
}
\`\`\``
}

function commands(isHybrid) {
  let md = `## Comandos

### Development
\`\`\`bash
npm run dev                    # Servidor de desarrollo
npm run build                  # Build produccion
npm run typecheck              # Verificar tipos
npm run lint                   # ESLint
npm run qa                     # typecheck + lint + test + build
\`\`\`

### Testing
\`\`\`bash
npm run test                   # Vitest (unit/component)
npm run test:watch             # Vitest watch mode
npm run test:coverage          # Cobertura
npm run test:e2e               # Playwright (E2E)
\`\`\`

### i18n
\`\`\`bash
npm run i18n:sync              # Detecta claves faltantes entre idiomas
\`\`\``

  if (isHybrid) {
    md += `

### Smart Contracts (hybrid)
\`\`\`bash
npm run contracts:build        # forge build
npm run contracts:test         # forge test -vvv
npm run contracts:slither      # Analisis de seguridad
npm run contracts:sync-abi     # Copiar ABIs al frontend
npm run contracts:deploy:fuji  # Deploy a Fuji testnet
npm run qa:hybrid              # QA completo (Web2 + Web3)
\`\`\``
  }

  return md
}

function testing() {
  return `## Testing (Patron AAA)

\`\`\`typescript
test('should calculate total with tax', () => {
  // Arrange
  const items = [{ price: 100 }, { price: 200 }];
  const taxRate = 0.1;

  // Act
  const result = calculateTotal(items, taxRate);

  // Assert
  expect(result).toBe(330);
});
\`\`\``
}

function security(isHybrid) {
  let md = `## Seguridad

### Off-Chain
- Validar TODAS las entradas de usuario (Zod)
- NUNCA exponer secrets en codigo (PINATA_JWT, keys AA = server-side only)
- SIEMPRE habilitar RLS en tablas Supabase
- HTTPS en produccion`

  if (isHybrid) {
    md += `

### On-Chain (hybrid)
- OpenZeppelin para todos los estandares (ERC-20, ERC-721, AccessControl)
- Slither antes de deploy a mainnet
- Zod schemas para addresses, amounts, chainId (\`shared/lib/web3/validation.ts\`)
- Verificar chainId correcto antes de firmar TX
- Mostrar resumen al usuario antes de firmar`
  }

  return md
}

function noHacer() {
  return `## No Hacer (Critical)

### Codigo
- No usar \`any\` en TypeScript
- No hacer commits sin tests
- No omitir manejo de errores
- No hardcodear configuraciones

### Seguridad
- No exponer secrets
- No loggear informacion sensible
- No saltarse validacion de entrada

### Arquitectura
- No crear dependencias circulares
- No mezclar responsabilidades
- No usar estado global innecesario`
}

function aprendizajes(aiTool) {
  let md = `## Aprendizajes (Auto-Blindaje Activo)

> Esta seccion CRECE con cada error encontrado.

### 2025-01-09: Usar npm run dev, no next dev
- **Error**: Puerto hardcodeado causa conflictos
- **Fix**: Siempre usar \`npm run dev\` (auto-detecta puerto)
- **Aplicar en**: Todos los proyectos`

  if (aiTool === 'gemini') {
    md += `

### 2026-01-22: Middleware debe usar middleware.ts y NO mutar request.cookies
- **Error**: \`proxy.ts\` no es reconocido como middleware; \`request.cookies.set()\` rompe el flujo en Edge
- **Fix**: Archivo debe ser \`middleware.ts\` en raiz, exportando \`middleware()\`. Solo setear cookies en \`response.cookies\`, nunca en \`request.cookies\`
- **Aplicar en**: Todos los proyectos Next.js 13+ con Supabase SSR

### 2026-01-23: Next.js 16 elimina next lint
- **Error**: En Next.js 16, \`next lint\` fue removido y \`next build\` ya no ejecuta lint
- **Fix**: Usar ESLint CLI: \`"lint": "eslint . --max-warnings 0"\`. Usar Flat Config (\`eslint.config.mjs\`). Blindar build: \`"build": "npm run lint && next build"\`
- **Aplicar en**: Todos los proyectos Next.js 16+`
  }

  return md
}

function footer(aiFile) {
  return `---

*Este archivo es la guia AI de tu proyecto. Cada error documentado lo hace mas fuerte.*`
}

// ─── Public API ──────────────────────────────────────────────────────

export function generateClaudeMd(projectName, mode) {
  const isHybrid = mode === 'hybrid'
  const sections = [
    header(projectName, 'CLAUDE.md'),
    principles(),
    autoBlindaje('CLAUDE.md'),
    goldenPath(isHybrid),
    architecture(isHybrid),
    mcps(),
    prpSystem(),
    aiEngine(),
    bucleAgentico(),
    codeRules(),
    commands(isHybrid),
    testing(),
    security(isHybrid),
    noHacer(),
    aprendizajes('claude'),
    footer('CLAUDE.md'),
  ]
  return sections.join('\n\n---\n\n') + '\n'
}

export function generateGeminiMd(projectName, mode) {
  const isHybrid = mode === 'hybrid'
  const sections = [
    header(projectName, 'GEMINI.md'),
    principles(),
    autoBlindaje('GEMINI.md'),
    goldenPath(isHybrid),
    architecture(isHybrid),
    mcps(),
    prpSystem(),
    aiEngine(),
    bucleAgentico(),
    codeRules(),
    commands(isHybrid),
    testing(),
    security(isHybrid),
    noHacer(),
    aprendizajes('gemini'),
    footer('GEMINI.md'),
  ]
  return sections.join('\n\n---\n\n') + '\n'
}
