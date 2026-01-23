# Bloque 01-ALT: Action Stream

> Patron alternativo donde el usuario VE cada paso del agente.

**Tiempo:** 30 minutos
**Prerequisitos:** Bloque 00 (Setup Base)
**Reemplaza:** Bloque 01 (Chat Streaming)

---

## El Cambio de Paradigma

### Chat Tradicional (Bloque 01)
```
Usuario: "¿Cuanto me cuesta no automatizar?"
Bot: "Estas perdiendo $4,500/mes"
Usuario: "¿De donde sacaste ese numero?"
```

### Action Stream (Este bloque)
```
Usuario: "¿Cuanto me cuesta no automatizar?"

💭 "Calculando tu situacion actual..."
🔧 [calcularTiempo] 4 horas/dia x $50/hora = $200/dia
💬 "Pierdes $200 diarios en tiempo"
🔧 [proyectarMes] 22 dias laborales...
💬 "$4,400/mes en tiempo perdido"
🔧 [agregarErrores] +5% tasa de error...
💬 "Total: $4,500/mes"

Usuario: (no puede discutir, VIO el calculo)
```

**La transparencia ES el producto.**

---

## Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                  FLUJO ACTION STREAM                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Usuario envia mensaje                              │
│       ↓                                            │
│  API Route recibe                                   │
│       ↓                                            │
│  streamText() genera JSON estructurado              │
│       ↓                                            │
│  closeAndParseJson() parsea mientras llega          │
│       ↓                                            │
│  SSE envia acciones una por una                     │
│       ↓                                            │
│  useActionStream() recibe y renderiza               │
│       ↓                                            │
│  Usuario VE cada paso en tiempo real                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 1. Parser de JSON Parcial

```typescript
// lib/ai/closeAndParseJson.ts
// NUNCA MODIFICAR - Core del streaming

/**
 * Parsea JSON incompleto cerrando brackets automaticamente.
 * Permite procesar respuestas mientras llegan en streaming.
 */
export function closeAndParseJson(str: string): any | null {
  const stack: string[] = []
  let i = 0

  while (i < str.length) {
    const char = str[i]
    const last = stack.at(-1)

    if (char === '"') {
      if (i > 0 && str[i - 1] === '\\') {
        i++
        continue
      }
      if (last === '"') {
        stack.pop()
      } else {
        stack.push('"')
      }
    }

    if (last === '"') {
      i++
      continue
    }

    if (char === '{' || char === '[') {
      stack.push(char)
    }
    if (char === '}' && last === '{') stack.pop()
    if (char === ']' && last === '[') stack.pop()

    i++
  }

  let closed = str
  for (let j = stack.length - 1; j >= 0; j--) {
    const opening = stack[j]
    if (opening === '{') closed += '}'
    if (opening === '[') closed += ']'
    if (opening === '"') closed += '"'
  }

  try {
    return JSON.parse(closed)
  } catch {
    return null
  }
}
```

---

## 2. Schemas de Acciones

```typescript
// lib/ai/actionSchemas.ts
// MODIFICAR: Añade tus acciones especificas

import { z } from 'zod'

// === ACCIONES BASE (siempre incluir) ===

export const ThinkAction = z.object({
  _type: z.literal('think'),
  text: z.string(),
})

export const MessageAction = z.object({
  _type: z.literal('message'),
  text: z.string(),
})

// === ACCIONES PERSONALIZADAS ===

// Pedir datos al usuario
export const AskAction = z.object({
  _type: z.literal('ask'),
  question: z.string(),
  field: z.string(),
})

// Mostrar un calculo
export const CalculateAction = z.object({
  _type: z.literal('calculate'),
  description: z.string(),
  formula: z.string(),
  result: z.number(),
  unit: z.string().optional(),
})

// Ejecutar una tool/busqueda
export const ToolAction = z.object({
  _type: z.literal('tool'),
  name: z.string(),
  args: z.record(z.any()),
  result: z.any().optional(),
})

// === UNION DE TODAS LAS ACCIONES ===

export const ActionSchema = z.discriminatedUnion('_type', [
  ThinkAction,
  MessageAction,
  AskAction,
  CalculateAction,
  ToolAction,
])

export type Action = z.infer<typeof ActionSchema>

// Schema de respuesta completa
export const ResponseSchema = z.object({
  actions: z.array(ActionSchema),
})
```

---

## 3. API Route con Action Stream

```typescript
// app/api/agent/route.ts
// MODIFICAR: Solo el SYSTEM_PROMPT y acciones disponibles

import { openrouter, MODELS } from '@/lib/ai/openrouter'
import { streamText } from 'ai'
import { closeAndParseJson } from '@/lib/ai/closeAndParseJson'

// MODIFICAR: Tu system prompt
const SYSTEM_PROMPT = `Eres un agente que responde con acciones estructuradas.

SIEMPRE responde en este formato JSON:
{
  "actions": [
    { "_type": "think", "text": "tu razonamiento" },
    { "_type": "message", "text": "mensaje al usuario" },
    { "_type": "calculate", "description": "...", "formula": "...", "result": 123 }
  ]
}

