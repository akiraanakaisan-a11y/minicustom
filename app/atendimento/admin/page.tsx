"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Send,
  MessageCircle,
  User,
  Clock,
  Mail,
  Zap,
  CreditCard,
  Package,
  Info,
  ChevronDown,
  ChevronUp,
  Trash2,
  X,
  Car,
  LogOut,
  FileText,
  UserCheck,
  ImageIcon,
  Video,
  Upload,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"

type AdminUser = {
  username: string
  displayName: string
  loginTime: number
}

const ADMIN_NAMES = {
  devcode: "Tainara",
  zplan: "Marcia",
  dasilva: "Giovanna",
}

export default function AdminAtendimentoPage() {
  const router = useRouter()
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null)
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [showQuickReplies, setShowQuickReplies] = useState(false)
  const [showLogs, setShowLogs] = useState(false)
  const [logs, setLogs] = useState<any[]>([])
  const [expandedCategory, setExpandedCategory] = useState<string>("pagamento")
  const [showConversations, setShowConversations] = useState(true)
  const [uploadingMedia, setUploadingMedia] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    const sessionData = localStorage.getItem("admin_session")

    if (!sessionData) {
      router.push("/atendimento/admin/login")
      return
    }

    const session: AdminUser = JSON.parse(sessionData)
    const sessionAge = Date.now() - session.loginTime
    const maxAge = 45 * 60 * 1000 // 45 minutes

    if (sessionAge > maxAge) {
      localStorage.removeItem("admin_session")
      alert("Sua sessão expirou. Por favor, faça login novamente.")
      router.push("/atendimento/admin/login")
      return
    }

    setCurrentAdmin(session)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("admin_session")
    router.push("/atendimento/admin/login")
  }

  const quickReplies = {
    valores: {
      label: "💰 Valores e Preços",
      icon: CreditCard,
      replies: [
        {
          label: "Tabela Completa de Preços",
          text: "📋 TABELA DE PREÇOS - MiniCustom\n\n15cm SEM Controle: R$ 106,80\n15cm COM Controle: R$ 145,70\n\n25cm SEM Controle: R$ 136,80\n25cm COM Controle: R$ 175,70\n\n40cm SEM Controle: R$ 146,80\n40cm COM Controle: R$ 185,70\n\n✅ FRETE GRÁTIS para todo Brasil\n✅ Prazo: 4-5 dias úteis\n✅ Personalização incluída",
        },
        {
          label: "15cm - COM e SEM Controle",
          text: "Miniatura 15cm:\n• SEM Controle: R$ 106,80\n• COM Controle: R$ 145,70\n\nFrete grátis! Qual modelo você prefere?",
        },
        {
          label: "25cm - COM e SEM Controle",
          text: "Miniatura 25cm:\n• SEM Controle: R$ 136,80\n• COM Controle: R$ 175,70\n\nFrete grátis! Qual modelo você prefere?",
        },
        {
          label: "40cm - COM e SEM Controle",
          text: "Miniatura 40cm:\n• SEM Controle: R$ 146,80\n• COM Controle: R$ 185,70\n\nFrete grátis! Qual modelo você prefere?",
        },
        {
          label: "Diferença COM/SEM Controle",
          text: "A diferença entre COM e SEM controle:\n\n✅ COM Controle: A miniatura é funcional e pode ser controlada remotamente (anda para frente, trás, direita e esquerda).\n\n⭐ SEM Controle: Perfeita para coleção e decoração, com todos os detalhes personalizados.\n\nQual você prefere?",
        },
      ],
    },
    pagamento: {
      label: "💳 Links de Pagamento",
      icon: CreditCard,
      replies: [
        {
          label: "Miniatura 15cm SEM Controle",
          text: "Link para pagamento da Miniatura 15cm SEM Controle Remoto:\nhttps://pay.kiwify.com.br/oY8I2i5",
        },
        {
          label: "Miniatura 15cm COM Controle",
          text: "Link para pagamento da Miniatura 15cm COM Controle Remoto:\nhttps://pay.kiwify.com.br/eSeTzrA",
        },
        {
          label: "Miniatura 25cm SEM Controle",
          text: "Link para pagamento da Miniatura 25cm SEM Controle Remoto:\nhttps://pay.kiwify.com.br/Z2udi3T",
        },
        {
          label: "Miniatura 25cm COM Controle",
          text: "Link para pagamento da Miniatura 25cm COM Controle Remoto:\nhttps://pay.kiwify.com.br/gHgCbJp",
        },
        {
          label: "Miniatura 40cm SEM Controle",
          text: "Link para pagamento da Miniatura 40cm SEM Controle Remoto:\nhttps://pay.kiwify.com.br/vLojZjL",
        },
        {
          label: "Miniatura 40cm COM Controle",
          text: "Link para pagamento da Miniatura 40cm COM Controle Remoto:\nhttps://pay.kiwify.com.br/AvF6xRl",
        },
      ],
    },
    saudacao: {
      label: "👋 Saudações",
      icon: MessageCircle,
      replies: [
        { label: "Boas-vindas", text: "Olá! Bem-vindo(a) à MiniCustom! Como posso ajudar você hoje?" },
        { label: "Retorno", text: "Obrigado por entrar em contato novamente! Em que posso ajudá-lo?" },
        { label: "Agradecimento", text: "Agradecemos por escolher a MiniCustom! Qualquer dúvida, estou à disposição." },
      ],
    },
    informacoes: {
      label: "ℹ️ Informações",
      icon: Info,
      replies: [
        {
          label: "Prazo de Entrega",
          text: "O prazo de entrega é de 4 a 5 dias úteis após a confirmação do pagamento. Todos os pedidos são enviados com código de rastreamento.",
        },
        {
          label: "Como Funciona",
          text: "Nossa equipe especializada cria miniaturas personalizadas do seu veículo. Após o pagamento, entramos em contato para coletar mais detalhes e enviar fotos para sua aprovação antes da produção final.",
        },
        {
          label: "Personalização",
          text: "Você pode personalizar a cor, detalhes, adesivos e características específicas do seu veículo. Enviamos fotos para aprovação durante o processo.",
        },
        {
          label: "Frete Grátis",
          text: "Trabalhamos com FRETE GRÁTIS para todo o Brasil! A entrega é realizada pelos Correios com código de rastreamento.",
        },
      ],
    },
    produtos: {
      label: "📦 Produtos",
      icon: Package,
      replies: [
        {
          label: "Tamanhos Disponíveis",
          text: "Oferecemos miniaturas em 3 tamanhos:\n• 15cm - Ideal para coleção\n• 25cm - Tamanho médio com ótimos detalhes\n• 40cm - Grande e impressionante\n\nTodas disponíveis COM ou SEM controle remoto!",
        },
        {
          label: "Com Controle Remoto",
          text: "Nossas miniaturas com controle remoto são funcionais! Elas se movimentam para frente, trás, direita e esquerda. Perfeitas para diversão e coleção.",
        },
        {
          label: "Material e Qualidade",
          text: "Utilizamos materiais de alta qualidade com pintura automotiva profissional. Cada miniatura é única e feita sob medida com atenção aos mínimos detalhes.",
        },
      ],
    },
    procedimentos: {
      label: "⚡ Procedimentos",
      icon: Zap,
      replies: [
        {
          label: "Aguardando Pagamento",
          text: "Estou aguardando a confirmação do seu pagamento. Assim que identificarmos, daremos início à produção da sua miniatura!",
        },
        {
          label: "Pagamento Confirmado",
          text: "Seu pagamento foi confirmado! Agora vamos iniciar a produção. Em breve entraremos em contato para coletar os detalhes do seu veículo.",
        },
        {
          label: "Coleta de Informações",
          text: "Para criar sua miniatura, preciso de algumas informações:\n• Modelo do veículo\n• Cor exata\n• Fotos em diferentes ângulos\n• Detalhes de personalização\n\nPode me enviar essas informações?",
        },
        {
          label: "Aprovação de Fotos",
          text: "Sua miniatura está quase pronta! Vou enviar fotos para sua aprovação. Após sua confirmação, finalizaremos e enviaremos para você.",
        },
        {
          label: "Enviado",
          text: "Sua miniatura foi enviada! 🚚\nCódigo de rastreamento: [INSERIR CÓDIGO]\nAcompanhe pelo site dos Correios. Obrigado pela preferência!",
        },
      ],
    },
  }

  useEffect(() => {
    if (currentAdmin) {
      loadConversations()
      const interval = setInterval(loadConversations, 3000)
      return () => clearInterval(interval)
    }
  }, [currentAdmin])

  useEffect(() => {
    if (selectedConversation && currentAdmin) {
      loadMessages(selectedConversation.id)
      const interval = setInterval(() => loadMessages(selectedConversation.id), 3000)
      return () => clearInterval(interval)
    }
  }, [selectedConversation, currentAdmin])

  const loadLogs = async () => {
    if (!currentAdmin) return

    const { data, error } = await supabase
      .from("support_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)

    if (!error && data) {
      setLogs(data)
    }
  }

  useEffect(() => {
    if (showLogs && currentAdmin) {
      loadLogs()
    }
  }, [showLogs, currentAdmin])

  const loadConversations = async () => {
    const { data, error } = await supabase
      .from("support_conversations")
      .select("*")
      .order("last_message_at", { ascending: false })

    if (!error && data) {
      setConversations(data)
    }
  }

  const loadMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from("support_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })

    if (!error && data) {
      setMessages(data)
    }
  }

  const assignConversation = async (conversationId: string) => {
    if (!currentAdmin) return

    const displayName = ADMIN_NAMES[currentAdmin.username as keyof typeof ADMIN_NAMES]

    await supabase
      .from("support_conversations")
      .update({
        assigned_to: currentAdmin.username,
        assigned_name: displayName,
        assigned_at: new Date().toISOString(),
      })
      .eq("id", conversationId)

    // Log the action
    await supabase.from("support_logs").insert({
      conversation_id: conversationId,
      admin_user: currentAdmin.username,
      admin_display_name: displayName,
      action: "Atribuiu conversa",
      details: `${displayName} assumiu o atendimento desta conversa`,
    })

    loadConversations()
  }

  const takeOverConversation = async (conversationId: string, currentAssignedTo: string) => {
    if (!currentAdmin) return

    const currentAssignedName = ADMIN_NAMES[currentAssignedTo as keyof typeof ADMIN_NAMES]
    const newAssignedName = ADMIN_NAMES[currentAdmin.username as keyof typeof ADMIN_NAMES]

    const confirmed = window.confirm(
      `Esta conversa está sendo atendida por ${currentAssignedName}.\n\nDeseja assumir o atendimento?`,
    )

    if (!confirmed) return

    await supabase
      .from("support_conversations")
      .update({
        assigned_to: currentAdmin.username,
        assigned_name: newAssignedName,
        assigned_at: new Date().toISOString(),
      })
      .eq("id", conversationId)

    // Log the action
    await supabase.from("support_logs").insert({
      conversation_id: conversationId,
      admin_user: currentAdmin.username,
      admin_display_name: newAssignedName,
      action: "Assumiu conversa",
      details: `${newAssignedName} assumiu a conversa de ${currentAssignedName}`,
    })

    loadConversations()
    setSelectedConversation(conversations.find((c) => c.id === conversationId))
  }

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    if (!e.target.files || !e.target.files[0] || !selectedConversation || !currentAdmin) return

    const file = e.target.files[0]
    const maxSize = type === "image" ? 5 * 1024 * 1024 : 20 * 1024 * 1024 // 5MB for images, 20MB for videos

    if (file.size > maxSize) {
      alert(`Arquivo muito grande! Máximo ${type === "image" ? "5MB" : "20MB"}`)
      return
    }

    setUploadingMedia(true)

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${type}s/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("support-media")
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("support-media").getPublicUrl(filePath)

      // Send message with media
      const displayName = ADMIN_NAMES[currentAdmin.username as keyof typeof ADMIN_NAMES]

      await supabase.from("support_messages").insert({
        conversation_id: selectedConversation.id,
        sender_type: "admin",
        message: type === "image" ? "📷 Imagem enviada" : "🎥 Vídeo enviado",
        message_type: type,
        media_url: publicUrl,
      })

      // Log the action
      await supabase.from("support_logs").insert({
        conversation_id: selectedConversation.id,
        admin_user: currentAdmin.username,
        admin_display_name: displayName,
        action: `Enviou ${type === "image" ? "imagem" : "vídeo"}`,
        details: `${displayName} enviou um ${type === "image" ? "foto" : "vídeo"} para o cliente`,
      })

      loadMessages(selectedConversation.id)
    } catch (error) {
      console.error("Erro ao enviar mídia:", error)
      alert("Erro ao enviar arquivo. Tente novamente.")
    } finally {
      setUploadingMedia(false)
      e.target.value = ""
    }
  }

  const handleQuickReply = async (text: string) => {
    if (!selectedConversation || !currentAdmin) return

    setNewMessage(text)

    if (text.includes("pay.kiwify.com.br")) {
      const displayName = ADMIN_NAMES[currentAdmin.username as keyof typeof ADMIN_NAMES]

      await supabase.from("support_messages").insert({
        conversation_id: selectedConversation.id,
        sender_type: "admin",
        message: text,
      })

      // Log the action
      await supabase.from("support_logs").insert({
        conversation_id: selectedConversation.id,
        admin_user: currentAdmin.username,
        admin_display_name: displayName,
        action: "Enviou link de pagamento",
        details: `${displayName} enviou um link de pagamento`,
      })

      setNewMessage("")
      loadMessages(selectedConversation.id)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !currentAdmin) return

    const messageText = newMessage
    const displayName = ADMIN_NAMES[currentAdmin.username as keyof typeof ADMIN_NAMES]
    setNewMessage("")

    try {
      await supabase.from("support_messages").insert({
        conversation_id: selectedConversation.id,
        sender_type: "admin",
        message: messageText,
      })

      // Log the action
      await supabase.from("support_logs").insert({
        conversation_id: selectedConversation.id,
        admin_user: currentAdmin.username,
        admin_display_name: displayName,
        action: "Enviou mensagem",
        details: `${displayName} enviou uma mensagem`,
      })

      loadMessages(selectedConversation.id)
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

  const deleteConversation = async (conversationId: string, customerName: string) => {
    if (!currentAdmin) return

    const confirmed = window.confirm(
      `Tem certeza que deseja excluir a conversa com ${customerName}?\n\nEsta ação não pode ser desfeita e todas as mensagens serão apagadas.`,
    )

    if (!confirmed) return

    try {
      const displayName = ADMIN_NAMES[currentAdmin.username as keyof typeof ADMIN_NAMES]

      // Log before deleting
      await supabase.from("support_logs").insert({
        conversation_id: conversationId,
        admin_user: currentAdmin.username,
        admin_display_name: displayName,
        action: "Excluiu conversa",
        details: `${displayName} excluiu a conversa com ${customerName}`,
      })

      const { error } = await supabase.from("support_conversations").delete().eq("id", conversationId)

      if (error) {
        console.error("Erro ao excluir conversa:", error)
        alert("Erro ao excluir conversa. Tente novamente.")
        return
      }

      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null)
        setMessages([])
      }

      loadConversations()
    } catch (error) {
      console.error("Erro ao excluir conversa:", error)
      alert("Erro ao excluir conversa. Tente novamente.")
    }
  }

  const canSendMessage = (conversation: any) => {
    if (!conversation.assigned_to) return true
    return conversation.assigned_to === currentAdmin?.username
  }

  if (!currentAdmin) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 flex overflow-hidden">
      {/* Racing Stripe Background */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500" />

      {/* Conversations Panel */}
      <div
        className={`${showConversations ? "w-full sm:w-80" : "w-0"} ${selectedConversation ? "hidden sm:flex" : "flex"} bg-white border-r border-slate-200 flex-col transition-all duration-300 overflow-hidden flex-shrink-0 shadow-lg`}
      >
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold">Painel Admin</h1>
                <p className="text-xs text-slate-300">
                  {ADMIN_NAMES[currentAdmin.username as keyof typeof ADMIN_NAMES]}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowLogs(!showLogs)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Ver Logs"
              >
                <FileText className="w-5 h-5" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="text-xs text-slate-400">
            {conversations.length} conversa{conversations.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Car className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhuma conversa ainda</p>
              <p className="text-xs text-slate-400 mt-1">Aguardando clientes...</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {conversations.map((conv) => {
                const isAssignedToMe = conv.assigned_to === currentAdmin.username
                const isAssignedToOther = conv.assigned_to && !isAssignedToMe
                const assignedName = conv.assigned_name

                return (
                  <div
                    key={conv.id}
                    className={`relative group ${
                      selectedConversation?.id === conv.id
                        ? "bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-600"
                        : ""
                    }`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteConversation(conv.id, conv.customer_name)
                      }}
                      className="absolute top-2 right-2 z-10 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                      title="Excluir conversa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (!conv.assigned_to) {
                          assignConversation(conv.id)
                        }
                        setSelectedConversation(conv)
                        if (window.innerWidth < 640) {
                          setShowConversations(false)
                        }
                      }}
                      className="w-full p-4 text-left hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">{conv.customer_name}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              <span className="truncate max-w-[150px]">{conv.customer_email}</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      {isAssignedToMe && (
                        <div className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full mt-2 w-fit">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Você está atendendo</span>
                        </div>
                      )}

                      {isAssignedToOther && (
                        <div className="flex items-center gap-1 text-xs text-orange-700 bg-orange-50 px-2 py-1 rounded-full mt-2 w-fit">
                          <AlertCircle className="w-3 h-3" />
                          <span>Atendida por {assignedName}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              takeOverConversation(conv.id, conv.assigned_to)
                            }}
                            className="ml-1 text-orange-700 hover:text-orange-900 underline"
                          >
                            Assumir
                          </button>
                        </div>
                      )}

                      {!conv.assigned_to && (
                        <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-full mt-2 w-fit">
                          <UserCheck className="w-3 h-3" />
                          <span>Clique para atender</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                        <Clock className="w-3 h-3" />
                        {new Date(conv.last_message_at).toLocaleString("pt-BR")}
                      </div>
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${selectedConversation ? "flex" : "hidden sm:flex"} flex-1 flex-col min-w-0 bg-slate-50`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-slate-200 p-3 sm:p-4 shadow-sm flex-shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setShowConversations(true)
                    setSelectedConversation(null)
                  }}
                  className="sm:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <ChevronDown className="w-5 h-5 rotate-90" />
                </button>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-slate-900 text-sm sm:text-base truncate">
                    {selectedConversation.customer_name}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 truncate">{selectedConversation.customer_email}</p>
                </div>
                <button
                  onClick={() => setShowQuickReplies(!showQuickReplies)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Respostas Rápidas"
                >
                  <Zap className={`w-5 h-5 ${showQuickReplies ? "text-purple-600" : "text-slate-400"}`} />
                </button>
              </div>

              {selectedConversation.assigned_to && selectedConversation.assigned_to !== currentAdmin.username && (
                <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-800 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <p>
                      Esta conversa está sendo atendida por <strong>{selectedConversation.assigned_name}</strong>. Você
                      não pode enviar mensagens.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-gradient-to-b from-slate-50 to-slate-100">
              <div className="max-w-4xl mx-auto">
                <div className="flex justify-center gap-1 mb-6">
                  <div className="w-12 h-1 bg-red-500 rounded-full" />
                  <div className="w-12 h-1 bg-yellow-500 rounded-full" />
                  <div className="w-12 h-1 bg-blue-500 rounded-full" />
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_type === "admin" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[70%] ${
                          msg.sender_type === "admin"
                            ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg"
                            : "bg-white text-slate-900 shadow-md border border-slate-200"
                        } rounded-2xl overflow-hidden`}
                      >
                        {msg.message_type === "image" && msg.media_url && (
                          <img
                            src={msg.media_url || "/placeholder.svg"}
                            alt="Imagem enviada"
                            className="w-full max-w-xs"
                          />
                        )}
                        {msg.message_type === "video" && msg.media_url && (
                          <video src={msg.media_url} controls className="w-full max-w-xs" />
                        )}
                        <div className="px-3 py-2.5 sm:px-4 sm:py-3">
                          <p className="text-sm sm:text-base whitespace-pre-wrap break-words">{msg.message}</p>
                          <p
                            className={`text-[10px] sm:text-xs mt-1 ${msg.sender_type === "admin" ? "text-blue-100" : "text-slate-500"}`}
                          >
                            {new Date(msg.created_at).toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-slate-200 p-3 sm:p-4 flex-shrink-0 shadow-lg">
              <div className="max-w-4xl mx-auto">
                <div className="flex gap-2 mb-3">
                  <label
                    className={`flex items-center gap-2 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg cursor-pointer transition-colors text-sm ${
                      !canSendMessage(selectedConversation) || uploadingMedia ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleMediaUpload(e, "image")}
                      disabled={!canSendMessage(selectedConversation) || uploadingMedia}
                      className="hidden"
                    />
                  </label>

                  <label
                    className={`flex items-center gap-2 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg cursor-pointer transition-colors text-sm ${
                      !canSendMessage(selectedConversation) || uploadingMedia ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    <span>Vídeo</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleMediaUpload(e, "video")}
                      disabled={!canSendMessage(selectedConversation) || uploadingMedia}
                      className="hidden"
                    />
                  </label>

                  {uploadingMedia && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm">
                      <Upload className="w-4 h-4 animate-pulse" />
                      <span>Enviando...</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder={
                      canSendMessage(selectedConversation)
                        ? "Digite sua resposta..."
                        : "Você não pode enviar mensagens nesta conversa"
                    }
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={!canSendMessage(selectedConversation)}
                    className="flex-1 h-12 sm:h-14 text-sm sm:text-base"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || !canSendMessage(selectedConversation)}
                    className="h-12 sm:h-14 px-4 sm:px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
                  >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <div className="text-center text-slate-400">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500 rounded-2xl flex items-center justify-center opacity-50">
                <Car className="w-10 h-10 text-white" />
              </div>
              <p className="text-base sm:text-lg font-semibold">Selecione uma conversa</p>
              <p className="text-sm text-slate-500 mt-2">Escolha um cliente para começar o atendimento</p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Replies Panel */}
      {selectedConversation && showQuickReplies && (
        <>
          <div className="sm:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setShowQuickReplies(false)} />

          <div
            className={`fixed sm:relative inset-x-0 bottom-0 sm:inset-auto bg-white border-l border-slate-200 flex-shrink-0 z-50 sm:z-auto transition-all duration-300 shadow-2xl ${
              showQuickReplies ? "max-h-[70vh] sm:max-h-none sm:w-80" : "max-h-0 sm:w-0"
            } overflow-hidden rounded-t-2xl sm:rounded-none`}
          >
            <div className="w-full sm:w-80 h-full flex flex-col">
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-3 sm:p-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  <h2 className="font-bold text-sm sm:text-base">Respostas Rápidas</h2>
                </div>
                <button
                  onClick={() => setShowQuickReplies(false)}
                  className="p-1.5 hover:bg-purple-800 rounded transition-colors"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
                {Object.entries(quickReplies).map(([key, category]) => {
                  const Icon = category.icon
                  return (
                    <div key={key} className="bg-slate-50 rounded-lg overflow-hidden shadow-sm">
                      <button
                        onClick={() => setExpandedCategory(expandedCategory === key ? "" : key)}
                        className="w-full p-3 flex items-center justify-between hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-purple-600" />
                          <span className="font-semibold text-xs sm:text-sm text-slate-900">{category.label}</span>
                        </div>
                        {expandedCategory === key ? (
                          <ChevronUp className="w-4 h-4 text-slate-600" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-600" />
                        )}
                      </button>

                      {expandedCategory === key && (
                        <div className="p-2 space-y-1">
                          {category.replies.map((reply, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleQuickReply(reply.text)}
                              className="w-full text-left p-3 bg-white hover:bg-purple-50 rounded-lg transition-colors text-xs sm:text-sm text-slate-700 hover:text-purple-900 border border-slate-200 hover:border-purple-300 shadow-sm"
                            >
                              {reply.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Logs Modal */}
      {showLogs && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowLogs(false)} />
          <div className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-2xl bg-white rounded-2xl shadow-2xl z-50 flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 flex items-center justify-between rounded-t-2xl flex-shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <h2 className="font-bold text-lg">Logs de Atividades</h2>
              </div>
              <button onClick={() => setShowLogs(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {logs.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhum log ainda</p>
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-semibold text-sm text-slate-900">{log.admin_display_name}</span>
                      <span className="text-xs text-slate-500">{new Date(log.created_at).toLocaleString("pt-BR")}</span>
                    </div>
                    <p className="text-sm text-purple-700 font-medium">{log.action}</p>
                    {log.details && <p className="text-xs text-slate-600 mt-1">{log.details}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
