# Single Call - Llamada Simple a LLM

> Genera texto con una sola llamada. Sin chat, sin agente, sin streaming.

**Tiempo:** 5 minutos
**Prerequisitos:** Bloque agents/00-setup-base

---

## Que Obtienes

- Llamada directa al LLM
- Respuesta completa (no streaming)
- Ideal para: botones, acciones puntuales, procesamiento batch

---

## Cuando Usar

| Usa Single Call | Usa Chat/Agent |
|-----------------|----------------|
| Boton "Resumir" | Conversacion continua |
| Generar descripcion | Preguntas de seguimiento |
| Traducir texto | Contexto acumulativo |
| Validar contenido | Streaming en tiempo real |
| Procesamiento batch | Interaccion con usuario |

---

## 1. generateText (Sincrono)

```typescript
// lib/ai/generate.ts
// MODIFICAR: Ajusta el modelo segun necesidad

import { generateText } from 'ai'
import { openrouter, MODELS } from '@/lib/ai/openrouter'

interface GenerateOptions {
  prompt: string
  system?: string
  maxTokens?: number
}

export async function generate({
  prompt,
  system,
  maxTokens = 1000
}: GenerateOptions): Promise<string> {
  const { text } = await generateText({
    model: openrouter(MODELS.fast), // Modelo rapido para tareas simples
    system: system || 'Eres un asistente util y conciso.',
    prompt,
    maxTokens,
  })

  return text
}
```

---

## 2. Uso en Server Action

```typescript
// app/actions/ai.ts
'use server'

import { generate } from '@/lib/ai/generate'

export async function summarizeText(text: string): Promise<string> {
  return generate({
    prompt: `Resume el siguiente texto en 2-3 oraciones:\n\n${text}`,
    system: 'Eres un experto en resumir textos. Se conciso y claro.',
  })
}

export async function translateText(text: string, targetLang: string): Promise<string> {
  return generate({
    prompt: `Traduce al ${targetLang}:\n\n${text}`,
    system: 'Eres un traductor profesional. Mantiene el tono original.',
  })
}

export async function generateDescription(product: string): Promise<string> {
  return generate({
    prompt: `Genera una descripcion de producto para: ${product}`,
    system: 'Eres un copywriter. Escribe descripciones atractivas y concisas.',
    maxTokens: 200,
  })
}
```

---

## 3. Uso en Componente

```typescript
// features/content/components/SummarizeButton.tsx
'use client'

import { useState } from 'react'
import { summarizeText } from '@/app/actions/ai'

interface Props {
  text: string
  onSummary: (summary: string) => void
}

export function SummarizeButton({ text, onSummary }: Props) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      const summary = await summarizeText(text)
      onSummary(summary)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
    >
      {loading ? 'Resumiendo...' : 'Resumir'}
    </button>
  )
}
```

---

## 4. Uso en API Route

```typescript
// app/api/generate/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { generate } from '@/lib/ai/generate'

export async function POST(req: NextRequest) {
  const { prompt, system } = await req.json()

  if (!prompt) {
    return NextResponse.json(
      { error: 'Prompt requerido' },
      { status: 400 }
    )
  }

  try {
    const text = await generate({ prompt, system })
    return NextResponse.json({ text })
  } catch (error) {
    console.error('Generate error:', error)
    return NextResponse.json(
      { error: 'Error generando texto' },
      { status: 500 }
    )
  }
}
```

---

## 5. Batch Processing (Multiples Llamadas)

```typescript
// lib/ai/batch.ts

import { generate } from './generate'

interface BatchItem {
  id: string
  prompt: string
}

interface BatchResult {
  id: string
  result: string
  error?: string
}

export async function generateBatch(
  items: BatchItem[],
  system?: string
): Promise<BatchResult[]> {
  // Procesar en paralelo (con limite)
  const BATCH_SIZE = 5

  const results: BatchResult[] = []

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE)

    const batchResults = await Promise.all(
      batch.map(async (item) => {
        try {
          const result = await generate({ prompt: item.prompt, system })
          return { id: item.id, result }
        } catch (error) {
          return {
            id: item.id,
            result: '',
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      })
    )

    results.push(...batchResults)
  }

  return results
}
```

---

## Diferencia con streamText

| generateText | streamText |
|--------------|------------|
| Espera respuesta completa | Envia tokens progresivamente |
| Retorna `string` | Retorna `ReadableStream` |
| Ideal para acciones puntuales | Ideal para chat/UI interactiva |
| Menor complejidad | Requiere manejo de stream |

```typescript
// generateText - simple
const { text } = await generateText({ model, prompt })
console.log(text) // Texto completo

// streamText - streaming
const result = streamText({ model, prompt })
for await (const chunk of result.textStream) {
  console.log(chunk) // Token por token
}
```

---

## Casos de Uso Comunes

### Validar Contenido
```typescript
export async function validateContent(content: string): Promise<boolean> {
  const result = await generate({
    prompt: `Analiza si este contenido es apropiado. Responde solo "SI" o "NO":\n\n${content}`,
    maxTokens: 10,
  })
  return result.trim().toUpperCase() === 'SI'
}
```

### Extraer Keywords
```typescript
export async function extractKeywords(text: string): Promise<string[]> {
  const result = await generate({
    prompt: `Extrae 5 keywords de este texto. Devuelve solo las palabras separadas por comas:\n\n${text}`,
    maxTokens: 50,
  })
  return result.split(',').map(k => k.trim())
}
```

### Clasificar Texto
```typescript
export async function classifyIntent(text: string): Promise<string> {
  const result = await generate({
    prompt: `Clasifica la intencion del usuario. Opciones: PREGUNTA, QUEJA, SOLICITUD, OTRO.\n\nTexto: ${text}`,
    maxTokens: 20,
  })
  return result.trim().toUpperCase()
}
```

---

## Checklist

- [ ] Funcion `generate()` creada en `lib/ai/generate.ts`
- [ ] Server actions para casos de uso especificos
- [ ] Componente con boton y estado loading
- [ ] Manejo de errores implementado

---

## Relacionado

- **Chat interactivo**: `agents/01-chat-streaming.md`
- **Respuestas estructuradas**: `structured-outputs.md`
