'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react'

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  
  const { messages, sendMessage, status } = useChat({
    api: '/api/chat',
  } as any)

  const isLoading = status === 'submitted' || status === 'streaming'

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage({ text: input } as any)
    setInput('')
  }

  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[380px] h-[520px] bg-slate-900/90 backdrop-blur-2xl border border-sky-500/30 rounded-3xl shadow-2xl shadow-sky-500/20 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-sky-600/20 to-indigo-600/20 border-b border-sky-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-sky-500/30">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">Asistente Flash</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">Cognitivo Online</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Feed */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
            >
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center px-6">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mb-4 border border-slate-700">
                    <Sparkles className="w-6 h-6 text-sky-400" />
                  </div>
                  <p className="text-slate-200 text-sm font-bold mb-2">¿Cómo puedo ayudarte hoy?</p>
                  <p className="text-slate-500 text-xs">Consulta citas, estados de pacientes o protocolos de la clínica en tiempo real.</p>
                </div>
              )}
              {messages.map((m) => (
                <div 
                  key={m.id} 
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                      m.role === 'user' 
                        ? 'bg-indigo-500' 
                        : 'bg-slate-800 border border-sky-500/30'
                    }`}>
                      {m.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-sky-400" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-sky-600 text-white rounded-tr-none shadow-md shadow-sky-900/20'
                        : 'bg-slate-800/50 text-slate-200 border border-slate-700 rounded-tl-none'
                    }`}>
                      {(m as any).text || (m as any).content}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-sky-500/30 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-sky-400" />
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-2xl rounded-tl-none border border-slate-700">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce delay-75"></span>
                        <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce delay-150"></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4 bg-slate-900/50 border-t border-slate-800">
              <div className="relative group">
                <input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Pregunta algo..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-4 pr-12 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500/50 transition-all"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:hover:bg-sky-500 text-white rounded-lg transition-all shadow-lg shadow-sky-500/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[9px] text-center text-slate-600 mt-3 font-medium uppercase tracking-widest">
                Flash Cognitive Assistant v3.0
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 group relative overflow-hidden ${
          isOpen 
            ? 'bg-slate-800 border border-slate-700 rotate-90' 
            : 'bg-gradient-to-br from-sky-400 to-indigo-600 border border-sky-400/30'
        }`}
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageSquare className="w-6 h-6 text-white" />
        )}
        
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#020617] flex items-center justify-center text-[10px] font-bold text-white">1</span>
        )}
      </button>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  )
}
