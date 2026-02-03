"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronDown, Star, Shield, Truck, Package, Check, X, Upload, Car, Award, MessageCircle } from "lucide-react"

interface CartItem {
  id: string
  size: string
  price: number
  brand: string
  model: string
  name: string
  color: string
  description: string
  quantity: number
  vehiclePhotos?: string[]
}

export default function Home() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [selectedSize, setSelectedSize] = useState("")
  const [includeRemoteControl, setIncludeRemoteControl] = useState(false)
  const [brand, setBrand] = useState("")
  const [model, setModel] = useState("")
  const [vehicleName, setVehicleName] = useState("")
  const [color, setColor] = useState("")
  const [description, setDescription] = useState("")
  const [vehiclePhotos, setVehiclePhotos] = useState<string[]>([])
  const [currentStep, setCurrentStep] = useState(1)

  const orderRef = useRef<HTMLDivElement>(null)
  const videosRef = useRef<HTMLDivElement>(null)

  const scrollToOrder = () => orderRef.current?.scrollIntoView({ behavior: "smooth" })
  const scrollToVideos = () => videosRef.current?.scrollIntoView({ behavior: "smooth" })

  const sizes = [
    {
      name: "15cm",
      price: 106.8,
      remotePrice: 145.7,
      kiwifyLink: "https://pay.kiwify.com.br/oY8I2i5",
      kiwifyLinkRemote: "https://pay.kiwify.com.br/eSeTzrA",
    },
    {
      name: "25cm",
      price: 136.8,
      remotePrice: 175.7,
      kiwifyLink: "https://pay.kiwify.com.br/Z2udi3T",
      kiwifyLinkRemote: "https://pay.kiwify.com.br/gHgCbJp",
    },
    {
      name: "40cm",
      price: 146.8,
      remotePrice: 185.7,
      kiwifyLink: "https://pay.kiwify.com.br/vLojZjL",
      kiwifyLinkRemote: "https://pay.kiwify.com.br/AvF6xRl",
    },
  ]

  const toggleFaq = (index: number) => setExpandedFaq(expandedFaq === index ? null : index)

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newPhotos: string[] = []
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          newPhotos.push(reader.result as string)
          if (newPhotos.length === files.length) {
            setVehiclePhotos([...vehiclePhotos, ...newPhotos].slice(0, 5))
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removePhoto = (index: number) => setVehiclePhotos(vehiclePhotos.filter((_, i) => i !== index))

  const getCurrentPrice = () => {
    const sizeData = sizes.find((s) => s.name === selectedSize)
    if (!sizeData) return 0
    return includeRemoteControl ? sizeData.remotePrice : sizeData.price
  }

  const handleContinueToPay = () => {
    if (!selectedSize || !brand || !model || !vehicleName || !color) {
      alert("Por favor, preencha todas as informações obrigatórias.")
      return
    }

    const sizeData = sizes.find((s) => s.name === selectedSize)
    if (!sizeData) return

    const paymentLink = includeRemoteControl ? sizeData.kiwifyLinkRemote : sizeData.kiwifyLink
    window.location.href = paymentLink
  }

  const faqs = [
    { q: "Posso escolher qualquer carro?", a: "Sim! Trabalhamos com qualquer modelo de carro, moto ou caminhão." },
    { q: "Quanto tempo leva para produzir?", a: "Em média 4 a 5 dias úteis após a confirmação do pagamento." },
    { q: "Vocês entregam em todo Brasil?", a: "Sim, entregamos para todo o Brasil com frete grátis!" },
    {
      q: "Como funciona o controle remoto?",
      a: "O controle remoto permite movimentar a miniatura para frente e para trás.",
    },
  ]

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Header */}
      <header className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-10 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiHElaPTYwIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYyLjY4NiA2IDYtNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-10" />
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center justify-center mb-4">
            <img src="/minicustom-logo.jpeg" alt="MiniCustom Logo" className="h-16 w-auto object-contain" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 leading-tight">MiniCustom</h1>
          <p className="text-slate-200 text-base sm:text-lg mb-6 leading-relaxed max-w-md mx-auto">
            Transformamos seu veículo em uma miniatura personalizada de alta qualidade
          </p>
        </div>
      </header>

      {/* Trust Badges */}
      <section className="py-4 px-4 bg-gradient-to-b from-slate-50 to-white border-b">
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-500" />
              </div>
              <span className="text-xs font-semibold text-slate-900">+15.000</span>
              <span className="text-[10px] text-slate-500 leading-tight">Vendas</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-xs font-semibold text-slate-900">100%</span>
              <span className="text-[10px] text-slate-500 leading-tight">Garantia</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs font-semibold text-slate-900">Grátis</span>
              <span className="text-[10px] text-slate-500 leading-tight">Frete</span>
            </div>
          </div>
        </div>
      </section>

      {/* Hero */}
      <section className="py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 leading-tight">
              Crie Sua Miniatura Personalizada
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
              Envie fotos do seu carro, moto ou caminhão e receba uma réplica perfeita em miniatura, feita sob medida
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <Button
              onClick={scrollToOrder}
              size="lg"
              className="h-14 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg shadow-slate-900/20 text-base font-semibold"
            >
              <Package className="w-5 h-5 mr-2" />
              Fazer Pedido Agora
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => (window.location.href = "/loja")}
              className="h-14 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-base font-semibold"
            >
              <Car className="w-5 h-5 mr-2" />
              Ver Miniaturas Prontas
            </Button>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-slate-500 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>Entrega 4-5 dias úteis</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Pagamento seguro</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span>Qualidade premium</span>
            </div>
          </div>
        </div>
      </section>

      {/* Videos */}
      <section ref={videosRef} className="py-10 px-4 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-1.5 rounded-full text-xs font-semibold mb-3">
              <Award className="w-3.5 h-3.5" />
              Trabalhos Realizados
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Veja Nossas Criações</h3>
            <p className="text-slate-600 text-sm">Confira a qualidade e detalhes das miniaturas que já produzimos</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {["10bm5sqz1s", "z4r0qujqlj", "2a8r3sxijr", "9kyhaup0re", "w2b8f0y3pt"].map((videoId, i) => (
              <div
                key={i}
                className="aspect-[9/16] rounded-xl overflow-hidden bg-slate-900 shadow-lg ring-1 ring-slate-200"
              >
                <iframe
                  src={`https://fast.wistia.net/embed/iframe/${videoId}?videoFoam=true`}
                  className="w-full h-full"
                  allowFullScreen
                  allow="autoplay; fullscreen"
                  title={`Video ${i + 1}`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Order Form */}
      <section ref={orderRef} className="py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">Configure Seu Pedido</h3>
            <p className="text-slate-600 text-sm">
              Escolha o tamanho, preencha os dados do veículo e continue para o pagamento
            </p>
          </div>

          <div className="bg-white rounded-2xl border-2 border-slate-100 shadow-xl shadow-slate-900/5 overflow-hidden">
            <div className="p-5 sm:p-6 space-y-8">
              {/* Step 1: Size */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white text-sm font-bold flex items-center justify-center shadow-md">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-slate-900">Escolha o Tamanho</h4>
                    <p className="text-xs text-slate-500">Selecione a escala da miniatura</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {sizes.map((size) => (
                    <button
                      key={size.name}
                      onClick={() => {
                        setSelectedSize(size.name)
                        setCurrentStep(2)
                      }}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                        selectedSize === size.name
                          ? "border-slate-900 bg-slate-50 shadow-md ring-2 ring-slate-900/10"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-base text-slate-900">Miniatura {size.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">Escala detalhada • Alta qualidade</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-green-600">
                            R$ {(includeRemoteControl ? size.remotePrice : size.price).toFixed(2).replace(".", ",")}
                          </p>
                          <p className="text-xs text-slate-400">à vista</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {selectedSize && (
                  <label className="flex items-start gap-3 mt-4 p-4 bg-gradient-to-br from-blue-50 to-slate-50 border border-blue-100 rounded-xl cursor-pointer hover:from-blue-100/50 transition-all">
                    <input
                      type="checkbox"
                      checked={includeRemoteControl}
                      onChange={(e) => setIncludeRemoteControl(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300 mt-0.5"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900">Adicionar Controle Remoto</p>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Motor elétrico + bateria recarregável • Movimentos para frente e trás
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-green-600">
                        +R${" "}
                        {(
                          sizes.find((s) => s.name === selectedSize)!.remotePrice -
                          sizes.find((s) => s.name === selectedSize)!.price
                        )
                          .toFixed(2)
                          .replace(".", ",")}
                      </span>
                    </div>
                  </label>
                )}
              </div>

              {/* Step 2: Vehicle Info */}
              {selectedSize && currentStep >= 2 && (
                <div className="pt-6 border-t-2 border-slate-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white text-sm font-bold flex items-center justify-center shadow-md">
                      2
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-slate-900">Dados do Veículo</h4>
                      <p className="text-xs text-slate-500">Informações para personalização</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs font-semibold text-slate-700 mb-1.5">Marca *</Label>
                        <Input
                          value={brand}
                          onChange={(e) => setBrand(e.target.value)}
                          placeholder="Honda"
                          className="h-12 text-sm border-slate-200 focus:border-slate-400"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-slate-700 mb-1.5">Modelo *</Label>
                        <Input
                          value={model}
                          onChange={(e) => setModel(e.target.value)}
                          placeholder="Civic"
                          className="h-12 text-sm border-slate-200 focus:border-slate-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs font-semibold text-slate-700 mb-1.5">Nome/Apelido *</Label>
                        <Input
                          value={vehicleName}
                          onChange={(e) => setVehicleName(e.target.value)}
                          placeholder="Civic Preto"
                          className="h-12 text-sm border-slate-200 focus:border-slate-400"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-slate-700 mb-1.5">Cor Principal *</Label>
                        <Input
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          placeholder="Preto"
                          className="h-12 text-sm border-slate-200 focus:border-slate-400"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-slate-700 mb-1.5">Observações Especiais</Label>
                      <Input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Rodas especiais, adesivos, modificações..."
                        className="h-12 text-sm border-slate-200 focus:border-slate-400"
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-slate-700 mb-2">
                        Fotos do Veículo (até 5 fotos)
                      </Label>
                      <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-slate-400 transition-all bg-slate-50/30">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                          <Upload className="w-6 h-6 text-slate-400" />
                        </div>
                        <div className="text-center">
                          <span className="text-sm font-medium text-slate-700">Clique para enviar fotos</span>
                          <p className="text-xs text-slate-500 mt-1">PNG, JPG até 10MB cada</p>
                        </div>
                        <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
                      </label>

                      {vehiclePhotos.length > 0 && (
                        <div className="grid grid-cols-5 gap-2 mt-3">
                          {vehiclePhotos.map((photo, index) => (
                            <div key={index} className="relative aspect-square group">
                              <img
                                src={photo || "/placeholder.svg"}
                                alt={`Foto ${index + 1}`}
                                className="w-full h-full object-cover rounded-lg border-2 border-slate-200"
                              />
                              <button
                                onClick={() => removePhoto(index)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-4 border border-slate-200">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold text-slate-700">Miniatura {selectedSize}</span>
                          <span className="text-lg font-bold text-green-600">
                            R$ {getCurrentPrice().toFixed(2).replace(".", ",")}
                          </span>
                        </div>
                        {includeRemoteControl && (
                          <div className="text-xs text-slate-600">+ Controle Remoto (Motor + Bateria + Controle)</div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg border border-green-200 mt-3">
                          <Truck className="w-4 h-4" />
                          <span className="font-medium">Frete Grátis • Entrega em 4-5 dias úteis</span>
                        </div>
                      </div>

                      <Button
                        onClick={handleContinueToPay}
                        disabled={!brand || !model || !vehicleName || !color}
                        size="lg"
                        className="w-full h-14 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white text-base font-bold shadow-lg shadow-green-600/20"
                      >
                        <Check className="w-5 h-5 mr-2" />
                        Continuar para Pagamento
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-10 px-4 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Perguntas Frequentes</h3>
            <p className="text-sm text-slate-600">Tire suas dúvidas sobre nossas miniaturas</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white border-2 border-slate-100 rounded-xl overflow-hidden hover:border-slate-200 transition-colors"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-4 flex justify-between items-center text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm font-semibold text-slate-900 pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${
                      expandedFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedFaq === index && (
                  <div className="px-4 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-4">
            <h4 className="text-xl font-bold mb-2">MiniCustom</h4>
            <p className="text-sm text-slate-300">Miniaturas Personalizadas de Alta Qualidade</p>
          </div>
          <div className="flex justify-center gap-6 text-xs text-slate-400 mb-4">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Pagamento Seguro
            </span>
            <span className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5" />
              Frete Grátis
            </span>
            <span className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              Garantia Total
            </span>
          </div>
          <div className="pt-4 border-t border-slate-700">
            <p className="text-sm">© 2025 MiniCustom Miniaturas</p>
            <p className="text-xs text-slate-400 mt-1">Todos os direitos reservados • CNPJ 00.000.000/0000-00</p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Float Button */}
      <a
        href="https://wa.me/5511948636929?text=Olá,%20vim%20pelo%20site%20e%20gostaria%20de%20mais%20informações"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all z-50 animate-bounce"
      >
        <MessageCircle className="w-7 h-7" />
      </a>
    </div>
  )
}
