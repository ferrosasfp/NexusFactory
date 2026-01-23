# Construir Agentes con Vercel AI SDK v5

Guia para construir agentes IA con Vercel AI SDK v5 + OpenRouter en frontend Next.js 16.

> **IMPORTANTE**: Este prompt esta actualizado para AI SDK v5 (ai@5.x). Las APIs cambiaron significativamente desde v4.

---

## Cuando Usar

- Frontend Next.js con interfaz de chat
- Necesitas respuestas en streaming con SSE
- Quieres llamadas a herramientas con tipos seguros en TypeScript
- Cambiar entre multiples proveedores de IA

---

## Inicio Rapido

### Instalacion

```bash
npm install ai@latest @ai-sdk/react @openrouter/ai-sdk-provider zod
```

### Variables de Entorno

```env
OPENROUTER_API_KEY=sk-or-v1-...
```

---

## Backend: API Route (SDK v5)

```typescript
// app/api/chat/route.ts
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { streamText, convertToModelMessages, type UIMessage } from 'ai'

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
})

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  // IMPORTANTE: Convertir UIMessage[] a ModelMessage[]
  const modelMessages = convertToModelMessages(messages)

  const result = streamText({
    model: openrouter('anthropic/claude-3-5-sonnet'),
    system: 'Eres un asistente util',
    messages: modelMessages,
  })

  // IMPORTANTE: Usar toUIMessageStreamResponse() para SDK v5
  return result.toUIMessageStreamResponse()
}
```

### Cambios Clave en v5

| v4 (antiguo) | v5 (actual) |
|--------------|-------------|
| `OpenRouter` class | `createOpenRouter()` function |
| `messages` directo | `convertToModelMessages(messages)` |
| `toDataStreamResponse()` | `toUIMessageStreamResponse()` |
| `import { useChat } from 'ai/react'` | `import { useChat } from '@ai-sdk/react'` |

---

## Frontend: Hook useChat (SDK v5)

```typescript
'use client'

import { useState, FormEvent } from 'react'
import { useChat } from '@ai-sdk/react'

export function ChatWidget() {
  // IMPORTANTE: En v5, el input se maneja externamente
  const { messages, status, error, sendMessage } = useChat()
  const [input, setInput] = useState('')

  const isLoading = status === 'submitted' || status === 'streaming'

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const text = input.trim()
    setInput('')
    // IMPORTANTE: sendMessage espera un objeto { text: string }
    sendMessage({ text })
  }

  // Helper para extraer texto de message.parts
  const getMessageContent = (message: typeof messages[0]): string => {
    if (!message.parts) return ''
    return message.parts
      .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
      .map(part => part.text)
      .join('')
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((m) => (
          <div key={m.id} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <div className="inline-block p-3 rounded-lg">
              {getMessageContent(m)}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe un mensaje..."
          disabled={isLoading}
          className="w-full px-4 py-2 border rounded"
        />
      </form>
    </div>
  )
}
```

### Cambios en useChat v5

| v4 (antiguo) | v5 (actual) |
|--------------|-------------|
| `input` del hook | `useState` externo |
| `handleInputChange` | `onChange={(e) => setInput(e.target.value)}` |
| `handleSubmit` | Custom con `sendMessage({ text })` |
| `isLoading` | `status === 'submitted' \|\| status === 'streaming'` |
| `message.content` | `message.parts.filter(p => p.type === 'text')` |

---

## Llamadas a Herramientas (Tools)

```typescript
import { z } from 'zod'
import { tool } from 'ai'

const tools = {
  calcularMateriales: tool({
    description: 'Calcula materiales necesarios para construccion',
    parameters: z.object({
      area: z.number().describe('Area en metros cuadrados'),
      tipo: z.string().describe('Tipo de trabajo: pared, piso, techo'),
    }),
    execute: async ({ area, tipo }) => {
      // Logica de calculo
      return { materiales: [...], costo: 1000 }
    },
  }),
}

// En el API route
const result = streamText({
  model: openrouter('anthropic/claude-3-5-sonnet'),
  messages: modelMessages,
  tools,
  maxSteps: 5, // Habilita bucle agentico
})
```

---

## Configuracion Multi-Proveedor

```typescript
import { createOpenRouter } from '@openrouter/ai-sdk-provider'

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
})

// Cambiar modelos facilmente
const claude = openrouter('anthropic/claude-3-5-sonnet')
const gpt4 = openrouter('openai/gpt-4o')
const gemini = openrouter('google/gemini-2.0-flash-exp')
```

---

## Matriz de Niveles de IA

| Nivel | Patron | Cuando Usar |
|-------|--------|-------------|
| 1 | `generateText()` | Background jobs, sin UI |
| 2 | `streamText()` + `useChat()` | Chat interactivo basico |
| 3 | `streamText()` + `tools` | Agente que ejecuta acciones |
| 4 | `Agent` class | Workflows autonomos complejos |
| 5 | Multi-agente | Orquestacion de agentes especializados |

---

## Mejores Practicas

1. **Siempre convertir mensajes**: `convertToModelMessages(messages)` antes de `streamText`
2. **Usar UIMessageStreamResponse**: Para compatibilidad con `useChat` v5
3. **Input externo**: Manejar estado de input fuera del hook
4. **Message parts**: Los mensajes tienen `.parts[]`, no `.content`
5. **Status check**: Usar `status` en lugar de `isLoading`
6. **Error handling**: El hook expone `error` directamente

---

## Recursos

- [Documentacion Vercel AI SDK v5](https://sdk.vercel.ai)
- [Guia de Migracion v4 a v5](https://sdk.vercel.ai/docs/migration-guides)
- [OpenRouter Provider](https://github.com/OpenRouterTeam/ai-sdk-provider)
