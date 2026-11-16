"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Globe,
  BarChart,
  TrendingUp,
  LineChart,
  CloudRain,
  Building,
  PieChart,
  Network,
  AlertTriangle,
  Sparkles,
  ArrowLeft,
  Scale,
} from "lucide-react"
import { useRouter } from "next/navigation"
import MarketAnalysis from "./components/market-analysis"
import { PatronesClimaticos, VisualizacionMercado } from "./components/modelos-patrones"
import EstacionalidadMercado from "./components/estacionalidad-mercado"
import MarketCharts from "./components/market-charts"
import { ErrorDisplay } from "@/components/error-display"

// Componente de botón de función con icono
interface FunctionButtonProps {
  icon: React.ReactNode
  title: string
  description: string
  isActive: boolean
  onClick: () => void
  isImplemented?: boolean
  isAIPowered?: boolean
  isHighlighted?: boolean
  href?: string
}

// Modificar el componente FunctionButton para mejorar la estética y evitar superposiciones
const FunctionButton = ({
  icon,
  title,
  description,
  isActive,
  onClick,
  isImplemented = true,
  isAIPowered = false,
  isHighlighted = false,
  href,
}: FunctionButtonProps) => {
  const router = useRouter()

  const handleClick = () => {
    if (href) {
      router.push(href)
    } else {
      onClick()
    }
  }

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${isHighlighted
          ? "bg-gradient-to-br from-[#0a0f29] to-[#1a2040] border-[#00a8ff] shadow-lg hover:shadow-xl"
          : isActive
            ? "bg-[#1a2040] border-[#00a8ff]"
            : "bg-[#111936] border-[#1a2040] hover:bg-[#162040]"
        } ${isHighlighted ? "transform hover:-translate-y-1" : ""}`}
      onClick={handleClick}
    >
      <CardContent className={`p-4 ${isHighlighted ? "p-5" : ""}`}>
        <div className="flex items-start space-x-4">
          <div
            className={`p-3 rounded-full ${isHighlighted ? "bg-[#00a8ff]/30 text-white" : isActive ? "bg-[#00a8ff]/20" : "bg-[#0a0f29]"
              }`}
          >
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            {" "}
            {/* Añadido min-w-0 para evitar desbordamiento */}
            <div className="flex items-center justify-between flex-wrap gap-1">
              {" "}
              {/* Añadido flex-wrap y gap-1 */}
              <div className="flex items-center flex-wrap gap-1">
                {" "}
                {/* Añadido flex-wrap y gap-1 */}
                <h3
                  className={`font-medium ${isHighlighted ? "text-[#00a8ff] text-lg" : isActive ? "text-[#00a8ff]" : "text-white"
                    }`}
                >
                  {title}
                </h3>
                {isAIPowered && (
                  <span className="bg-[#0a84ff]/20 text-[#00a8ff] text-xs px-1.5 py-0.5 rounded-sm flex items-center whitespace-nowrap">
                    {" "}
                    {/* Añadido whitespace-nowrap */}
                    <Sparkles className="h-3 w-3 mr-1" />
                    IA
                  </span>
                )}
              </div>
              {!isImplemented && (
                <span className="bg-amber-900/30 text-amber-400 text-xs px-2 py-0.5 rounded-full flex items-center whitespace-nowrap">
                  {" "}
                  {/* Añadido whitespace-nowrap */}
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  En desarrollo
                </span>
              )}
            </div>
            <p className={`text-sm ${isHighlighted ? "text-gray-300" : "text-gray-400"} mt-1 line-clamp-2`}>
              {" "}
              {/* Añadido line-clamp-2 */}
              {description}
            </p>
            {isHighlighted && (
              <div className="mt-2 pt-2 border-t border-[#1a2040]">
                <span className="text-xs text-[#00a8ff] flex items-center">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Función destacada
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente para manejar errores específicos de cada pestaña
function TabErrorBoundary({ children, tabName }: { children: React.ReactNode; tabName: string }) {
  return (
    <div>
      {(() => {
        try {
          return children
        } catch (error) {
          console.error(`Error en pestaña ${tabName}:`, error)
          return (
            <Card className="w-full">
              <CardContent className="p-6">
                <ErrorDisplay error={`Error al cargar la pestaña "${tabName}"`} title="Error en el componente" />
              </CardContent>
            </Card>
          )
        }
      })()}
    </div>
  )
}

// Componente para funcionalidades en desarrollo
const UnderDevelopmentContent = ({ title }: { title: string }) => (
  <Card className="bg-[#111936] border-[#1a2040]">
    <CardContent>
      <div className="h-[400px] flex flex-col items-center justify-center bg-[#0a0f29] rounded-lg">
        <div className="text-center max-w-md">
          <div className="bg-amber-900/30 p-4 rounded-full inline-block mb-4">
            <AlertTriangle className="h-12 w-12 text-amber-400" />
          </div>
          <h3 className="text-white text-lg font-medium mb-2">Módulo en desarrollo</h3>
          <p className="text-gray-400">
            Estamos trabajando para implementar esta funcionalidad. Pronto estará disponible con análisis detallados y
            visualizaciones interactivas.
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
)

// Definición de las funciones disponibles
const functionButtons = [
  {
    id: "analisis-avanzado",
    title: "Análisis Avanzado y Predicción",
    description: "Predicciones y análisis detallado del mercado con inteligencia artificial",
    icon: <LineChart className="h-6 w-6 text-[#00a8ff]" />,
    isImplemented: true,
    isAIPowered: true,
    isHighlighted: true,
    href: "/utilidades/inteligencia-comercial/analisis-avanzado",
  },
  {
    id: "mercado-global",
    title: "Mercado Global",
    description: "Panorama mundial del azúcar",
    icon: <Globe className="h-6 w-6 text-[#00a8ff]" />,
    isImplemented: true,
    isAIPowered: false,
  },
  {
    id: "precios",
    title: "Precios y Tendencias",
    description: "Evolución histórica y proyecciones",
    icon: <BarChart className="h-6 w-6 text-[#00a8ff]" />,
    isImplemented: true,
    isAIPowered: true,
  },
  {
    id: "analisis-competitivo",
    title: "Análisis Competitivo",
    description: "Comparativa de productores y exportadores",
    icon: <Building className="h-6 w-6 text-[#00a8ff]" />,
    isImplemented: false,
    isAIPowered: false,
  },
  {
    id: "visualizacion",
    title: "Visualización",
    description: "Gráficos interactivos y dashboards",
    icon: <PieChart className="h-6 w-6 text-[#00a8ff]" />,
    isImplemented: true,
    isAIPowered: false,
  },
  {
    id: "correlaciones",
    title: "Correlaciones",
    description: "Relaciones entre variables de mercado",
    icon: <Network className="h-6 w-6 text-[#00a8ff]" />,
    isImplemented: false,
    isAIPowered: true,
  },
  {
    id: "patrones-mercado",
    title: "Estacionalidad y Ritmo Zafra",
    description: "Curvas de molienda, ritmo de embarque Comex Stat, paridad FAS y comisiones",
    icon: <Scale className="h-6 w-6 text-[#00a8ff]" />,
    isImplemented: true,
    isAIPowered: true,
    isHighlighted: true,
  },
  {
    id: "patrones-climaticos",
    title: "Patrones Climáticos",
    description: "Impacto del clima en la producción",
    icon: <CloudRain className="h-6 w-6 text-[#00a8ff]" />,
    isImplemented: true,
    isAIPowered: true,
  },
]

// Modificar la estructura del grid y la disposición de los botones
export default function InteligenciaComercialPage() {
  const router = useRouter()
  const [activeFunction, setActiveFunction] = useState("patrones-mercado")

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center">
        <button
          onClick={() => router.back()}
          className="mr-3 p-2 rounded-full bg-[#0a0f29] hover:bg-[#1a2040] text-gray-400 hover:text-white transition-colors"
          aria-label="Volver"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-white">Inteligencia Comercial</h1>
      </div>

      {/* Botón destacado de Análisis Avanzado separado del grid principal */}
      <div className="mb-6">
        <FunctionButton
          key="analisis-avanzado"
          icon={<LineChart className="h-6 w-6 text-[#00a8ff]" />}
          title="Análisis Avanzado y Predicción"
          description="Predicciones y análisis detallado del mercado con inteligencia artificial"
          isActive={activeFunction === "analisis-avanzado"}
          isImplemented={true}
          isAIPowered={true}
          isHighlighted={true}
          href="/utilidades/inteligencia-comercial/analisis-avanzado"
          onClick={() => setActiveFunction("analisis-avanzado")}
        />
      </div>

      {/* Título para las demás funciones */}
      <div className="flex items-center mb-2">
        <h2 className="text-lg font-medium text-white">Otras funcionalidades</h2>
      </div>

      {/* Grid de botones de función (excluyendo Análisis Avanzado) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {functionButtons
          .filter((button) => button.id !== "analisis-avanzado")
          .map((button) => (
            <FunctionButton
              key={button.id}
              icon={button.icon}
              title={button.title}
              description={button.description}
              isActive={activeFunction === button.id}
              isImplemented={button.isImplemented}
              isAIPowered={button.isAIPowered}
              isHighlighted={button.isHighlighted}
              href={button.href}
              onClick={() => setActiveFunction(button.id)}
            />
          ))}
      </div>

      {/* Contenido basado en la función seleccionada */}
      <div className="mt-6">
        {activeFunction === "mercado-global" && (
          <TabErrorBoundary tabName="Mercado Global">
            <MarketAnalysis />
          </TabErrorBoundary>
        )}

        {activeFunction === "patrones-mercado" && (
          <TabErrorBoundary tabName="Estacionalidad y Ritmo Zafra">
            <EstacionalidadMercado />
          </TabErrorBoundary>
        )}

        {activeFunction === "patrones-climaticos" && (
          <TabErrorBoundary tabName="Patrones Climáticos">
            <PatronesClimaticos />
          </TabErrorBoundary>
        )}

        {activeFunction === "visualizacion" && (
          <TabErrorBoundary tabName="Visualización de Mercado">
            <VisualizacionMercado />
          </TabErrorBoundary>
        )}

        {/* Funcionalidades en desarrollo */}
        {activeFunction === "precios" && (
          <TabErrorBoundary tabName="Precios y Tendencias">
            <MarketCharts />
          </TabErrorBoundary>
        )}

        {activeFunction === "analisis-competitivo" && <UnderDevelopmentContent title="Análisis Competitivo" />}

        {activeFunction === "correlaciones" && <UnderDevelopmentContent title="Correlaciones de Mercado" />}
      </div>
    </div>
  )
}
