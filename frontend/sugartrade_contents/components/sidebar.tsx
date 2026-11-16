"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Briefcase,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Package,
  Shield,
  FileText,
  DollarSign,
  Box,
  Warehouse,
  Truck,
  Umbrella,
  Building,
  Globe,
  Info,
  Sparkles,
  LogOut,
  LogIn,
  Eye,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "@/hooks/use-auth"

// Definiciones de los elementos de la barra lateral con descripciones
interface MenuItem {
  id: string
  label: string
  icon: JSX.Element
  href: string
  description: string
  highlight?: boolean
}

const menuItems: { main: MenuItem[]; utilities: MenuItem[] } = {
  main: [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <BarChart3 className="h-5 w-5" />,
      href: "/dashboard",
      description:
        "Panel principal con resumen de precios, tendencias del mercado y estadísticas clave del comercio de azúcar.",
    },
    {
      id: "portafolio",
      label: "Portafolio",
      icon: <Briefcase className="h-5 w-5" />,
      href: "/portafolio",
      description:
        "Gestione sus inversiones, contratos y posiciones en el mercado de azúcar. Visualice rendimiento y balance.",
    },
    {
      id: "operar",
      label: "Operar",
      icon: <TrendingUp className="h-5 w-5" />,
      href: "/operar",
      description:
        "Ejecute operaciones de compra y venta de azúcar, establezca órdenes y acceda al mercado en tiempo real.",
    },
    {
      id: "mundo-campo",
      label: "Mundo Agro",
      icon: <Globe className="h-5 w-5" />,
      href: "/mundo-campo",
      description:
        "Noticias, tendencias y análisis del sector agropecuario con enfoque en la producción de azúcar y derivados.",
    },
    {
      id: "inteligencia-comercial",
      label: "Inteligencia Comercial - AI",
      icon: <Sparkles className="h-5 w-5" />,
      href: "/dashboard/inteligencia/zafra",
      description:
        "Análisis competitivo del mercado mundial de azúcar y herramientas de inteligencia comercial impulsadas por IA.",
      highlight: true,
    },
    {
      id: "visor-cana",
      label: "( Visor-Caña )",
      icon: <Eye className="h-5 w-5" />,
      href: "/visor-cana",
      description:
        "Diagnóstico inteligente de fitopatologías en campo con modelos de visión avanzados.",
      highlight: true,
    },
  ],
  utilities: [
    {
      id: "canje",
      label: "Canje",
      icon: <Package className="h-5 w-5" />,
      href: "/utilidades/canje",
      description:
        "Gestione operaciones de intercambio de productos por insumos o servicios sin utilizar dinero en efectivo.",
    },
    {
      id: "cobertura",
      label: "Cobertura",
      icon: <Shield className="h-5 w-5" />,
      href: "/utilidades/cobertura",
      description:
        "Herramientas para proteger sus operaciones contra la volatilidad de precios mediante contratos de futuros y opciones.",
    },
    {
      id: "warrants",
      label: "Warrants",
      icon: <FileText className="h-5 w-5" />,
      href: "/utilidades/warrants",
      description:
        "Gestione certificados de depósito que le permiten utilizar mercadería almacenada como garantía para financiamiento.",
    },
    {
      id: "financiacion",
      label: "Financiación",
      icon: <DollarSign className="h-5 w-5" />,
      href: "/utilidades/financiacion",
      description:
        "Acceda a opciones de crédito y financiamiento específicas para el sector azucarero y sus operaciones comerciales.",
    },
    {
      id: "insumos",
      label: "Insumos",
      icon: <Box className="h-5 w-5" />,
      href: "/utilidades/insumos",
      description:
        "Gestione la compra y seguimiento de insumos necesarios para la producción y procesamiento de azúcar.",
    },
    {
      id: "almacenaje",
      label: "Almacenaje",
      icon: <Warehouse className="h-5 w-5" />,
      href: "/utilidades/almacenaje",
      description:
        "Administre espacios de almacenamiento, controle inventario y gestione la logística de sus productos.",
    },
    {
      id: "flete",
      label: "Flete",
      icon: <Truck className="h-5 w-5" />,
      href: "/utilidades/flete",
      description: "Coordine el transporte de su mercadería, compare costos y gestione la logística de distribución.",
    },
    {
      id: "deposito-fiscal",
      label: "Depósito Fiscal",
      icon: <Building className="h-5 w-5" />,
      href: "/utilidades/deposito-fiscal",
      description:
        "Gestione almacenamiento en depósitos con beneficios fiscales para operaciones de exportación e importación.",
    },
    {
      id: "seguros",
      label: "Seguro agropecuario",
      icon: <Umbrella className="h-5 w-5" />,
      href: "/utilidades/seguros",
      description:
        "Proteja sus cultivos, instalaciones y operaciones con seguros específicos para el sector azucarero.",
    },
  ],
}

