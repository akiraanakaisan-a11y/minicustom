"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, ChevronRight, Shield, Zap, Copy, Check, X, Minus, Plus, Clock, AlertCircle } from "lucide-react"

export default function FPVCarPage() {
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [cep, setCep] = useState("")
  const [address, setAddress] = useState<any>(null)
  const [addressNumber, setAddressNumber] = useState("")
  const [loadingCep, setLoadingCep] = useState(false)
  const [selectedColor, setSelectedColor] = useState("branco")
  const [quantity, setQuantity] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card">("pix")
  const [cardAttempts, setCardAttempts] = useState(0)
  const [processingCard, setProcessingCard] = useState(false)
  const [paymentData, setPaymentData] = useState<any>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "loading" | "pending" | "paid" | "failed">("idle")
  const [copied, setCopied] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60) // 24 hours in seconds
  const [isProcessing, setIsProcessing] = useState(false)
  const [cardName, setCardName] = useState("")
  const [cardCpf, setCardCpf] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvv, setCardCvv] = useState("")
  const [toast, setToast] = useState<{ message: string; type: "error" | "warning" | "success" } | null>(null)

  const FIXED_DOCUMENT = "48070248000155"
  const PRICE = 112.8
  const ORIGINAL_PRICE = 289.9
  const PRODUCT_NAME = "SNICLO 1:43 FPV RC Car CA51 - Carrinho de Corrida com Visão em Primeira Pessoa"

  const colors = [
    {
      name: "Branco",
      value: "branco",
      image: "https://ae-pic-a1.aliexpress-media.com/kf/S925b6fe518b34c1a806f09fb24ba6467r.jpg",
    },
    {
      name: "Cinza",
      value: "cinza",
      image: "https://ae-pic-a1.aliexpress-media.com/kf/S0b481b8f63db4820872f4d88a76ae9354.jpg",
    },
    {
      name: "Roxo",
      value: "roxo",
      image: "https://ae-pic-a1.aliexpress-media.com/kf/Sce3de7c549df4f0ca357ce7cdafcaee9W.jpg",
    },
  ]

  const images = [
    "https://ae-pic-a1.aliexpress-media.com/kf/S925b6fe518b34c1a806f09fb24ba6467r.jpg",
    "https://ae-pic-a1.aliexpress-media.com/kf/S0b481b8f63db4820872f4d88a76ae9354.jpg",
    "https://ae-pic-a1.aliexpress-media.com/kf/Sce3de7c549df4f0ca357ce7cdafcaee9W.jpg",
    "https://ae-pic-a1.aliexpress-media.com/kf/S21ded81d0ef7491d96d53aef774b3612x.jpg",
    "https://ae-pic-a1.aliexpress-media.com/kf/S548cc74c84bf480a90d2381bb6ba9c099.jpg",
    "https://ae-pic-a1.aliexpress-media.com/kf/S63df0bb3ef984fa2983424fd2c67127eX.jpg",
    "https://ae-pic-a1.aliexpress-media.com/kf/S1eb87a9c578449568efce1b588a47ab1W.jpg",
    "https://ae-pic-a1.aliexpress-media.com/kf/Sa68394a3a4ad4693a7719cd29bc52f12q.jpg",
    "https://ae-pic-a1.aliexpress-media.com/kf/S79cc07fd4bda49479400c5949bf0c34fm.jpg",
  ]

  const showToast = (message: string, type: "error" | "warning" | "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  const handleCepChange = async (value: string) => {
    const cleanCep = value.replace(/\D/g, "")
    if (cleanCep.length <= 8) {
      setCep(cleanCep)
      if (cleanCep.length === 8) {
        setLoadingCep(true)
        try {
          const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
          const data = await res.json()
          if (!data.erro) {
            setAddress({
              logradouro: data.logradouro,
              bairro: data.bairro,
              cidade: data.localidade,
              uf: data.uf,
            })
          } else {
            setAddress(null)
          }
        } catch {
          setAddress(null)
        }
        setLoadingCep(false)
      } else {
        setAddress(null)
        setAddressNumber("")
      }
    }
  }

  const handleCardPayment = () => {
    setProcessingCard(true)
    setCardAttempts((prev) => prev + 1)

    setTimeout(() => {
      setProcessingCard(false)
      if (cardAttempts < 1) {
        alert("⚠️ Erro no processamento do cartão. Tente novamente.")
      } else {
        alert(
          "❌ Não foi possível processar o pagamento com cartão. Por favor, tente via PIX para concluir sua compra.",
        )
        setPaymentMethod("pix")
      }
    }, 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    if (paymentMethod === "card") {
      if (!cardName || !cardCpf || !cardNumber || !cardExpiry || !cardCvv) {
        showToast("Por favor, preencha todos os dados do cartão", "error")
        setIsProcessing(false)
        return
      }

      // Simulate card payment failure (always fails twice)
      if (cardAttempts < 2) {
        setCardAttempts((prev) => prev + 1)
        setIsProcessing(false)
        showToast("❌ Pagamento recusado. Tente novamente ou use PIX.", "error")
        return
      } else {
        // After 2 attempts, suggest PIX
        showToast("⚠️ Após 2 tentativas com cartão, recomendamos usar PIX para pagamento instantâneo.", "warning")
        setPaymentMethod("pix")
        setIsProcessing(false)
        return
      }
    }

    if (!customerName || !customerEmail || !cep || !addressNumber) {
      showToast("Preencha todos os campos obrigatórios", "error")
      setIsProcessing(false)
      return
    }

    if (paymentMethod === "card") {
      handleCardPayment()
    } else {
      handlePixPayment()
    }
  }

  const handlePixPayment = () => {
    setShowPaymentModal(true)
    setPaymentStatus("loading")

    const totalPrice = PRICE * quantity

    console.log("[v0] Starting PIX payment with amount:", totalPrice)

    fetch("/api/orders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        size: "1:43 FPV",
        price: PRICE,
        total_price: totalPrice,
        quantity,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_document: FIXED_DOCUMENT,
        vehicle_model: `SNICLO CA51 FPV - ${selectedColor}`,
        vehicle_color: selectedColor,
        vehicle_name: PRODUCT_NAME,
        shipping_method: "Envio Rastreado",
        shipping_cep: cep,
        shipping_address: address
          ? `${address.logradouro}, ${addressNumber} - ${address.bairro}, ${address.cidade} - ${address.uf}`
          : "",
        payment_method: "pix",
      }),
    })
      .then((res) => {
        console.log("[v0] Order created, status:", res.status)
        return res.json()
      })
      .then((orderData) => {
        console.log("[v0] Order data:", orderData)
        return fetch("/api/create-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: totalPrice,
            description: PRODUCT_NAME,
            customerName,
            customerEmail,
            customerDocument: FIXED_DOCUMENT,
          }),
        })
      })
      .then((res) => {
        console.log("[v0] Payment API response status:", res.status)
        if (!res.ok) {
          throw new Error(`Payment API error: ${res.status}`)
        }
        return res.json()
      })
      .then((pixData) => {
        console.log("[v0] PIX data received:", pixData)

        if (!pixData || !pixData.qrcode || !pixData.qrcode_base64) {
          console.error("[v0] Invalid PIX data structure:", pixData)
          throw new Error("Invalid PIX data received")
        }

        const formattedPixData = {
          qr_code: `data:image/bmp;base64,${pixData.qrcode_base64}`,
          copy_paste: pixData.qrcode,
          id_transaction: pixData.id_transaction,
          transactionId: pixData.id_transaction,
        }

        setPaymentData(formattedPixData)
        setPaymentStatus("pending")
        setIsProcessing(false)

        // Start checking payment status
        const interval = setInterval(() => {
          fetch("/api/check-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transactionId: pixData.id_transaction }),
          })
            .then((res) => res.json())
            .then((data) => {
              console.log("[v0] Payment check response:", data)
              if (data?.status === "paid") {
                setPaymentStatus("paid")
                clearInterval(interval)
              }
            })
            .catch((error) => {
              console.error("[v0] Payment check error:", error)
            })
        }, 3000)

        // Stop checking after 10 minutes
        setTimeout(() => clearInterval(interval), 600000)
      })
      .catch((error) => {
        console.error("[v0] Payment error:", error)
        setPaymentStatus("failed")
        setIsProcessing(false)
        showToast("Erro ao gerar pagamento. Tente novamente.", "error")
      })
  }

  const copyPix = () => {
    if (paymentData?.qr_code) {
      navigator.clipboard.writeText(paymentData.copy_paste)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-md animate-in slide-in-from-top duration-300">
          <div
            className={`rounded-xl shadow-2xl p-4 flex items-start gap-3 ${
              toast.type === "error"
                ? "bg-red-50 border-2 border-red-200"
                : toast.type === "warning"
                  ? "bg-amber-50 border-2 border-amber-200"
                  : "bg-green-50 border-2 border-green-200"
            }`}
          >
            <AlertCircle
              className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                toast.type === "error" ? "text-red-600" : toast.type === "warning" ? "text-amber-600" : "text-green-600"
              }`}
            />
            <p
              className={`text-sm font-medium flex-1 ${
                toast.type === "error" ? "text-red-900" : toast.type === "warning" ? "text-amber-900" : "text-green-900"
              }`}
            >
              {toast.message}
            </p>
            <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-600 flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header - Optimized padding and font sizes for mobile */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-center">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            <span className="text-sm sm:text-base font-semibold text-slate-900">Compra Segura</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-6xl">
        {/* Product Section - Optimized spacing and sizing for mobile */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 mb-6 sm:mb-8">
          {/* Image Gallery with Navigation */}
          <div className="relative mb-4 sm:mb-6">
            <div className="aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 relative">
              <Image
                src={images[selectedImage] || "/placeholder.svg"}
                alt={`${PRODUCT_NAME} - Imagem ${selectedImage + 1}`}
                fill
                className="object-contain"
                priority
              />
              {/* Navigation Buttons - Smaller on mobile */}
              <button
                onClick={() => setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-1.5 sm:p-2 rounded-full shadow-lg transition-all"
                aria-label="Imagem anterior"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900" />
              </button>
              <button
                onClick={() => setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-1.5 sm:p-2 rounded-full shadow-lg transition-all"
                aria-label="Próxima imagem"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900" />
              </button>
              {/* Image Counter - Smaller text on mobile */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm">
                {selectedImage + 1} / {images.length}
              </div>
            </div>
          </div>

          {/* Product Title - Responsive font sizes */}
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-3 sm:mb-4 leading-tight">
            {PRODUCT_NAME}
          </h1>

          {/* Price Section - Optimized for mobile */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <span className="text-base sm:text-lg text-slate-500 line-through">
                R$ {ORIGINAL_PRICE.toFixed(2).replace(".", ",")}
              </span>
              <div className="flex items-center gap-1 bg-red-100 text-red-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-xs font-semibold">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-xs">{formatTime(timeLeft)}</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-bold text-green-600">
                R$ {PRICE.toFixed(2).replace(".", ",")}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 sm:mt-2">Oferta válida por 24 horas</p>
            <div className="flex items-center gap-1.5 sm:gap-2 text-green-700 mt-1.5 sm:mt-2">
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-semibold">Entrega em até 2 dias úteis</span>
            </div>
          </div>

          {/* Color Selection - Smaller cards on mobile */}
          <div className="mb-4 sm:mb-6">
            <Label className="text-xs sm:text-sm font-semibold text-slate-700 mb-2 sm:mb-3 block">Escolha a Cor:</Label>
            <div className="flex gap-2 sm:gap-3">
              {colors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all ${
                    selectedColor === color.value ? "border-green-600 shadow-lg scale-105" : "border-slate-200"
                  }`}
                >
                  <Image src={color.image || "/placeholder.svg"} alt={color.name} fill className="object-cover" />
                  {selectedColor === color.value && (
                    <div className="absolute inset-0 bg-green-600/20 flex items-center justify-center">
                      <Check className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-lg" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity - Optimized button sizes */}
          <div className="mb-4 sm:mb-6">
            <Label className="text-xs sm:text-sm font-semibold text-slate-700 mb-2 sm:mb-3 block">Quantidade:</Label>
            <div className="flex items-center gap-3 sm:gap-4">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-9 h-9 sm:w-10 sm:h-10"
              >
                <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
              <span className="text-lg sm:text-xl font-bold text-slate-900 w-10 sm:w-12 text-center">{quantity}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-9 h-9 sm:w-10 sm:h-10"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>

          {/* CTA Button - Responsive button size */}
          <Button
            onClick={() => document.getElementById("checkout-form")?.scrollIntoView({ behavior: "smooth" })}
            className="w-full h-12 sm:h-14 text-base sm:text-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold shadow-lg"
          >
            Comprar Agora
          </Button>
        </div>

        {/* Instagram Video - Increased height to show full video */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-4">Veja o Carrinho em Ação</h2>
            <div className="w-full flex justify-center">
              <blockquote
                className="instagram-media"
                data-instgrm-permalink="https://www.instagram.com/reel/DTIhnpuCuRU/?utm_source=ig_embed&utm_campaign=loading"
                data-instgrm-version="14"
                style={{
                  background: "#FFF",
                  border: 0,
                  borderRadius: "3px",
                  boxShadow: "0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)",
                  margin: "1px",
                  maxWidth: "540px",
                  minWidth: "326px",
                  padding: 0,
                  width: "99.375%",
                }}
              >
                <div style={{ padding: "16px" }}>
                  <a
                    href="https://www.instagram.com/reel/DTIhnpuCuRU/?utm_source=ig_embed&utm_campaign=loading"
                    style={{
                      background: "#FFFFFF",
                      lineHeight: 0,
                      padding: "0 0",
                      textAlign: "center",
                      textDecoration: "none",
                      width: "100%",
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver esta publicação no Instagram
                  </a>
                </div>
              </blockquote>
              <script async src="//www.instagram.com/embed.js"></script>
            </div>
          </div>
        </div>

        {/* Specifications - Optimized text sizes and spacing */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-4">Especificações Técnicas</h2>
            <div className="grid gap-2 sm:gap-4 text-xs sm:text-sm">
              <div className="flex justify-between py-1.5 sm:py-2 border-b border-slate-100">
                <span className="text-slate-600">Marca:</span>
                <span className="font-semibold text-slate-900">SNICLO</span>
              </div>
              <div className="flex justify-between py-1.5 sm:py-2 border-b border-slate-100">
                <span className="text-slate-600">Modelo:</span>
                <span className="font-semibold text-slate-900">CA51</span>
              </div>
              <div className="flex justify-between py-1.5 sm:py-2 border-b border-slate-100">
                <span className="text-slate-600">Escala:</span>
                <span className="font-semibold text-slate-900">1:43</span>
              </div>
              <div className="flex justify-between py-1.5 sm:py-2 border-b border-slate-100">
                <span className="text-slate-600">Tipo:</span>
                <span className="font-semibold text-slate-900">Carrinho RC com FPV</span>
              </div>
              <div className="flex justify-between py-1.5 sm:py-2 border-b border-slate-100">
                <span className="text-slate-600">Tração:</span>
                <span className="font-semibold text-slate-900">4 Rodas (AWD)</span>
              </div>
              <div className="flex justify-between py-1.5 sm:py-2 border-b border-slate-100">
                <span className="text-slate-600">Velocidade Máxima:</span>
                <span className="font-semibold text-slate-900">Alta Velocidade</span>
              </div>
              <div className="flex justify-between py-1.5 sm:py-2 border-b border-slate-100">
                <span className="text-slate-600">Bateria:</span>
                <span className="font-semibold text-slate-900">Recarregável</span>
              </div>
              <div className="flex justify-between py-1.5 sm:py-2 border-b border-slate-100">
                <span className="text-slate-600">Câmera FPV:</span>
                <span className="font-semibold text-slate-900">Sim (Visão em Primeira Pessoa)</span>
              </div>
              <div className="flex justify-between py-1.5 sm:py-2 border-b border-slate-100">
                <span className="text-slate-600">Controle Remoto:</span>
                <span className="font-semibold text-slate-900">Incluído</span>
              </div>
              <div className="flex justify-between py-1.5 sm:py-2 border-b border-slate-100">
                <span className="text-slate-600">Óculos FPV:</span>
                <span className="font-semibold text-slate-900">Incluído</span>
              </div>
              <div className="flex justify-between py-1.5 sm:py-2 border-b border-slate-100">
                <span className="text-slate-600">Material:</span>
                <span className="font-semibold text-slate-900">Plástico ABS de Alta Qualidade</span>
              </div>
              <div className="flex justify-between py-1.5 sm:py-2 border-b border-slate-100">
                <span className="text-slate-600">Função Drift:</span>
                <span className="font-semibold text-slate-900">Sim</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description Image - Removed aspect ratio and made image larger and readable */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-4">Descrição do Produto</h2>
            <div className="relative w-full rounded-lg sm:rounded-xl overflow-hidden bg-white">
              <Image
                src="https://ae01.alicdn.com/kf/S0f706a5b0ad542909436f1983a3bc977E.jpg"
                alt="Descrição do SNICLO CA51 FPV"
                width={2400}
                height={3200}
                className="w-full h-auto max-w-full"
                priority={false}
                quality={100}
              />
            </div>
          </div>
        </div>

        {/* Checkout Form - Fully optimized for mobile */}
        <div id="checkout-form" className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-4">Finalizar Pedido</h2>
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg space-y-4 sm:space-y-6"
          >
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <Label htmlFor="name" className="text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 sm:mb-2 block">
                  Nome Completo *
                </Label>
                <Input
                  id="name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  className="w-full text-sm sm:text-base h-10 sm:h-11"
                  placeholder="Seu nome completo"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 sm:mb-2 block">
                  E-mail *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  required
                  className="w-full text-sm sm:text-base h-10 sm:h-11"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="cep" className="text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 sm:mb-2 block">
                CEP de Entrega *
              </Label>
              <Input
                id="cep"
                value={cep}
                onChange={(e) => handleCepChange(e.target.value)}
                required
                maxLength={8}
                className="w-full text-sm sm:text-base h-10 sm:h-11"
                placeholder="00000000"
              />
              {loadingCep && <p className="text-xs text-slate-500 mt-1">Buscando endereço...</p>}
              {address && (
                <div className="mt-2 sm:mt-3 p-2.5 sm:p-3 bg-green-50 border border-green-200 rounded-lg space-y-1.5 sm:space-y-2">
                  <p className="text-xs sm:text-sm text-green-900">
                    <strong>Endereço:</strong> {address.logradouro}, {address.bairro}
                  </p>
                  <p className="text-xs sm:text-sm text-green-900">
                    <strong>Cidade:</strong> {address.cidade} - {address.uf}
                  </p>
                  <div className="mt-2 sm:mt-3">
                    <Label
                      htmlFor="addressNumber"
                      className="text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 sm:mb-2 block"
                    >
                      Número da Residência *
                    </Label>
                    <Input
                      id="addressNumber"
                      value={addressNumber}
                      onChange={(e) => setAddressNumber(e.target.value)}
                      required
                      className="w-full text-sm sm:text-base h-10 sm:h-11"
                      placeholder="Ex: 123"
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label className="text-xs sm:text-sm font-semibold text-slate-700 mb-2 sm:mb-3 block">
                Método de Pagamento *
              </Label>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("pix")}
                  className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all ${
                    paymentMethod === "pix"
                      ? "border-green-600 bg-green-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="text-sm sm:text-base font-semibold text-slate-900">PIX</div>
                  <div className="text-xs text-slate-600 mt-0.5 sm:mt-1">Pagamento instantâneo</div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all ${
                    paymentMethod === "card"
                      ? "border-green-600 bg-green-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="text-sm sm:text-base font-semibold text-slate-900">Cartão</div>
                  <div className="text-xs text-slate-600 mt-0.5 sm:mt-1">Crédito ou Débito</div>
                </button>
              </div>
              {cardAttempts > 0 && (
                <p className="text-xs text-amber-600 mt-2">
                  ⚠️ Tentativa {cardAttempts}/2 - Caso não funcione, tente via PIX
                </p>
              )}
            </div>

            {paymentMethod === "card" && (
              <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-blue-50 border-2 border-blue-200 rounded-lg sm:rounded-xl">
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-2 sm:mb-3">Dados do Cartão</h3>

                <div>
                  <Label
                    htmlFor="cardName"
                    className="text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 sm:mb-2 block"
                  >
                    Nome no Cartão *
                  </Label>
                  <Input
                    id="cardName"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value.toUpperCase())}
                    required={paymentMethod === "card"}
                    className="w-full text-sm sm:text-base h-10 sm:h-11"
                    placeholder="COMO ESTÁ NO CARTÃO"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="cardCpf"
                    className="text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 sm:mb-2 block"
                  >
                    CPF do Titular *
                  </Label>
                  <Input
                    id="cardCpf"
                    value={cardCpf}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "")
                      if (value.length <= 11) {
                        setCardCpf(value)
                      }
                    }}
                    required={paymentMethod === "card"}
                    maxLength={11}
                    className="w-full text-sm sm:text-base h-10 sm:h-11"
                    placeholder="000.000.000-00"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="cardNumber"
                    className="text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 sm:mb-2 block"
                  >
                    Número do Cartão *
                  </Label>
                  <Input
                    id="cardNumber"
                    value={cardNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "")
                      if (value.length <= 16) {
                        setCardNumber(value)
                      }
                    }}
                    required={paymentMethod === "card"}
                    maxLength={16}
                    className="w-full text-sm sm:text-base h-10 sm:h-11"
                    placeholder="0000 0000 0000 0000"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label
                      htmlFor="cardExpiry"
                      className="text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 sm:mb-2 block"
                    >
                      Validade *
                    </Label>
                    <Input
                      id="cardExpiry"
                      value={cardExpiry}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "")
                        if (value.length <= 4) {
                          let formatted = value
                          if (value.length >= 2) {
                            formatted = value.slice(0, 2) + "/" + value.slice(2)
                          }
                          setCardExpiry(formatted)
                        }
                      }}
                      required={paymentMethod === "card"}
                      maxLength={5}
                      className="w-full text-sm sm:text-base h-10 sm:h-11"
                      placeholder="MM/AA"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="cardCvv"
                      className="text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 sm:mb-2 block"
                    >
                      CVV *
                    </Label>
                    <Input
                      id="cardCvv"
                      value={cardCvv}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "")
                        if (value.length <= 3) {
                          setCardCvv(value)
                        }
                      }}
                      required={paymentMethod === "card"}
                      maxLength={3}
                      className="w-full text-sm sm:text-base h-10 sm:h-11"
                      placeholder="000"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="bg-slate-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-2 sm:mb-3">Resumo do Pedido</h3>
              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Produto:</span>
                  <span className="font-semibold text-slate-900 text-right">SNICLO CA51 FPV - {selectedColor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Quantidade:</span>
                  <span className="font-semibold text-slate-900">{quantity}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="font-semibold text-slate-900">
                    R$ {(PRICE * quantity).toFixed(2).replace(".", ",")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Frete:</span>
                  <span className="font-semibold text-green-600">GRÁTIS</span>
                </div>
                <div className="border-t pt-1.5 sm:pt-2 flex justify-between">
                  <span className="text-base sm:text-lg font-bold text-slate-900">Total:</span>
                  <span className="text-base sm:text-lg font-bold text-green-600">
                    R$ {(PRICE * quantity).toFixed(2).replace(".", ",")}
                  </span>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={processingCard || isProcessing}
              className="w-full h-12 sm:h-14 text-base sm:text-lg bg-green-600 hover:bg-green-700 text-white font-bold disabled:opacity-50"
            >
              {processingCard || isProcessing ? "Processando..." : "Ir para Pagamento"}
            </Button>

            <div className="flex items-center justify-center gap-3 sm:gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Pagamento Seguro</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Entrega Rastreada</span>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Payment Modal - Optimized for mobile */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {paymentStatus === "loading" && (
              <div className="text-center py-6 sm:py-8">
                <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-green-600 mx-auto mb-3 sm:mb-4"></div>
                <p className="text-sm sm:text-base text-slate-700 font-semibold">Gerando código PIX...</p>
              </div>
            )}

            {paymentStatus === "pending" && paymentData && (
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 text-center">Pague com PIX</h3>
                <p className="text-xs sm:text-sm text-slate-600 text-center">
                  Escaneie o QR Code ou copie o código para pagar
                </p>

                <div className="bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 border-slate-200">
                  {paymentData.qr_code && (
                    <Image
                      src={paymentData.qr_code || "/placeholder.svg"}
                      alt="QR Code PIX"
                      width={280}
                      height={280}
                      className="mx-auto w-full max-w-[280px]"
                    />
                  )}
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-xs sm:text-sm font-semibold text-slate-700">Código PIX Copia e Cola:</Label>
                  <div className="flex gap-2">
                    <Input value={paymentData.copy_paste || ""} readOnly className="font-mono text-xs flex-1" />
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={copyPix}
                      className="flex-shrink-0 bg-transparent"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 sm:p-3 text-center">
                  <p className="text-xs sm:text-sm text-blue-900">
                    <strong>Valor:</strong> R$ {(PRICE * quantity).toFixed(2).replace(".", ",")}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">Aguardando confirmação do pagamento...</p>
                </div>
              </div>
            )}

            {paymentStatus === "paid" && (
              <div className="text-center py-6 sm:py-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Check className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">Pagamento Confirmado!</h3>
                <p className="text-sm sm:text-base text-slate-600">
                  Seu pedido foi recebido e será processado em breve.
                </p>
              </div>
            )}

            {paymentStatus === "failed" && (
              <div className="text-center py-6 sm:py-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <X className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">Erro no Pagamento</h3>
                <p className="text-sm sm:text-base text-slate-600">
                  Ocorreu um erro ao processar seu pagamento. Tente novamente.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
