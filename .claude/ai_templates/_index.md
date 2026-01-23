# AI Templates - Sistema Modular

> **"El 20% de componentes que produce el 80% de los resultados"**

Templates copy-paste para IA con **Vercel AI SDK v5 + OpenRouter**.

---

## Estructura

```
ai_templates/
├── _index.md              # Este archivo
│
├── agents/                # Flujo secuencial para agentes
│   ├── 00-setup-base.md
│   ├── 01-chat-streaming.md
│   ├── 01-alt-action-stream.md
│   ├── 02-web-search.md
│   ├── 03-historial-supabase.md
│   ├── 04-vision-analysis.md
│   ├── 05-tools-funciones.md
│   └── 06-rag-basico.md
│
└── [standalone]           # Capacidades independientes
    ├── single-call.md
    ├── structured-outputs.md  (en optimizacion)
    └── generative-ui.md       (en optimizacion)
```

---

## Dos Tipos de Templates

### 1. Agentes (Secuenciales)

Bloques que se construyen progresivamente. Ubicados en `agents/`.

| # | Bloque | Prerequisitos |
|---|--------|---------------|
| 00 | **Setup Base** | Ninguno |
| 01 | **Chat Streaming** | 00 |
| 01-ALT | **Action Stream** | 00 (alternativa a 01) |
| 02 | **Web Search** | 01 |
| 03 | **Historial** | 01 + Supabase |
| 04 | **Vision** | 01 |
| 05 | **Tools** | 01 |
| 06 | **RAG Basico** | 03 (Supabase) |

**Dos caminos:**

```
Camino A (Chat):    00 → 01 → 02 → 03 → 04 → 05 → 06
Camino B (Action):  00 → 01-ALT → 02 → 03 → 04 → 06
```

### 2. Standalone (Independientes)

Capacidades que NO dependen del flujo de agente. En la raiz de `ai_templates/`.

| Template | Descripcion | Estado |
|----------|-------------|--------|
| **single-call.md** | Llamada simple a LLM | Listo |
| **structured-outputs.md** | JSON tipado con Zod | En optimizacion |
| **generative-ui.md** | Componentes dinamicos | En optimizacion |

---

## Cuando Usar Cada Uno

### Usa Agentes cuando:
- Necesitas conversacion continua
- El usuario interactua multiples veces
- Requieres memoria/historial
- El AI debe usar herramientas

### Usa Standalone cuando:
- Es una accion puntual (boton "Resumir")
- No hay interaccion de chat
- Solo necesitas una respuesta
- Quieres JSON estructurado

---

## Como Referenciar

### Agentes (secuenciales)
```
@ai_templates/agents/00-setup-base.md
Configura el setup base para mi proyecto
```

### Standalone (independientes)
```
@ai_templates/single-call.md
Implementa un boton que resuma texto con IA
```

### Combinacion
```
@ai_templates/_index.md
Necesito: Setup + Chat + RAG
```

---

## Stack Compartido

Todos los templates usan:

```env
# .env.local
OPENROUTER_API_KEY=sk-or-v1-...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

```bash
# Dependencias
npm install ai@latest @ai-sdk/react @openrouter/ai-sdk-provider zod
npm install @supabase/supabase-js @supabase/ssr
```

---

## Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                    VERCEL AI SDK v5                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   AGENTES (chat)              STANDALONE (puntual)              │
│   ┌──────────────────┐       ┌──────────────────┐              │
│   │ useChat()        │       │ generateText()   │              │
│   │ streamText()     │       │ generateObject() │              │
│   │ tools + RAG      │       │                  │              │
│   └────────┬─────────┘       └────────┬─────────┘              │
│            │                          │                         │
│   ┌────────┴──────────────────────────┴─────────┐              │
│   │               OPENROUTER                     │              │
│   │     300+ modelos via una sola API            │              │
│   └────────────────────┬────────────────────────┘              │
│                        │                                        │
│   ┌────────────────────┴────────────────────────┐              │
│   │               SUPABASE                       │              │
│   │   Auth │ Historial │ pgvector (RAG)         │              │
│   └─────────────────────────────────────────────┘              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Combinaciones Recomendadas

### Chatbot Basico
```
agents/00 + agents/01 + agents/02
```

### Asistente con Memoria
```
agents/00 + agents/01 + agents/02 + agents/03
```

### Agente con Conocimiento (RAG)
```
agents/00 + agents/01 + agents/03 + agents/06
```

### Boton de IA Simple
```
single-call.md (sin agente)
```

### Extraccion de Datos
```
structured-outputs.md (sin agente)
```

---

## Principios

1. **Agentes = conversacion**, Standalone = accion puntual
2. **Copy-paste ready**: Busca `// MODIFICAR:`
3. **TypeScript + Zod**: Tipos seguros siempre
4. **UI headless**: Tu decides el diseño

---

*"No todo necesita ser un agente. A veces un boton es suficiente."*
