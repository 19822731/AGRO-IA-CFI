"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  LineChart,
  BarChart3,
  TrendingUp,
  Sparkles,
  Calendar,
  Globe,
  PieChart,
  AlertTriangle,
  Info,
} from "lucide-react"
import { useRouter } from "next/navigation"

// Componente para mostrar una predicción con nivel de confianza
interface PredictionCardProps {
  title: string
  value: string
  change: string
  isPositive: boolean
  confidence: number
  timeframe: string
  region?: string
}

const PredictionCard = ({ title, value, change, isPositive, confidence, timeframe, region }: PredictionCardProps) => (
  <Card className="bg-[#111936] border-[#1a2040]">
    <CardContent className="p-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-white font-medium">{title}</h3>
        <div className="flex items-center">
          <span className="text-xs text-gray-400 mr-1">Confianza:</span>
          <div className="w-16 h-2 bg-[#0a0f29] rounded-full overflow-hidden">
            <div
              className={`h-full ${
                confidence >= 80
                  ? "bg-green-500"
                  : confidence >= 60
                    ? "bg-blue-500"
                    : confidence >= 40
                      ? "bg-yellow-500"
                      : "bg-red-500"
              }`}
              style={{ width: `${confidence}%` }}
            ></div>
          </div>
          <span className="text-xs text-gray-400 ml-1">{confidence}%</span>
        </div>
      </div>

      <div className="flex items-baseline">
        <span className="text-2xl font-bold text-white">{value}</span>
        <div className={`ml-2 flex items-center ${isPositive ? "text-green-500" : "text-red-500"}`}>
          {isPositive ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
          <span>{change}</span>
        </div>
      </div>

      <div className="mt-3 flex items-center text-xs text-gray-400">
        <Calendar className="h-3 w-3 mr-1" />
        <span className="mr-3">{timeframe}</span>
        {region && (
          <>
            <Globe className="h-3 w-3 mr-1" />
            <span>{region}</span>
          </>
        )}
      </div>
    </CardContent>
  </Card>
)

// Componente para mostrar una tendencia de mercado
interface TrendCardProps {
  title: string
  trend: "up" | "down" | "neutral"
  description: string
  region: string
  impact: "high" | "medium" | "low"
}

const TrendCard = ({ title, trend, description, region, impact }: TrendCardProps) => (
  <Card className="bg-[#111936] border-[#1a2040]">
    <CardContent className="p-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-white font-medium">{title}</h3>
        <div
          className={`
          p-1.5 rounded-full 
          ${trend === "up" ? "bg-green-500/20" : trend === "down" ? "bg-red-500/20" : "bg-yellow-500/20"}
        `}
        >
          {trend === "up" ? (
            <ArrowUp className="h-4 w-4 text-green-500" />
          ) : trend === "down" ? (
            <ArrowDown className="h-4 w-4 text-red-500" />
          ) : (
            <ArrowRight className="h-4 w-4 text-yellow-500" />
          )}
        </div>
      </div>

      <p className="text-sm text-gray-400 mb-3">{description}</p>

      <div className="flex justify-between items-center text-xs">
        <div className="flex items-center text-gray-400">
          <Globe className="h-3 w-3 mr-1" />
          <span>{region}</span>
        </div>

        <div className="flex items-center">
          <span className="text-gray-400 mr-1">Impacto:</span>
          <span
            className={`
            px-1.5 py-0.5 rounded-sm
            ${
              impact === "high"
                ? "bg-red-500/20 text-red-500"
                : impact === "medium"
                  ? "bg-yellow-500/20 text-yellow-500"
                  : "bg-blue-500/20 text-blue-500"
            }
          `}
          >
            {impact === "high" ? "Alto" : impact === "medium" ? "Medio" : "Bajo"}
          </span>
        </div>
      </div>
    </CardContent>
  </Card>
)

// Componente para mostrar una recomendación
interface RecommendationCardProps {
  title: string
  description: string
  type: "action" | "caution" | "info"
  timeframe: string
}

const RecommendationCard = ({ title, description, type, timeframe }: RecommendationCardProps) => (
  <Card className="bg-[#111936] border-[#1a2040]">
    <CardContent className="p-4">
      <div className="flex items-start space-x-3">
        <div
          className={`
          p-2 rounded-full flex-shrink-0
          ${type === "action" ? "bg-green-500/20" : type === "caution" ? "bg-yellow-500/20" : "bg-blue-500/20"}
        `}
        >
          {type === "action" ? (
            <TrendingUp className={`h-5 w-5 text-green-500`} />
          ) : type === "caution" ? (
            <AlertTriangle className={`h-5 w-5 text-yellow-500`} />
          ) : (
            <Info className={`h-5 w-5 text-blue-500`} />
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-white font-medium mb-1">{title}</h3>
          <p className="text-sm text-gray-400 mb-2">{description}</p>

          <div className="flex items-center text-xs text-gray-400">
            <Calendar className="h-3 w-3 mr-1" />
            <span>{timeframe}</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
)

// Mejorar el diseño del encabezado para destacar más el título
export default function AnalisisAvanzadoPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("predicciones")

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.push("/utilidades/inteligencia-comercial")}
          className="mr-3 p-2 rounded-full bg-[#0a0f29] hover:bg-[#1a2040] text-gray-400 hover:text-white transition-colors"
          aria-label="Volver"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            Análisis Avanzado y Predicción
            <span className="ml-2 bg-[#0a84ff]/20 text-[#00a8ff] text-sm px-2 py-0.5 rounded-sm flex items-center">
              <Sparkles className="h-4 w-4 mr-1" />
              IA
            </span>
          </h1>
          <p className="text-gray-400 text-sm">
            Predicciones y análisis detallado del mercado con inteligencia artificial
          </p>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-[#0a0f29] to-[#111936] border-[#1a2040]">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-xl">Panel de Análisis</CardTitle>
          <CardDescription className="text-gray-400">
            Análisis predictivo y recomendaciones personalizadas basadas en inteligencia artificial
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="predicciones" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-[#111936] border-b border-[#1a2040] w-full justify-start rounded-none p-0">
              <TabsTrigger
                value="predicciones"
                className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff] data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-[#00a8ff] px-4 py-2"
              >
                <LineChart className="h-4 w-4 mr-2" />
                Predicciones
              </TabsTrigger>
              <TabsTrigger
                value="tendencias"
                className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff] data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-[#00a8ff] px-4 py-2"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Tendencias
              </TabsTrigger>
              <TabsTrigger
                value="recomendaciones"
                className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff] data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-[#00a8ff] px-4 py-2"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Recomendaciones
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="predicciones" className="m-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <PredictionCard
                    title="Precio del Azúcar Crudo"
                    value="$420/ton"
                    change="+2.5%"
                    isPositive={true}
                    confidence={85}
                    timeframe="Próximos 30 días"
                    region="Global"
                  />
                  <PredictionCard
                    title="Producción Mundial"
                    value="178.4M ton"
                    change="-1.2%"
                    isPositive={false}
                    confidence={72}
                    timeframe="Zafra 2025"
                    region="Global"
                  />
                  <PredictionCard
                    title="Demanda de Azúcar"
                    value="182.1M ton"
                    change="+0.8%"
                    isPositive={true}
                    confidence={78}
                    timeframe="Año 2025"
                    region="Global"
                  />
                  <PredictionCard
                    title="Exportaciones Brasil"
                    value="28.5M ton"
                    change="+3.2%"
                    isPositive={true}
                    confidence={81}
                    timeframe="Próximos 6 meses"
                    region="Brasil"
                  />
                  <PredictionCard
                    title="Producción India"
                    value="32.8M ton"
                    change="-2.1%"
                    isPositive={false}
                    confidence={68}
                    timeframe="Zafra 2025"
                    region="India"
                  />
                  <PredictionCard
                    title="Precio Azúcar Refinada"
                    value="$510/ton"
                    change="+1.8%"
                    isPositive={true}
                    confidence={76}
                    timeframe="Próximos 30 días"
                    region="Global"
                  />
                </div>

                <div className="mt-6 bg-[#111936] p-4 rounded-md border border-[#1a2040]">
                  <div className="flex items-center mb-2">
                    <Sparkles className="h-4 w-4 text-[#00a8ff] mr-2" />
                    <h3 className="text-white font-medium">Análisis de IA</h3>
                  </div>
                  <p className="text-gray-400 text-sm">
                    El modelo de IA predice un déficit global de 3.7M de toneladas para 2025, lo que mantendrá una
                    presión alcista sobre los precios. Las condiciones climáticas adversas en Brasil e India están
                    afectando las proyecciones de producción, mientras que la demanda continúa creciendo de manera
                    constante, especialmente en mercados emergentes de Asia.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="tendencias" className="m-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TrendCard
                    title="Mercado de Futuros"
                    trend="up"
                    description="Los contratos de futuros muestran una tendencia alcista sostenida, con aumento en el interés abierto y volumen de operaciones."
                    region="Global"
                    impact="high"
                  />
                  <TrendCard
                    title="Producción Brasileña"
                    trend="neutral"
                    description="La producción se mantiene estable con ligera tendencia al alza, compensando parcialmente la caída en otros mercados."
                    region="Brasil"
                    impact="medium"
                  />
                  <TrendCard
                    title="Producción India"
                    trend="down"
                    description="Condiciones climáticas adversas y políticas de exportación restrictivas están impactando negativamente la producción."
                    region="India"
                    impact="high"
                  />
                  <TrendCard
                    title="Demanda China"
                    trend="up"
                    description="Aumento sostenido en la demanda industrial y de consumo directo, con incremento en importaciones."
                    region="China"
                    impact="medium"
                  />
                  <TrendCard
                    title="Mercado Europeo"
                    trend="neutral"
                    description="Estabilidad en precios y demanda, con ligeras fluctuaciones estacionales dentro de rangos esperados."
                    region="Europa"
                    impact="low"
                  />
                  <TrendCard
                    title="Exportaciones Tailandia"
                    trend="up"
                    description="Recuperación significativa en la capacidad exportadora tras dos temporadas de producción reducida."
                    region="Tailandia"
                    impact="medium"
                  />
                </div>

                <div className="mt-6 bg-[#111936] p-4 rounded-md border border-[#1a2040]">
                  <div className="flex items-center mb-2">
                    <PieChart className="h-4 w-4 text-[#00a8ff] mr-2" />
                    <h3 className="text-white font-medium">Análisis Regional</h3>
                  </div>
                  <p className="text-gray-400 text-sm">
                    El análisis de tendencias muestra un desplazamiento en el equilibrio de producción global, con
                    Brasil consolidando su posición dominante mientras India enfrenta desafíos. El mercado asiático
                    continúa siendo el principal motor de crecimiento de la demanda, mientras que Europa mantiene un
                    consumo estable. Las políticas comerciales y arancelarias están generando oportunidades para
                    exportadores emergentes.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="recomendaciones" className="m-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <RecommendationCard
                    title="Mantener Posiciones Largas"
                    description="Se recomienda mantener o incrementar posiciones largas en contratos de azúcar crudo para el próximo trimestre, aprovechando la tendencia alcista proyectada."
                    type="action"
                    timeframe="Próximos 3 meses"
                  />
                  <RecommendationCard
                    title="Diversificar Proveedores"
                    description="Ante la volatilidad en la producción de India, se recomienda diversificar la cartera de proveedores, incrementando relaciones comerciales con Brasil y Tailandia para asegurar suministro estable."
                    type="caution"
                    timeframe="Inmediato"
                  />
                  <RecommendationCard
                    title="Cobertura con Opciones"
                    description="Implementar estrategias de cobertura mediante opciones para protegerse contra la volatilidad de precios, especialmente para contratos a largo plazo."
                    type="info"
                    timeframe="Próximos 6 meses"
                  />
                  <RecommendationCard
                    title="Monitoreo de Políticas Comerciales"
                    description="Seguimiento cercano de cambios en políticas comerciales y arancelarias en mercados clave como India, China y UE, que podrían impactar significativamente los flujos comerciales."
                    type="info"
                    timeframe="Continuo"
                  />
                </div>

                <div className="mt-6 bg-[#111936] p-4 rounded-md border border-[#1a2040]">
                  <div className="flex items-center mb-2">
                    <Sparkles className="h-4 w-4 text-[#00a8ff] mr-2" />
                    <h3 className="text-white font-medium">Recomendación Estratégica</h3>
                  </div>
                  <p className="text-gray-400 text-sm">
                    El análisis de IA sugiere adoptar una postura moderadamente alcista para los próximos 3-6 meses, con
                    énfasis en la diversificación geográfica de operaciones comerciales. Se recomienda mantener
                    inventarios ligeramente por encima de los niveles históricos y establecer contratos a precio fijo
                    para el 60-70% de los requerimientos, dejando el resto para aprovechar oportunidades de mercado.
                  </p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
