# Reglas del proyecto (Antigravity)

Pega este contenido (o úsalo como base) en la sección de reglas/instrucciones del agente dentro de Antigravity.

## Objetivo
Operar como una “fábrica” para crear SaaS production-ready usando el **Golden Path** del repositorio y un flujo agent-first con controles de calidad.

## Principios operativos
- Sigue el stack y la arquitectura del repo; evita introducir nuevas tecnologías salvo que sea estrictamente necesario.
- Prefiere cambios pequeños e incrementales.
- Cuando haya errores en ejecución/tests, corrige basado en evidencia (logs, resultados de tests, screenshots), no por suposición.

## Golden Path (stack fijo)
- Next.js (App Router) + React + TypeScript
- Tailwind + shadcn/ui
- Supabase (Auth + Postgres + Storage + RLS)
- Zod (validación)
- Zustand (estado)
- Playwright (tests e2e)

## Calidad y no-alucinación
- Usa herramientas de observabilidad (MCP / logs / tests) antes de proponer cambios grandes.
- Antes de cerrar una tarea, valida:
  - typecheck
  - lint
  - tests relevantes
  - y, si aplica, verificación visual con Playwright

## Workflows
- Para discovery de negocio: `workflows/new-app.md`
- Para landing: `workflows/landing.md`
- Para mantenimiento de la factory: `workflows/update-sf.md` y `workflows/eject-sf.md`
