# Agent Action Stream - Paradigma de Transparencia para Agentes IA

> **El insight clave:** La transparencia ES el producto.
> No le dices el resultado al usuario. Le muestras COMO llegaste a el.

---

## El Cambio de Paradigma

### Por que esto importa

La mayoria de chatbots son **cajas negras**:
```
Usuario: "¿Cuanto me cuesta no tener tu sistema?"
Bot: "Estas perdiendo $4,500/mes"
Usuario: "¿De donde sacaste ese numero?" 🤨
```

Con Action Stream, el proceso es **visible**:
```
Usuario: "¿Cuanto me cuesta no tener tu sistema?"

💭 "Calculando tu situacion actual..."
🔧 [calcularTiempo] 4 horas/dia × $50/hora = $200/dia
💬 "Pierdes $200 diarios en tiempo"
🔧 [proyectarMes] 22 dias laborales...
💬 "$4,400/mes en tiempo perdido"
🔧 [agregarErrores] +5% tasa de error...
💬 "Total: $4,500/mes de COSTO DE INACCION"

Usuario: "..." (no puede discutir, VIO el calculo)
```

**El usuario no discute con matematicas que el mismo alimento.**

---

### Aplicaciones del Paradigma

| Caso de Uso | Por que Action Stream es CLAVE |
|-------------|-------------------------------|
| **Ventas High Ticket** | El cliente VE como llegaste al ROI |
| **Calculadoras de ROI** | Cada paso del calculo es verificable |
| **Auditorias** | Cada verificacion es trazable |
| **Due Diligence** | Cada fuente consultada visible |
| **Diagnosticos** | "Por que llegue a esta conclusion" |
| **Pricing dinamico** | "Asi calcule tu precio personalizado" |
| **Investigacion** | Cada busqueda mostrada en tiempo real |
| **Onboarding** | Cada paso de configuracion visible |

---

### La Formula

```
TRANSPARENCIA + PROCESO VISIBLE = CONFIANZA = CONVERSION
```

Esto es lo que hace:
- **Anthropic** con artifacts (muestra el trabajo)
- **Perplexity** mostrando fuentes
- **Cursor** mostrando el plan antes de ejecutar

**La transparencia ES el diferenciador.**

---

## Arquitectura Tecnica

### Complejidad: FIJA, no incremental

| Componente | Lineas | Se modifica? |
|------------|--------|--------------|
| `closeAndParseJson.ts` | ~70 | NUNCA |
| `API route (streaming)` | ~80 | NUNCA |
| `useActionStream.ts` | ~80 | NUNCA |
| **Schemas de acciones** | ~15 c/u | SOLO ESTO |

**Una vez que tienes el core, solo añades schemas Zod.**

```
Proyecto nuevo = Copiar core + Definir tus acciones
```

---

## Implementacion Completa (Copy-Paste Ready)

### Paso 1: Parser de JSON Parcial

```typescript
// lib/closeAndParseJson.ts
// NUNCA MODIFICAR - Este es el core del streaming

/**
 * Parsea JSON incompleto cerrando brackets/quotes automaticamente.
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

### Paso 2: Schemas de Acciones Base

```typescript
// lib/actionSchemas.ts
// MODIFICAR: Añade tus acciones especificas aqui

import { z } from 'zod'

// === ACCIONES BASE (siempre incluir) ===

export const MessageAction = z.object({
  _type: z.literal('message'),
  text: z.string(),
})

export const ThinkAction = z.object({
  _type: z.literal('think'),
  text: z.string(),
})

// === ACCIONES PERSONALIZADAS (añade las tuyas) ===

// Ejemplo: Accion para pedir datos al usuario
export const AskAction = z.object({
  _type: z.literal('ask'),
  question: z.string(),
  field: z.string(), // nombre del campo que esperas
})

// Ejemplo: Accion para calcular algo
export const CalculateAction = z.object({
  _type: z.literal('calculate'),
  operation: z.string(),
  inputs: z.record(z.number()),
  result: z.number(),
})