Acciones disponibles:
- think: Explica tu razonamiento (el usuario lo ve)
- message: Mensaje directo al usuario
- ask: Pedir informacion al usuario
- calculate: Mostrar un calculo con formula visible
- tool: Ejecutar una herramienta externa

REGLAS:
1. Usa multiples acciones en secuencia
2. Siempre muestra tu razonamiento con "think"
3. Cada calculo debe mostrar la formula y el resultado
4. Se transparente en cada paso`

export async function POST(req: Request) {
  const { prompt, context } = await req.json()

  const encoder = new TextEncoder()
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()

  // Forzar inicio de JSON
  const forceStart = '{"actions": [{"_type":'

  const { textStream } = streamText({
    model: openrouter(MODELS.balanced),
    system: SYSTEM_PROMPT,
    messages: [
      { role: 'assistant', content: forceStart },
      { role: 'user', content: prompt },
    ],
    temperature: 0,
  })

  ;(async () => {
    let buffer = forceStart
    let cursor = 0

    try {
      for await (const text of textStream) {
        buffer += text

        const parsed = closeAndParseJson(buffer)
        if (!parsed?.actions) continue

        const actions = parsed.actions

        while (cursor < actions.length) {
          const action = actions[cursor]
          const isComplete = cursor < actions.length - 1 || buffer.endsWith(']}')

          await writer.write(
            encoder.encode(`data: ${JSON.stringify({ ...action, complete: isComplete })}\n\n`)
          )

          if (isComplete) cursor++
          else break
        }
      }

      await writer.write(encoder.encode('data: [DONE]\n\n'))
    } catch (error) {
      await writer.write(
        encoder.encode(`data: ${JSON.stringify({ error: String(error) })}\n\n`)
      )
    } finally {
      await writer.close()
    }
  })()

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
```

---

## 4. Hook useActionStream

```typescript
// features/agent/hooks/useActionStream.ts
// NUNCA MODIFICAR - Core del cliente

'use client'

import { useState, useCallback } from 'react'
import type { Action } from '@/lib/ai/actionSchemas'

export type StreamingAction = Action & { complete: boolean }

export function useActionStream(endpoint = '/api/agent') {
  const [actions, setActions] = useState<StreamingAction[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendPrompt = useCallback(async (prompt: string, context?: any) => {
    setIsStreaming(true)
    setError(null)
    setActions([])

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, context }),
      })

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error('No reader')

      let buffer = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const match = line.match(/^data: (.+)$/)
          if (!match) continue
          if (match[1] === '[DONE]') break

          try {
            const action: StreamingAction = JSON.parse(match[1])

            setActions(prev => {
              if (prev.length > 0 && !prev[prev.length - 1].complete) {
                return [...prev.slice(0, -1), action]
              }
              return [...prev, action]
            })
          } catch (e) {
            console.error('Parse error:', e)
          }
        }
      }
    } catch (e) {
      setError(String(e))
    } finally {
      setIsStreaming(false)
    }
  }, [endpoint])

  const reset = useCallback(() => {
    setActions([])
    setError(null)
  }, [])

  return { actions, isStreaming, error, sendPrompt, reset }
}
```

---

## 5. Componente ActionFeed

