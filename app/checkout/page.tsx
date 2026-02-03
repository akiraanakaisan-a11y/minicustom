"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, Copy, X, ChevronLeft, Car, Plus } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const sizes = [
  { name: "15cm", scale: "1:43", price: 106.8, originalPrice: 156.8 },
  { name: "25cm", scale: "1:32", price: 136.8, originalPrice: 186.8 },
  { name: "40cm", scale: "1:24", price: 146.8, originalPrice: 196.8 },
]

const remoteControlPrice = 38.9

export default function CheckoutPage() {
  const [step, setStep] = useState(1)
  const [selectedSize, setSelectedSize] = useState("")
  const [includeRemoteControl, setIncludeRemoteControl] = useState(false)
  const [brand, setBrand] = useState("")
  const [model, setModel] = useState("")
  const [vehicleName, setVehicleName] = useState("")
  const [color, setColor] = useState("")
  const [description, setDescription] = useState("")
  const [vehiclePhotos, setVehiclePhotos] = useState<string[]>([])
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
  const [paymentData, setPaymentData] = useState<any>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "loading" | "pending" | "paid" | "failed">("idle")
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const statusCheckInterval = useRef<NodeJS.Timeout | null>(null)

  const selectedSizeData = sizes.find((s) => s.name === selectedSize)
  const totalPrice = selectedSizeData ? selectedSizeData.price + (includeRemoteControl ? remoteControlPrice : 0) : 0

  const fetchAddressByCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "")
    if (cleanCep.length !== 8) return
    setLoadingCep(true)
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      const data = await response.json()
      if (!data.erro) {
        setShippingStreet(data.logradouro || "")
        setShippingNeighborhood(data.bairro || "")
        setShippingCity(data.localidade || "")
        setShippingState(data.uf || "")
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error)
    } finally {
      setLoadingCep(false)
    }
  }

  const handleCepChange = (value: string) => {
    const cleanCep = value.replace(/\D/g, "")
    const formattedCep = cleanCep.replace(/^(\d{5})(\d)/, "$1-$2")
    setShippingCep(formattedCep)
    if (cleanCep.length === 8) {
      fetchAddressByCep(cleanCep)
    }
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const remainingSlots = 5 - vehiclePhotos.length
    const filesToProcess = Array.from(files).slice(0, remainingSlots)
    filesToProcess.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setVehiclePhotos((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removePhoto = (index: number) => {
    setVehiclePhotos(vehiclePhotos.filter((_, i) => i !== index))
  }

  const canProceedToStep2 = selectedSize !== ""
  const canProceedToStep3 = brand && model && vehicleName && color
  const canProceedToStep4 = customerName && customerEmail && customerDocument
  const canFinish =
    shippingCep && shippingStreet && shippingNumber && shippingNeighborhood && shippingCity && shippingState

  const handlePixPayment = async () => {
    if (!selectedSizeData) return
    setShowPaymentModal(true)
    setPaymentStatus("loading")

    try {
      const orderResponse = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          size: selectedSizeData.scale,
          price: selectedSizeData.price,
          include_remote_control: includeRemoteControl,
          remote_control_price: includeRemoteControl ? remoteControlPrice : 0,
          total_price: totalPrice,
          quantity: 1,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_document: customerDocument,
          vehicle_brand: brand,
          vehicle_model: model,
          vehicle_name: vehicleName,
          vehicle_color: color,
          vehicle_description: description,
          photos_count: vehiclePhotos.length,
          payment_method: "pix",
          shipping_cep: shippingCep,
          shipping_street: shippingStreet,
          shipping_number: shippingNumber,
          shipping_complement: shippingComplement,
          shipping_neighborhood: shippingNeighborhood,
          shipping_city: shippingCity,
          shipping_state: shippingState,
          shipping_method: "Frete Grátis",
        }),
      })

      if (!orderResponse.ok) throw new Error("Erro ao criar pedido")
      const { order } = await orderResponse.json()

      const paymentResponse = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalPrice,
          description: `Miniatura ${selectedSize} - ${brand} ${model}${includeRemoteControl ? " + Controle Remoto" : ""}`,
          customerName,
          customerEmail,
          customerDocument,
        }),
      })

      if (!paymentResponse.ok) throw new Error("Erro ao criar pagamento")
      const pixData = await paymentResponse.json()

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

      statusCheckInterval.current = setInterval(async () => {
        try {
          const statusResponse = await fetch("/api/check-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transactionId: pixData.id_transaction || pixData.id }),
          })
          const status = await statusResponse.json()
          if (status.paid || status.status === "paid") {
            setPaymentStatus("paid")
            await fetch("/api/orders/update-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: order.id,
                paymentStatus: "paid",
                pixTransactionId: pixData.id_transaction || pixData.id,
              }),
            })
            if (statusCheckInterval.current) clearInterval(statusCheckInterval.current)
          }
        } catch (error) {
          console.error("Status check error:", error)
        }
      }, 3000)

      setTimeout(() => {
        if (statusCheckInterval.current) clearInterval(statusCheckInterval.current)
      }, 600000)
    } catch (error) {
      console.error("Payment error:", error)
      setPaymentStatus("failed")
    }
  }

  const copyPix = () => {
    const code = paymentData?.qrcode || paymentData?.pixCopiaECola
    if (code) {
      navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/loja" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm">Voltar</span>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            <span className="text-base font-semibold">MiniCustom</span>
          </Link>
          <div className="w-16"></div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center gap-2 max-w-md mx-auto">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 4 && <div className={`w-8 h-0.5 ${step > s ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>
      </div>

      <main className="container mx-auto px-4 py-4 pb-8 max-w-lg">
        {/* Step 1: Size Selection */}
        {step === 1 && (
          <Card>
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold mb-4">Escolha o Tamanho</h2>
              <div className="space-y-3">
                {sizes.map((size) => (
                  <button
                    key={size.name}
                    onClick={() => setSelectedSize(size.name)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      selectedSize === size.name
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{size.name}</p>
                        <p className="text-xs text-muted-foreground">Escala {size.scale}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">R$ {size.price.toFixed(2).replace(".", ",")}</p>
                        <p className="text-xs text-muted-foreground line-through">
                          R$ {size.originalPrice.toFixed(2).replace(".", ",")}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Remote Control Option */}
              <div className="mt-4 p-4 rounded-lg border bg-muted/30">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeRemoteControl}
                    onChange={(e) => setIncludeRemoteControl(e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Adicionar Controle Remoto</p>
                    <p className="text-xs text-muted-foreground">
                      + R$ {remoteControlPrice.toFixed(2).replace(".", ",")}
                    </p>
                  </div>
                </label>
              </div>

              {selectedSize && (
                <div className="mt-4 p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total:</span>
                    <span className="text-xl font-bold">R$ {totalPrice.toFixed(2).replace(".", ",")}</span>
                  </div>
                </div>
              )}

              <Button onClick={() => setStep(2)} disabled={!canProceedToStep2} className="w-full mt-4 h-12">
                Continuar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Vehicle Info */}
        {step === 2 && (
          <Card>
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold mb-4">Dados do Veículo</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm">Marca *</Label>
                    <Input
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="Ex: Toyota"
                      className="h-11"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Modelo *</Label>
                    <Input
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="Ex: Corolla"
                      className="h-11"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm">Nome do Veículo *</Label>
                  <Input
                    value={vehicleName}
                    onChange={(e) => setVehicleName(e.target.value)}
                    placeholder="Ex: Corolla XRS 2024"
                    className="h-11"
                  />
                </div>
                <div>
                  <Label className="text-sm">Cor *</Label>
                  <Input
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="Ex: Preto Metálico"
                    className="h-11"
                  />
                </div>
                <div>
                  <Label className="text-sm">Descrição (opcional)</Label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detalhes adicionais..."
                    className="w-full h-20 px-3 py-2 text-sm rounded-lg border bg-background resize-none"
                  />
                </div>

                {/* Photo Upload */}
                <div>
                  <Label className="text-sm">Fotos do Veículo (até 5)</Label>
                  <div className="mt-2 grid grid-cols-5 gap-2">
                    {vehiclePhotos.map((photo, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                        <Image
                          src={photo || "/placeholder.svg"}
                          alt={`Foto ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {vehiclePhotos.length < 5 && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center hover:border-primary/50 transition-colors"
                      >
                        <Plus className="w-5 h-5 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-11">
                  Voltar
                </Button>
                <Button onClick={() => setStep(3)} disabled={!canProceedToStep3} className="flex-1 h-11">
                  Continuar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Customer Info */}
        {step === 3 && (
          <Card>
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold mb-4">Seus Dados</h2>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm">Nome Completo *</Label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="h-11"
                  />
                </div>
                <div>
                  <Label className="text-sm">E-mail *</Label>
                  <Input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="h-11"
                  />
                </div>
                <div>
                  <Label className="text-sm">CPF/CNPJ *</Label>
                  <Input
                    value={customerDocument}
                    onChange={(e) => setCustomerDocument(e.target.value)}
                    placeholder="000.000.000-00"
                    className="h-11"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-11">
                  Voltar
                </Button>
                <Button onClick={() => setStep(4)} disabled={!canProceedToStep4} className="flex-1 h-11">
                  Continuar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Shipping */}
        {step === 4 && (
          <Card>
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold mb-4">Endereço de Entrega</h2>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm">CEP *</Label>
                  <Input
                    value={shippingCep}
                    onChange={(e) => handleCepChange(e.target.value)}
                    placeholder="00000-000"
                    className="h-11"
                    maxLength={9}
                  />
                  {loadingCep && <p className="text-xs text-muted-foreground mt-1">Buscando endereço...</p>}
                </div>
                <div>
                  <Label className="text-sm">Rua *</Label>
                  <Input
                    value={shippingStreet}
                    onChange={(e) => setShippingStreet(e.target.value)}
                    placeholder="Nome da rua"
                    className="h-11"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-sm">Número *</Label>
                    <Input
                      value={shippingNumber}
                      onChange={(e) => setShippingNumber(e.target.value)}
                      placeholder="123"
                      className="h-11"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm">Complemento</Label>
                    <Input
                      value={shippingComplement}
                      onChange={(e) => setShippingComplement(e.target.value)}
                      placeholder="Apto, Bloco..."
                      className="h-11"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm">Bairro *</Label>
                  <Input
                    value={shippingNeighborhood}
                    onChange={(e) => setShippingNeighborhood(e.target.value)}
                    placeholder="Nome do bairro"
                    className="h-11"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <Label className="text-sm">Cidade *</Label>
                    <Input
                      value={shippingCity}
                      onChange={(e) => setShippingCity(e.target.value)}
                      placeholder="Cidade"
                      className="h-11"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">UF *</Label>
                    <Input
                      value={shippingState}
                      onChange={(e) => setShippingState(e.target.value)}
                      placeholder="SP"
                      className="h-11"
                      maxLength={2}
                    />
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="mt-6 p-4 rounded-lg bg-muted/50 space-y-2">
                <h3 className="font-medium text-sm">Resumo do Pedido</h3>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Miniatura {selectedSize}</span>
                    <span>R$ {selectedSizeData?.price.toFixed(2).replace(".", ",")}</span>
                  </div>
                  {includeRemoteControl && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Controle Remoto</span>
                      <span>R$ {remoteControlPrice.toFixed(2).replace(".", ",")}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frete</span>
                    <span className="text-green-600">Grátis</span>
                  </div>
                  <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>R$ {totalPrice.toFixed(2).replace(".", ",")}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setStep(3)} className="flex-1 h-11">
                  Voltar
                </Button>
                <Button onClick={handlePixPayment} disabled={!canFinish} className="flex-1 h-11">
                  Pagar com PIX
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm">
            <CardContent className="p-5 relative">
              <button
                onClick={() => {
                  setShowPaymentModal(false)
                  setPaymentStatus("idle")
                  if (statusCheckInterval.current) clearInterval(statusCheckInterval.current)
                }}
                className="absolute top-3 right-3 text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>

              {paymentStatus === "loading" && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
                  <p className="text-sm text-muted-foreground">Gerando PIX...</p>
                </div>
              )}

              {paymentStatus === "pending" && paymentData && (
                <div className="text-center space-y-4">
                  <h3 className="text-lg font-semibold">Pague com PIX</h3>
                  <p className="text-xl font-bold">R$ {totalPrice.toFixed(2).replace(".", ",")}</p>
                  {(paymentData.qrcode_base64 || paymentData.qrcodeBase64) && (
                    <div className="bg-white p-4 rounded-lg border mx-auto w-fit">
                      <img
                        src={`data:image/png;base64,${paymentData.qrcode_base64 || paymentData.qrcodeBase64}`}
                        alt="QR Code PIX"
                        className="w-40 h-40 object-contain"
                      />
                    </div>
                  )}
                  <Button onClick={copyPix} variant="outline" className="w-full h-11 bg-transparent">
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? "Copiado!" : "Copiar código PIX"}
                  </Button>
                  <div className="bg-muted/50 rounded-lg p-3 text-left text-xs space-y-1">
                    <p className="font-medium">Como pagar:</p>
                    <ol className="list-decimal list-inside text-muted-foreground space-y-0.5">
                      <li>Abra o app do seu banco</li>
                      <li>Escolha pagar com PIX</li>
                      <li>Escaneie ou cole o código</li>
                      <li>Confirme o pagamento</li>
                    </ol>
                  </div>
                  <p className="text-xs text-muted-foreground">Aguardando pagamento...</p>
                </div>
              )}

              {paymentStatus === "paid" && (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-green-600 mb-1">Pagamento Confirmado!</h3>
                  <p className="text-sm text-muted-foreground mb-4">Seu pedido foi recebido com sucesso.</p>
                  <Button onClick={() => (window.location.href = "/loja")} className="w-full">
                    Voltar para Loja
                  </Button>
                </div>
              )}

              {paymentStatus === "failed" && (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <X className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-red-600 mb-1">Erro no Pagamento</h3>
                  <p className="text-sm text-muted-foreground mb-4">Ocorreu um erro. Tente novamente.</p>
                  <Button onClick={() => setShowPaymentModal(false)} variant="outline" className="w-full">
                    Tentar Novamente
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