// Ejemplo: Accion para ejecutar tool externa
export const ToolAction = z.object({
  _type: z.literal('tool'),
  name: z.string(),
  args: z.record(z.any()),
})

// === UNION DE TODAS LAS ACCIONES ===

export const ActionSchema = z.discriminatedUnion('_type', [
  MessageAction,
  ThinkAction,
  AskAction,
  CalculateAction,
  ToolAction,
])

export type Action = z.infer<typeof ActionSchema>

// Schema de respuesta completa del modelo
export const ResponseSchema = z.object({
  actions: z.array(ActionSchema),
})
```

### Paso 3: API Route con Streaming

```typescript
// app/api/agent/route.ts
// MODIFICAR: Solo el SYSTEM_PROMPT y las acciones disponibles

import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { streamText } from 'ai'
import { closeAndParseJson } from '@/lib/closeAndParseJson'

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
})

// === MODIFICAR ESTE PROMPT SEGUN TU CASO DE USO ===
const SYSTEM_PROMPT = `Eres un agente que responde con acciones estructuradas.

SIEMPRE responde en este formato JSON:
{
  "actions": [
    { "_type": "think", "text": "tu razonamiento" },
    { "_type": "message", "text": "mensaje al usuario" },
    { "_type": "calculate", "operation": "suma", "inputs": {"a": 1, "b": 2}, "result": 3 }
  ]
}

Acciones disponibles:
- think: Explica tu razonamiento (el usuario lo ve)
- message: Mensaje directo al usuario
- ask: Pedir informacion al usuario
- calculate: Mostrar un calculo con inputs y resultado
- tool: Ejecutar una herramienta externa

REGLAS:
1. Usa multiples acciones en secuencia
2. Siempre muestra tu razonamiento con "think"
3. Cada calculo debe mostrar los inputs y el resultado
4. Se transparente en cada paso`

