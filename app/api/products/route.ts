import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase-server"

export async function GET() {
  try {
    const supabase = await createServerClient()

    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_available", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching products:", error)
      return NextResponse.json([])
    }

    return NextResponse.json(products || [])
  } catch (error) {
    console.error("[v0] Unexpected error:", error)
    return NextResponse.json([])
  }
}
