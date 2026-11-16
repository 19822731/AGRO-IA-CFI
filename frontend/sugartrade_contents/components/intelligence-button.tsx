"use client"

import { Sparkles } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function IntelligenceButton() {
  const pathname = usePathname()
  const isActive = pathname?.includes("/utilidades/inteligencia-comercial")

  return (
    <Link
      href="/utilidades/inteligencia-comercial"
      className={`
        group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors
        relative overflow-hidden
        ${
          isActive
            ? "bg-gradient-to-r from-[#0a84ff]/20 to-[#00a8ff]/5 text-[#00a8ff]"
            : "text-[#00a8ff] hover:bg-[#1a2040] hover:text-[#00a8ff]"
        }
      `}
    >
      {/* Efecto de brillo en el fondo */}
      {isActive && <div className="absolute inset-0 bg-gradient-to-r from-[#0a84ff]/10 to-transparent animate-pulse" />}

      <div className="flex items-center justify-center w-5 h-5">
        <Sparkles className="h-[18px] w-[18px]" />
      </div>

      <span className="flex-1">Inteligencia Comercial - IA</span>

      {/* Indicador de IA */}
      <div className="bg-[#0a84ff]/20 text-[#00a8ff] text-xs px-1.5 py-0.5 rounded-sm flex items-center">
        <Sparkles className="h-3 w-3 mr-1" />
        IA
      </div>
    </Link>
  )
}
