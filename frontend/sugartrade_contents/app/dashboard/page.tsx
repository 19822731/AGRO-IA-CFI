"use client"

import { useState } from "react"
import { TrendingUp, DollarSign, Calendar, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useSugarPrices } from "@/hooks/use-sugar-prices"
import PriceEvolutionChart from "@/components/price-evolution-chart"
import DataCard from "@/components/data-card"
import TabNavigation from "@/components/tab-navigation"
import MercadoInternoCard from "@/components/mercado-interno-card"

const tabs = [
  { id: "overview", label: "Resumen" },
  { id: "market", label: "Mercado" },
  { id: "analysis", label: "Análisis" },
]

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [chartType, setChartType] = useState<"internacional" | "interno">("internacional")
  const { precios, isLoading, error } = useSugarPrices()

  // Formatear la fecha de actualización
  const fechaActualizacion = precios?.actualizado
    ? format(new Date(precios.actualizado), "d MMM yyyy, HH:mm", { locale: es })
    : "Cargando..."

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <span className="text-gray-400 text-sm">Última actualización:</span>
          <span className="text-white text-sm">{fechaActualizacion}</span>
          {isLoading && <RefreshCw className="ml-2 h-4 w-4 text-[#00a8ff] animate-spin" />}
        </div>
      </div>

      <TabNavigation tabs={tabs} defaultTab="overview" onTabChange={setActiveTab} />

      {error && (
        <div className="bg-red-900/20 border border-red-900 rounded-lg p-4 text-red-400">
          <p>{error}</p>
          <button className="mt-2 text-sm text-[#00a8ff] hover:underline" onClick={() => window.location.reload()}>
            Intentar nuevamente
          </button>
        </div>
      )}

      {activeTab === "overview" && (
        <>
          {/* Precio del Mercado Interno (Destacado) */}
          {precios && (
            <MercadoInternoCard
              precio={precios.mercadoInterno.precio}
              cambio={precios.mercadoInterno.cambio}
              unidad={precios.mercadoInterno.unidad}
              isLoading={isLoading}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DataCard
              title="Contrato #5 (Londres)"
              value={isLoading ? "Cargando..." : `${precios?.contrato5.precio} ${precios?.contrato5.unidad}`}
              subtitle="Azúcar blanco refinado"
              trend={
                precios ? { value: precios.contrato5.cambio, isPositive: precios.contrato5.cambio >= 0 } : undefined
              }
              icon={<DollarSign size={20} />}
              isLoading={isLoading}
            />

            <DataCard
              title="Contrato #11 (Nueva York)"
              value={isLoading ? "Cargando..." : `${precios?.contrato11.precio} ${precios?.contrato11.unidad}`}
              subtitle="Azúcar crudo sin refinar"
              trend={
                precios ? { value: precios.contrato11.cambio, isPositive: precios.contrato11.cambio >= 0 } : undefined
              }
              icon={<DollarSign size={20} />}
              isLoading={isLoading}
            />

            <DataCard
              title="Tendencia"
              value={isLoading ? "Cargando..." : precios && precios.mercadoInterno.cambio >= 0 ? "Alcista" : "Bajista"}
              subtitle="Basado en movimiento reciente"
              icon={<TrendingUp size={20} />}
              isLoading={isLoading}
            />

            <DataCard
              title="Próximo Vencimiento"
              value="15 Mar"
              subtitle="7 días restantes"
              icon={<Calendar size={20} />}
              isLoading={isLoading}
            />
          </div>

          <div className="bg-[#111936] rounded-lg p-6 border border-[#1a2040]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Evolución del Precio</h2>

              <div className="flex rounded-md overflow-hidden">
                <button
                  className={`px-3 py-1 text-sm ${chartType === "internacional" ? "bg-[#00a8ff] text-[#0a0f29]" : "bg-[#1a2040] text-gray-300"}`}
                  onClick={() => setChartType("internacional")}
                >
                  Mercado Internacional
                </button>
                <button
                  className={`px-3 py-1 text-sm ${chartType === "interno" ? "bg-[#00a8ff] text-[#0a0f29]" : "bg-[#1a2040] text-gray-300"}`}
                  onClick={() => setChartType("interno")}
                >
                  Mercado Interno
                </button>
              </div>
            </div>

            <div className="h-[300px]">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="flex flex-col items-center">
                    <RefreshCw className="h-8 w-8 text-[#00a8ff] animate-spin mb-2" />
                    <p className="text-gray-400">Cargando datos históricos...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-red-400">Error al cargar los datos históricos</p>
                </div>
              ) : (
                <PriceEvolutionChart
                  data={
                    chartType === "internacional" ? precios?.historicos || [] : precios?.historicosMercadoInterno || []
                  }
                  yAxisLabel={chartType === "internacional" ? "centavos/libra" : "ARS/bolsa"}
                />
              )}
            </div>
          </div>

          {/* Precios Futuros */}
          {precios && (
            <div className="bg-[#111936] rounded-lg p-6 border border-[#1a2040]">
              <h2 className="text-xl font-bold text-white mb-4">Precios Futuros</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {precios.futuros.map((futuro) => (
                  <div key={futuro.mes} className="bg-[#0a0f29] rounded-lg p-4 border border-[#1a2040]">
                    <h3 className="text-lg font-medium text-white mb-2">{futuro.mes}</h3>
                    <div className="flex items-baseline">
                      <span className="text-[#00a8ff] text-2xl font-bold">{futuro.precio}</span>
                      <span className="ml-2 text-gray-400 text-sm">centavos/libra</span>
                    </div>
                    <div className="mt-2">
                      <span className={`text-sm ${futuro.cambio >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {futuro.cambio >= 0 ? "↑" : "↓"} {Math.abs(futuro.cambio)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "market" && (
        <div className="bg-[#111936] rounded-lg p-6 border border-[#1a2040]">
          <h2 className="text-xl font-bold text-white mb-4">Información de Mercado</h2>
          <p className="text-gray-300">Contenido de la sección de mercado en desarrollo.</p>
        </div>
      )}

      {activeTab === "analysis" && (
        <div className="bg-[#111936] rounded-lg p-6 border border-[#1a2040]">
          <h2 className="text-xl font-bold text-white mb-4">Análisis Técnico</h2>
          <p className="text-gray-300">Contenido de la sección de análisis en desarrollo.</p>
        </div>
      )}
    </div>
  )
}
