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
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-gray-400 mt-1">Resumen del mercado de azúcar en tiempo real</p>
        </div>
        <div className="flex items-center space-x-3 bg-[#111936] px-4 py-2 rounded-full border border-[#1a2040]">
          <span className="text-gray-400 text-sm font-medium">Última actualización:</span>
          <span className="text-[#00a8ff] text-sm font-bold">{fechaActualizacion}</span>
          {isLoading && <RefreshCw className="ml-2 h-4 w-4 text-[#00a8ff] animate-spin" />}
        </div>
      </div>

      <TabNavigation tabs={tabs} defaultTab="overview" onTabChange={setActiveTab} />

      {error && (
        <div className="bg-red-900/20 border border-red-900/50 rounded-xl p-4 text-red-400 flex items-center justify-between">
          <p className="font-medium">{error}</p>
          <button className="text-sm bg-red-900/30 hover:bg-red-900/50 px-3 py-1.5 rounded-lg transition-colors" onClick={() => window.location.reload()}>
            Intentar nuevamente
          </button>
        </div>
      )}

      {activeTab === "overview" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Mercado Interno - Destacado */}
            {precios && (
              <div className="md:col-span-2 lg:col-span-4">
                <MercadoInternoCard
                  precio={precios.mercadoInterno.precio}
                  cambio={precios.mercadoInterno.cambio}
                  unidad={precios.mercadoInterno.unidad}
                  isLoading={isLoading}
                />
              </div>
            )}

            <div>
              <DataCard
                title="Contrato #5 (Londres)"
                value={isLoading ? "Cargando..." : `${precios?.contrato5.precio} ${precios?.contrato5.unidad}`}
                subtitle="Azúcar blanco refinado"
                trend={
                  precios ? { value: precios.contrato5.cambio, isPositive: precios.contrato5.cambio >= 0 } : undefined
                }
                icon={<DollarSign size={24} />}
                isLoading={isLoading}
              />
            </div>

            <div>
              <DataCard
                title="Contrato #11 (Nueva York)"
                value={isLoading ? "Cargando..." : `${precios?.contrato11.precio} ${precios?.contrato11.unidad}`}
                subtitle="Azúcar crudo sin refinar"
                trend={
                  precios ? { value: precios.contrato11.cambio, isPositive: precios.contrato11.cambio >= 0 } : undefined
                }
                icon={<DollarSign size={24} />}
                isLoading={isLoading}
              />
            </div>

            <div>
              <DataCard
                title="Tendencia"
                value={isLoading ? "Cargando..." : precios && precios.mercadoInterno.cambio >= 0 ? "Alcista" : "Bajista"}
                subtitle="Basado en movimiento reciente"
                icon={<TrendingUp size={24} />}
                isLoading={isLoading}
              />
            </div>

            <div>
              <DataCard
                title="Próximo Vencimiento"
                value="15 Mar"
                subtitle="7 días restantes"
                icon={<Calendar size={24} />}
                isLoading={isLoading}
              />
            </div>
          </div>

          <div className="bg-[#111936] rounded-xl p-6 border border-[#1a2040]">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-white flex items-center">
                <span className="w-1 h-6 bg-[#00a8ff] rounded-full mr-3"></span>
                Evolución del Precio
              </h2>

              <div className="flex bg-[#0a0f29] p-1 rounded-lg">
                <button
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${chartType === "internacional" ? "bg-[#00a8ff] text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
                  onClick={() => setChartType("internacional")}
                >
                  Mercado Internacional
                </button>
                <button
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${chartType === "interno" ? "bg-[#00a8ff] text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
                  onClick={() => setChartType("interno")}
                >
                  Mercado Interno
                </button>
              </div>
            </div>

            <div className="h-[350px]">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="flex flex-col items-center">
                    <RefreshCw className="h-8 w-8 text-[#00a8ff] animate-spin mb-4" />
                    <p className="text-gray-400 font-medium">Cargando datos históricos...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-red-400 font-medium">Error al cargar los datos históricos</p>
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
            <div className="bg-[#111936] rounded-xl p-6 border border-[#1a2040]">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <span className="w-1 h-6 bg-yellow-500 rounded-full mr-3"></span>
                Precios Futuros
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {precios.futuros.map((futuro) => (
                  <div key={futuro.mes} className="bg-[#1a2040] rounded-xl p-5 border border-[#2d3748] hover:border-yellow-500/30 transition-colors group">
                    <h3 className="text-lg font-medium text-white mb-3 group-hover:text-yellow-500 transition-colors">{futuro.mes}</h3>
                    <div className="flex items-baseline">
                      <span className="text-white text-3xl font-bold tracking-tight">{futuro.precio}</span>
                      <span className="ml-2 text-gray-500 text-sm font-medium">centavos/libra</span>
                    </div>
                    <div className="mt-3">
                      <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${futuro.cambio >= 0 ? "text-green-400 bg-green-400/10" : "text-red-400 bg-red-400/10"}`}>
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
        <div className="bg-[#111936] rounded-xl p-8 text-center border border-[#1a2040]">
          <h2 className="text-xl font-bold text-white mb-4">Información de Mercado</h2>
          <p className="text-gray-400">Contenido de la sección de mercado en desarrollo.</p>
        </div>
      )}

      {activeTab === "analysis" && (
        <div className="bg-[#111936] rounded-xl p-8 text-center border border-[#1a2040]">
          <h2 className="text-xl font-bold text-white mb-4">Análisis Técnico</h2>
          <p className="text-gray-400">Contenido de la sección de análisis en desarrollo.</p>
        </div>
      )}
    </div>
  )
}