```typescript
// features/agent/components/ActionFeed.tsx
// MODIFICAR: Personaliza el rendering de cada tipo

'use client'

import { useState } from 'react'
import type { StreamingAction } from '../hooks/useActionStream'

// ============================================
// VALIDACION DE ACCIONES (evita burbujas vacias)
// ============================================

// MODIFICAR: Añade aquí los tipos que uses
const VALID_ACTION_TYPES = new Set(['think', 'message', 'ask', 'calculate', 'tool'])

// Helper: valida que una acción tenga contenido
function isValidAction(action: StreamingAction): boolean {
  // 1. Rechazar tipos no reconocidos
  if (!VALID_ACTION_TYPES.has(action._type)) return false

  // 2. Validar contenido según tipo
  switch (action._type) {
    case 'think':
    case 'message':
      return !!(action as { text?: string }).text?.trim()
    case 'ask':
      return !!(action as { question?: string }).question?.trim()
    case 'calculate':
      return !!(action as { description?: string }).description?.trim()
    case 'tool':
      return !!(action as { name?: string }).name?.trim()
    default:
      return false
  }
}

// ============================================

interface Props {
  actions: StreamingAction[]
}

export function ActionFeed({ actions }: Props) {
  return (
    <div className="space-y-3">
      {actions
        .filter(isValidAction) // <-- Filtra acciones invalidas/vacias
        .map((action, i) => (
          <ActionItem key={i} action={action} />
        ))}
    </div>
  )
}

function ActionItem({ action }: { action: StreamingAction }) {
  const baseClass = `flex items-start gap-3 p-3 rounded-lg transition-opacity ${
    !action.complete ? 'opacity-70' : ''
  }`

  switch (action._type) {
    case 'think':
      return <ThinkingToggle text={action.text} complete={action.complete} />

    case 'message':
      return (
        <div className={`${baseClass} bg-blue-50`}>
          <span className="text-xl">💬</span>
          <p className="text-gray-900">{action.text}</p>
        </div>
      )

    case 'ask':
      return (
        <div className={`${baseClass} bg-yellow-50`}>
          <span className="text-xl">❓</span>
          <p className="text-gray-900">{action.question}</p>
        </div>
      )

    case 'calculate':
      return (
        <div className={`${baseClass} bg-green-50`}>
          <span className="text-xl">🔢</span>
          <div>
            <p className="font-medium text-gray-900">{action.description}</p>
            <p className="text-sm text-gray-600 font-mono">{action.formula}</p>
            <p className="text-lg font-bold text-green-700">
              = {action.result} {action.unit || ''}
            </p>
          </div>
        </div>
      )

    case 'tool':
      return (
        <div className={`${baseClass} bg-purple-50`}>
          <span className="text-xl">🔧</span>
          <div>
            <p className="font-medium text-purple-700">{action.name}</p>
            <pre className="text-xs text-gray-600 mt-1">
              {JSON.stringify(action.args, null, 2)}
            </pre>
            {action.result && (
              <div className="mt-2 p-2 bg-white rounded">
                <pre className="text-xs">{JSON.stringify(action.result, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      )

    default:
      // Tipo no reconocido - no renderizar (el filtro ya deberia haberlo atrapado)
      console.warn('ActionItem: tipo no reconocido', action._type)
      return null
  }
}

// Toggle minimalista para thinking
// Por defecto colapsado, click para expandir
function ThinkingToggle({ text, complete }: { text: string; complete: boolean }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className={`w-full text-left transition-opacity ${!complete ? 'opacity-60' : ''}`}
    >
      {expanded ? (
        // Expandido: muestra el razonamiento completo
        <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
          <span className="text-xl">💭</span>
          <p className="text-gray-600 italic text-sm">{text}</p>
        </div>
      ) : (
        // Colapsado: solo "thinking..." en italicas
        <p className="text-sm text-gray-400 italic">
          thinking...
        </p>
      )}
    </button>
  )
}
```

---

## 6. Componente Principal

```typescript
// features/agent/components/AgentChat.tsx

'use client'

import { useState, FormEvent } from 'react'
import { useActionStream } from '../hooks/useActionStream'
import { ActionFeed } from './ActionFeed'

export function AgentChat() {
  const { actions, isStreaming, error, sendPrompt, reset } = useActionStream()
  const [input, setInput] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isStreaming) return
    sendPrompt(input.trim())
    setInput('')
  }

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <h1 className="font-bold text-lg">Agente Transparente</h1>
        <button
          onClick={reset}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Limpiar
        </button>
      </div>

      {/* Actions Feed */}
      <div className="flex-1 overflow-y-auto p-4">
        {actions.length === 0 && !isStreaming && (
          <p className="text-center text-gray-400 py-8">
            Escribe algo para comenzar...
          </p>
        )}

        <ActionFeed actions={actions} />

        {/* Indicador minimalista mientras inicia */}
        {isStreaming && actions.length === 0 && (
          <p className="text-sm text-gray-400 italic animate-pulse">
            thinking...
          </p>
        )}

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg">
            Error: {error}
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
            placeholder="Escribe tu solicitud..."
            disabled={isStreaming}
            className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg disabled:opacity-50 hover:bg-blue-600"
          >
            {isStreaming ? '...' : 'Enviar'}
          </button>
        </div>
      </form>
    </div>
  )
}
```

---

## Casos de Uso Ideales

| Caso | Por que Action Stream |
|------|----------------------|
| **Calculadoras ROI** | Usuario VE cada calculo |
| **Auditorias** | Cada verificacion es trazable |
| **Due Diligence** | Cada fuente visible |
| **Diagnosticos** | "Por que llegue a esta conclusion" |
| **Cotizadores** | Desglose transparente |
| **Investigacion** | Cada busqueda mostrada |

---

## Complejidad

| Componente | Lineas | Se modifica? |
|------------|--------|--------------|
| closeAndParseJson.ts | ~50 | NUNCA |
| useActionStream.ts | ~70 | NUNCA |
| API route | ~60 | Solo SYSTEM_PROMPT |
| actionSchemas.ts | ~15/accion | Añadir acciones |
| ActionFeed.tsx | ~20/accion | Personalizar UI |

**Total core fijo:** ~180 lineas (copiar una vez)
**Por accion nueva:** ~35 lineas

---

## Checklist

- [ ] closeAndParseJson.ts copiado
- [ ] actionSchemas.ts con tus acciones
- [ ] API route /api/agent creada
- [ ] useActionStream hook implementado
- [ ] ActionFeed renderiza cada tipo
- [ ] Probado que acciones aparecen en tiempo real

---

## Compatibilidad con Otros Bloques

- **02 Web Search**: Añadir `:online` al modelo
- **03 Historial**: Guardar actions[] en lugar de messages
- **04 Vision**: Añadir accion `analyze_image`
- **05 Tools**: Las tools SON acciones (no necesitas bloque separado)

---

*"No le digas el resultado. Muestrale como llegaste a el."*
