# Antigravity Port Pack (SaaS Factory)

Este paquete agrega una carpeta **`.agent/`** con artefactos listos para usar en entornos de agente que **no dependen de Claude CLI**.

## Qué incluye

- `workflows/`  
  Copia 1:1 de los comandos originales de `.claude/commands/` (por ejemplo `new-app.md`, `landing.md`, `update-sf.md`, etc.).  
  Úsalos como *workflows / macros / prompts reutilizables* dentro de Antigravity.

- `skills/`  
  Skills reutilizables (por ahora: `skill-creator`) para estandarizar cómo crear nuevas skills internas.

## Cómo usarlo (alto nivel)

1. Mantén el Golden Path del repo tal cual (Next.js/Supabase/Tailwind/etc.).
2. En Antigravity, registra/pega:
   - Reglas del proyecto (ver `rules.md`)
   - Workflows (carpeta `workflows/`)
   - Skills (carpeta `skills/`)
3. Para generar tu `BUSINESS_LOGIC.md`, usa el workflow `workflows/new-app.md`.
4. Para generar una landing, usa `workflows/landing.md`.

## Nota
La carpeta `.claude/` se conserva como referencia “canónica” del origen.  
La carpeta `.agent/` es la adaptación para agentes sin Claude CLI.
