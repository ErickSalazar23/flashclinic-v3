# Bloque 03: Historial con Supabase

> Guardar y cargar conversaciones con Supabase.

**Tiempo:** 20 minutos
**Prerequisitos:** Bloque 01 (Chat Streaming), Supabase configurado

---

## Que Obtienes

- Conversaciones persistentes
- Sidebar con lista de chats
- Crear/cargar/eliminar conversaciones
- Compatible con UIMessage del SDK

---

## 1. Schema de Base de Datos

```sql
-- Ejecutar en Supabase SQL Editor o via MCP

-- Tabla de conversaciones
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'Nueva conversacion',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de mensajes
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);

-- RLS (Row Level Security)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies: usuarios solo ven sus conversaciones
CREATE POLICY "Users can CRUD own conversations"
  ON conversations FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD messages in own conversations"
  ON messages FOR ALL
  USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );
```

---

## 2. Tipos TypeScript

```typescript
// features/chat/types/index.ts

export interface Conversation {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}
```

---

## 3. Servicio de Historial

```typescript
// features/chat/services/historyService.ts

import { createClient } from '@/lib/supabase/client'
import type { Conversation, Message } from '../types'

const supabase = createClient()

export const historyService = {
  // Listar conversaciones del usuario
  async listConversations(): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Crear nueva conversacion
  async createConversation(title?: string): Promise<Conversation> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        title: title || 'Nueva conversacion'
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Cargar mensajes de una conversacion
  async loadMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  },

  // Guardar mensaje
  async saveMessage(
    conversationId: string,
    role: 'user' | 'assistant',
    content: string
  ): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert({ conversation_id: conversationId, role, content })
      .select()
      .single()

    if (error) throw error

    // Actualizar updated_at de la conversacion
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId)

    return data
  },

  // Actualizar titulo (auto-generar del primer mensaje)
  async updateTitle(conversationId: string, title: string): Promise<void> {
    const { error } = await supabase
      .from('conversations')
      .update({ title: title.slice(0, 100) })
      .eq('id', conversationId)

    if (error) throw error
  },

  // Eliminar conversacion
  async deleteConversation(conversationId: string): Promise<void> {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId)

    if (error) throw error
  },
}
```

---

## 4. Hook useHistory

```typescript
// features/chat/hooks/useHistory.ts

'use client'

import { useState, useEffect, useCallback } from 'react'
import { historyService } from '../services/historyService'
import type { Conversation, Message } from '../types'

export function useHistory() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Cargar lista de conversaciones
  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = useCallback(async () => {
    try {
      const data = await historyService.listConversations()
      setConversations(data)
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Crear nueva conversacion
  const createNew = useCallback(async () => {
    const conv = await historyService.createConversation()
    setConversations(prev => [conv, ...prev])
    setCurrentId(conv.id)
    return conv
  }, [])

  // Cargar mensajes de una conversacion
  const loadMessages = useCallback(async (id: string) => {
    setCurrentId(id)
    const messages = await historyService.loadMessages(id)
    return messages
  }, [])

  // Guardar mensaje
  const saveMessage = useCallback(async (
    role: 'user' | 'assistant',
    content: string
  ) => {
    if (!currentId) {
      // Crear conversacion si no existe
      const conv = await createNew()
      return historyService.saveMessage(conv.id, role, content)
    }
    return historyService.saveMessage(currentId, role, content)
  }, [currentId, createNew])

  // Eliminar conversacion
  const deleteConversation = useCallback(async (id: string) => {
    await historyService.deleteConversation(id)
    setConversations(prev => prev.filter(c => c.id !== id))
    if (currentId === id) {
      setCurrentId(null)
    }
  }, [currentId])

  return {
    conversations,
    currentId,
    isLoading,
    createNew,
    loadMessages,
    saveMessage,
    deleteConversation,
    setCurrentId,
  }
}
```

---

## 5. Componente Sidebar

```typescript
// features/chat/components/ChatSidebar.tsx

'use client'

import type { Conversation } from '../types'

interface Props {
  conversations: Conversation[]
  currentId: string | null
  onSelect: (id: string) => void
  onNew: () => void
  onDelete: (id: string) => void
}

export function ChatSidebar({
  conversations,
  currentId,
  onSelect,
  onNew,
  onDelete
}: Props) {
  return (
    <div className="w-64 h-full bg-gray-50 border-r flex flex-col">
      {/* Boton nueva conversacion */}
      <div className="p-4">
        <button
          onClick={onNew}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          + Nueva conversacion
        </button>
      </div>

      {/* Lista de conversaciones */}
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className={`group flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-100 ${
              currentId === conv.id ? 'bg-blue-50' : ''
            }`}
            onClick={() => onSelect(conv.id)}
          >
            <span className="truncate flex-1">{conv.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(conv.id)
              }}
              className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700"
            >
              x
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 6. Integrar con Chat

```typescript
// features/chat/components/ChatWithHistory.tsx

'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useChat } from '@ai-sdk/react'
import { useHistory } from '../hooks/useHistory'
import { ChatSidebar } from './ChatSidebar'
import type { Message as DBMessage } from '../types'

export function ChatWithHistory() {
  const {
    conversations,
    currentId,
    createNew,
    loadMessages,
    saveMessage,
    deleteConversation,
    setCurrentId
  } = useHistory()

  const { messages, status, sendMessage, setMessages } = useChat({
    id: currentId || undefined,
  })

  const [input, setInput] = useState('')
  const isLoading = status === 'submitted' || status === 'streaming'

  // Cargar mensajes cuando cambia la conversacion
  useEffect(() => {
    if (currentId) {
      loadMessages(currentId).then((dbMessages) => {
        // Convertir DB messages a UI messages
        const uiMessages = dbMessages.map((m: DBMessage) => ({
          id: m.id,
          role: m.role as 'user' | 'assistant',
          content: m.content,
          parts: [{ type: 'text' as const, text: m.content }],
        }))
        setMessages(uiMessages)
      })
    } else {
      setMessages([])
    }
  }, [currentId, loadMessages, setMessages])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const text = input.trim()
    setInput('')

    // Guardar mensaje del usuario
    await saveMessage('user', text)

    // Enviar al modelo
    sendMessage({ text })
  }

  // Guardar respuesta del asistente cuando termina
  useEffect(() => {
    if (status === 'ready' && messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === 'assistant') {
        const content = lastMessage.parts
          ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
          .map(p => p.text)
          .join('') || ''

        if (content) {
          saveMessage('assistant', content)
        }
      }
    }
  }, [status, messages, saveMessage])

  // Helper para extraer texto
  const getMessageText = (message: typeof messages[0]): string => {
    if (!message.parts) return message.content || ''
    return message.parts
      .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map(p => p.text)
      .join('')
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <ChatSidebar
        conversations={conversations}
        currentId={currentId}
        onSelect={setCurrentId}
        onNew={createNew}
        onDelete={deleteConversation}
      />

      {/* Chat */}
      <div className="flex-1 flex flex-col">
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
                {getMessageText(m)}
              </div>
            </div>
          ))}
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
              className="flex-1 px-4 py-2 border rounded-lg"
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
    </div>
  )
}
```

---

## Checklist

- [ ] Tablas creadas en Supabase (conversations, messages)
- [ ] RLS policies configuradas
- [ ] historyService implementado
- [ ] useHistory hook funcionando
- [ ] Sidebar con lista de conversaciones
- [ ] Mensajes se guardan y cargan correctamente

---

## Siguiente Bloque

- **Analizar imagenes**: `04-vision-analysis.md`
- **Agregar tools**: `05-tools-funciones.md`
