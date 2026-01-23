---
description: "Inicializar contexto del proyecto para el asistente AI. Usa esto al comenzar una nueva conversación para que Claude entienda rápidamente tu proyecto."
---

# Primer: Contexto SaaS Factory

Este proyecto fue creado con **SaaS Factory**, una template optimizada para desarrollo Agent-First. Al ejecutar `/primer`, el agente entiende inmediatamente qué tiene disponible y cómo trabajar.

## Lo Que Ya Sabes (SaaS Factory DNA)

### Golden Path (Stack Fijo)
No hay decisiones técnicas que tomar. El stack está definido:

| Capa | Tecnología | Notas |
|------|------------|-------|
| Framework | Next.js 16 + Turbopack | App Router, Server Components |
| UI | React 19 + TypeScript | Strict mode |
| Styling | Tailwind CSS 3.4 | Sin CSS custom |
| Backend | Supabase | Auth + PostgreSQL + Storage + RLS |
| Validation | Zod | Schemas compartidos client/server |

### Arquitectura Feature-First
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Route group: páginas sin sidebar
│   ├── (main)/            # Route group: páginas con sidebar
│   └── api/               # API Routes
├── features/              # Todo colocalizado por feature
│   └── [feature-name]/
│       ├── components/    # UI de la feature
│       ├── services/      # Lógica de negocio
│       ├── hooks/         # React hooks
│       └── types/         # TypeScript types
├── components/            # Componentes compartidos (Sidebar, etc.)
└── lib/
    └── supabase/          # Clients (client.ts, server.ts)
```

### MCPs Disponibles
Tienes 3 MCPs conectados. Úsalos:

| MCP | Comandos Clave | Cuándo Usar |
|-----|----------------|-------------|
| **Supabase** | `list_tables`, `execute_sql`, `apply_migration`, `get_logs` | SIEMPRE para BD. No uses CLI. |
| **Next.js DevTools** | `nextjs_index`, `nextjs_call`, `browser_eval` | Debug errores, ver estado del servidor |
| **Playwright** | `browser_navigate`, `browser_snapshot`, `browser_click` | Validación visual, testing UI |

### Agentes Especializados
Delega tareas complejas a agentes via `Task` tool:

| Agente | Responsabilidad |
|--------|-----------------|
| `frontend-specialist` | UI/UX, componentes, Tailwind, animaciones |
| `backend-specialist` | Server Actions, APIs, lógica de negocio |
| `supabase-admin` | Migraciones, RLS policies, queries complejas |
| `validacion-calidad` | Tests, quality gates, verificación |
| `vercel-deployer` | Deploy, env vars, dominios |
| `gestor-documentacion` | README, docs técnicos |
| `codebase-analyst` | Patrones, convenciones del proyecto |

### Comandos Slash Disponibles
- `/primer` → Este comando (contexto inicial)
- `/a2a-report` → Reporte para comunicar a otra IA
- `/generar-prp` → Generar Product Requirements Proposal
- `/new-app` → Crear nueva aplicación desde cero

---

## Proceso de Contextualización

### 1. Leer Identidad del Proyecto

Lee `CLAUDE.md` y extrae:
- **Nombre del proyecto**
- **Problema que resuelve** (propuesta de valor)
- **Usuario target** (avatar)
- **Reglas de negocio específicas**

### 2. Mapear Estado de BD (via Supabase MCP)

Ejecuta `list_tables` para ver:
- Qué tablas existen
- Cuántos registros tiene cada una
- Si RLS está habilitado
- Relaciones entre tablas (foreign keys)

### 3. Escanear Features Implementadas

Revisa `src/app/` y `src/features/` para entender:
- Qué páginas existen
- Qué features están construidas
- Qué API endpoints hay

### 4. Entregar Resumen

```markdown
# 🏭 [Nombre del Proyecto]

## Template
SaaS Factory v1.0 (Next.js 16 + Supabase)

## Propósito
[Qué problema resuelve en 1-2 líneas]

## Estado Actual

### Base de Datos
| Tabla | Registros | RLS |
|-------|-----------|-----|
| ... | ... | ✅/❌ |

### Rutas Implementadas
- `/` → [descripción]
- `/dashboard` → [descripción]
- ...

### API Endpoints
- `POST /api/xxx` → [qué hace]
- ...

## MCPs Activos
✅ Supabase | ✅ Next.js DevTools | ✅ Playwright

## Comandos
- `npm run dev` → Desarrollo
- `npm run build` → Build

## Listo para trabajar
¿En qué te ayudo?
```

---

## Filosofía SaaS Factory

### El Humano Decide QUÉ, Tú Ejecutas CÓMO
- El humano define el problema de negocio
- Tú traduces a código usando el Golden Path
- No preguntas "¿qué stack usar?" - ya está decidido

### Velocidad = Inteligencia
- Turbopack permite 100 iteraciones en 30 segundos
- Usa Playwright para validar visualmente → código → screenshot → iterar
- No planifiques de más, ejecuta y ajusta

### MCPs son tus Sentidos
- **Supabase MCP** = Tu conexión a la BD (no uses CLI)
- **Next.js DevTools** = Tus ojos en errores/logs
- **Playwright** = Tu validación visual

---

## Uso

```bash
# Al inicio de cada conversación nueva
/primer

# El agente lee el contexto y está listo para trabajar
```

**Objetivo**: De 5-10 minutos de explicación a 30 segundos de contexto automático.

---

*SaaS Factory: Agent-First Development*
