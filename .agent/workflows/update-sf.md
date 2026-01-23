---
description: "Actualiza SaaS Factory a la ultima version. Busca el alias saas-factory, hace git pull y reemplaza la carpeta .claude/"
---

# Update SaaS Factory

Este comando actualiza las herramientas de desarrollo (carpeta `.claude/`) a la ultima version disponible.

## Proceso

### Paso 1: Buscar el alias saas-factory

Busca el alias `saas-factory` en los archivos de configuracion del shell del usuario:

```bash
# Buscar en zshrc
grep "alias saas-factory" ~/.zshrc

# Si no esta, buscar en bashrc
grep "alias saas-factory" ~/.bashrc
```

El alias tiene este formato:
```bash
alias saas-factory="cp -r /ruta/al/repo/saas-factory/. ."
```

**Extrae la ruta del repo** del alias (la parte entre `cp -r ` y `/saas-factory/.`).

Si no encuentras el alias, pregunta al usuario:
> No encontre el alias `saas-factory`. Por favor, indica la ruta donde tienes el repositorio de SaaS Factory.

### Paso 2: Actualizar el repositorio fuente

Una vez tengas la ruta del repo, actualiza con git:

```bash
cd [RUTA_REPO_SF]
git pull origin main
```

Si hay errores de git (cambios locales, etc.), informa al usuario y sugiere solucion.

### Paso 3: Reemplazar .claude/

Elimina la carpeta `.claude/` actual del proyecto y copia la nueva:

```bash
# En el directorio del proyecto actual
rm -rf .claude/
cp -r [RUTA_REPO_SF]/saas-factory/.claude/ .claude/
```

### Paso 4: Confirmar actualizacion

Informa al usuario:

```
SaaS Factory actualizado correctamente.

Cambios aplicados:
- .claude/commands/    (comandos actualizados)
- .claude/agents/      (agentes actualizados)
- .claude/PRPs/        (templates PRP actualizados)
- .claude/ai_templates/ (bloques LEGO actualizados)
- .claude/design-systems/ (sistemas de diseno actualizados)
- .claude/skills/      (skills actualizados)
- .claude/prompts/     (metodologias actualizadas)

Archivos NO modificados:
- CLAUDE.md (tu configuracion de proyecto)
- .mcp.json (tus tokens y credenciales)
- src/ (tu codigo)
```

## Notas

- Este comando NO modifica `CLAUDE.md`, `.mcp.json` ni el codigo fuente
- Solo actualiza la "toolbox" de desarrollo
- Si necesitas actualizar `CLAUDE.md` manualmente, revisa el template en el repo SF
