"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, X } from "lucide-react"

interface Notification {
  id: number
  name: string
  color: string
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
]

const colors = ["Branco", "Cinza", "Roxo"]

function maskLastName(lastName: string): string {
  return lastName.charAt(0) + "****"
}

function getRandomName(): string {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  return `${firstName} ${maskLastName(lastName)}`
}

function getRandomColor(): string {
  return colors[Math.floor(Math.random() * colors.length)]
}

export function FPVCarNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [nextId, setNextId] = useState(1)

  useEffect(() => {
    const showNotification = () => {
      const notification: Notification = {
        id: nextId,
        name: getRandomName(),
        color: getRandomColor(),
      }

      setNotifications((prev) => [...prev, notification])
      setNextId((prev) => prev + 1)

      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id))
      }, 5000)
    }

    const initialTimeout = setTimeout(showNotification, 20000)
    const interval = setInterval(showNotification, 20000)

    return () => {
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, [nextId])

  const handleClose = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="pointer-events-auto animate-in slide-in-from-right-full duration-300 bg-white border border-zinc-200 rounded-lg shadow-lg p-4 pr-10 min-w-[280px] max-w-[320px] relative"
        >
          <button
            onClick={() => handleClose(notification.id)}
            className="absolute top-2 right-2 text-zinc-400 hover:text-zinc-600 transition-colors"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-900 truncate">{notification.name}</p>
              <p className="text-xs text-zinc-600 mt-0.5">comprou o Carrinho FPV {notification.color}</p>
              <p className="text-xs text-zinc-400 mt-1">Agora há pouco</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
