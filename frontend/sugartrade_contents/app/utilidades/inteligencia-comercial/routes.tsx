import { BarChart3, Globe, LineChart, Map, History } from "lucide-react"

export const routes = [
  {
    title: "Panel Interactivo",
    href: "/utilidades/inteligencia-comercial/panel-interactivo",
    description: "Visualización interactiva de datos de mercado y precios",
    icon: <LineChart className="h-6 w-6" />,
  },
  {
    title: "Visualización de Mercado",
    href: "/utilidades/inteligencia-comercial/visualizacion-mercado",
    description: "Análisis visual de tendencias y patrones del mercado azucarero",
    icon: <BarChart3 className="h-6 w-6" />,
  },
  {
    title: "Análisis Espacial",
    href: "/utilidades/inteligencia-comercial/analisis-espacial",
    description: "Visualización geoespacial de la actividad azucarera",
    icon: <Map className="h-6 w-6" />,
  },
  {
    title: "Análisis Histórico",
    href: "/utilidades/inteligencia-comercial/analisis-historico",
    description: "Datos históricos de producción de caña de azúcar",
    icon: <History className="h-6 w-6" />,
  },
  {
    title: "Comercio Internacional",
    href: "/utilidades/inteligencia-comercial/comercio-internacional",
    description: "Análisis de importaciones y exportaciones de azúcar",
    icon: <Globe className="h-6 w-6" />,
  },
]
