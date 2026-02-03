import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase-server"

export async function GET(request: Request, context: { params: { slug: string } | Promise<{ slug: string }> }) {
  try {
    const resolvedParams = context.params instanceof Promise ? await context.params : context.params
    const { slug } = resolvedParams

    console.log("[v0] Fetching product with slug:", slug)

    const supabase = await createServerClient()

    const { data: product, error } = await supabase.from("products").select("*").eq("slug", slug).single()

    if (error) {
      console.error("[v0] Product not found:", error)
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    console.log("[v0] Product found:", product?.name)
    return NextResponse.json(product)
  } catch (error) {
    console.error("[v0] Error fetching product:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
