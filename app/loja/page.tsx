"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Car, Loader2 } from "lucide-react"

interface Product {
  id: string
  name: string
  slug: string
  price_1_43: number
  price_1_32: number
  price_1_24: number
  photo_1: string
}

export default function LojaPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

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

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Header */}
      <header className="bg-slate-900 text-white py-4 px-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            <span className="font-bold">MiniCustom</span>
          </Link>
          <Link href="/" className="text-xs bg-white text-slate-900 px-3 py-1.5 rounded-full font-medium">
            Monte a Sua
          </Link>
        </div>
      </header>

      {/* Title */}
      <section className="py-6 px-4 bg-slate-50 text-center">
        <h1 className="text-xl font-bold text-slate-900 mb-1">Miniaturas Prontas</h1>
        <p className="text-sm text-slate-600">Entrega imediata para todo Brasil</p>
      </section>

      {/* Products */}
      <main className="px-4 py-6">
        <div className="max-w-lg mx-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/loja/${product.slug}`}
                  className="bg-white rounded-lg border overflow-hidden active:scale-[0.98] transition-transform"
                >
                  <div className="aspect-square bg-slate-50 relative">
                    <Image
                      src={product.photo_1 || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-contain p-2"
                      sizes="50vw"
                    />
                    <span className="absolute top-1.5 left-1.5 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      -45%
                    </span>
                  </div>
                  <div className="p-2.5">
                    <h3 className="text-xs font-medium text-slate-900 line-clamp-2 min-h-[2rem] leading-tight mb-1.5">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-through">
                      R$ {(product.price_1_43 / 0.55).toFixed(2).replace(".", ",")}
                    </p>
                    <p className="text-sm font-bold text-green-600">
                      R$ {product.price_1_43.toFixed(2).replace(".", ",")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-4 text-center border-t">
        <p className="text-xs text-slate-500">© 2025 MiniCustom Miniaturas</p>
      </footer>
    </div>
  )
}
