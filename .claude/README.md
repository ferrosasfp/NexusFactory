# 🏭 SaaS Factory - Template Documentation

> **Esta es la fuente de verdad del template.** Guardada en `.claude/` para que no sea modificada durante el desarrollo de proyectos especificos.

---

## 🎯 Que es SaaS Factory?

Un template **production-ready** para crear aplicaciones SaaS modernas con desarrollo asistido por IA. Filosofia Henry Ford: un solo stack perfeccionado.

### Lo que incluye

- ✅ Next.js 16 (App Router) + TypeScript
- ✅ Supabase (Database + Auth)
- ✅ Tailwind CSS + shadcn/ui
- ✅ Claude Code con comandos, agentes y skills
- ✅ Arquitectura Feature-First optimizada para IA
- ✅ Auto port detection (3000-3006)
- ✅ Testing, linting y type checking configurados

---

## 📦 Tech Stack (Golden Path)

```yaml
Runtime: Node.js + TypeScript
Framework: Next.js 16 (App Router)
Database: PostgreSQL/Supabase
Styling: Tailwind CSS 3.4
Components: shadcn/ui
State: Zustand
Validation: Zod
Testing: Jest + React Testing Library + Playwright
AI Tooling: Claude Code + MCPs
Deploy: Vercel
```

**Por que Email/Password y no OAuth?**
Para evitar bloqueos de bots durante testing. Google OAuth requiere verificacion.

---

## 🏗️ Arquitectura Feature-First

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Rutas auth (grupo)
│   ├── (main)/              # Rutas principales
│   ├── layout.tsx
│   └── page.tsx
│
├── features/                 # 🎯 Organizadas por funcionalidad
│   ├── auth/
│   │   ├── components/      # LoginForm, SignupForm
│   │   ├── hooks/           # useAuth, useSession
│   │   ├── services/        # authService.ts
│   │   ├── types/           # User, Session
│   │   └── store/           # authStore.ts
│   │
│   ├── dashboard/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   │
│   └── [tu-feature]/
│
└── shared/                   # Codigo reutilizable
    ├── components/          # Button, Card, Input
    ├── hooks/               # useDebounce, useLocalStorage
    ├── stores/              # appStore.ts
    ├── types/               # api.ts, domain.ts
    ├── utils/               # helpers
    ├── lib/                 # supabase.ts, axios.ts
    └── constants/
```

> **Por que Feature-First?** Cada feature tiene TODO lo necesario en un solo lugar. Perfecto para que la IA entienda contexto completo sin navegar multiples carpetas.

---

## 🚀 Quick Start

### 1. Instalar Dependencias

```bash
npm install
# o
pnpm install
```

### 2. Configurar Variables de Entorno

```bash
cp .env.example .env.local

# Editar con tus credenciales de Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

### 3. Configurar MCPs (Opcional)

```bash
cp .claude/example.mcp.json .mcp.json
# Editar con tu project ref de Supabase
```

### 4. Iniciar Desarrollo

```bash
npm run dev
# Auto-detecta puerto disponible (3000-3006)
```

---

## 🛠️ Comandos npm

### Development
```bash
npm run dev          # Servidor desarrollo (auto-port 3000-3006)
npm run build        # Build para produccion
npm run start        # Servidor produccion
```

### Quality Assurance
```bash
npm run test         # Tests con Jest
npm run test:watch   # Tests en modo watch
npm run lint         # ESLint
npm run lint:fix     # Fix automatico
npm run typecheck    # TypeScript check
```

---

## 🤖 Claude Code Integration

### Comandos Disponibles

| Comando | Descripcion |
|---------|-------------|
| `/new-app` | Arquitecto de Negocio - genera BUSINESS_LOGIC.md |
| `/landing` | Money Maker - landing pages de alta conversion |
| `/add-login` | Agrega autenticacion con Supabase |
| `/primer` | Contextualiza a Claude sobre el proyecto |

### Agentes Especializados

| Agente | Especialidad |
|--------|--------------|
| **Codebase Analyst** | Analiza arquitectura y patrones |
| **Frontend Specialist** | React, Next.js, Tailwind |
| **Backend Specialist** | APIs, Supabase, DB |
| **Supabase Admin** | Auth, migrations, RLS |
| **Vercel Deployer** | Deploy, env vars, domains |
| **Validacion Calidad** | Tests, linting, tipos |
| **Gestor Documentacion** | Mantiene docs actualizados |

### MCPs Configurados

- 🧠 **Next.js DevTools** - Conectado a `/_next/mcp` para debug en tiempo real
- 👁️ **Playwright** - Validacion visual y testing automatizado
- 🗄️ **Supabase** - Integracion directa con DB y auth

---

## 📋 Sistema PRP (Product Requirements Proposals)

> **Contrato humano-IA antes de escribir codigo**

### Flujo

```
1. Humano: "Necesito [feature]"
2. IA: Investiga si es necesario
3. IA: Genera PRP-XXX-nombre.md
4. Humano: Revisa y aprueba
5. IA: Ejecuta Blueprint fase por fase
```

### Anatomia

