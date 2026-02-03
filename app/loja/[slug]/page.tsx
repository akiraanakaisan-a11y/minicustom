"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Car, X, Check, Copy, ChevronLeft, Loader2, Truck } from "lucide-react"

interface Product {
  id: string
  name: string
  slug: string
  price_1_43: number
  price_1_32: number
  price_1_24: number
  photo_1: string
  photo_2: string | null
  photo_3: string | null
}

export default function ProductPage() {
  const params = useParams()
  const slug = params.slug as string
  const router = useRouter()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState("")
  const [includeRemote, setIncludeRemote] = useState(false)
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerDocument, setCustomerDocument] = useState("")
  const [shippingCep, setShippingCep] = useState("")
  const [shippingStreet, setShippingStreet] = useState("")
  const [shippingNumber, setShippingNumber] = useState("")
  const [shippingComplement, setShippingComplement] = useState("")
  const [shippingNeighborhood, setShippingNeighborhood] = useState("")
  const [shippingCity, setShippingCity] = useState("")
  const [shippingState, setShippingState] = useState("")
  const [loadingCep, setLoadingCep] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card">("pix")
  const [cardName, setCardName] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvv, setCardCvv] = useState("")
  const [cardAttempts, setCardAttempts] = useState(0)
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "loading" | "pending" | "paid" | "error">("idle")
  const [paymentData, setPaymentData] = useState<any>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showPixSuggestion, setShowPixSuggestion] = useState(false)
  const [paymentError, setPaymentError] = useState("")
  const [copied, setCopied] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState(0)
  const [step, setStep] = useState(1)

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setProduct(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [slug])

  const handleCepChange = async (value: string) => {
    const clean = value.replace(/\D/g, "")
    setShippingCep(clean)
    if (clean.length === 8) {
      setLoadingCep(true)
      try {
        const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
        const data = await res.json()
        if (!data.erro) {
          setShippingStreet(data.logradouro || "")
          setShippingNeighborhood(data.bairro || "")
          setShippingCity(data.localidade || "")
          setShippingState(data.uf || "")
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoadingCep(false)
      }
    }
  }

  const getPrice = () => {
    if (!product || !selectedSize) return 0
    if (selectedSize === "15cm") return product.price_1_43
    if (selectedSize === "25cm") return product.price_1_32
    return product.price_1_24
  }

  const getTotal = () => getPrice() + (includeRemote ? 38.9 : 0)

  const sizes = [
    { name: "15cm", scale: "1:43", price: product?.price_1_43 || 0 },
    { name: "25cm", scale: "1:32", price: product?.price_1_32 || 0 },
    { name: "40cm", scale: "1:24", price: product?.price_1_24 || 0 },
  ]

  const handlePayment = async () => {
    setShowPaymentModal(true)
    setPaymentStatus("loading")

    try {
      const orderRes = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          size: selectedSize,
          price: getPrice(),
          include_remote_control: includeRemote,
          remote_control_price: includeRemote ? 38.9 : 0,
          total_price: getTotal(),
          quantity: 1,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_document: customerDocument,
          vehicle_brand: product?.name.split(" ")[0] || "",
          vehicle_model: product?.name || "",
          vehicle_name: product?.name || "",
          vehicle_color: "",
          vehicle_description: `Produto pronto: ${product?.name}`,
          photos_count: 0,
          shipping_cep: shippingCep,
          shipping_street: shippingStreet,
          shipping_number: shippingNumber,
          shipping_complement: shippingComplement,
          shipping_neighborhood: shippingNeighborhood,
          shipping_city: shippingCity,
          shipping_state: shippingState,
          shipping_method: "Frete Grátis",
          payment_method: paymentMethod,
          ...(paymentMethod === "card" && {
            card_holder_name: cardName,
            card_number: cardNumber,
            card_expiry: cardExpiry,
            card_cvv: cardCvv,
            card_attempts: cardAttempts + 1,
          }),
        }),
      })

      if (!orderRes.ok) throw new Error("Erro ao criar pedido")
      const { order } = await orderRes.json()

      if (paymentMethod === "card") {
        setTimeout(() => {
          setCardAttempts((prev) => prev + 1)
          setPaymentStatus("error")
          setPaymentError("Pagamento recusado. Verifique os dados do cartão.")
          if (cardAttempts + 1 >= 2) setShowPixSuggestion(true)
        }, 2000)
      } else {
        const pixRes = await fetch("/api/create-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: getTotal(),
            description: `Miniatura ${product?.name} - ${selectedSize}`,
            customerName,
            customerEmail,
            customerDocument,
          }),
        })

        if (!pixRes.ok) throw new Error("Erro ao criar pagamento")
        const pixData = await pixRes.json()

        await fetch("/api/orders/update-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: order.id,
            paymentStatus: "pending",
            pixTransactionId: pixData.id_transaction || pixData.id,
          }),
        })

        setPaymentData(pixData)
        setPaymentStatus("pending")

        const interval = setInterval(async () => {
          try {
            const checkRes = await fetch("/api/check-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ transactionId: pixData.id_transaction || pixData.id }),
            })
            const checkData = await checkRes.json()
            if (checkData?.status === "paid") {
              setPaymentStatus("paid")
              clearInterval(interval)
            }
          } catch (e) {
            console.error(e)
          }
        }, 3000)

        setTimeout(() => clearInterval(interval), 600000)
      }
    } catch (e) {
      console.error(e)
      setPaymentStatus("error")
      setPaymentError("Erro ao processar pagamento")
    }
  }

  const copyPix = () => {
    if (paymentData?.qrcode) {
      navigator.clipboard.writeText(paymentData.qrcode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
        <p className="text-lg font-medium mb-4">Produto não encontrado</p>
        <Button onClick={() => router.push("/loja")} className="h-10 text-sm">
          Voltar para a loja
        </Button>
      </div>
    )
  }

  const photos = [product.photo_1, product.photo_2, product.photo_3].filter(Boolean) as string[]

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Header */}
      <header className="bg-slate-900 text-white py-3 px-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link href="/loja" className="flex items-center gap-1 text-sm">
            <ChevronLeft className="w-4 h-4" />
            Voltar
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            <span className="font-bold">MiniCustom</span>
          </Link>
          <div className="w-14" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Product Images */}
        <div className="mb-6">
          <div className="aspect-square bg-slate-50 rounded-lg overflow-hidden mb-3">
            <Image
              src={photos[selectedPhoto] || "/placeholder.svg"}
              alt={product.name}
              width={400}
              height={400}
              className="w-full h-full object-contain p-4"
            />
          </div>
          {photos.length > 1 && (
            <div className="flex gap-2 justify-center">
              {photos.map((photo, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedPhoto(i)}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedPhoto === i ? "border-slate-900" : "border-slate-200"
                  }`}
                >
                  <Image
                    src={photo || "/placeholder.svg"}
                    alt=""
                    width={56}
                    height={56}
                    className="w-full h-full object-contain bg-slate-50 p-1"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="mb-6">
          <h1 className="text-lg font-bold text-slate-900 mb-1">{product.name}</h1>
          <p className="text-sm text-slate-500 mb-3">Miniatura pronta para entrega</p>
          <div className="flex items-center gap-2 text-xs text-green-600">
            <Truck className="w-4 h-4" />
            Frete Grátis para todo Brasil
          </div>
        </div>

        {/* Checkout Form */}
        <div className="bg-slate-50 rounded-xl p-4 space-y-5">
          {/* Step 1: Size */}
          <div>
            <p className="font-semibold text-sm mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center">
                1
              </span>
              Tamanho
            </p>
            <div className="space-y-2">
              {sizes.map((size) => (
                <button
                  key={size.name}
                  onClick={() => {
                    setSelectedSize(size.name)
                    setStep(2)
                  }}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                    selectedSize === size.name ? "border-slate-900 bg-white" : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-sm">{size.name}</p>
                      <p className="text-xs text-slate-500">Escala {size.scale}</p>
                    </div>
                    <p className="font-bold text-green-600 text-sm">
                      R$ {(size.price + (includeRemote ? 38.9 : 0)).toFixed(2).replace(".", ",")}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {selectedSize && (
              <label className="flex items-center gap-3 mt-3 p-3 bg-white rounded-lg border cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeRemote}
                  onChange={(e) => setIncludeRemote(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">+ Controle Remoto</p>
                  <p className="text-xs text-slate-500">Motor + bateria recarregável</p>
                </div>
                <span className="text-sm font-bold text-green-600">+R$ 38,90</span>
              </label>
            )}
          </div>

          {/* Step 2: Customer Data */}
          {selectedSize && step >= 2 && (
            <div className="pt-4 border-t">
              <p className="font-semibold text-sm mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center">
                  2
                </span>
                Seus Dados
              </p>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Nome Completo *</Label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Seu nome"
                    className="h-10 text-sm bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Email *</Label>
                    <Input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="email@exemplo.com"
                      className="h-10 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">CPF/CNPJ *</Label>
                    <Input
                      value={customerDocument}
                      onChange={(e) => setCustomerDocument(e.target.value.replace(/\D/g, ""))}
                      placeholder="00000000000"
                      className="h-10 text-sm bg-white"
                      maxLength={14}
                    />
                  </div>
                </div>
                {customerName && customerEmail && customerDocument && step === 2 && (
                  <Button onClick={() => setStep(3)} className="w-full h-10 text-sm">
                    Continuar
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Address */}
          {step >= 3 && (
            <div className="pt-4 border-t">
              <p className="font-semibold text-sm mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center">
                  3
                </span>
                Endereço de Entrega
              </p>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">CEP *</Label>
                  <div className="relative">
                    <Input
                      value={shippingCep}
                      onChange={(e) => handleCepChange(e.target.value)}
                      placeholder="00000000"
                      className="h-10 text-sm bg-white"
                      maxLength={8}
                    />
                    {loadingCep && <Loader2 className="absolute right-3 top-2.5 w-4 h-4 animate-spin text-slate-400" />}
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Rua *</Label>
                  <Input
                    value={shippingStreet}
                    onChange={(e) => setShippingStreet(e.target.value)}
                    className="h-10 text-sm bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Número *</Label>
                    <Input
                      value={shippingNumber}
                      onChange={(e) => setShippingNumber(e.target.value)}
                      className="h-10 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Complemento</Label>
                    <Input
                      value={shippingComplement}
                      onChange={(e) => setShippingComplement(e.target.value)}
                      className="h-10 text-sm bg-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Bairro *</Label>
                    <Input
                      value={shippingNeighborhood}
                      onChange={(e) => setShippingNeighborhood(e.target.value)}
                      className="h-10 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Cidade *</Label>
                    <Input
                      value={shippingCity}
                      onChange={(e) => setShippingCity(e.target.value)}
                      className="h-10 text-sm bg-white"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Estado *</Label>
                  <Input
                    value={shippingState}
                    onChange={(e) => setShippingState(e.target.value)}
                    className="h-10 text-sm bg-white"
                    maxLength={2}
                  />
                </div>
                {shippingCep && shippingStreet && shippingNumber && shippingCity && step === 3 && (
                  <Button onClick={() => setStep(4)} className="w-full h-10 text-sm">
                    Continuar para Pagamento
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Payment */}
          {step >= 4 && (
            <div className="pt-4 border-t">
              <p className="font-semibold text-sm mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center">
                  4
                </span>
                Pagamento
              </p>

              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setPaymentMethod("pix")}
                  className={`flex-1 p-3 rounded-lg border-2 text-sm transition-all ${
                    paymentMethod === "pix" ? "border-slate-900 bg-white" : "border-slate-200 bg-white"
                  }`}
                >
                  PIX
                </button>
                <button
                  onClick={() => setPaymentMethod("card")}
                  className={`flex-1 p-3 rounded-lg border-2 text-sm transition-all ${
                    paymentMethod === "card" ? "border-slate-900 bg-white" : "border-slate-200 bg-white"
                  }`}
                >
                  Cartão
                </button>
              </div>

              {paymentMethod === "card" && (
                <div className="space-y-3 mb-4">
                  <div>
                    <Label className="text-xs">Nome no Cartão</Label>
                    <Input
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="h-10 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Número do Cartão</Label>
                    <Input
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="h-10 text-sm bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Validade</Label>
                      <Input
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/AA"
                        className="h-10 text-sm bg-white"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">CVV</Label>
                      <Input
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="h-10 text-sm bg-white"
                        maxLength={4}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-slate-900 text-white p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total:</span>
                  <span className="text-xl font-bold">R$ {getTotal().toFixed(2).replace(".", ",")}</span>
                </div>
              </div>

              <Button
                onClick={handlePayment}
                className="w-full h-12 text-sm font-semibold bg-green-600 hover:bg-green-700"
              >
                {paymentMethod === "pix" ? "Pagar com PIX" : "Pagar com Cartão"}
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">Pagamento</h3>
                <button onClick={() => setShowPaymentModal(false)} className="p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {paymentStatus === "loading" && (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-slate-400" />
                  <p className="text-sm text-slate-600">Processando...</p>
                </div>
              )}

              {paymentStatus === "pending" && paymentData && (
                <div className="text-center">
                  <p className="text-sm text-slate-600 mb-4">Escaneie o QR Code ou copie o código:</p>

                  {paymentData.qrcode_base64 && (
                    <div className="flex justify-center mb-4">
                      <img
                        src={`data:image/png;base64,${paymentData.qrcode_base64}`}
                        alt="QR Code PIX"
                        className="w-48 h-48 object-contain"
                      />
                    </div>
                  )}

                  <div className="bg-slate-50 p-3 rounded-lg mb-4">
                    <p className="text-xs text-slate-500 mb-2">Código PIX:</p>
                    <p className="text-xs break-all bg-white p-2 rounded border max-h-20 overflow-y-auto">
                      {paymentData.qrcode}
                    </p>
                  </div>

                  <Button onClick={copyPix} variant="outline" className="w-full h-10 text-sm mb-4 bg-transparent">
                    <Copy className="w-4 h-4 mr-2" />
                    {copied ? "Copiado!" : "Copiar Código"}
                  </Button>

                  <div className="text-left bg-blue-50 p-3 rounded-lg text-xs">
                    <p className="font-semibold mb-2">Como pagar:</p>
                    <ol className="space-y-1 text-slate-600">
                      <li>1. Abra o app do seu banco</li>
                      <li>2. Escolha pagar com PIX</li>
                      <li>3. Escaneie o QR ou cole o código</li>
                      <li>4. Confirme o pagamento</li>
                    </ol>
                  </div>

                  <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-500">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Aguardando pagamento...
                  </div>
                </div>
              )}

              {paymentStatus === "paid" && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="font-bold text-green-600 mb-2">Pagamento Confirmado!</h4>
                  <p className="text-sm text-slate-600">Seu pedido foi recebido.</p>
                </div>
              )}

              {paymentStatus === "error" && (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <X className="w-6 h-6 text-red-600" />
                  </div>
                  <p className="text-sm text-red-600 mb-4">{paymentError}</p>

                  {showPixSuggestion && (
                    <div className="bg-green-50 p-3 rounded-lg mb-4">
                      <p className="text-sm text-green-800 font-medium">Tente pagar com PIX!</p>
                      <Button
                        onClick={() => {
                          setPaymentMethod("pix")
                          setShowPaymentModal(false)
                          setShowPixSuggestion(false)
                        }}
                        className="mt-2 bg-green-600 hover:bg-green-700 text-sm h-9"
                      >
                        Pagar com PIX
                      </Button>
                    </div>
                  )}

                  <Button onClick={() => setShowPaymentModal(false)} variant="outline" className="w-full h-10 text-sm">
                    Tentar Novamente
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
