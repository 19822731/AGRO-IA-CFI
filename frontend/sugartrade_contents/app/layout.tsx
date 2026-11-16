import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Sidebar from "@/components/sidebar"
import "./globals.css"

import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

// Modificar el título en el objeto metadata
export const metadata: Metadata = {
  title: "Agro-IA",
  description: "Aplicación web de inteligencia artificial para el sector agropecuario",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} dark`}>
        <div className="flex h-screen text-white">
          <Sidebar />
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
        <Toaster />
      </body>
    </html>
  )
}