| Seccion | Proposito |
|---------|-----------|
| **Objetivo** | Que se construye (estado final) |
| **Por Que** | Valor de negocio |
| **Que** | Comportamiento + criterios de exito |
| **Contexto** | Docs, referencias, gotchas |
| **Blueprint** | Fases de implementacion |
| **Validacion** | Tests, linting, verificacion |

---

## 🎨 AI Templates - Sistema de Bloques LEGO

Templates copy-paste para construir agentes IA con **Vercel AI SDK v5 + OpenRouter**.

### Bloques Disponibles

| # | Bloque | Tiempo | Descripcion |
|---|--------|--------|-------------|
| 00 | Setup Base | 10 min | Configuracion inicial |
| 01 | Chat Streaming | 15 min | Chat con useChat |
| 01-ALT | Action Stream | 30 min | Agente transparente |
| 02 | Web Search | 5 min | Busqueda con :online |
| 03 | Historial | 20 min | Persistencia en Supabase |
| 04 | Vision | 25 min | Analisis de imagenes |
| 05 | Tools | 20 min | Funciones/herramientas |

### Dos Caminos

**A) Chat Tradicional**: `00 → 01 → 02 → 03 → 04 → 05`
- Respuestas de texto con streaming
- Ideal para: chatbots, asistentes, Q&A

**B) Agente Transparente**: `00 → 01-ALT → 02 → 03 → 04`
- Acciones visibles en tiempo real
- Ideal para: calculadoras ROI, auditorias, diagnosticos

---

## 🎭 Design Systems

Sistemas de diseno visuales listos para usar en `.claude/design-systems/`.

| Sistema | Estilo |
|---------|--------|
| **Liquid Glass** | iOS-like, transparencias |
| **Gradient Mesh** | Degradados fluidos |
| **Neumorphism** | Soft UI, sombras suaves |
| **Bento Grid** | Grids asimetricos |
| **Neobrutalism** | Bold, bordes duros |

---

## 🛠️ Skills System

Skills son carpetas con instrucciones que ensenan a Claude como hacer tareas especializadas.

### Estructura

```
skill-name/
├── SKILL.md              # Metadatos + Instrucciones (requerido)
├── scripts/              # Codigo ejecutable (opcional)
├── references/           # Documentacion (opcional)
└── assets/              # Recursos (opcional)
```

### Skill Incluido: skill-creator

```bash
python .claude/skills/skill-creator/scripts/init_skill.py my-skill
python .claude/skills/skill-creator/scripts/quick_validate.py ./my-skill
python .claude/skills/skill-creator/scripts/package_skill.py ./my-skill
```

---

## 🔒 Supabase Setup

### 1. Crear Proyecto

```bash
# Visita: https://supabase.com/dashboard
# Crea nuevo proyecto
# Copia URL y Anon Key
```

### 2. Cliente Configurado

```typescript
// src/shared/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### 3. Migraciones

```bash
# Guardar en supabase/migrations/
# Ejemplo: supabase/migrations/001_create_users.sql
```

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
// src/features/auth/hooks/useAuth.test.ts
import { renderHook } from '@testing-library/react'
import { useAuth } from './useAuth'

test('should authenticate user', async () => {
  const { result } = renderHook(() => useAuth())
  await result.current.login('test@example.com', 'password')
  expect(result.current.user).toBeDefined()
})
```

### Run Tests

```bash
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

---

## 🎯 Best Practices

### Component Structure

```typescript
// ✅ GOOD: Clear props, typed
interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  onClick: () => void
}

export function Button({ children, variant = 'primary', onClick }: ButtonProps) {
  return (
    <button onClick={onClick} className={`btn btn-${variant}`}>
      {children}
    </button>
  )
}
```

### Feature Organization

```typescript
// ✅ GOOD: Todo relacionado en un lugar
src/features/auth/
├── components/     # UI especificos de auth
├── hooks/          # Logica de auth
├── services/       # API calls
├── types/          # Types de auth
└── store/          # Estado de auth
```

---

## 🚨 Troubleshooting

### Puerto Ocupado (EADDRINUSE)

```bash
# El auto-port detection deberia resolver esto
# Si persiste:
lsof -i :3000
kill -9 <PID>
```

### TypeScript Errors

```bash
npm run typecheck
rm -rf .next
npm install
```

### Tests Failing

```bash
npm run test -- --clearCache
npm run test -- --verbose
```

---

## 📦 Deploy

### Vercel (Recomendado)

```bash
npm install -g vercel
vercel
```

### Variables de Entorno

En tu dashboard de Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 📂 Estructura de .claude/

```
.claude/
├── commands/           # Comandos slash (/comando)
├── agents/             # Agentes especializados
├── PRPs/               # Product Requirements Proposals
├── skills/             # Skills reutilizables
├── ai_templates/       # Bloques LEGO para agentes IA
├── design-systems/     # Sistemas de diseno visuales
├── prompts/            # Metodologias y patrones
├── hooks/              # Scripts en eventos
└── example.mcp.json    # Config de MCPs
```

---

## 🔄 Versionado

**Template Version:** 2.0.0
**Last Updated:** 2024-12-16

---

*Este README es la fuente de verdad del template SaaS Factory.*
*Guardado en `.claude/` para preservarlo durante el desarrollo de proyectos.*
