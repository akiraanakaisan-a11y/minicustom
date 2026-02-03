"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Send,
  Loader2,
  Shield,
  Truck,
  BadgeCheck,
  Copy,
  Check,
  X,
  Car,
  Bike,
  Gamepad2,
  Package,
  MessageCircle,
  HelpCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Play,
  ExternalLink,
  Lock,
  Camera,
  User,
  Mail,
  MapPin,
  Star,
  ImageIcon,
} from "lucide-react"
import Image from "next/image"

// Types
interface Message {
  id: string
  role: "assistant" | "user"
  content: string
  actionType?:
    | "quick_actions"
    | "size_selector"
    | "remote_selector"
    | "model_input"
    | "order_summary"
    | "checkout_form"
    | "pix_payment"
    | "gallery"
  actionData?: any
}

interface OrderData {
  size: string
  remote: boolean
  model: string
  price: number
}

// Constants
const WHATSAPP_NUMBER = "554731706046"
const FIXED_DOCUMENT = "48070248000155"

const priceInfo = {
  "15cm": { sem: 106.8, com: 145.7 },
  "25cm": { sem: 136.8, com: 175.7 },
  "40cm": { sem: 146.8, com: 185.7 },
}

const galleryImages = {
  carros: [
    "https://madmachines.com.br/cdn/shop/products/03_2a685873-2109-434c-9aea-86d86224c1dd.jpg?v=1687380533&width=823",
    "https://madmachines.com.br/cdn/shop/files/01_c2981188-dc89-4c4b-837f-c6e4e7e78c94.jpg?v=1692066024&width=823",
    "https://madmachines.com.br/cdn/shop/files/02_34f2e967-472f-4a30-a8b2-37db57f56365.jpg?v=1753815376&width=823",
  ],
  motos: [
    "https://madmachines.com.br/cdn/shop/files/s-l1600-3_af89df19-f4b3-47de-9e46-7121797f3783.jpg?v=1763489689&width=823",
    "https://madmachines.com.br/cdn/shop/files/08_6ff0502a-de9c-48e0-9fff-bc92f9948787.jpg?v=1701822741&width=823",
    "https://madmachines.com.br/cdn/shop/files/06_f9165cf2-aca5-45a9-b3a8-07b5b3c6b45c.jpg?v=1758907456&width=823",
  ],
  videos: [
    {
      url: "https://www.instagram.com/reel/DSpg3OoCg8m/",
      label: "Miniatura em ação",
      thumb:
        "https://madmachines.com.br/cdn/shop/products/preto_4c6126c7-9f8a-42b5-8713-20f7b93eef70.jpg?v=1687380533&width=400",
    },
    {
      url: "https://www.instagram.com/reel/DSZ_BoUCvRx/",
      label: "Detalhes do acabamento",
      thumb:
        "https://madmachines.com.br/cdn/shop/files/vermelho_d0d3e1b4-cdee-4902-8bdc-d1da5d57ea89.jpg?v=1749674554&width=400",
    },
    {
      url: "https://www.instagram.com/reel/DRNndQsiuvV/",
      label: "Controle remoto",
      thumb:
        "https://madmachines.com.br/cdn/shop/files/preto_d4cd83c0-05b9-469a-8f35-8caa58f7b8fe.jpg?v=1740689119&width=400",
    },
  ],
}

const greetingVariations = ["Oi! Tudo bem? 😊", "Oii! Tudo certo por aí? 🚗", "Olá! Como vai? ✨"]

const confirmationVariations = ["Entendi! 👍", "Perfeito! ✨", "Ótimo! 🎉", "Show! 🔥"]

// Helper functions
const getRandomVariation = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]

const calculateTypingDelay = (text: string): number => {
  const baseDelay = 800
  const charDelay = 20
  const maxDelay = 3500
  const minDelay = 1000
  const calculatedDelay = baseDelay + Math.min(text.length, 150) * charDelay
  return Math.max(minDelay, Math.min(calculatedDelay, maxDelay))
}