export async function POST(req: Request) {
  const { prompt, context } = await req.json()

  const encoder = new TextEncoder()
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()

  // Forzar inicio de JSON (funciona con Anthropic/Google)
  const forceStart = '{"actions": [{"_type":'

  const { textStream } = streamText({
    model: openrouter('anthropic/claude-3-5-sonnet'),
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

### Paso 4: Hook del Cliente

```typescript
// hooks/useActionStream.ts
// NUNCA MODIFICAR - Este es el core del cliente

'use client'

import { useState, useCallback } from 'react'
import type { Action } from '@/lib/actionSchemas'

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

### Paso 5: Componente UI Base

```typescript
// components/ActionStreamChat.tsx
// MODIFICAR: Personaliza el rendering de cada tipo de accion

'use client'

import { useState, FormEvent } from 'react'
import { useActionStream, StreamingAction } from '@/hooks/useActionStream'

// === MODIFICAR: Como se renderiza cada tipo de accion ===
function ActionItem({ action }: { action: StreamingAction }) {
  const baseClass = `flex items-start gap-3 p-3 rounded-lg ${
    !action.complete ? 'opacity-70 animate-pulse' : ''
  }`

  switch (action._type) {
    case 'think':
      return (
        <div className={`${baseClass} bg-gray-100`}>
          <span>💭</span>
          <p className="text-gray-600 italic">{action.text}</p>
        </div>
      )

    case 'message':
      return (
        <div className={`${baseClass} bg-blue-50`}>
          <span>💬</span>
          <p className="text-gray-900">{action.text}</p>
        </div>
      )

    case 'calculate':
      return (
        <div className={`${baseClass} bg-green-50`}>
          <span>🔢</span>
          <div>
            <p className="font-medium">{action.operation}</p>
            <p className="text-sm text-gray-600">
              Inputs: {JSON.stringify(action.inputs)}
            </p>
            <p className="text-lg font-bold text-green-700">
              = {action.result}
            </p>
          </div>
        </div>
      )

    case 'tool':
      return (
        <div className={`${baseClass} bg-purple-50`}>
          <span>🔧</span>
          <div>
            <p className="font-medium">{action.name}</p>
            {!action.complete && <p className="text-sm">Ejecutando...</p>}
          </div>
        </div>
      )

    case 'ask':
      return (
        <div className={`${baseClass} bg-yellow-50`}>
          <span>❓</span>
          <p>{action.question}</p>
        </div>
      )

    default:
      return (
        <div className={baseClass}>
          <span>📝</span>
          <pre className="text-xs">{JSON.stringify(action, null, 2)}</pre>
        </div>
      )
  }
}

export function ActionStreamChat() {
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
        <h1 className="font-bold">Agent Action Stream</h1>
        <button
          onClick={reset}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Reset
        </button>
      </div>

      {/* Actions Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {actions.length === 0 && !isStreaming && (
          <p className="text-center text-gray-400 py-8">
            Escribe algo para comenzar...
          </p>
        )}

        {actions.map((action, i) => (
          <ActionItem key={i} action={action} />
        ))}

        {isStreaming && actions.length === 0 && (
          <div className="flex items-center gap-2 text-gray-400">
            <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full" />
            <p>Procesando...</p>
          </div>
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
            className="px-6 py-3 bg-blue-500 text-white rounded-lg disabled:opacity-50 hover:bg-blue-600 transition-colors"
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

## Checklist para Nuevo Proyecto

```
[ ] 1. Copiar lib/closeAndParseJson.ts (NUNCA MODIFICAR)
[ ] 2. Copiar hooks/useActionStream.ts (NUNCA MODIFICAR)
[ ] 3. Crear lib/actionSchemas.ts (DEFINIR TUS ACCIONES)
[ ] 4. Crear app/api/agent/route.ts (MODIFICAR SYSTEM_PROMPT)
[ ] 5. Crear components/ActionStreamChat.tsx (PERSONALIZAR UI)
[ ] 6. Añadir OPENROUTER_API_KEY a .env
```

**Tiempo estimado: 15-30 minutos para proyecto nuevo**

---

## Ejemplo: ROI Calculator Agent

### Schemas especificos:

```typescript
// lib/actionSchemas.ts para ROI Agent

export const PedirDatoAction = z.object({
  _type: z.literal('pedirDato'),
  pregunta: z.string(),
  campo: z.enum(['horas_semana', 'costo_hora', 'tasa_error', 'costo_solucion']),
})

export const CalculoAction = z.object({
  _type: z.literal('calculo'),
  descripcion: z.string(),
  formula: z.string(),
  resultado: z.number(),
  unidad: z.string(),
})

export const ROIAction = z.object({
  _type: z.literal('roi'),
  costoInaccion: z.number(),
  costoSolucion: z.number(),
  roiMultiplier: z.number(),
  diasRecuperacion: z.number(),
})
```

### System prompt especifico:

```typescript
const SYSTEM_PROMPT = `Eres un consultor financiero que calcula el ROI de automatizar procesos.

Tu objetivo: Demostrar matematicamente el COSTO DE INACCION.

Proceso:
1. Pide datos uno por uno (horas, costo/hora, errores)
2. Muestra CADA calculo con formula visible
3. Totaliza el costo de inaccion mensual
4. Compara con el costo de la solucion
5. Presenta ROI y dias para recuperar inversion

Acciones disponibles:
- think: Tu razonamiento
- message: Comunicacion al usuario
- pedirDato: Solicitar un dato especifico
- calculo: Mostrar calculo con formula
- roi: Resultado final con metricas

IMPORTANTE: El usuario debe VER cada paso del calculo.
Eso construye confianza y elimina objeciones.`
```

---

## Recursos

- [tldraw-agent](https://github.com/tldraw/tldraw) - Implementacion original
- [Vercel AI SDK v5](https://sdk.vercel.ai) - Base del streaming
- [Zod](https://zod.dev) - Validacion de schemas

---

## Filosofia Final

> **"No le digas el resultado. Muestrale como llegaste a el."**

La transparencia no es un feature. Es el producto.
