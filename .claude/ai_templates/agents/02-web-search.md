# Bloque 02: Web Search

> Busqueda web integrada con un solo suffix.

**Tiempo:** 5 minutos
**Prerequisitos:** Bloque 01 (Chat Streaming)

---

## Que Obtienes

- Busqueda web en tiempo real
- Sin API adicional
- Solo un suffix `:online`

---

## Como Funciona

OpenRouter soporta el suffix `:online` en cualquier modelo.
Automaticamente hace busqueda web antes de responder.

```
modelo:online = modelo + busqueda web
```

---

## 1. Modificar API Route

```typescript
// app/api/chat/route.ts
// MODIFICAR: Agregar soporte para web search

import { openrouter, MODELS } from '@/lib/ai/openrouter'
import { streamText, convertToModelMessages, type UIMessage } from 'ai'

const SYSTEM_PROMPT = `Eres un asistente util.
Cuando busques informacion, cita las fuentes.`

export async function POST(req: Request) {
  const {
    messages,
    webSearch = false  // Nuevo parametro
  }: {
    messages: UIMessage[]
    webSearch?: boolean
  } = await req.json()

  const modelMessages = convertToModelMessages(messages)

  // Agregar :online si webSearch esta activo
  const modelId = webSearch
    ? `${MODELS.balanced}:online`
    : MODELS.balanced

  const result = streamText({
    model: openrouter(modelId),
    system: SYSTEM_PROMPT,
    messages: modelMessages,
  })

  return result.toUIMessageStreamResponse()
}
```

---

## 2. Actualizar Componente

```typescript
// features/chat/components/ChatWidget.tsx
// MODIFICAR: Agregar toggle de web search

'use client'

import { useState, FormEvent } from 'react'
import { useChat } from '@ai-sdk/react'

export function ChatWidget() {
  const { messages, status, error, sendMessage } = useChat()
  const [input, setInput] = useState('')
  const [webSearch, setWebSearch] = useState(false)  // Nuevo estado

  const isLoading = status === 'submitted' || status === 'streaming'

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const text = input.trim()
    setInput('')

    // Enviar con opcion de web search
    sendMessage({
      text,
      body: { webSearch }  // Pasar al API route
    })
  }

  // ... resto del codigo igual ...

  return (
    <div className="flex flex-col h-full">
      {/* ... lista de mensajes ... */}

      {/* Input con toggle */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        {/* Toggle de Web Search */}
        <div className="flex items-center gap-2 mb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={webSearch}
              onChange={(e) => setWebSearch(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-600">
              Buscar en web
            </span>
          </label>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={webSearch ? "Buscar en internet..." : "Escribe tu mensaje..."}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
          >
            {webSearch ? 'Buscar' : 'Enviar'}
          </button>
        </div>
      </form>
    </div>
  )
}
```

---

## 3. Alternativa: Web Search Siempre Activo

Si quieres que SIEMPRE busque en web:

```typescript
// app/api/chat/route.ts

const result = streamText({
  model: openrouter(`${MODELS.balanced}:online`),  // Siempre online
  system: SYSTEM_PROMPT,
  messages: modelMessages,
})
```

---

## Modelos Compatibles con :online

Todos los modelos de OpenRouter soportan `:online`:

```typescript
// Ejemplos
'anthropic/claude-3-5-sonnet:online'
'google/gemini-2.0-flash-exp:free:online'
'openai/gpt-4o:online'
```

---

## Consideraciones

1. **Latencia**: Web search agrega ~2-5 segundos
2. **Costo**: Puede incrementar el costo del request
3. **Fuentes**: El modelo incluira referencias en la respuesta

---

## System Prompt Recomendado

```typescript
const SYSTEM_PROMPT = `Eres un asistente con acceso a busqueda web.

Cuando uses informacion de la web:
1. Menciona las fuentes brevemente
2. Indica si la informacion es reciente
3. Distingue entre hechos y opiniones

Si no encuentras informacion relevante, dilo claramente.`
```

---

## Checklist

- [ ] API route modificada para aceptar `webSearch`
- [ ] Toggle de web search en UI (o siempre activo)
- [ ] Probado que las busquedas funcionan

---

## Siguiente Bloque

- **Guardar conversaciones**: `03-historial-supabase.md`
- **Analizar imagenes**: `04-vision-analysis.md`
- **Agregar tools**: `05-tools-funciones.md`
