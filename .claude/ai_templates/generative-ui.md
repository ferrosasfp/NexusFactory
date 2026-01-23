# Generative UI - Componentes Dinamicos

> El LLM decide que componente React renderizar segun el contexto.

**Estado:** En optimizacion (no validado profesionalmente)
**Tiempo estimado:** 30 minutos
**Prerequisitos:** Bloque agents/00-setup-base, agents/01-chat-streaming

---

## Que Obtienes

- El AI genera componentes React en tiempo real
- UI adaptativa segun la conversacion
- Ideal para: dashboards dinamicos, wizards inteligentes, interfaces contextuales

---

## Estado Actual

> **NOTA:** Esta plantilla esta en fase de optimizacion.
> Generative UI es un patron avanzado del AI SDK que requiere
> cuidadosa implementacion. No validado en produccion a escala.

---

## Casos de Uso Potenciales

| Caso | Descripcion |
|------|-------------|
| Dashboard adaptativo | Mostrar widgets segun lo que pregunta el usuario |
| Wizard inteligente | Pasos dinamicos segun respuestas anteriores |
| Visualizacion de datos | Graficas generadas segun el analisis |
| Formularios contextuales | Campos que aparecen segun necesidad |
| Respuestas ricas | Tablas, cards, listas segun el contenido |

---

## 1. Concepto Basico

La idea es que el AI, en lugar de solo responder texto, puede "llamar"
componentes React que tu defines.

```typescript
// Flujo conceptual:
// 1. Usuario pregunta: "Muestrame las ventas de este mes"
// 2. AI decide: "Voy a mostrar un SalesChart"
// 3. AI llama tool: render_chart({ type: 'bar', data: [...] })
// 4. Tu renderizas el componente <SalesChart data={...} />
```

---

## 2. Definir Componentes Renderizables

```typescript
// features/chat/components/generative/index.tsx

'use client'

// Componentes que el AI puede invocar
export function WeatherCard({ city, temp, condition }: {
  city: string
  temp: number
  condition: string
}) {
  return (
    <div className="p-4 bg-blue-50 rounded-lg">
      <h3 className="font-bold">{city}</h3>
      <p className="text-2xl">{temp}C</p>
      <p className="text-gray-600">{condition}</p>
    </div>
  )
}

export function StockPrice({ symbol, price, change }: {
  symbol: string
  price: number
  change: number
}) {
  const isPositive = change >= 0
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h3 className="font-mono font-bold">{symbol}</h3>
      <p className="text-2xl">${price.toFixed(2)}</p>
      <p className={isPositive ? 'text-green-600' : 'text-red-600'}>
        {isPositive ? '+' : ''}{change.toFixed(2)}%
      </p>
    </div>
  )
}

export function DataTable({ headers, rows }: {
  headers: string[]
  rows: string[][]
}) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={i} className="border p-2 bg-gray-100">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j} className="border p-2">{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

---

## 3. Definir Tools de UI

```typescript
// lib/ai/ui-tools.ts

import { z } from 'zod'

// Cada tool representa un componente que el AI puede invocar
export const uiTools = {
  show_weather: {
    description: 'Muestra una tarjeta de clima',
    parameters: z.object({
      city: z.string().describe('Nombre de la ciudad'),
      temp: z.number().describe('Temperatura en Celsius'),
      condition: z.string().describe('Condicion: sunny, cloudy, rainy'),
    }),
  },

  show_stock: {
    description: 'Muestra precio de accion',
    parameters: z.object({
      symbol: z.string().describe('Simbolo de la accion'),
      price: z.number().describe('Precio actual'),
      change: z.number().describe('Cambio porcentual'),
    }),
  },

  show_table: {
    description: 'Muestra datos en tabla',
    parameters: z.object({
      headers: z.array(z.string()).describe('Encabezados de columnas'),
      rows: z.array(z.array(z.string())).describe('Filas de datos'),
    }),
  },
}
```

---

## 4. API Route con Tools de UI

```typescript
// app/api/chat-ui/route.ts

import { streamText, convertToModelMessages, type UIMessage } from 'ai'
import { openrouter, MODELS } from '@/lib/ai/openrouter'
import { uiTools } from '@/lib/ai/ui-tools'

const SYSTEM_PROMPT = `Eres un asistente que puede mostrar informacion visualmente.
Cuando el usuario pida datos, usa las tools disponibles para mostrar UI.
Siempre explica brevemente que estas mostrando.`

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: openrouter(MODELS.balanced),
    system: SYSTEM_PROMPT,
    messages: convertToModelMessages(messages),
    tools: uiTools,
  })

  return result.toUIMessageStreamResponse()
}
```

---

## 5. Renderizar Componentes Dinamicos

```typescript
// features/chat/components/GenerativeChat.tsx

'use client'

import { useChat } from '@ai-sdk/react'
import { WeatherCard, StockPrice, DataTable } from './generative'

export function GenerativeChat() {
  const { messages, sendMessage, status } = useChat({
    api: '/api/chat-ui',
  })

  // Renderizar tool calls como componentes
  const renderToolResult = (toolName: string, args: Record<string, unknown>) => {
    switch (toolName) {
      case 'show_weather':
        return <WeatherCard {...args as Parameters<typeof WeatherCard>[0]} />

      case 'show_stock':
        return <StockPrice {...args as Parameters<typeof StockPrice>[0]} />

      case 'show_table':
        return <DataTable {...args as Parameters<typeof DataTable>[0]} />

      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div key={m.id}>
            {/* Texto normal */}
            {m.parts?.filter(p => p.type === 'text').map((p, i) => (
              <p key={i}>{p.text}</p>
            ))}

            {/* Tool calls como componentes */}
            {m.parts?.filter(p => p.type === 'tool-invocation').map((p, i) => (
              <div key={i} className="my-2">
                {renderToolResult(p.toolInvocation.toolName, p.toolInvocation.args)}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Input... */}
    </div>
  )
}
```

---

## Consideraciones

### Limitaciones Conocidas

1. **Complejidad**: Requiere mapeo manual tool → componente
2. **Hidratacion**: Cuidado con SSR y componentes dinamicos
3. **Estado**: Los componentes generados no persisten estado entre renders
4. **Seguridad**: Validar siempre los args antes de renderizar

### Cuando NO Usar

- Si los componentes son predecibles (usa condicionales normales)
- Si la UI es estatica (no necesitas AI)
- Si el rendimiento es critico (tiene overhead)

### Alternativas Mas Simples

A veces es mejor:
```typescript
// En lugar de Generative UI...
if (response.includes('tabla')) {
  return <DataTable data={parseTable(response)} />
}

// ...usa clasificacion + render condicional
const { type } = await classifyResponse(response)
switch (type) {
  case 'table': return <DataTable />
  case 'chart': return <Chart />
  default: return <Text />
}
```

---

## Checklist

- [ ] Componentes renderizables definidos
- [ ] Tools de UI con schemas Zod
- [ ] API route con tools configuradas
- [ ] Logica de renderizado dinamico
- [ ] Validacion de argumentos
- [ ] Testing de cada componente

---

## Relacionado

- **Chat basico**: `agents/01-chat-streaming.md`
- **Tools tradicionales**: `agents/05-tools-funciones.md`
- **Structured outputs**: `structured-outputs.md`

---

*Esta plantilla esta en optimizacion. Requiere mas validacion antes de uso en produccion.*
