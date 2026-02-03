"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase-client"
import Image from "next/image"

interface Product {
  id: string
  name: string
  slug: string
  price_1_43: number
  price_1_32: number
  price_1_24: number
  photo_1: string
}

export default function WhatsAppPage() {
  const [sessionId, setSessionId] = useState<string>("")
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const phoneNumber = "554731706046"
  const message =
    "Olá, como funciona? Gostaria de saber valores, prazo de entrega e formas de pagamento. Vocês fazem miniaturas de qualquer veículo?"

  const getUtmParams = () => {
    if (typeof window === "undefined") return {}
    const searchParams = new URLSearchParams(window.location.search)
    return {
      utm_source: searchParams.get("utm_source"),
      utm_medium: searchParams.get("utm_medium"),
      utm_campaign: searchParams.get("utm_campaign"),
      utm_term: searchParams.get("utm_term"),
      utm_content: searchParams.get("utm_content"),
    }
  }

  const trackEvent = async (eventType: string) => {
    try {
      const supabase = createClient()
      const utmParams = getUtmParams()

      const eventData = {
        event_type: eventType,
        referrer: typeof window !== "undefined" ? document.referrer : null,
        ...utmParams,
        user_agent: typeof window !== "undefined" ? navigator.userAgent : null,
        screen_width: typeof window !== "undefined" ? window.screen.width : null,
        screen_height: typeof window !== "undefined" ? window.screen.height : null,
        session_id: sessionId,
      }

      const { error } = await supabase.from("whatsapp_page_events").insert([eventData])

      if (error) {
        console.error("[v0] Error tracking event:", error)
      }
    } catch (error) {
      console.error("[v0] Error in trackEvent:", error)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products")
      const data = await response.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching products:", error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`
    setSessionId(newSessionId)

    trackEvent("page_view")
    fetchProducts()
  }, [])

  const handleWhatsAppClick = () => {
    trackEvent("whatsapp_button_click")

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 px-4 py-8">
      <div className="flex flex-col items-center justify-center mb-8 space-y-4">
        <p className="text-center text-slate-200 text-sm sm:text-base px-4 leading-relaxed">
          Para mais informações clique no botão "Iniciar Conversa no WhatsApp".
          <br />
          Atendimento feito pelo WhatsApp.
        </p>

        <Button
          onClick={handleWhatsAppClick}
          className="h-14 px-8 text-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl shadow-2xl shadow-green-500/30 transform hover:scale-105 transition-all duration-300 font-semibold group"
        >
          <MessageCircle className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
          Iniciar Conversa no WhatsApp
        </Button>
      </div>

      <div className="max-w-md mx-auto">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {products.map((product) => (
              <button
                key={product.id}
                onClick={handleWhatsAppClick}
                className="bg-white rounded-lg overflow-hidden active:scale-95 transition-transform"
              >
                <div className="aspect-square bg-slate-50 relative">
                  <Image
                    src={product.photo_1 || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-contain p-1"
                    sizes="33vw"
                  />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
