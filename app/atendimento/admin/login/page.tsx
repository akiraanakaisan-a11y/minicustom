"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Car, Lock, User } from "lucide-react"

const ADMIN_USERS = {
  devcode: { password: "makemoney2026", displayName: "Tainara" },
  zplan: { password: "makemoney2026", displayName: "Marcia" },
  dasilva: { password: "makemoney2026", displayName: "Giovanna" },
}

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const user = ADMIN_USERS[username as keyof typeof ADMIN_USERS]

    if (!user || user.password !== password) {
      setError("Usuário ou senha incorretos")
      setLoading(false)
      return
    }

    // Salvar sessão com timestamp
    const sessionData = {
      username,
      displayName: user.displayName,
      loginTime: Date.now(),
    }

    localStorage.setItem("admin_session", JSON.stringify(sessionData))

    setTimeout(() => {
      router.push("/atendimento/admin")
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background Pattern - Checkered Flag */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)`,
          }}
        />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500 rounded-2xl mb-4 shadow-2xl">
            <Car className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Painel Admin</h1>
          <p className="text-slate-400">MiniCustom - Sistema de Atendimento</p>
        </div>

        {/* Card de Login */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Campo Usuário */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Usuário</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                  placeholder="Digite seu usuário"
                  required
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                  placeholder="Digite sua senha"
                  required
                />
              </div>
            </div>

            {/* Mensagem de Erro */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Botão de Login */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-gradient-to-r from-yellow-500 via-red-500 to-blue-500 hover:from-yellow-600 hover:via-red-600 hover:to-blue-600 text-white font-semibold text-lg rounded-xl shadow-lg transition-all"
            >
              {loading ? "Entrando..." : "Entrar no Painel"}
            </Button>
          </form>

          {/* Info de Sessão */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-slate-400 text-center">🔒 Sessão expira automaticamente em 45 minutos</p>
          </div>
        </div>

        {/* Racing Stripes */}
        <div className="mt-8 flex justify-center gap-2">
          <div className="w-2 h-16 bg-red-500 rounded-full animate-pulse" />
          <div className="w-2 h-16 bg-yellow-500 rounded-full animate-pulse delay-75" />
          <div className="w-2 h-16 bg-blue-500 rounded-full animate-pulse delay-150" />
        </div>
      </div>
    </div>
  )
}
