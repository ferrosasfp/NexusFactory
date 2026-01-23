# Bloque 04: Vision Analysis

> Analizar imagenes con modelos de vision (Gemini, GPT-4o, Claude).

**Tiempo:** 20 minutos
**Prerequisitos:** Bloque 01 (Chat Streaming)

---

## Que Obtienes

- **Cmd+V** para pegar imagenes del clipboard
- Preview de imagenes encima del input
- Boton para subir imagenes
- Analisis con IA Vision
- Sin limite de imagenes

---

## 1. Modelos con Vision

```typescript
// lib/ai/openrouter.ts
// Agregar modelos de vision

export const MODELS = {
  // ... otros modelos ...

  // Vision (analisis de imagenes)
  vision: 'google/gemini-2.0-flash-exp:free',  // Gratis, bueno
  visionPro: 'openai/gpt-4o',                   // Mejor calidad
  visionClaude: 'anthropic/claude-3-5-sonnet',  // Alternativa
} as const
```

---

## 2. API Route con Vision

```typescript
// app/api/chat/route.ts
// MODIFICAR: Agregar soporte para imagenes

import { openrouter, MODELS } from '@/lib/ai/openrouter'
import { streamText, convertToModelMessages, type UIMessage } from 'ai'

const SYSTEM_PROMPT = `Eres un asistente que puede analizar imagenes.
Cuando recibas una imagen:
1. Describe lo que ves
2. Responde preguntas sobre el contenido
3. Extrae informacion relevante`

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  // Detectar si hay imagenes en el ultimo mensaje
  const lastMessage = messages[messages.length - 1]
  const hasImages = lastMessage?.parts?.some(
    (part) => part.type === 'image'
  )

  // Usar modelo de vision si hay imagenes
  const model = hasImages ? MODELS.vision : MODELS.balanced

  const modelMessages = convertToModelMessages(messages)

  const result = streamText({
    model: openrouter(model),
    system: SYSTEM_PROMPT,
    messages: modelMessages,
  })

  return result.toUIMessageStreamResponse()
}
```

---

## 3. Hook useImageUpload (con Cmd+V)

```typescript
// features/chat/hooks/useImageUpload.ts

'use client'

import { useState, useCallback, useEffect } from 'react'

interface UploadedImage {
  id: string
  file: File
  preview: string   // URL blob para mostrar
  base64: string    // Data URL para enviar
}

interface UseImageUploadReturn {
  images: UploadedImage[]
  isProcessing: boolean
  hasImages: boolean
  addImages: (fileList: FileList) => Promise<void>
  removeImage: (id: string) => void
  clearImages: () => void
  getBase64Images: () => string[]
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB por imagen

export function useImageUpload(): UseImageUploadReturn {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  // Limpiar URLs de memoria al desmontar
  useEffect(() => {
    return () => {
      images.forEach(img => URL.revokeObjectURL(img.preview))
    }
  }, [images])

  // Convertir File a base64 (data URL)
  const fileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }, [])

  // Validar archivo
  const validateFile = useCallback((file: File): boolean => {
    if (!file.type.startsWith('image/')) {
      console.warn(`Archivo rechazado: ${file.name} no es una imagen`)
      return false
    }
    if (file.size > MAX_FILE_SIZE) {
      console.warn(`Archivo rechazado: ${file.name} excede 10MB`)
      return false
    }
    return true
  }, [])

  // Procesar archivos
  const processFiles = useCallback(
    async (files: File[]) => {
      setIsProcessing(true)

      try {
        const validFiles = files.filter(validateFile)
        if (validFiles.length === 0) return

        const newImages: UploadedImage[] = await Promise.all(
          validFiles.map(async (file) => ({
            id: crypto.randomUUID(),
            file,
            preview: URL.createObjectURL(file),
            base64: await fileToBase64(file),
          }))
        )

        setImages((prev) => [...prev, ...newImages])
      } catch (error) {
        console.error('Error procesando imagenes:', error)
      } finally {
        setIsProcessing(false)
      }
    },
    [validateFile, fileToBase64]
  )

  // Agregar imagenes desde input file
  const addImages = useCallback(
    async (fileList: FileList) => {
      await processFiles(Array.from(fileList))
    },
    [processFiles]
  )

  // Remover imagen por ID
  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id)
      if (img) URL.revokeObjectURL(img.preview)
      return prev.filter((i) => i.id !== id)
    })
  }, [])

  // Limpiar todas
  const clearImages = useCallback(() => {
    images.forEach((img) => URL.revokeObjectURL(img.preview))
    setImages([])
  }, [images])

  // Obtener array de base64
  const getBase64Images = useCallback((): string[] => {
    return images.map((img) => img.base64)
  }, [images])

  // ========================================
  // CLIPBOARD PASTE (Cmd+V / Ctrl+V)
  // ========================================
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      const files: File[] = []

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) files.push(file)
        }
      }

      if (files.length > 0) {
        e.preventDefault()
        await processFiles(files)
      }
    }

    // Escuchar en document para capturar paste global
    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [processFiles])

  return {
    images,
    isProcessing,
    hasImages: images.length > 0,
    addImages,
    removeImage,
    clearImages,
    getBase64Images,
  }
}
```

