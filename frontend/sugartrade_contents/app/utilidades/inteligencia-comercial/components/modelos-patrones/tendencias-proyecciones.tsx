"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  BarChart2,
  TrendingUp,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Info,
} from "lucide-react"
import { sugarMarketProjections } from "@/data/sugar-market-projections"

export default function TendenciasProyecciones() {
  const [activeTab, setActiveTab] = useState("tendencias-globales")

  // Función para renderizar flechas de tendencia con colores
  const renderTrend = (value: number) => {
    if (value > 0) {
      return (
        <div className="flex items-center text-green-500">
          <ArrowUpRight className="h-4 w-4 mr-1" />+{value.toFixed(1)}%
        </div>
      )
    } else if (value < 0) {
      return (
        <div className="flex items-center text-red-500">
          <ArrowDownRight className="h-4 w-4 mr-1" />
          {value.toFixed(1)}%
        </div>
      )
    } else {
      return <div className="text-gray-400">0%</div>
    }
  }

  // Función para calcular el cambio porcentual entre años
  const calculatePercentageChange = (
    country: string,
    metric: "production" | "exports" | "imports",
    currentYear: string,
    previousYear: string,
  ) => {
    let data: any

    if (metric === "production") {
      data = sugarMarketProjections.countryProduction.countries
    } else if (metric === "exports") {
      data = sugarMarketProjections.countryExports.countries
    } else {
      data = sugarMarketProjections.countryImports.countries
    }

    if (!data[country] || !data[country][currentYear] || !data[country][previousYear]) {
      return 0
    }

    const current = data[country][currentYear]
    const previous = data[country][previousYear]

    return ((current - previous) / previous) * 100
  }

  return (
    <Card className="bg-[#111936] border-[#1a2040]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white text-xl">Tendencias y Proyecciones del Mercado Azucarero</CardTitle>
            <CardDescription className="text-gray-400">
              Fuente: {sugarMarketProjections.globalProduction.source} | Proyecciones 2021-2025
            </CardDescription>
          </div>
          <div className="bg-[#1a2040] p-2 rounded-full">
            <TrendingUp className="h-6 w-6 text-[#00a8ff]" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="tendencias-globales" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[#0a0f29] w-full">
            <TabsTrigger
              value="tendencias-globales"
              className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
            >
              <Globe className="h-4 w-4 mr-2" />
              Tendencias Globales
            </TabsTrigger>
            <TabsTrigger
              value="proyecciones-paises"
              className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
            >
              <BarChart2 className="h-4 w-4 mr-2" />
              Proyecciones por País
            </TabsTrigger>
            <TabsTrigger
              value="analisis-cualitativo"
              className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
            >
              <LineChart className="h-4 w-4 mr-2" />
              Análisis Cualitativo
            </TabsTrigger>
          </TabsList>

          {/* Pestaña de Tendencias Globales */}
          <TabsContent value="tendencias-globales" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-[#0a0f29] border-[#1a2040]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg">Producción Mundial</CardTitle>
                  <CardDescription className="text-gray-400">Tendencia histórica y proyecciones</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-48 relative">
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <LineChart className="h-12 w-12 text-[#00a8ff] mx-auto mb-4" />
                      <p className="text-gray-400">Visualización de gráfico en desarrollo</p>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0">
                      <div className="space-y-2">
                        {Object.entries(sugarMarketProjections.globalProduction.yearlyData).map(([year, data]) => (
                          <div key={year} className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">{year}:</span>
                            <div className="flex items-center">
                              <span className="text-white mr-2">{data.value.toLocaleString()} mill. ton.</span>
                              {"percentageChange" in data && (
                                <div className="w-16 text-right">{renderTrend(data.percentageChange)}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 bg-[#1a2040] p-3 rounded-lg">
                    <p className="text-sm text-white font-medium mb-2">Análisis de Tendencia</p>
                    <p className="text-xs text-gray-300">
                      La producción mundial muestra un crecimiento hasta 2023/24, seguido de una ligera contracción en
                      2024/25. Esta tendencia refleja principalmente las fluctuaciones en la producción de Brasil e
                      India, los dos mayores productores mundiales.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0a0f29] border-[#1a2040]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg">Consumo Mundial</CardTitle>
                  <CardDescription className="text-gray-400">Tendencia histórica y proyecciones</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-48 relative">
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <LineChart className="h-12 w-12 text-[#00a8ff] mx-auto mb-4" />
                      <p className="text-gray-400">Visualización de gráfico en desarrollo</p>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0">
                      <div className="space-y-2">
                        {Object.entries(sugarMarketProjections.globalConsumption.yearlyData).map(([year, data]) => (
                          <div key={year} className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">{year}:</span>
                            <div className="flex items-center">
                              <span className="text-white mr-2">{data.value.toLocaleString()} mill. ton.</span>
                              {"percentageChange" in data && (
                                <div className="w-16 text-right">{renderTrend(data.percentageChange)}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 bg-[#1a2040] p-3 rounded-lg">
                    <p className="text-sm text-white font-medium mb-2">Análisis de Tendencia</p>
                    <p className="text-xs text-gray-300">
                      El consumo mundial de azúcar muestra un crecimiento constante y sostenido, con un aumento
                      acumulado del 4.8% entre 2021/22 y 2024/25. Este crecimiento está impulsado principalmente por
                      mercados asiáticos como India y China.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0a0f29] border-[#1a2040]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg">Exportaciones Mundiales</CardTitle>
                  <CardDescription className="text-gray-400">Tendencia histórica y proyecciones</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-48 relative">
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <LineChart className="h-12 w-12 text-[#00a8ff] mx-auto mb-4" />
                      <p className="text-gray-400">Visualización de gráfico en desarrollo</p>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0">
                      <div className="space-y-2">
                        {Object.entries(sugarMarketProjections.globalExports.yearlyData).map(([year, data]) => (
                          <div key={year} className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">{year}:</span>
                            <div className="flex items-center">
                              <span className="text-white mr-2">{data.value.toLocaleString()} mill. ton.</span>
                              {"percentageChange" in data && (
                                <div className="w-16 text-right">{renderTrend(data.percentageChange)}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 bg-[#1a2040] p-3 rounded-lg">
                    <p className="text-sm text-white font-medium mb-2">Análisis de Tendencia</p>
                    <p className="text-xs text-gray-300">
                      Las exportaciones mundiales muestran un crecimiento hasta 2023/24, seguido de una ligera
                      contracción en 2024/25. Esta tendencia refleja principalmente las fluctuaciones en la
                      disponibilidad exportable de Brasil, India y Tailandia.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-[#0a0f29] border-[#1a2040]">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg">Balance Mundial de Azúcar</CardTitle>
                <CardDescription className="text-gray-400">Comparativa entre producción y consumo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 relative">
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <BarChart2 className="h-12 w-12 text-[#00a8ff] mx-auto mb-4" />
                    <p className="text-gray-400">Visualización de gráfico en desarrollo</p>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0">
                    <div className="space-y-4">
                      {Object.keys(sugarMarketProjections.globalProduction.yearlyData).map((year) => {
                        const production = sugarMarketProjections.globalProduction.yearlyData[year].value
                        const consumption = sugarMarketProjections.globalConsumption.yearlyData[year].value
                        const balance = production - consumption
                        const isPositive = balance > 0

                        return (
                          <div key={year} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">{year}:</span>
                              <div className="flex items-center">
                                <span className={`${isPositive ? "text-green-500" : "text-red-500"} font-medium`}>
                                  {isPositive ? "+" : ""}
                                  {balance.toFixed(1)} mill. ton.
                                </span>
                              </div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Producción: {production.toLocaleString()} mill. ton.</span>
                              <span>Consumo: {consumption.toLocaleString()} mill. ton.</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-4 bg-[#1a2040] p-3 rounded-lg">
                  <p className="text-sm text-white font-medium mb-2">Análisis de Balance</p>
                  <p className="text-xs text-gray-300">
                    El balance mundial muestra un superávit creciente hasta 2023/24, seguido de una reducción en
                    2024/25. Este patrón sugiere una posible presión a la baja sobre los precios en el corto plazo,
                    seguida de un potencial fortalecimiento en 2024/25 a medida que el superávit se reduce.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="bg-blue-900/20 border border-blue-900/30 rounded-md p-3">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-300">
                  Las tendencias globales muestran un mercado que se mueve hacia un mayor equilibrio en 2024/25, con un
                  crecimiento constante en el consumo y fluctuaciones en la producción. Este escenario podría generar
                  mayor volatilidad en los precios internacionales del azúcar en los próximos años.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Pestaña de Proyecciones por País */}
          <TabsContent value="proyecciones-paises" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-[#0a0f29] border-[#1a2040]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg">Producción por País (2023/24 vs 2024/25)</CardTitle>
                  <CardDescription className="text-gray-400">
                    Proyecciones de producción en millones de toneladas métricas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(sugarMarketProjections.countryProduction.countries)
                      .sort((a, b) => b[1]["2023/24"] - a[1]["2023/24"])
                      .slice(0, 6)
                      .map(([country, data]) => {
                        const percentageChange = calculatePercentageChange(country, "production", "2024/25", "2023/24")

                        return (
                          <div key={country}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-400">{country}</span>
                              <div className="flex items-center">
                                <span className="text-white mr-2">{data["2024/25"].toLocaleString()}</span>
                                {renderTrend(percentageChange)}
                              </div>
                            </div>
                            <div className="w-full bg-[#1a2040] h-2 rounded-full">
                              <div
                                className={`${percentageChange > 0 ? "bg-green-500" : percentageChange < 0 ? "bg-red-500" : "bg-[#00a8ff]"} h-2 rounded-full`}
                                style={{ width: `${(data["2024/25"] / 45) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        )
                      })}
                  </div>

                  <div className="mt-4 bg-[#1a2040] p-3 rounded-lg">
                    <p className="text-sm text-white font-medium mb-2">Análisis de Producción</p>
                    <p className="text-xs text-gray-300">
                      Brasil e India muestran tendencias opuestas para 2024/25, con una disminución proyectada en ambos
                      países. Tailandia muestra una recuperación, mientras que la Unión Europea y Estados Unidos
                      mantienen niveles relativamente estables.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0a0f29] border-[#1a2040]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg">Exportaciones por País (2023/24 vs 2024/25)</CardTitle>
                  <CardDescription className="text-gray-400">
                    Proyecciones de exportaciones en millones de toneladas métricas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(sugarMarketProjections.countryExports.countries)
                      .sort((a, b) => b[1]["2023/24"] - a[1]["2023/24"])
                      .slice(0, 5)
                      .map(([country, data]) => {
                        const percentageChange = calculatePercentageChange(country, "exports", "2024/25", "2023/24")

                        return (
                          <div key={country}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-400">{country}</span>
                              <div className="flex items-center">
                                <span className="text-white mr-2">{data["2024/25"].toLocaleString()}</span>
                                {renderTrend(percentageChange)}
                              </div>
                            </div>
                            <div className="w-full bg-[#1a2040] h-2 rounded-full">
                              <div
                                className={`${percentageChange > 0 ? "bg-green-500" : percentageChange < 0 ? "bg-red-500" : "bg-[#00a8ff]"} h-2 rounded-full`}
                                style={{ width: `${(data["2024/25"] / 30) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        )
                      })}
                  </div>

                  <div className="mt-4 bg-[#1a2040] p-3 rounded-lg">
                    <p className="text-sm text-white font-medium mb-2">Análisis de Exportaciones</p>
                    <p className="text-xs text-gray-300">
                      Brasil mantiene su posición dominante como exportador, aunque con una disminución proyectada para
                      2024/25. India muestra una reducción significativa en sus exportaciones, mientras que Tailandia
                      aumenta su participación en el mercado global.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-[#0a0f29] border-[#1a2040]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg">Importaciones por País (2023/24 vs 2024/25)</CardTitle>
                  <CardDescription className="text-gray-400">
                    Proyecciones de importaciones en millones de toneladas métricas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(sugarMarketProjections.countryImports.countries)
                      .sort((a, b) => b[1]["2023/24"] - a[1]["2023/24"])
                      .map(([country, data]) => {
                        const percentageChange = calculatePercentageChange(country, "imports", "2024/25", "2023/24")

                        return (
                          <div key={country}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-400">{country}</span>
                              <div className="flex items-center">
                                <span className="text-white mr-2">{data["2024/25"].toLocaleString()}</span>
                                {renderTrend(percentageChange)}
                              </div>
                            </div>
                            <div className="w-full bg-[#1a2040] h-2 rounded-full">
                              <div
                                className={`${percentageChange > 0 ? "bg-green-500" : percentageChange < 0 ? "bg-red-500" : "bg-[#00a8ff]"} h-2 rounded-full`}
                                style={{ width: `${(data["2024/25"] / 6) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        )
                      })}
                  </div>

                  <div className="mt-4 bg-[#1a2040] p-3 rounded-lg">
                    <p className="text-sm text-white font-medium mb-2">Análisis de Importaciones</p>
                    <p className="text-xs text-gray-300">
                      China se mantiene como el principal importador mundial, con un ligero aumento proyectado para
                      2024/25. Indonesia, Estados Unidos y Bangladesh muestran patrones de importación relativamente
                      estables, lo que refleja una demanda constante en estos mercados.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0a0f29] border-[#1a2040]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg">Evolución de Brasil e India</CardTitle>
                  <CardDescription className="text-gray-400">
                    Tendencias de los dos principales productores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 relative">
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <LineChart className="h-12 w-12 text-[#00a8ff] mx-auto mb-4" />
                      <p className="text-gray-400">Visualización de gráfico en desarrollo</p>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-white font-medium mb-2">Brasil (Producción)</p>
                          <div className="space-y-1">
                            {Object.entries(sugarMarketProjections.countryProduction.countries["Brasil"]).map(
                              ([year, value]) => (
                                <div key={year} className="flex justify-between text-xs">
                                  <span className="text-gray-400">{year}:</span>
                                  <span className="text-white">{value.toLocaleString()} mill. ton.</span>
                                </div>
                              ),
                            )}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-white font-medium mb-2">India (Producción)</p>
                          <div className="space-y-1">
                            {Object.entries(sugarMarketProjections.countryProduction.countries["India"]).map(
                              ([year, value]) => (
                                <div key={year} className="flex justify-between text-xs">
                                  <span className="text-gray-400">{year}:</span>
                                  <span className="text-white">{value.toLocaleString()} mill. ton.</span>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 bg-[#1a2040] p-3 rounded-lg">
                    <p className="text-sm text-white font-medium mb-2">Análisis Comparativo</p>
                    <p className="text-xs text-gray-300">
                      Brasil muestra un patrón de crecimiento hasta 2023/24, seguido de una disminución en 2024/25.
                      India muestra mayor volatilidad, con una disminución significativa proyectada para 2024/25. Estos
                      dos países representan aproximadamente el 40% de la producción mundial de azúcar.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-900/30 rounded-md p-3">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-300">
                  Las proyecciones para 2024/25 muestran una disminución en la producción y exportaciones de los
                  principales países productores, lo que podría generar presiones alcistas en los precios
                  internacionales del azúcar. Los comerciantes deben monitorear de cerca la evolución de la producción
                  en Brasil e India, ya que estos países tienen un impacto significativo en el mercado global.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Pestaña de Análisis Cualitativo */}
          <TabsContent value="analisis-cualitativo" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-[#0a0f29] border-[#1a2040]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg">Tendencias Globales</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {sugarMarketProjections.qualitativeAnalysis.globalTrends.map((trend, index) => (
                      <li key={index} className="flex items-start">
                        <div className="h-5 w-5 rounded-full bg-[#1a2040] flex items-center justify-center text-[#00a8ff] text-xs mr-2 flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-sm text-gray-300">{trend}</p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-[#0a0f29] border-[#1a2040]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg">Perspectivas del Mercado</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {sugarMarketProjections.qualitativeAnalysis.marketOutlook.map((outlook, index) => (
                      <li key={index} className="flex items-start">
                        <div className="h-5 w-5 rounded-full bg-[#1a2040] flex items-center justify-center text-[#00a8ff] text-xs mr-2 flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-sm text-gray-300">{outlook}</p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-[#0a0f29] border-[#1a2040]">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg">Análisis Regional</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(sugarMarketProjections.qualitativeAnalysis.regionalInsights)
                    .slice(0, 6)
                    .map(([region, insight], index) => (
                      <div key={region} className="bg-[#1a2040] p-3 rounded-lg">
                        <div className="flex items-center mb-2">
                          <div className="h-6 w-6 rounded-full bg-[#111936] flex items-center justify-center text-[#00a8ff] text-xs mr-2">
                            {index + 1}
                          </div>
                          <p className="text-white text-sm font-medium">{region}</p>
                        </div>
                        <p className="text-xs text-gray-300 ml-8">{insight}</p>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#0a0f29] border-[#1a2040]">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg">Factores de Impacto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sugarMarketProjections.qualitativeAnalysis.impactFactors.map((factor, index) => (
                    <div key={index} className="flex items-start">
                      <div className="h-5 w-5 rounded-full bg-[#1a2040] flex items-center justify-center text-[#00a8ff] text-xs mr-2 flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-sm text-gray-300">{factor}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 bg-[#1a2040] p-3 rounded-lg">
                  <p className="text-sm text-white font-medium mb-2">Implicaciones para el Comercio</p>
                  <p className="text-xs text-gray-300">
                    Los factores mencionados interactúan de manera compleja para determinar la dinámica del mercado
                    mundial del azúcar. Los comerciantes deben considerar estos factores en conjunto al desarrollar
                    estrategias de comercialización y cobertura de riesgos.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="bg-blue-900/20 border border-blue-900/30 rounded-md p-3">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-300">
                  El análisis cualitativo sugiere un mercado en transición, con cambios significativos en los patrones
                  de producción y comercio. La disminución proyectada en la producción de India y Brasil para 2024/25,
                  combinada con un consumo en constante crecimiento, podría generar un mercado más ajustado y
                  potencialmente precios más altos en el mediano plazo.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
