# Antigravity Setup (SaaS Factory Port)

Este repo fue diseñado originalmente para Claude Code/CLI. Para usarlo con Antigravity, utiliza la carpeta `.agent/`:

- `.agent/rules.md` → reglas/instrucciones del agente
- `.agent/workflows/*.md` → workflows/macros reutilizables
- `.agent/skills/*` → skills reutilizables

## Paso a paso sugerido

1) Crear proyecto
- Crea una carpeta nueva para tu SaaS
- Copia el contenido del Golden Path (este repo) dentro de esa carpeta

2) Instalar y ejecutar
```bash
npm install
npm run dev
```

3) Configurar MCP (opcional pero recomendado)
En la raíz existe `.mcp.json` con una configuración de ejemplo.
También incluimos `antigravity.mcp_config.example.json` para que lo pegues en el formato que Antigravity te solicite.

4) Inicializar contexto
- Pega `.agent/rules.md` como reglas de proyecto en Antigravity.
- Ejecuta el workflow `.agent/workflows/primer.md` para cargar el contexto (si tu herramienta soporta “workflows”).
- Luego usa `.agent/workflows/new-app.md` para entrevistar y generar `BUSINESS_LOGIC.md`.

## Nota sobre naming
Los archivos en `.agent/workflows/` mantienen el naming original (por compatibilidad). Si prefieres, puedes renombrarlos internamente en Antigravity (por ejemplo: `new-app` → `new_app`).
