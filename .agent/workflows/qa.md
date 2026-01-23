---
description: Quality Gate (Repo Truth)
---

Propósito: Ejecutar un QA reproducible y alineado con el repositorio usando npm run qa como verificación principal. Luego, (opcional) correr smoke tests básicos con Playwright y emitir un reporte claro. No usar next lint (Next.js 16 ya no lo incluye).

Requisitos previos

En package.json existe:

"qa": "npm run typecheck && npm run lint && npm run build"

"lint": "eslint . --max-warnings 0"

"build": "npm run lint && next build" (si ya lo tienes, mejor)

Flujo del workflow (orden estricto)

Repo QA (fuente de verdad)

Ejecutar en terminal: npm run qa

Si falla: reportar el primer comando que falló + error, proponer fix mínimo y detenerse (o aplicar fix mínimo si el workflow está autorizado a corregir).

Smoke tests (valor agregado)

Verificar si el servidor ya está corriendo.

Si no está corriendo: levantar npm run dev y detectar el puerto (3000–3006).

Con Playwright:

Navegar a / y validar carga.

Navegar a /login y validar que existe el formulario.

Navegar a /dashboard sin sesión y validar redirect a /login.

Reporte final

Mostrar tabla/resumen con: Typecheck, Lint, Build, Smoke.

Incluir comandos ejecutados y exit codes.

Listar archivos cambiados (solo si el workflow aplicó fixes).

Auto-Blindaje

Solo si el fallo fue un patrón nuevo (no repetido): agregar entrada en GEMINI.md:

Error/Síntoma

Fix

Aplicar en

Formato de salida (plantilla)

Result: PASS/FAIL

Checks:

Typecheck: PASS/FAIL

Lint: PASS/FAIL

Build: PASS/FAIL

Smoke: PASS/FAIL

Root cause (si falló): 2–5 líneas, concreto

Fix aplicado (si aplica): lista corta

Auto-Blindaje (si aplica): entrada agregada en GEMINI.md

Recomendación operativa

Tu estándar oficial para QA (local y CI): npm run qa.

/qa en Antigravity debe ser el “wrapper inteligente” que:

llama npm run qa

corre smoke tests

reporta bonito