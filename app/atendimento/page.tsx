"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, MessageCircle, User, Shield, Clock, CheckCircle2, Lock } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"

export default function AtendimentoPage() {
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [conversationStarted, setConversationStarted] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  // Auto-scroll para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Verificar se já existe uma conversa salva
  useEffect(() => {
    const savedConversationId = localStorage.getItem("support_conversation_id")
    const savedName = localStorage.getItem("support_customer_name")
    const savedEmail = localStorage.getItem("support_customer_email")

    if (savedConversationId && savedName && savedEmail) {
      setConversationId(savedConversationId)
      setCustomerName(savedName)
      setCustomerEmail(savedEmail)
      setConversationStarted(true)
      loadMessages(savedConversationId)
    }
  }, [])

  // Polling de mensagens a cada 3 segundos
  useEffect(() => {
    if (!conversationId) return

    const interval = setInterval(() => {
      loadMessages(conversationId)
    }, 3000)

    return () => clearInterval(interval)
  }, [conversationId])

  const loadMessages = async (convId: string) => {
    const { data, error } = await supabase
      .from("support_messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true })

    if (!error && data) {
      setMessages(data)
    }
  }

  const startConversation = async () => {
    if (!customerName.trim() || !customerEmail.trim()) {
      alert("Por favor, preencha seu nome e e-mail")
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from("support_conversations")
        .insert({
          customer_name: customerName,
          customer_email: customerEmail,
          status: "active",
        })
        .select()
        .single()

      if (error) throw error

      setConversationId(data.id)
      setConversationStarted(true)

      // Salvar no localStorage
      localStorage.setItem("support_conversation_id", data.id)
      localStorage.setItem("support_customer_name", customerName)
      localStorage.setItem("support_customer_email", customerEmail)

      // Enviar mensagem de boas-vindas automática
      await supabase.from("support_messages").insert({
        conversation_id: data.id,
        sender_type: "admin",
        message: "Olá! Bem-vindo ao atendimento da MiniCustom. Como posso ajudá-lo hoje?",
      })

      loadMessages(data.id)
    } catch (error) {
      console.error("Erro ao iniciar conversa:", error)
      alert("Erro ao iniciar conversa. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversationId) return

    const messageText = newMessage
    setNewMessage("")

    try {
      await supabase.from("support_messages").insert({
        conversation_id: conversationId,
        sender_type: "customer",
        message: messageText,
      })

      loadMessages(conversationId)
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!conversationStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-8 sm:p-10">
            {/* Logo/Icon */}
            <div className="flex items-center justify-center w-20 h-20 bg-white rounded-2xl mx-auto mb-6 shadow-lg overflow-hidden border-2 border-blue-100">
              <img src="/minicustom-logo.jpeg" alt="MiniCustom" className="w-full h-full object-contain p-1" />
            </div>

            <a
              href="https://wa.me/5511948636929?text=Vim%20pelo%20atendimento%2C%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full h-12 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all mb-6"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              WhatsApp
            </a>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-bold text-center text-slate-900 mb-3">Atendimento Online</h1>
            <p className="text-base sm:text-lg text-center text-slate-600 mb-8 font-medium">
              MiniCustom - Miniaturas Personalizadas
            </p>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 mb-8 p-4 bg-blue-50 rounded-2xl">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mx-auto mb-2">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-xs font-semibold text-slate-700">Seguro</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mx-auto mb-2">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-xs font-semibold text-slate-700">Rápido</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mx-auto mb-2">
                  <CheckCircle2 className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-xs font-semibold text-slate-700">Confiável</p>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 mb-6 border border-blue-100">
              <p className="text-sm text-slate-700 text-center leading-relaxed">
                👋 <strong>Bem-vindo!</strong> Para iniciar o atendimento, preencha os campos abaixo. Nossa equipe
                responderá em instantes.
              </p>
            </div>

            {/* Form */}
            <div className="space-y-5">
              <div>
                <label className="block text-base font-bold text-slate-800 mb-2.5 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Seu Nome Completo
                </label>
                <Input
                  type="text"
                  placeholder="Ex: João Silva"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="h-14 text-lg border-2 border-slate-200 focus:border-blue-500 rounded-xl px-4"
                />
              </div>

              <div>
                <label className="block text-base font-bold text-slate-800 mb-2.5 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-blue-600" />
                  Seu E-mail
                </label>
                <Input
                  type="email"
                  placeholder="Ex: joao@email.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="h-14 text-lg border-2 border-slate-200 focus:border-blue-500 rounded-xl px-4"
                />
                <p className="text-xs text-slate-500 mt-1.5 ml-1">🔒 Suas informações estão protegidas e seguras</p>
              </div>

              <Button
                onClick={startConversation}
                disabled={isLoading}
                className="w-full h-16 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-all mt-6"
              >
                {isLoading ? "Conectando..." : "🚀 Iniciar Atendimento"}
              </Button>
            </div>

            {/* Footer Info */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <p className="text-sm font-semibold">Equipe Online e Pronta para Atender</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-slate-50 overflow-hidden">
      <div className="flex-shrink-0 bg-gradient-to-r from-slate-900 via-blue-700 to-slate-900 text-white p-4 shadow-xl relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-white rounded-xl overflow-hidden shadow-lg border-2 border-yellow-400">
                  <img src="/minicustom-logo.jpeg" alt="MiniCustom" className="w-full h-full object-contain p-0.5" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">MiniCustom Atendimento</h1>
                <p className="text-xs text-blue-100 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  Equipe online agora
                </p>
              </div>
            </div>
            <a
              href="https://wa.me/5511948636929?text=Vim%20pelo%20atendimento%2C%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all text-sm"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 w-full bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Welcome message */}
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Conversa Iniciada!</h3>
              <p className="text-slate-600 text-base">Digite sua mensagem abaixo e aguarde nossa resposta.</p>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender_type === "customer" ? "justify-end" : "justify-start"}`}>
              <div className="flex flex-col max-w-[85%] sm:max-w-[70%]">
                {/* Sender label */}
                <p
                  className={`text-xs font-semibold mb-1.5 px-2 ${msg.sender_type === "customer" ? "text-right text-blue-700" : "text-slate-600"}`}
                >
                  {msg.sender_type === "customer" ? "Você" : "Atendente MiniCustom"}
                </p>

                {/* Message bubble */}
                <div
                  className={`rounded-2xl px-5 py-4 shadow-md ${
                    msg.sender_type === "customer"
                      ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-sm"
                      : "bg-white text-slate-900 border-2 border-slate-100 rounded-tl-sm"
                  }`}
                >
                  <p className="text-base leading-relaxed whitespace-pre-wrap break-words font-medium">{msg.message}</p>
                  <p className={`text-xs mt-2 ${msg.sender_type === "customer" ? "text-blue-200" : "text-slate-500"}`}>
                    {new Date(msg.created_at).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="flex-shrink-0 bg-white border-t-2 border-slate-200 p-4 shadow-2xl">
        <div className="max-w-4xl mx-auto">
          {/* Helper text */}
          <p className="text-xs text-slate-600 mb-3 text-center font-medium">
            💬 Digite sua mensagem e pressione Enter ou clique no botão enviar
          </p>

          <div className="flex gap-3">
            <Input
              type="text"
              placeholder="Escreva sua mensagem aqui..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 h-14 text-base border-2 border-slate-200 focus:border-blue-500 rounded-xl px-4 font-medium"
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="h-14 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
              <span className="ml-2 font-bold hidden sm:inline">Enviar</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
