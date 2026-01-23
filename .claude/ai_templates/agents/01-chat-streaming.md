# Bloque 01: Chat Streaming

> Chat con streaming usando Vercel AI SDK v5 + useChat hook.

**Tiempo:** 15 minutos
**Prerequisitos:** Bloque 00 (Setup Base)

---

## Que Obtienes

- Chat con respuestas en streaming
- Estado manejado automaticamente
- UI headless (tu decides el diseño)
- Compatible con todos los bloques siguientes

---

## 1. API Route

```typescript
// app/api/chat/route.ts
// MODIFICAR: Solo el system prompt

import { openrouter, MODELS } from '@/lib/ai/openrouter'
import { streamText, convertToModelMessages, type UIMessage } from 'ai'

// MODIFICAR: Tu system prompt
const SYSTEM_PROMPT = `Eres un asistente util y conciso.
Responde en español.
Se directo y practico.`

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  // Convertir UIMessage[] a formato del modelo
  const modelMessages = convertToModelMessages(messages)

  const result = streamText({
    model: openrouter(MODELS.balanced),
    system: SYSTEM_PROMPT,
    messages: modelMessages,
  })

  // Retornar stream compatible con useChat
  return result.toUIMessageStreamResponse()
}
```

---

## 2. Hook useChat

```typescript
// features/chat/hooks/useChat.ts
// NUNCA MODIFICAR - Re-exporta el hook del SDK

'use client'

// SDK v5: importar de @ai-sdk/react
export { useChat } from '@ai-sdk/react'

// Tipos utiles
export type { Message } from 'ai'
```

---

## 3. Componente de Chat (UI Headless)

```typescript
// features/chat/components/ChatWidget.tsx
// MODIFICAR: Estilos segun tu diseño

'use client'

import { useState, FormEvent } from 'react'
import { useChat } from '@ai-sdk/react'

export function ChatWidget() {
  // SDK v5: input se maneja externamente
  const { messages, status, error, sendMessage } = useChat()
  const [input, setInput] = useState('')

  const isLoading = status === 'submitted' || status === 'streaming'

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const text = input.trim()
    setInput('')
    // SDK v5: sendMessage espera { text: string }
    sendMessage({ text })
  }

  // Helper: extraer texto de message.parts
  const getMessageText = (message: typeof messages[0]): string => {
    if (!message.parts) return ''
    return message.parts
      .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
      .map(part => part.text)
      .join('')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Lista de mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-center text-gray-400">
            Escribe algo para comenzar...
          </p>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                m.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {getMessageText(m)}
            </div>
          </div>
        ))}

        {/* Indicador de thinking */}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <ThinkingIndicator />
        )}

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg">
            Error: {error.message}
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu mensaje..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  )
}

// Indicador minimalista de thinking
function ThinkingIndicator() {
  return (
    <div className="flex justify-start">
      <p className="text-sm text-gray-400 italic animate-pulse">
        thinking...
      </p>
    </div>
  )
}
```

---

## 4. Usar el Componente

```typescript
// app/page.tsx o donde lo necesites

import { ChatWidget } from '@/features/chat/components/ChatWidget'

export default function Page() {
  return (
    <main className="h-screen">
      <ChatWidget />
    </main>
  )
}
```

---

## Cambios Clave SDK v4 vs v5

| v4 (antiguo) | v5 (actual) |
|--------------|-------------|
| `import { useChat } from 'ai/react'` | `import { useChat } from '@ai-sdk/react'` |
| `input` del hook | `useState` externo |
| `handleInputChange` | `onChange` manual |
| `handleSubmit` | `sendMessage({ text })` |
| `isLoading` | `status === 'streaming'` |
| `message.content` | `message.parts.filter(p => p.type === 'text')` |
| `toDataStreamResponse()` | `toUIMessageStreamResponse()` |

---

## Personalizacion

### Cambiar modelo

```typescript
// En app/api/chat/route.ts
const result = streamText({
  model: openrouter(MODELS.powerful), // Cambiar aqui
  // ...
})
```

### Agregar contexto del usuario

```typescript
// En app/api/chat/route.ts
const SYSTEM_PROMPT = `Eres un asistente para ${userName}.
Su empresa es ${companyName}.
Responde de forma personalizada.`
```

### Endpoint personalizado

```typescript
// En el componente
const { messages, sendMessage } = useChat({
  api: '/api/mi-chat-custom'
})
```

---

## Checklist

- [ ] API route creada en `app/api/chat/route.ts`
- [ ] System prompt personalizado
- [ ] Componente ChatWidget implementado
- [ ] Chat funciona con streaming

---

## Siguiente Bloque

- **Agregar busqueda web**: `02-web-search.md`
- **Guardar conversaciones**: `03-historial-supabase.md`
- **Analizar imagenes**: `04-vision-analysis.md`
- **Agregar tools**: `05-tools-funciones.md`