export default function Sidebar() {
  const [utilitiesOpen, setUtilitiesOpen] = useState(true)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <div className="w-64 h-full bg-[#111936] border-r border-[#1a2040] flex flex-col">
      <div className="p-6 border-b border-[#1a2040] flex items-center justify-center">
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="text-blue-500">A</span>
          <span className="text-red-500">g</span>
          <span className="text-red-500">r</span>
          <span className="text-red-500">o</span>
          <span className="text-gray-500">-</span>
          <span className="text-orange-500">I</span>
          <span className="text-green-500">A</span>
        </h1>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-3">
        <TooltipProvider delayDuration={300}>
          <ul className="space-y-1">
            {/* Elementos principales */}
            {menuItems.main.map((item) => (
              <li key={item.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={`
            flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
            ${pathname === item.href || (item.highlight && pathname?.includes(item.href))
                          ? "bg-[#00a8ff] text-white"
                          : "text-gray-400 hover:bg-[#1a2040] hover:text-white"
                        }
          `}
                    >
                      <span className="mr-3">{item.icon}</span>
                      <span>{item.label}</span>
                      {item.highlight && (
                        <span className="ml-auto text-xs bg-white/20 text-white px-2 py-0.5 rounded-full flex items-center">
                          <Sparkles className="h-3 w-3 mr-1" />
                          IA
                        </span>
                      )}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-[#1a2040] text-white border-[#2d3748]">
                    <p className="text-sm">{item.description}</p>
                  </TooltipContent>
                </Tooltip>
              </li>
            ))}

            {/* Utilities Section */}
            <li className="pt-6 pb-2">
              <button
                onClick={() => setUtilitiesOpen(!utilitiesOpen)}
                className="flex items-center justify-between w-full px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-white transition-colors"
              >
                <span>Herramientas</span>
                {utilitiesOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </button>

              {utilitiesOpen && (
                <ul className="space-y-1 mt-2">
                  {menuItems.utilities.map((item) => (
                    <li key={item.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            href={item.href}
                            className={`
                              flex items-center px-4 py-2.5 text-sm rounded-lg transition-colors
                              ${pathname?.includes(item.href)
                                ? "bg-[#1a2040] text-white"
                                : "text-gray-400 hover:bg-[#1a2040] hover:text-white"
                              }
                            `}
                          >
                            <span className="mr-3 opacity-70">{item.icon}</span>
                            <span>{item.label}</span>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-[#1a2040] text-white border-[#2d3748]">
                          <p className="text-sm">{item.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          </ul>
        </TooltipProvider>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#1a2040] bg-[#0d1226]">
        <Link
          href="/guia-usuario"
          className="flex items-center justify-center w-full px-3 py-2 text-sm text-[#00a8ff] bg-[#00a8ff]/10 rounded-lg hover:bg-[#00a8ff]/20 transition-colors mb-3"
        >
          <Info className="h-4 w-4 mr-2" />
          <span>Guía de usuario</span>
        </Link>

        {user ? (
          <div className="flex flex-col gap-2">
            <div className="px-3 py-1 text-xs text-gray-500 text-center truncate font-mono">
              {user.sub || user.email || "Usuario"}
            </div>
            <button
              onClick={logout}
              className="flex items-center justify-center w-full px-3 py-2 text-sm text-red-400 bg-red-400/10 rounded-lg hover:bg-red-400/20 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center justify-center w-full px-3 py-2 text-sm text-green-400 bg-green-400/10 rounded-lg hover:bg-green-400/20 transition-colors"
          >
            <LogIn className="h-4 w-4 mr-2" />
            <span>Iniciar Sesión</span>
          </Link>
        )}
      </div>
    </div>
  )
}