const formatPrice = (price: number) => {
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const [step, setStep] = useState<string>("greeting")
  const [orderData, setOrderData] = useState<OrderData>({ size: "", remote: false, model: "", price: 0 })
  const [checkoutData, setCheckoutData] = useState({ name: "", email: "", cep: "", address: "" })
  const [photos, setPhotos] = useState<string[]>([])
  const [paymentData, setPaymentData] = useState<any>(null)
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "loading" | "pending" | "paid">("idle")
  const [copied, setCopied] = useState(false)
  const [galleryTab, setGalleryTab] = useState<"carros" | "motos" | "videos">("carros")
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [expirationTime, setExpirationTime] = useState(1800)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Timer for PIX expiration
  useEffect(() => {
    if (paymentStatus === "pending" && expirationTime > 0) {
      const timer = setInterval(() => setExpirationTime((t) => t - 1), 1000)
      return () => clearInterval(timer)
    }
  }, [paymentStatus, expirationTime])

  // Add assistant message with typing delay
  const addAssistantMessage = useCallback((content: string, actionType?: string, actionData?: any) => {
    setIsTyping(true)
    const delay = calculateTypingDelay(content)

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content,
          actionType: actionType as any,
          actionData,
        },
      ])
      setIsTyping(false)
    }, delay)
  }, [])

  // Add user message
  const addUserMessage = (content: string) => {
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", content }])
  }

  // Initial greeting
  useEffect(() => {
    const greeting = getRandomVariation(greetingVariations)
    const welcomeMessage = `${greeting} Me chamo Tainara e farei seu atendimento aqui na MiniCustom Miniaturas!

Somos especializados em **miniaturas personalizadas sob encomenda**. Temos todos os modelos de veículos - carros, motos, caminhões - e fazemos igualzinho ao original!

Como posso te ajudar hoje?`

    setTimeout(() => {
      setMessages([
        {
          id: "1",
          role: "assistant",
          content: welcomeMessage,
          actionType: "quick_actions",
          actionData: ["Ver exemplos", "Ver preços", "Fazer pedido", "Tirar dúvidas", "WhatsApp"],
        },
      ])
      setIsTyping(false)
    }, 1500)
  }, [])

  // Handle quick actions
  const handleQuickAction = (action: string) => {
    addUserMessage(action)

    switch (action.toLowerCase()) {
      case "ver exemplos":
        setTimeout(() => {
          addAssistantMessage(
            "Olha só alguns dos nossos trabalhos! 🔥\n\nNavegue pelas abas para ver carros, motos e vídeos dos nossos clientes:",
            "gallery",
          )
        }, 500)
        break

      case "ver preços":
        setTimeout(() => {
          const priceMessage = `📋 **Tabela de Preços**

🚗 **15cm (Compacta)**
• Sem controle: R$ 106,80
• Com controle: R$ 145,70

🚙 **25cm (Média)** ⭐ MAIS VENDIDA
• Sem controle: R$ 136,80
• Com controle: R$ 175,70

🚕 **40cm (Grande)**
• Sem controle: R$ 146,80
• Com controle: R$ 185,70

✅ Frete GRÁTIS para todo Brasil
✅ Entrega em 4-5 dias úteis
✅ Todos os pedidos rastreados

Qual tamanho te interessa?`
          addAssistantMessage(priceMessage, "quick_actions", ["Quero 15cm", "Quero 25cm", "Quero 40cm", "Voltar"])
        }, 500)
        break

      case "fazer pedido":
      case "quero 15cm":
      case "quero 25cm":
      case "quero 40cm":
        if (action.includes("15cm")) {
          setOrderData((prev) => ({ ...prev, size: "15cm" }))
          setStep("awaiting_remote")
          setTimeout(() => {
            addAssistantMessage(
              `${getRandomVariation(confirmationVariations)} Miniatura de 15cm!\n\nVocê quer com ou sem controle remoto?`,
              "remote_selector",
            )
          }, 500)
        } else if (action.includes("25cm")) {
          setOrderData((prev) => ({ ...prev, size: "25cm" }))
          setStep("awaiting_remote")
          setTimeout(() => {
            addAssistantMessage(
              `${getRandomVariation(confirmationVariations)} Miniatura de 25cm - nossa mais vendida!\n\nVocê quer com ou sem controle remoto?`,
              "remote_selector",
            )
          }, 500)
        } else if (action.includes("40cm")) {
          setOrderData((prev) => ({ ...prev, size: "40cm" }))
          setStep("awaiting_remote")
          setTimeout(() => {
            addAssistantMessage(
              `${getRandomVariation(confirmationVariations)} Miniatura de 40cm - a maior e mais detalhada!\n\nVocê quer com ou sem controle remoto?`,
              "remote_selector",
            )
          }, 500)
        } else {
          setStep("awaiting_size")
          setTimeout(() => {
            addAssistantMessage(
              "Ótimo! Vamos começar seu pedido! 🎉\n\nPrimeiro, escolha o tamanho da sua miniatura:",
              "size_selector",
            )
          }, 500)
        }
        break

      case "tirar dúvidas":
        setTimeout(() => {
          addAssistantMessage(
            `Claro! Aqui estão as dúvidas mais comuns:

📦 **Prazo de entrega:** 4-5 dias úteis após aprovação
🚚 **Frete:** GRÁTIS para todo Brasil
🔍 **Rastreamento:** Código enviado por email
🎨 **Personalização:** Fazemos igual ao seu veículo
📸 **Aprovação:** Enviamos fotos antes de enviar
🛡️ **Garantia:** 90 dias

Tem mais alguma dúvida?`,
            "quick_actions",
            ["Fazer pedido", "Ver preços", "WhatsApp", "Voltar"],
          )
        }, 500)
        break

      case "whatsapp":
        window.open(
          `https://wa.me/${WHATSAPP_NUMBER}?text=Olá! Vim pelo chat do site e gostaria de saber mais sobre as miniaturas.`,
          "_blank",
        )
        break

      case "voltar":
        setStep("greeting")
        setTimeout(() => {
          addAssistantMessage("Como posso te ajudar? 😊", "quick_actions", [
            "Ver exemplos",
            "Ver preços",
            "Fazer pedido",
            "Tirar dúvidas",
            "WhatsApp",
          ])
        }, 500)
        break
    }
  }

  // Handle size selection
  const handleSizeSelect = (size: string) => {
    addUserMessage(`Quero ${size}`)
    setOrderData((prev) => ({ ...prev, size }))
    setStep("awaiting_remote")
    setTimeout(() => {
      const sizeLabel = size === "15cm" ? "compacta" : size === "25cm" ? "média" : "grande"
      addAssistantMessage(
        `${getRandomVariation(confirmationVariations)} Miniatura ${sizeLabel} de ${size}!\n\nVocê quer com ou sem controle remoto?`,
        "remote_selector",
      )
    }, 500)
  }

  // Handle remote selection
  const handleRemoteSelect = (withRemote: boolean) => {
    addUserMessage(withRemote ? "Com controle remoto" : "Sem controle remoto")
    const price = withRemote
      ? priceInfo[orderData.size as keyof typeof priceInfo].com
      : priceInfo[orderData.size as keyof typeof priceInfo].sem
    setOrderData((prev) => ({ ...prev, remote: withRemote, price }))
    setStep("awaiting_model")
    setTimeout(() => {
      addAssistantMessage(
        `${getRandomVariation(confirmationVariations)} ${withRemote ? "Com controle" : "Sem controle"} por ${formatPrice(price)}.\n\nAgora me conta: qual é o modelo do seu veículo?\n\n*Ex: Civic 2020 preto, Fusca 1970 azul...*`,
        "model_input",
      )
    }, 500)
  }

  // Handle model input
  const handleModelSubmit = (model: string) => {
    addUserMessage(model)
    setOrderData((prev) => ({ ...prev, model }))
    setStep("awaiting_confirmation")
    setTimeout(() => {
      addAssistantMessage(`Perfeito! Vou resumir seu pedido:\n\n📋 **Resumo do Pedido**`, "order_summary", {
        ...orderData,
        model,
      })
    }, 500)
  }

  // Handle order confirmation
  const handleConfirmOrder = () => {
    addUserMessage("Confirmar pedido")
    setStep("checkout_form")
    setTimeout(() => {
      addAssistantMessage("Excelente! Agora preciso de alguns dados para finalizar:", "checkout_form")
    }, 500)
  }

  // Handle checkout submit
  const handleCheckoutSubmit = async (data: { name: string; email: string; cep: string; address: string }) => {
    setCheckoutData(data)
    addUserMessage(`${data.name} - ${data.email}`)
    setStep("awaiting_payment")
    setPaymentStatus("loading")

    setTimeout(() => {
      addAssistantMessage("Perfeito! Gerando seu PIX...", "pix_payment")
    }, 500)

    try {
      // Create order
      await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          size: orderData.size,
          price: orderData.price,
          include_remote_control: orderData.remote,
          remote_control_price: orderData.remote ? 38.9 : 0,
          total_price: orderData.price,
          quantity: 1,
          customer_name: data.name,
          customer_email: data.email,
          customer_document: FIXED_DOCUMENT,
          vehicle_model: orderData.model,
          vehicle_name: `Miniatura ${orderData.size} ${orderData.remote ? "com" : "sem"} controle`,
          shipping_method: "Envio Rastreado",
          shipping_cep: data.cep,
          shipping_address: data.address,
          payment_method: "pix",
        }),
      })

      // Create payment
      const response = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: orderData.price,
          description: `Miniatura ${orderData.size} ${orderData.remote ? "com" : "sem"} controle - ${orderData.model}`,
          customerName: data.name,
          customerEmail: data.email,
          customerDocument: FIXED_DOCUMENT,
        }),
      })

      const pixData = await response.json()
      setPaymentData(pixData)
      setPaymentStatus("pending")
      setExpirationTime(1800)

      // Check payment status
      const checkInterval = setInterval(async () => {
        try {
          const checkResponse = await fetch("/api/check-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transactionId: pixData.id_transaction || pixData.transactionId }),
          })
          const checkData = await checkResponse.json()
          if (checkData?.status === "paid") {
            setPaymentStatus("paid")
            clearInterval(checkInterval)
          }
        } catch (e) {
          console.error("Check payment error:", e)
        }
      }, 3000)

      setTimeout(() => clearInterval(checkInterval), 600000)
    } catch (error) {
      console.error("Payment error:", error)
    }
  }

  // Handle photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newPhotos: string[] = []
      Array.from(files)
        .slice(0, 5 - photos.length)
        .forEach((file) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            newPhotos.push(reader.result as string)
            if (newPhotos.length === Math.min(files.length, 5 - photos.length)) {
              setPhotos((prev) => [...prev, ...newPhotos])
            }
          }
          reader.readAsDataURL(file)
        })
    }
  }

  // Copy PIX code
  const copyPixCode = () => {
    if (paymentData?.qrcode) {
      navigator.clipboard.writeText(paymentData.qrcode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Handle text input
  const handleSendMessage = () => {
    if (!inputValue.trim()) return
    const text = inputValue.trim().toLowerCase()

    if (step === "awaiting_model") {
      handleModelSubmit(inputValue.trim())
      setInputValue("")
      return
    }

    // Intent recognition
    if (text.match(/oi|ola|boa|bom|hey|eai|e ai|fala|salve/)) {
      handleQuickAction("Voltar")
    } else if (text.match(/preco|valor|quanto|custa|custo|tabela|promocao/)) {
      handleQuickAction("Ver preços")
    } else if (text.match(/fazer pedido|quero|comprar|encomendar|pedir/)) {
      handleQuickAction("Fazer pedido")
    } else if (text.match(/exemplo|fotos|foto|video|portfolio/)) {
      handleQuickAction("Ver exemplos")
    } else if (text.match(/15|quinze|menor|pequen/)) {
      handleQuickAction("Quero 15cm")
    } else if (text.match(/25|vinte|medio/)) {
      handleQuickAction("Quero 25cm")
    } else if (text.match(/40|quarenta|maior|grand/)) {
      handleQuickAction("Quero 40cm")
    } else if (text.match(/whatsapp|zap|wpp|atendente|humano/)) {
      handleQuickAction("WhatsApp")
    } else if (text.match(/tchau|ate mais|obrigad|vlw|valeu/)) {
      addUserMessage(inputValue.trim())
      setTimeout(() => {
        addAssistantMessage(
          "Por nada! Foi um prazer te atender! 😊\n\nSe precisar de mais alguma coisa, é só chamar. Até mais! 👋",
          "quick_actions",
          ["Fazer pedido", "Ver preços", "WhatsApp"],
        )
      }, 500)
    } else if (step === "awaiting_confirmation" && text.match(/sim|confirmo|isso|certo|correto|ok|pode|fechado/)) {
      handleConfirmOrder()
    } else {
      addUserMessage(inputValue.trim())
      setTimeout(() => {
        addAssistantMessage("Não entendi muito bem... 🤔 Posso te ajudar com:", "quick_actions", [
          "Ver exemplos",
          "Ver preços",
          "Fazer pedido",
          "Tirar dúvidas",
          "WhatsApp",
        ])
      }, 500)
    }

    setInputValue("")
  }

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-zinc-950 overflow-hidden">
      {/* Header */}
      <header className="shrink-0 bg-zinc-900 border-b border-zinc-800">
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
              T
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-zinc-900"></div>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-zinc-100 text-[15px]">Tainara - MiniCustom</h1>
            <p className="text-xs text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Online agora
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-zinc-400 bg-zinc-800 px-2 py-1 rounded-full">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <span>+15k vendas</span>
            </div>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=Olá! Vim pelo chat do site e gostaria de saber mais sobre as miniaturas.`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-emerald-600 hover:bg-emerald-500 rounded-full transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-white" />
            </a>
          </div>
        </div>

        {/* Trust badges */}
        <div className="px-4 py-2 flex justify-center gap-4 border-t border-zinc-800/50 bg-zinc-900/50">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Truck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Frete Grátis</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>Garantia 90 dias</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <BadgeCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>CNPJ Ativo</span>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main ref={chatContainerRef} className="flex-1 overflow-y-auto overscroll-none">
        <div className="px-4 py-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              {message.role === "user" ? (
                <div className="bg-blue-500 text-white px-4 py-2.5 rounded-2xl rounded-tr-md max-w-[85%] text-[15px] leading-relaxed shadow-lg shadow-blue-500/10">
                  {message.content}
                </div>
              ) : (
                <div className="flex gap-2.5 max-w-[90%]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-lg shadow-blue-500/20">
                    T
                  </div>
                  <div className="space-y-2">
                    <div className="bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-2xl rounded-tl-md">
                      <p className="text-[15px] text-zinc-100 whitespace-pre-line leading-relaxed">
                        {message.content.split("**").map((part, i) =>
                          i % 2 === 1 ? (
                            <strong key={i} className="text-blue-400">
                              {part}
                            </strong>
                          ) : (
                            part
                          ),
                        )}
                      </p>
                    </div>

                    {/* Quick Actions */}
                    {message.actionType === "quick_actions" && message.actionData && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {message.actionData.map((action: string) => (
                          <button
                            key={action}
                            onClick={() => handleQuickAction(action)}
                            className="px-4 py-2 bg-zinc-900 border border-zinc-700 text-zinc-200 rounded-full text-sm font-medium hover:bg-zinc-800 hover:border-blue-500 hover:text-blue-400 transition-all active:scale-95 flex items-center gap-2"
                          >
                            {action === "Ver exemplos" && <ImageIcon className="w-4 h-4" />}
                            {action === "Ver preços" && <Package className="w-4 h-4" />}
                            {action === "Fazer pedido" && <Car className="w-4 h-4" />}
                            {action === "Tirar dúvidas" && <HelpCircle className="w-4 h-4" />}
                            {action === "WhatsApp" && <MessageCircle className="w-4 h-4" />}
                            {action}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Size Selector */}
                    {message.actionType === "size_selector" && (
                      <div className="space-y-2 pt-1">
                        {[
                          { size: "15cm", label: "Compacta", desc: "Ideal para coleção" },
                          { size: "25cm", label: "Média", desc: "Mais vendida", popular: true },
                          { size: "40cm", label: "Grande", desc: "Máximo detalhe" },
                        ].map((item) => (
                          <button
                            key={item.size}
                            onClick={() => handleSizeSelect(item.size)}
                            className={`w-full p-4 bg-zinc-900 border ${item.popular ? "border-blue-500" : "border-zinc-700"} rounded-xl text-left hover:border-blue-500 transition-all active:scale-[0.98] relative`}
                          >
                            {item.popular && (
                              <span className="absolute -top-2 right-3 px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full">
                                POPULAR
                              </span>
                            )}
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-semibold text-zinc-100">
                                  {item.size} - {item.label}
                                </p>
                                <p className="text-sm text-zinc-400">{item.desc}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-blue-400">
                                  {formatPrice(priceInfo[item.size as keyof typeof priceInfo].sem)}
                                </p>
                                <p className="text-xs text-zinc-500">sem controle</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Remote Selector */}
                    {message.actionType === "remote_selector" && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => handleRemoteSelect(true)}
                          className="p-4 bg-zinc-900 border border-zinc-700 rounded-xl text-center hover:border-blue-500 transition-all active:scale-[0.98]"
                        >
                          <Gamepad2 className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                          <p className="font-semibold text-zinc-100 text-sm">Com Controle</p>
                          <p className="text-xs text-emerald-400 mt-1">+R$ 38,90</p>
                        </button>
                        <button
                          onClick={() => handleRemoteSelect(false)}
                          className="p-4 bg-zinc-900 border border-zinc-700 rounded-xl text-center hover:border-blue-500 transition-all active:scale-[0.98]"
                        >
                          <Car className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                          <p className="font-semibold text-zinc-100 text-sm">Sem Controle</p>
                          <p className="text-xs text-zinc-500 mt-1">Incluso</p>
                        </button>
                      </div>
                    )}

                    {/* Model Input */}
                    {message.actionType === "model_input" && (
                      <div className="pt-1">
                        <div className="flex gap-2">
                          <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Ex: Civic 2020 preto..."
                            className="flex-1 bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 rounded-xl h-11 text-[16px]"
                            onKeyDown={(e) => e.key === "Enter" && handleModelSubmit(inputValue)}
                          />
                          <Button
                            onClick={() => handleModelSubmit(inputValue)}
                            disabled={!inputValue.trim()}
                            className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl h-11 px-4"
                          >
                            <Send className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Order Summary */}
                    {message.actionType === "order_summary" && (
                      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 space-y-3">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Tamanho:</span>
                            <span className="text-zinc-100 font-medium">{orderData.size}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Controle:</span>
                            <span className="text-zinc-100 font-medium">{orderData.remote ? "Sim" : "Não"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Veículo:</span>
                            <span className="text-zinc-100 font-medium">
                              {message.actionData?.model || orderData.model}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Frete:</span>
                            <span className="text-emerald-400 font-medium">GRÁTIS</span>
                          </div>
                          <div className="border-t border-zinc-700 pt-2 mt-2">
                            <div className="flex justify-between">
                              <span className="text-zinc-100 font-semibold">Total:</span>
                              <span className="text-xl font-bold text-blue-400">{formatPrice(orderData.price)}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={handleConfirmOrder}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold h-12 rounded-xl shadow-lg shadow-blue-500/20"
                        >
                          Confirmar Pedido
                        </Button>
                        <p className="text-xs text-zinc-500 text-center">Ou digite: sim, confirmo, certo...</p>
                      </div>
                    )}

                    {/* Checkout Form */}
                    {message.actionType === "checkout_form" && (
                      <CheckoutForm
                        onSubmit={handleCheckoutSubmit}
                        photos={photos}
                        onPhotoUpload={handlePhotoUpload}
                        fileInputRef={fileInputRef}
                        onRemovePhoto={(index) => setPhotos((prev) => prev.filter((_, i) => i !== index))}
                      />
                    )}

                    {/* PIX Payment */}
                    {message.actionType === "pix_payment" && (
                      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
                        {paymentStatus === "loading" && (
                          <div className="text-center py-8">
                            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-3" />
                            <p className="text-zinc-400">Gerando PIX...</p>
                          </div>
                        )}

                        {paymentStatus === "pending" && paymentData && (
                          <div className="space-y-4">
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-2 text-amber-400 mb-3">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm font-medium">Expira em {formatTime(expirationTime)}</span>
                              </div>
                              {paymentData.qrcode_base64 && (
                                <div className="bg-white p-3 rounded-xl inline-block">
                                  <Image
                                    src={
                                      paymentData.qrcode_base64.startsWith("data:")
                                        ? paymentData.qrcode_base64
                                        : `data:image/png;base64,${paymentData.qrcode_base64}`
                                    }
                                    alt="QR Code PIX"
                                    width={200}
                                    height={200}
                                    className="w-[200px] h-[200px]"
                                  />
                                </div>
                              )}
                            </div>
                            <div className="space-y-2">
                              <p className="text-xs text-zinc-400 text-center">Código Copia e Cola:</p>
                              <div className="bg-zinc-800 p-3 rounded-lg">
                                <p className="text-xs text-zinc-300 break-all font-mono line-clamp-2">
                                  {paymentData.qrcode}
                                </p>
                              </div>
                              <Button
                                onClick={copyPixCode}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold h-12 rounded-xl"
                              >
                                {copied ? (
                                  <>
                                    <Check className="w-5 h-5 mr-2" />
                                    Copiado!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-5 h-5 mr-2" />
                                    Copiar Código PIX
                                  </>
                                )}
                              </Button>
                            </div>
                            <div className="text-center pt-2">
                              <p className="text-xs text-zinc-500">Aguardando pagamento...</p>
                              <Loader2 className="w-4 h-4 text-blue-500 animate-spin mx-auto mt-2" />
                            </div>
                          </div>
                        )}

                        {paymentStatus === "paid" && (
                          <div className="text-center py-6">
                            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Check className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-emerald-400 mb-2">Pagamento Confirmado!</h3>
                            <p className="text-zinc-400 text-sm">
                              Nossa equipe entrará em contato em até 24h para iniciar a produção da sua miniatura.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Gallery */}
                    {message.actionType === "gallery" && (
                      <div className="bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden">
                        <div className="flex border-b border-zinc-700">
                          {(["carros", "motos", "videos"] as const).map((tab) => (
                            <button
                              key={tab}
                              onClick={() => {
                                setGalleryTab(tab)
                                setGalleryIndex(0)
                              }}
                              className={`flex-1 py-3 text-sm font-medium transition-colors ${galleryTab === tab ? "text-blue-400 border-b-2 border-blue-400" : "text-zinc-400"}`}
                            >
                              {tab === "carros" && <Car className="w-4 h-4 inline mr-1" />}
                              {tab === "motos" && <Bike className="w-4 h-4 inline mr-1" />}
                              {tab === "videos" && <Play className="w-4 h-4 inline mr-1" />}
                              {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                          ))}
                        </div>
                        <div className="relative aspect-square">
                          {galleryTab !== "videos" ? (
                            <Image
                              src={galleryImages[galleryTab][galleryIndex] || "/placeholder.svg"}
                              alt="Exemplo"
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <a
                              href={galleryImages.videos[galleryIndex].url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block relative w-full h-full"
                            >
                              <Image
                                src={galleryImages.videos[galleryIndex].thumb || "/placeholder.svg"}
                                alt={galleryImages.videos[galleryIndex].label}
                                fill
                                className="object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                                  <Play className="w-8 h-8 text-white fill-white" />
                                </div>
                              </div>
                              <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 text-white text-sm">
                                <ExternalLink className="w-4 h-4" />
                                {galleryImages.videos[galleryIndex].label}
                              </div>
                            </a>
                          )}
                          <button
                            onClick={() =>
                              setGalleryIndex(
                                (i) => (i - 1 + galleryImages[galleryTab].length) % galleryImages[galleryTab].length,
                              )
                            }
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setGalleryIndex((i) => (i + 1) % galleryImages[galleryTab].length)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="p-3 flex justify-center gap-1.5">
                          {galleryImages[galleryTab].map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setGalleryIndex(i)}
                              className={`w-2 h-2 rounded-full transition-colors ${i === galleryIndex ? "bg-blue-500" : "bg-zinc-600"}`}
                            />
                          ))}
                        </div>
                        <div className="px-3 pb-3">
                          <Button
                            onClick={() => handleQuickAction("Fazer pedido")}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold h-11 rounded-xl"
                          >
                            Quero fazer o meu pedido
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                T
              </div>
              <div className="bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-2xl rounded-tl-md">
                <div className="flex gap-1">
                  <div
                    className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="shrink-0 bg-zinc-900 border-t border-zinc-800 p-4">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 rounded-xl h-12 text-[16px]"
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-zinc-700 text-white rounded-xl h-12 w-12"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </footer>
    </div>
  )
}

// Checkout Form Component
function CheckoutForm({
  onSubmit,
  photos,
  onPhotoUpload,
  fileInputRef,
  onRemovePhoto,
}: {
  onSubmit: (data: { name: string; email: string; cep: string; address: string }) => void
  photos: string[]
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  fileInputRef: React.RefObject<HTMLInputElement>
  onRemovePhoto: (index: number) => void
}) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [cep, setCep] = useState("")
  const [address, setAddress] = useState("")
  const [loadingCep, setLoadingCep] = useState(false)

  const handleCepChange = async (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    setCep(cleaned)
    if (cleaned.length === 8) {
      setLoadingCep(true)
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`)
        const data = await res.json()
        if (!data.erro) {
          setAddress(`${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`)
        }
      } catch (e) {
        console.error(e)
      }
      setLoadingCep(false)
    }
  }

  const isValid = name && email.includes("@") && cep.length === 8 && address

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 space-y-4">
      <div className="space-y-3">
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">Nome Completo</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
              className="bg-zinc-800 border-zinc-700 text-zinc-100 pl-10 h-11 rounded-lg text-[16px]"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-zinc-400 mb-1 block">E-mail</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="bg-zinc-800 border-zinc-700 text-zinc-100 pl-10 h-11 rounded-lg text-[16px]"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-zinc-400 mb-1 block">CEP</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              value={cep}
              onChange={(e) => handleCepChange(e.target.value)}
              placeholder="00000-000"
              maxLength={8}
              className="bg-zinc-800 border-zinc-700 text-zinc-100 pl-10 h-11 rounded-lg text-[16px]"
            />
            {loadingCep && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin" />
            )}
          </div>
        </div>

        {address && (
          <div className="bg-zinc-800 p-3 rounded-lg">
            <p className="text-xs text-zinc-400">Endereço encontrado:</p>
            <p className="text-sm text-zinc-200">{address}</p>
          </div>
        )}

        <div>
          <label className="text-xs text-zinc-400 mb-1 block">Fotos do Veículo (opcional)</label>
          <input
            ref={fileInputRef as any}
            type="file"
            accept="image/*"
            multiple
            onChange={onPhotoUpload}
            className="hidden"
          />
          <div className="grid grid-cols-5 gap-2">
            {photos.map((photo, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                <Image src={photo || "/placeholder.svg"} alt="" fill className="object-cover" />
                <button
                  onClick={() => onRemovePhoto(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
            {photos.length < 5 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-lg border-2 border-dashed border-zinc-600 flex items-center justify-center hover:border-blue-500 transition-colors"
              >
                <Camera className="w-5 h-5 text-zinc-500" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-700 pt-4 space-y-3">
        <div className="flex items-start gap-2 text-xs text-zinc-400">
          <Shield className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
          <p>
            Após o pagamento, nossa equipe entrará em contato em até 24h para obter mais detalhes e enviar fotos para
            sua aprovação.
          </p>
        </div>
        <div className="flex items-start gap-2 text-xs text-zinc-400">
          <Package className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
          <p>Entrega em 4-5 dias úteis. Todos os pedidos são rastreados.</p>
        </div>
      </div>

      <Button
        onClick={() => onSubmit({ name, email, cep, address })}
        disabled={!isValid}
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-zinc-700 text-white font-semibold h-12 rounded-xl shadow-lg shadow-blue-500/20"
      >
        <Lock className="w-4 h-4 mr-2" />
        Gerar PIX Seguro
      </Button>
    </div>
  )
}
