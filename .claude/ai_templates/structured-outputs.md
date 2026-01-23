# Structured Outputs - Respuestas JSON Tipadas

> Genera JSON estructurado con schemas Zod. El LLM responde en formato definido.

**Estado:** En optimizacion (no validado profesionalmente)
**Tiempo estimado:** 15 minutos
**Prerequisitos:** Bloque agents/00-setup-base

---

## Que Obtienes

- Respuestas del LLM en formato JSON
- Tipado fuerte con Zod schemas
- Validacion automatica de estructura
- Ideal para: formularios inteligentes, extraccion de datos, clasificacion

---

## Estado Actual

> **NOTA:** Esta plantilla esta en fase de optimizacion.
> Los patrones documentados son funcionales pero no han sido validados
> en produccion a escala. Usar con criterio.

---

## Casos de Uso Potenciales

| Caso | Descripcion |
|------|-------------|
| Extraccion de entidades | Sacar nombres, fechas, montos de texto libre |
| Formularios inteligentes | El AI completa campos faltantes |
| Clasificacion multi-label | Categorizar contenido en multiples dimensiones |
| Parseo de documentos | Convertir texto no estructurado a JSON |
| Validacion semantica | Verificar si datos tienen sentido |

---

## 1. Concepto Basico

```typescript
// La idea central: definir un schema Zod y el AI lo llena

import { generateObject } from 'ai'
import { z } from 'zod'
import { openrouter, MODELS } from '@/lib/ai/openrouter'

// 1. Definir schema
const ContactSchema = z.object({
  name: z.string().describe('Nombre completo'),
  email: z.string().email().describe('Correo electronico'),
  phone: z.string().optional().describe('Telefono si se menciona'),
  company: z.string().optional().describe('Empresa si se menciona'),
})

// 2. Generar objeto tipado
const { object } = await generateObject({
  model: openrouter(MODELS.balanced),
  schema: ContactSchema,
  prompt: 'Extrae la info de contacto: "Hola, soy Juan Perez de Acme Corp, mi correo es juan@acme.com"',
})

// 3. Resultado tipado
console.log(object.name)    // "Juan Perez"
console.log(object.email)   // "juan@acme.com"
console.log(object.company) // "Acme Corp"
```

---

## 2. Patron: Extractor de Entidades

```typescript
// lib/ai/extractors.ts

import { generateObject } from 'ai'
import { z } from 'zod'
import { openrouter, MODELS } from '@/lib/ai/openrouter'

// Schema para datos de factura
const InvoiceDataSchema = z.object({
  vendor: z.string().describe('Nombre del proveedor'),
  invoiceNumber: z.string().describe('Numero de factura'),
  date: z.string().describe('Fecha en formato YYYY-MM-DD'),
  total: z.number().describe('Monto total'),
  currency: z.enum(['USD', 'MXN', 'EUR']).describe('Moneda'),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number(),
    unitPrice: z.number(),
  })).describe('Lista de conceptos'),
})

type InvoiceData = z.infer<typeof InvoiceDataSchema>

export async function extractInvoiceData(text: string): Promise<InvoiceData> {
  const { object } = await generateObject({
    model: openrouter(MODELS.balanced),
    schema: InvoiceDataSchema,
    prompt: `Extrae los datos de esta factura:\n\n${text}`,
  })

  return object
}
```

---

## 3. Patron: Clasificador Multi-Dimension

```typescript
// lib/ai/classifiers.ts

import { generateObject } from 'ai'
import { z } from 'zod'
import { openrouter, MODELS } from '@/lib/ai/openrouter'

const TicketClassificationSchema = z.object({
  category: z.enum([
    'billing',
    'technical',
    'sales',
    'general'
  ]).describe('Categoria principal'),

  priority: z.enum([
    'low',
    'medium',
    'high',
    'urgent'
  ]).describe('Nivel de urgencia'),

  sentiment: z.enum([
    'positive',
    'neutral',
    'negative',
    'angry'
  ]).describe('Tono del mensaje'),

  requiresHuman: z.boolean().describe('Necesita atencion humana?'),

  suggestedTags: z.array(z.string()).describe('Tags relevantes'),
})

type TicketClassification = z.infer<typeof TicketClassificationSchema>

export async function classifyTicket(content: string): Promise<TicketClassification> {
  const { object } = await generateObject({
    model: openrouter(MODELS.fast),
    schema: TicketClassificationSchema,
    prompt: `Clasifica este ticket de soporte:\n\n${content}`,
  })

  return object
}
```

---

## 4. Patron: Formulario Inteligente

```typescript
// features/forms/hooks/useSmartForm.ts

'use client'

import { useState } from 'react'
import { z } from 'zod'

interface UseSmartFormOptions<T> {
  schema: z.ZodSchema<T>
  extractEndpoint: string
}

export function useSmartForm<T>({ schema, extractEndpoint }: UseSmartFormOptions<T>) {
  const [data, setData] = useState<Partial<T>>({})
  const [loading, setLoading] = useState(false)

  // El usuario pega texto libre y el AI lo parsea
  const extractFromText = async (text: string) => {
    setLoading(true)
    try {
      const res = await fetch(extractEndpoint, {
        method: 'POST',
        body: JSON.stringify({ text }),
      })
      const extracted = await res.json()
      setData(prev => ({ ...prev, ...extracted }))
    } finally {
      setLoading(false)
    }
  }

  return {
    data,
    setData,
    loading,
    extractFromText,
  }
}
```

---

## 5. API Route para Structured Output

```typescript
// app/api/extract/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { generateObject } from 'ai'
import { z } from 'zod'
import { openrouter, MODELS } from '@/lib/ai/openrouter'

// Schema generico (personalizar segun caso)
const ExtractSchema = z.object({
  // MODIFICAR: Define tu schema aqui
  name: z.string().optional(),
  email: z.string().email().optional(),
  date: z.string().optional(),
  amount: z.number().optional(),
})

export async function POST(req: NextRequest) {
  const { text } = await req.json()

  if (!text) {
    return NextResponse.json({ error: 'Text required' }, { status: 400 })
  }

  try {
    const { object } = await generateObject({
      model: openrouter(MODELS.balanced),
      schema: ExtractSchema,
      prompt: `Extrae la informacion relevante de este texto:\n\n${text}`,
    })

    return NextResponse.json(object)
  } catch (error) {
    console.error('Extract error:', error)
    return NextResponse.json({ error: 'Extraction failed' }, { status: 500 })
  }
}
```

---

## Consideraciones

### Limitaciones Conocidas

1. **Modelos soportados**: No todos los modelos de OpenRouter soportan structured output
2. **Schemas complejos**: Schemas muy anidados pueden fallar
3. **Validacion**: Zod valida estructura, no semantica (el AI puede inventar datos)

### Mejores Practicas

1. **Usar `.describe()`**: Ayuda al modelo a entender cada campo
2. **Schemas planos**: Preferir estructuras simples sobre anidadas
3. **Enums sobre strings**: Usar `z.enum()` para campos con opciones fijas
4. **Campos opcionales**: Marcar como `.optional()` lo que puede no existir

---

## Checklist

- [ ] Schema Zod definido con `.describe()` en cada campo
- [ ] Funcion extractora con `generateObject()`
- [ ] API route o server action
- [ ] Manejo de errores de validacion
- [ ] Testing con casos edge

---

## Relacionado

- **Llamada simple**: `single-call.md`
- **UI generativa**: `generative-ui.md`
- **Chat con tools**: `agents/05-tools-funciones.md`

---

*Esta plantilla esta en optimizacion. Feedback bienvenido.*
