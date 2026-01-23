---
description: 
---

# /add-login — Implementar Auth B2B (Supabase + Next.js 16)

OBJETIVO:
Implementar el sistema de autenticación completo siguiendo el blueprint del repo.

REGLAS:
- No pidas confirmaciones. Ejecuta.
- No inventes APIs. Usa el Golden Path y lo que ya exista en el repo.
- En server: usar getUser() (no getSession()).
- En SSR: usar @supabase/ssr con cookies getAll()/setAll().
- Mantén arquitectura Feature-First.

PASOS:
1) Abre y lee el archivo: `.agent/blueprints/add-login.md`
   - Si no existe, busca `docs/add-login.md` y úsalo.
2) Implementa todos los archivos y cambios indicados en el blueprint.
3) Aplica la migración SQL (profiles + RLS + trigger).
4) Verifica compilación y rutas:
   - `npm run typecheck`
   - `npm run lint`
   - `npm run build`
5) Smoke check manual:
   - /signup → crear usuario
   - /login → entrar
   - /dashboard protegido
   - /forgot-password → enviar email
   - /update-password → actualizar pass
6) Auto-Blindaje:
   - Si hubo errores, documenta el aprendizaje en el lugar correspondiente.

SALIDA:
Devuelve un resumen con:
- Archivos creados/modificados
- Migración aplicada (sí/no)
- Checklist de rutas probadas
- Errores encontrados y fixes
