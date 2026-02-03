import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { orderId, paymentStatus, pixTransactionId } = await request.json()

    console.log("[v0] Updating order payment:", { orderId, paymentStatus, pixTransactionId })

    const { data: order, error } = await supabase
      .from("orders")
      .update({
        payment_status: paymentStatus,
        pix_transaction_id: pixTransactionId,
        order_status: paymentStatus === "paid" ? "completed" : "processing",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select()
      .single()

    if (error) {
      console.error("[v0] Supabase error:", error)
      return NextResponse.json({ error: "Failed to update order", details: error.message }, { status: 500 })
    }

    console.log("[v0] Order updated successfully:", order)

    return NextResponse.json({ order }, { status: 200 })
  } catch (error: any) {
    console.error("[v0] Error updating order:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}
