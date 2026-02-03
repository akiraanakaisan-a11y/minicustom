"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { CheckCircle2, X } from "lucide-react"

interface Notification {
  id: number
  name: string
  size: number
}

const firstNames = [
  "João",
  "Maria",
  "Pedro",
  "Ana",
  "Carlos",
  "Juliana",
  "Lucas",
  "Fernanda",
  "Rafael",
  "Beatriz",
  "Felipe",
  "Camila",
  "Gustavo",
  "Amanda",
  "Bruno",
  "Mariana",
  "Diego",
  "Letícia",
  "Rodrigo",
  "Gabriela",
  "Thiago",
  "Larissa",
  "Matheus",
  "Isabela",
  "Vinicius",
  "Carla",
  "Daniel",
  "Renata",
  "André",
  "Patrícia",
  "Marcelo",
  "Aline",
  "Fabio",
  "Priscila",
  "Leonardo",
  "Vanessa",
]

const lastNames = [
  "Silva",
  "Santos",
  "Oliveira",
  "Souza",
  "Costa",
  "Ferreira",
  "Rodrigues",
  "Almeida",
  "Nascimento",
  "Lima",
  "Araújo",
  "Fernandes",
  "Carvalho",
  "Gomes",
  "Martins",
  "Rocha",
  "Ribeiro",
  "Alves",
  "Pereira",
  "Monteiro",
  "Mendes",
  "Barros",
  "Freitas",
  "Barbosa",
  "Pinto",
  "Moura",
  "Cardoso",
  "Correia",
]

function maskLastName(lastName: string): string {
  return lastName.charAt(0) + "****"
}

function getRandomName(): string {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  return `${firstName} ${maskLastName(lastName)}`
}

function getRandomSize(): number {
  const sizes = [25, 40]
  return sizes[Math.floor(Math.random() * sizes.length)]
}

function getRandomDelay(): number {
  return Math.floor(Math.random() * (35000 - 25000 + 1)) + 25000
}

export function SocialProofNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [nextId, setNextId] = useState(1)
  const pathname = usePathname()

  useEffect(() => {
    if (pathname === "/SNICLOCA511/43FPV") {
      return
    }

    const showNotification = () => {
      const notification: Notification = {
        id: nextId,
        name: getRandomName(),
        size: getRandomSize(),
      }

      setNotifications((prev) => [...prev, notification])
      setNextId((prev) => prev + 1)

      // Remove notification after 5 seconds
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id))
      }, 5000)
    }

    // Show first notification after initial delay
    const initialTimeout = setTimeout(showNotification, getRandomDelay())

    // Set up recurring notifications
    const interval = setInterval(() => {
      showNotification()
    }, getRandomDelay())

    return () => {
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, [nextId, pathname])

  const handleClose = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="pointer-events-auto animate-in slide-in-from-right-full duration-300 bg-white border border-zinc-200 rounded-lg shadow-lg p-3 pr-9 min-w-[240px] max-w-[280px] relative"
        >
          <button
            onClick={() => handleClose(notification.id)}
            className="absolute top-2 right-2 text-zinc-400 hover:text-zinc-600 transition-colors"
            aria-label="Fechar"
          >
            <X className="h-3.5 w-3.5" />
          </button>

          <div className="flex items-start gap-2.5">
            <div className="flex-shrink-0 mt-0.5">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-900 truncate">{notification.name}</p>
              <p className="text-[11px] text-zinc-600 mt-0.5 leading-tight">
                efetuou a compra da miniatura de {notification.size}cm
              </p>
              <p className="text-[10px] text-zinc-400 mt-1">Agora há pouco</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
