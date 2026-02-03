"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X, Check, Shield, Upload, Loader2, Lock, Zap } from "lucide-react"
import Image from "next/image"

export default function Checkout25cmSemControle() {
  const [sentViaWhatsapp, setSentViaWhatsapp] = useState<boolean | null>(null)
  const [vehicleModel, setVehicleModel] = useState("")
  const [vehicleColor, setVehicleColor] = useState("")
  const [customizationDetails, setCustomizationDetails] = useState("")
  const [vehiclePhotos, setVehiclePhotos] = useState<File[]>([])
  const [photosPreviews, setPhotosPreviews] = useState<string[]>([])
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [cep, setCep] = useState("")
  const [address, setAddress] = useState<{
    logradouro: string
    bairro: string
    cidade: string
    uf: string
  } | null>(null)
  const [loadingCep, setLoadingCep] = useState(false)
  const [paymentData, setPaymentData] = useState<any>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "loading" | "pending" | "paid" | "failed">("idle")
  const [copied, setCopied] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [hasProvidedDetails, setHasProvidedDetails] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const FIXED_DOCUMENT = "48070248000155"
  const PRICE = 136.8
  const DESCRIPTION = "Miniatura 25cm Sem Controle"
  const SIZE = "25cm"

  useEffect(() => {
    setHasProvidedDetails(sentViaWhatsapp !== null && (sentViaWhatsapp || (vehicleModel && vehicleColor)))
  }, [sentViaWhatsapp, vehicleModel, vehicleColor])

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
      }
    }
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + vehiclePhotos.length > 5) {
      alert("Máximo de 5 fotos permitidas")
      return
    }

    const newPhotos = [...vehiclePhotos, ...files].slice(0, 5)
    setVehiclePhotos(newPhotos)
    setPhotosPreviews(newPhotos.map((file) => URL.createObjectURL(file)))
  }

  const removePhoto = (index: number) => {
    const newPhotos = vehiclePhotos.filter((_, i) => i !== index)
    const newPreviews = photosPreviews.filter((_, i) => i !== index)
    setVehiclePhotos(newPhotos)
    setPhotosPreviews(newPreviews)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (sentViaWhatsapp === null) {
      alert("Por favor, indique se já enviou os detalhes pelo WhatsApp")
      return
    }
    if (!sentViaWhatsapp && (!vehicleModel || !vehicleColor)) {
      alert("Preencha os dados do veículo")
      return
    }
    if (!customerName || !customerEmail || !cep) {
      alert("Preencha todos os campos obrigatórios")
      return
    }
    handlePixPayment()
  }

  const handlePayment = () => {
    if (!hasProvidedDetails) {
      alert("Por favor, forneça os detalhes do veículo")
      return
    }
    handlePixPayment()
  }

  const handlePixPayment = () => {
    setShowPaymentModal(true)
    setPaymentStatus("loading")
    setIsProcessing(true)

    fetch("/api/tribopay/create-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: PRICE,
        description: DESCRIPTION,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_document: FIXED_DOCUMENT,
        order_data: {
          product_size: SIZE,
          has_remote: "false",
          vehicle_model: vehicleModel,
          vehicle_color: vehicleColor,
          customization_details: customizationDetails,
        },
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPaymentData({
            qr_code: `data:image/png;base64,${data.qrcode}`,
            copy_paste: data.qrcode_text,
            transaction_hash: data.transaction_hash,
          })
          setPaymentStatus("pending")
          setIsProcessing(false)
          startPaymentPolling(data.transaction_hash)
        } else {
          throw new Error("Failed to create payment")
        }
      })
      .catch(() => {
        setPaymentStatus("failed")
        setIsProcessing(false)
        alert("Erro ao processar pedido. Tente novamente.")
      })
  }

  const startPaymentPolling = (transactionHash: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/tribopay/check-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transaction_hash: transactionHash }),
        })
        const data = await res.json()
        
        if (data.paid) {
          setPaymentStatus("paid")
          clearInterval(interval)
        }
      } catch (error) {
        console.error("[v0] Error checking payment:", error)
      }
    }, 5000)

    setTimeout(() => clearInterval(interval), 600000)
  }

  const copyPix = () => {
    if (paymentData?.copy_paste) {
      navigator.clipboard.writeText(paymentData.copy_paste)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatCep = (value: string) => {
    if (value.length <= 5) return value
    return `${value.slice(0, 5)}-${value.slice(5)}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-slate-900">Seguro</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">{DESCRIPTION}</h1>
              <p className="text-sm text-slate-500">Miniatura personalizada do seu veículo</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">R$ {PRICE.toFixed(2).replace(".", ",")}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-slate-600">Réplica fiel do seu veículo</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-slate-600">Acabamento premium</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-slate-600">Embalagem especial</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-slate-600">Garantia de qualidade</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* WhatsApp confirmation section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-amber-600 text-xs font-bold">1</span>
              </div>
              Detalhes do Veículo
            </h2>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-3 block">
                  Você já descreveu os detalhes do seu veículo pelo WhatsApp? *
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSentViaWhatsapp(true)}
                    className={`h-12 rounded-xl border-2 font-medium transition-all ${
                      sentViaWhatsapp === true
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {sentViaWhatsapp === true && <Check className="w-4 h-4 inline mr-2" />}
                    Sim, já enviei
                  </button>
                  <button
                    type="button"
                    onClick={() => setSentViaWhatsapp(false)}
                    className={`h-12 rounded-xl border-2 font-medium transition-all ${
                      sentViaWhatsapp === false
                        ? "border-amber-500 bg-amber-50 text-amber-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {sentViaWhatsapp === false && <Check className="w-4 h-4 inline mr-2" />}
                    Não, vou preencher
                  </button>
                </div>
              </div>

              {sentViaWhatsapp === false && (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Modelo do Veículo *</Label>
                    <Input
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      className="mt-1 h-12 bg-slate-50 border-slate-200 focus:bg-white"
                      placeholder=""
                      required={sentViaWhatsapp === false}
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-slate-700">Cor do Veículo *</Label>
                    <Input
                      value={vehicleColor}
                      onChange={(e) => setVehicleColor(e.target.value)}
                      className="mt-1 h-12 bg-slate-50 border-slate-200 focus:bg-white"
                      placeholder=""
                      required={sentViaWhatsapp === false}
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-slate-700">Detalhes da Personalização</Label>
                    <Textarea
                      value={customizationDetails}
                      onChange={(e) => setCustomizationDetails(e.target.value)}
                      className="mt-1 min-h-[100px] bg-slate-50 border-slate-200 focus:bg-white resize-none"
                      placeholder=""
                    />
                    <p className="text-xs text-slate-400 mt-1">Descreva detalhes especiais que deseja na miniatura</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-slate-700">Fotos do Veículo</Label>
                    <p className="text-xs text-slate-400 mb-2">Envie até 5 fotos para referência (opcional)</p>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />

                    <div className="grid grid-cols-5 gap-2">
                      {photosPreviews.map((preview, index) => (
                        <div
                          key={index}
                          className="relative aspect-square rounded-lg overflow-hidden border border-slate-200"
                        >
                          <Image
                            src={preview || "/placeholder.svg"}
                            alt={`Foto ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                          >
                            <X className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      ))}

                      {vehiclePhotos.length < 5 && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="aspect-square rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center hover:border-amber-500 hover:bg-amber-50 transition-colors"
                        >
                          <Upload className="w-5 h-5 text-slate-400" />
                          <span className="text-xs text-slate-400 mt-1">Adicionar</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {sentViaWhatsapp === true && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Ótimo!</p>
                      <p className="text-sm text-green-700">Vamos usar os detalhes que você já enviou pelo WhatsApp.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-amber-600 text-xs font-bold">2</span>
              </div>
              Seus Dados e Endereço
            </h2>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-slate-700">Nome Completo *</Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="mt-1 h-12 bg-slate-50 border-slate-200 focus:bg-white"
                  placeholder=""
                  required
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700">Email *</Label>
                <Input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="mt-1 h-12 bg-slate-50 border-slate-200 focus:bg-white"
                  placeholder=""
                  required
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700">CEP *</Label>
                <Input
                  value={formatCep(cep)}
                  onChange={(e) => handleCepChange(e.target.value)}
                  className="mt-1 h-12 bg-slate-50 border-slate-200 focus:bg-white"
                  placeholder=""
                  required
                />
                {loadingCep && (
                  <div className="mt-2 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                    <span className="text-sm text-slate-600">Buscando endereço...</span>
                  </div>
                )}
                {address && (
                  <div className="mt-2">
                    <p className="text-sm text-slate-600">
                      {`${address.logradouro}, ${address.bairro}, ${address.cidade} - ${address.uf}`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-amber-600 text-xs font-bold">3</span>
              </div>
              Resumo do Pedido e Entrega
            </h2>
            <div className="flex items-center gap-3 text-sm text-slate-600 bg-amber-50 rounded-lg p-4">
              <Zap className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-900">Entrega em até 7 dias úteis</p>
                <p className="text-xs text-slate-500 mt-0.5">Após confirmação do pagamento</p>
              </div>
            </div>
          </div>

          <Button
            onClick={handlePayment}
            disabled={isProcessing || !hasProvidedDetails}
            className="w-full h-14 text-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Processando...
              </>
            ) : (
              "Ir para pagamento"
            )}
          </Button>

          <div className="flex items-center justify-center gap-4 pt-2">
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Shield className="w-4 h-4" />
              <span>Pagamento Seguro</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Lock className="w-4 h-4" />
              <span>Dados Protegidos</span>
            </div>
          </div>
        </form>
      </main>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Lock className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className="font-bold text-slate-900">Pagamento Seguro</h3>
                </div>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                >
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </div>

              {paymentStatus === "loading" && (
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-green-500" />
                  <p className="text-slate-600">Gerando código PIX...</p>
                </div>
              )}

              {paymentStatus === "pending" && paymentData && (
                <div className="text-center">
                  <div className="bg-slate-100 rounded-xl p-4 mb-4">
                    <p className="text-sm text-slate-500 mb-1">Valor a pagar</p>
                    <p className="text-3xl font-bold text-slate-900">R$ {PRICE.toFixed(2).replace(".", ",")}</p>
                  </div>

                  {paymentData.qrcode_base64 && (
                    <div className="bg-white border-2 border-slate-200 rounded-xl p-4 mb-4 inline-block">
                      <img
                        src={`data:image/png;base64,${paymentData.qrcode_base64}`}
                        alt="QR Code PIX"
                        className="w-48 h-48 mx-auto"
                      />
                    </div>
                  )}

                  <Button
                    onClick={copyPix}
                    variant="outline"
                    className="w-full h-12 text-sm mb-6 border-2 border-green-500 text-green-600 hover:bg-green-50 bg-transparent"
                  >
                    {copied ? "Código Copiado!" : "Copiar Código PIX"}
                  </Button>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left mb-4">
                    <p className="font-semibold text-blue-900 mb-3">Como pagar:</p>
                    <ol className="space-y-2 text-sm text-blue-800">
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                          1
                        </span>
                        <span>Abra o aplicativo do seu banco</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                          2
                        </span>
                        <span>Escolha pagar com PIX</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                          3
                        </span>
                        <span>Escaneie o QR Code ou cole o código</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                          4
                        </span>
                        <span>Confirme o pagamento</span>
                      </li>
                    </ol>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-sm text-slate-500 bg-slate-50 rounded-xl py-3">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Aguardando confirmação do pagamento...</span>
                  </div>
                </div>
              )}

              {paymentStatus === "paid" && (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-10 h-10 text-green-600" />
                  </div>
                  <h4 className="text-xl font-bold text-green-600 mb-2">Pagamento Confirmado!</h4>
                  <p className="text-slate-600 mb-4">Seu pedido foi recebido com sucesso.</p>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-left text-sm text-green-800">
                    <p className="font-semibold mb-2">Próximos passos:</p>
                    <ul className="space-y-1">
                      <li>• Nossa equipe entrará em contato em até 24h</li>
                      <li>• Você receberá fotos para aprovação</li>
                      <li>• Envio em 7 dias úteis após aprovação</li>
                    </ul>
                  </div>
                </div>
              )}

              {paymentStatus === "failed" && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-8 h-8 text-red-600" />
                  </div>
                  <h4 className="font-bold text-red-600 mb-2">Erro no Pagamento</h4>
                  <p className="text-sm text-slate-600 mb-4">
                    Não foi possível processar o pagamento. Tente novamente.
                  </p>
                  <Button
                    onClick={() => {
                      setShowPaymentModal(false)
                      setPaymentStatus("idle")
                    }}
                    className="w-full h-12 bg-slate-900 hover:bg-slate-800"
                  >
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
