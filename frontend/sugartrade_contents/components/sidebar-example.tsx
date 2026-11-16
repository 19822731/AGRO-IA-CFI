"use client"

import { IntelligenceButton } from "./intelligence-button"
import { Building, BarChart4, FileText, DollarSign, Package, Warehouse, HelpCircle } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

// Este es un componente de ejemplo que muestra cómo integrar el botón personalizado
// Deberás adaptar esto a tu componente sidebar.tsx real
export function SidebarExample() {
  const pathname = usePathname()

  // Función para determinar si un enlace está activo
  const isActive = (path: string) => {
    return pathname?.includes(path)
  }

  // Estilo base para los enlaces de navegación
  const linkStyle = (path: string) => `
    group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors
    ${isActive(path) ? "bg-[#1a2040] text-white" : "text-sidebar-foreground hover:bg-[#1a2040] hover:text-white"}
  `

  return (
    <div className="flex h-full flex-col bg-[#0a0f29] text-white">
      <div className="flex h-14 items-center border-b border-[#1a2040] px-4">
        <h1 className="text-xl font-bold text-[#00a8ff]">Sugar Trade</h1>
      </div>

      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium">
          <Link href="/canje" className={linkStyle("/canje")}>
            <Building className="h-4 w-4" />
            <span>Canje</span>
          </Link>

          <Link href="/cobertura" className={linkStyle("/cobertura")}>
            <BarChart4 className="h-4 w-4" />
            <span>Cobertura</span>
          </Link>

          {/* Aquí usamos nuestro botón personalizado */}
          <IntelligenceButton />

          <Link href="/warrants" className={linkStyle("/warrants")}>
            <FileText className="h-4 w-4" />
            <span>Warrants</span>
          </Link>

          <Link href="/financiacion" className={linkStyle("/financiacion")}>
            <DollarSign className="h-4 w-4" />
            <span>Financiación</span>
          </Link>

          <Link href="/insumos" className={linkStyle("/insumos")}>
            <Package className="h-4 w-4" />
            <span>Insumos</span>
          </Link>

          <Link href="/almacenaje" className={linkStyle("/almacenaje")}>
            <Warehouse className="h-4 w-4" />
            <span>Almacenaje</span>
          </Link>
        </nav>
      </div>

      <div className="mt-auto border-t border-[#1a2040] px-2 py-2">
        <Link href="/guia-usuario" className={linkStyle("/guia-usuario")}>
          <HelpCircle className="h-4 w-4" />
          <span>Guía de usuario</span>
        </Link>
      </div>
    </div>
  )
}
