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
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Definiciones de los elementos de la barra lateral con descripciones
const menuItems = {
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
      href: "/utilidades/inteligencia-comercial",
      description:
        "Análisis competitivo del mercado mundial de azúcar y herramientas de inteligencia comercial impulsadas por IA.",
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

  return (
    <TooltipProvider delayDuration={300}>
      <div className="w-64 h-full bg-[#0a0f29] border-r border-[#1a2040] flex flex-col">
        <div className="p-4 border-b border-[#1a2040]">
          <h1 className="text-xl font-bold">
            <span style={{ color: "#4285F4" }}>A</span>
            <span style={{ color: "#EA4335" }}>gro</span>
            <span style={{ color: "#5F6368" }}>-</span>
            <span style={{ color: "#FBBC05" }}>I</span>
            <span style={{ color: "#34A853" }}>A</span>
          </h1>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            {/* Elementos principales */}
            {menuItems.main.map((item) => (
              <li key={item.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={`
            flex items-center px-4 py-2.5 text-sm 
            ${item.highlight ? "relative" : ""}
            ${
              pathname === item.href || (item.highlight && pathname?.includes(item.href))
                ? item.highlight
                  ? "text-[#00a8ff] bg-gradient-to-r from-[#0a84ff]/20 to-[#1a2040]"
                  : "text-[#00a8ff] bg-[#1a2040]"
                : item.highlight
                  ? "text-[#00a8ff] hover:bg-[#1a2040]"
                  : "text-gray-300 hover:bg-[#1a2040] hover:text-[#00a8ff]"
            }
          `}
                    >
                      {item.highlight && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00a8ff]"></div>}
                      <span className={`mr-3 ${item.highlight ? "text-[#00a8ff]" : ""}`}>{item.icon}</span>
                      <span>{item.label}</span>
                      {item.highlight && (
                        <span className="ml-auto bg-[#0a84ff]/20 text-[#00a8ff] text-xs px-1.5 py-0.5 rounded-sm flex items-center">
                          <Sparkles className="h-3 w-3 mr-1" />
                          IA
                        </span>
                      )}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs bg-[#111936] text-white border-[#1a2040]">
                    <p className="text-sm">{item.description}</p>
                  </TooltipContent>
                </Tooltip>
              </li>
            ))}

            {/* Utilities Section - More subtle heading */}
            <li className="py-2">
              <button
                onClick={() => setUtilitiesOpen(!utilitiesOpen)}
                className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-300 hover:bg-[#1a2040]"
              >
                <div className="flex items-center">
                  <span className="text-xs font-semibold tracking-wider text-gray-500">Herramientas</span>
                </div>
                {utilitiesOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>

              {utilitiesOpen && (
                <ul className="space-y-1 mt-1">
                  {menuItems.utilities.map((item) => (
                    <li key={item.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            href={item.href}
                            className={`
                              flex items-center px-4 py-2 text-sm 
                              ${item.highlight ? "relative" : ""}
                              ${
                                pathname?.includes(item.href)
                                  ? item.highlight
                                    ? "text-[#00a8ff] bg-gradient-to-r from-[#0a84ff]/20 to-[#1a2040]"
                                    : "text-[#00a8ff] bg-[#1a2040]"
                                  : item.highlight
                                    ? "text-[#00a8ff] hover:bg-[#1a2040]"
                                    : "text-gray-300 hover:bg-[#1a2040] hover:text-[#00a8ff]"
                              }
                            `}
                          >
                            {item.highlight && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00a8ff]"></div>}
                            <span className={`mr-3 ${item.highlight ? "text-[#00a8ff]" : ""}`}>{item.icon}</span>
                            <span>{item.label}</span>
                            {item.highlight && (
                              <span className="ml-auto bg-[#0a84ff]/20 text-[#00a8ff] text-xs px-1.5 py-0.5 rounded-sm flex items-center">
                                <Sparkles className="h-3 w-3 mr-1" />
                                IA
                              </span>
                            )}
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs bg-[#111936] text-white border-[#1a2040]">
                          <p className="text-sm">{item.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          </ul>
        </nav>

        {/* Ayuda para nuevos usuarios */}
        <div className="p-4 border-t border-[#1a2040]">
          <Link
            href="/guia-usuario"
            className="flex items-center justify-center w-full px-3 py-2 text-sm text-[#00a8ff] bg-[#1a2040] rounded-md hover:bg-[#2a3050]"
          >
            <Info className="h-4 w-4 mr-2" />
            <span>Guía de usuario</span>
          </Link>
        </div>
      </div>
    </TooltipProvider>
  )
}