---

## 4. Componente ImagePreviewBar

Se muestra **encima del input** cuando hay imagenes.

```typescript
// features/chat/components/ImagePreviewBar.tsx

'use client'

import { X } from 'lucide-react'

interface ImagePreview {
  id: string
  preview: string
}

interface Props {
  images: ImagePreview[]
  onRemove: (id: string) => void
  disabled?: boolean
}

export function ImagePreviewBar({ images, onRemove, disabled = false }: Props) {
  if (images.length === 0) return null

  return (
    <div className="border-b border-gray-100 px-4 py-3 flex items-center gap-3">
      <div className="flex gap-2 flex-wrap">
        {images.map((image) => (
          <div
            key={image.id}
            className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200 group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {!disabled && (
              <button
                onClick={() => onRemove(image.id)}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                aria-label="Eliminar imagen"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
        ))}
      </div>
      <span className="ml-auto text-sm text-gray-400">
        {images.length} {images.length === 1 ? 'imagen' : 'imagenes'}
      </span>
    </div>
  )
}
```

---

## 5. Integrar con Chat

```typescript
// features/chat/components/ChatWithVision.tsx

'use client'

import { useState, useRef, FormEvent } from 'react'
import { useChat } from '@ai-sdk/react'
import { ImagePlus } from 'lucide-react'
import { useImageUpload } from '../hooks/useImageUpload'
import { ImagePreviewBar } from './ImagePreviewBar'

export function ChatWithVision() {
  const { messages, status, sendMessage } = useChat()
  const { images, hasImages, addImages, removeImage, clearImages, getBase64Images } = useImageUpload()
  const [input, setInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isLoading = status === 'submitted' || status === 'streaming'

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if ((!input.trim() && !hasImages) || isLoading) return

    const text = input.trim()
    setInput('')

    // Enviar con imagenes adjuntas
    sendMessage({
      text: text || 'Analiza esta imagen',
      experimental_attachments: images.map((img) => ({
        name: img.file.name,
        contentType: img.file.type,
        url: img.preview,
      })),
    })

    clearImages()
  }

  const getMessageText = (message: typeof messages[0]): string => {
    if (!message.parts) return ''
    return message.parts
      .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map(p => p.text)
      .join('')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                m.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100'
              }`}
            >
              {/* Mostrar imagenes adjuntas */}
              {m.experimental_attachments?.map((att, i) => (
                <img
                  key={i}
                  src={att.url}
                  alt="Attached"
                  className="max-w-full rounded-lg mb-2"
                />
              ))}
              {getMessageText(m)}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="border-t">
        {/* Preview de imagenes (encima del input) */}
        <ImagePreviewBar
          images={images}
          onRemove={removeImage}
          disabled={isLoading}
        />

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 flex gap-2 items-end">
          {/* Boton subir imagen */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className={`p-2 rounded-lg transition-colors ${
              hasImages
                ? 'bg-green-100 text-green-600'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            } disabled:opacity-50`}
            title="Subir imagen (o usa Cmd+V)"
          >
            <ImagePlus className="w-5 h-5" />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              if (e.target.files?.length) {
                addImages(e.target.files)
                e.target.value = ''
              }
            }}
            className="hidden"
          />

          {/* Text input */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={hasImages ? 'Pregunta sobre las imagenes...' : 'Escribe o pega una imagen (Cmd+V)...'}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Send button */}
          <button
            type="submit"
            disabled={isLoading || (!input.trim() && !hasImages)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  )
}
```

---

## 6. Tip: Placeholder Dinamico

El placeholder cambia segun el contexto:

```typescript
placeholder={
  hasImages
    ? 'Pregunta sobre las imagenes...'
    : 'Escribe o pega una imagen (Cmd+V)...'
}
```

Esto le indica al usuario que puede usar **Cmd+V** para pegar.

---

## Alternativa: Subir a Supabase Storage

Si quieres guardar las imagenes permanentemente:

```typescript
// features/chat/services/storageService.ts

import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export async function uploadImage(file: File): Promise<string> {
  const fileName = `${Date.now()}-${file.name}`

  const { data, error } = await supabase.storage
    .from('chat-images')
    .upload(fileName, file)

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from('chat-images')
    .getPublicUrl(data.path)

  return publicUrl
}
```

---

## Checklist

- [ ] Modelo de vision configurado
- [ ] API route detecta imagenes
- [ ] Hook useImageUpload funciona
- [ ] **Cmd+V** pega imagenes
- [ ] ImagePreviewBar muestra previews encima del input
- [ ] Imagenes se envian y analizan correctamente

---

## Siguiente Bloque

- **Agregar tools**: `05-tools-funciones.md`
