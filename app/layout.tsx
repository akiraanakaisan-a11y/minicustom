import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import Script from "next/script"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "MiniCustom - Miniaturas Personalizadas",
  description:
    "Transforme QUALQUER veículo em uma miniatura personalizada. +15.000 miniaturas entregues em todo Brasil.",
  generator: "v0.app",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "MiniCustom - Miniaturas Personalizadas",
    description:
      "Transforme QUALQUER veículo em uma miniatura personalizada. +15.000 miniaturas entregues em todo Brasil.",
    images: [
      {
        url: "/minicustom-logo.jpeg",
        width: 1200,
        height: 630,
        alt: "MiniCustom Miniaturas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MiniCustom - Miniaturas Personalizadas",
    description:
      "Transforme QUALQUER veículo em uma miniatura personalizada. +15.000 miniaturas entregues em todo Brasil.",
    images: ["/minicustom-logo.jpeg"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        <Script src="https://www.googletagmanager.com/gtag/js?id=AW-17772114307" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17772114307');
          `}
        </Script>
      </head>
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
        <script src="https://fast.wistia.com/assets/external/E-v1.js" async></script>
      </body>
    </html>
  )
}
