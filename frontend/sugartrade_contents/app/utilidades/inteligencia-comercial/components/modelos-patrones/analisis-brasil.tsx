"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Map,
  Factory,
  Droplet,
  AlertTriangle,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  BarChart2,
  LineChart,
} from "lucide-react"
import { brazilMarketData } from "@/data/brazil-market-data"

export default function AnalisisBrasil() {
  const [activeTab, setActiveTab] = useState("produccion")

  // Función para renderizar flechas de tendencia con colores
  const renderTrend = (value: number) => {
    if (value > 0) {
      return (
        <div className="flex items-center text-green-500">
          <ArrowUpRight className="h-4 w-4 mr-1" />
          {value > 0 ? "+" : ""}
          {value}%
        </div>
      )
    } else if (value < 0) {
      return (
        <div className="flex items-center text-red-500">
          <ArrowDownRight className="h-4 w-4 mr-1" />
          {value}%
        </div>
      )
    } else {
      return <div className="text-gray-400">0%</div>
    }
  }

  return (
    <Card className="bg-[#111936] border-[#1a2040]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white text-xl">Análisis del Mercado Brasileño</CardTitle>
            <CardDescription className="text-gray-400">
              {brazilMarketData.harvestForecast.title} | Fuente: {brazilMarketData.harvestForecast.source}
            </CardDescription>
          </div>
          <div className="bg-[#1a2040] p-2 rounded-full">
            <img src="/placeholder.svg?height=24&width=24" alt="Bandera Brasil" className="h-6 w-6" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="produccion" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[#0a0f29] w-full">
            <TabsTrigger
              value="produccion"
              className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
            >
              <Factory className="h-4 w-4 mr-2" />
              Producción
            </TabsTrigger>
            <TabsTrigger value="area" className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]">
              <Map className="h-4 w-4 mr-2" />
              Área Cultivada
            </TabsTrigger>
            <TabsTrigger value="azucar" className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]">
              <Droplet className="h-4 w-4 mr-2" />
              Producción de Azúcar
            </TabsTrigger>
            <TabsTrigger
              value="analisis"
              className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
            >
              <Info className="h-4 w-4 mr-2" />
              Análisis de Impacto
            </TabsTrigger>
            <TabsTrigger
              value="tendencias"
              className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
            >
              <LineChart className="h-4 w-4 mr-2" />
              Tendencias Zafras
            </TabsTrigger>
          </TabsList>

          {/* Pestaña de Producción */}
          <TabsContent value="produccion" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-[#0a0f29] border-[#1a2040]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg">Producción Total de Caña</CardTitle>
                  <CardDescription className="text-gray-400">En miles de toneladas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-3xl font-bold text-white">
                        {brazilMarketData.harvestForecast.production.cropYear2024_25Estimate.brazilTotal.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-400">Estimación 2024/25</p>
                    </div>
                    <div className="p-3 rounded-full bg-red-500/10">
                      {renderTrend(
                        brazilMarketData.harvestForecast.production.cropYear2024_25Estimate.variationPercentage,
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Región Sudeste</span>
                        <span className="text-white">
                          {brazilMarketData.harvestForecast.production.cropYear2024_25Estimate.southeastRegion.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-[#1a2040] h-2 rounded-full">
                        <div
                          className="bg-[#00a8ff] h-2 rounded-full"
                          style={{
                            width: `${(brazilMarketData.harvestForecast.production.cropYear2024_25Estimate.southeastRegion / brazilMarketData.harvestForecast.production.cropYear2024_25Estimate.brazilTotal) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Región Centro-Oeste</span>
                        <span className="text-white">
                          {brazilMarketData.harvestForecast.production.cropYear2024_25Estimate.midwestRegion.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-[#1a2040] h-2 rounded-full">
                        <div
                          className="bg-[#00a8ff] h-2 rounded-full"
                          style={{
                            width: `${(brazilMarketData.harvestForecast.production.cropYear2024_25Estimate.midwestRegion / brazilMarketData.harvestForecast.production.cropYear2024_25Estimate.brazilTotal) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Región Nordeste</span>
                        <span className="text-white">
                          {brazilMarketData.harvestForecast.production.cropYear2024_25Estimate.northeastRegion.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-[#1a2040] h-2 rounded-full">
                        <div
                          className="bg-[#00a8ff] h-2 rounded-full"
                          style={{
                            width: `${(brazilMarketData.harvestForecast.production.cropYear2024_25Estimate.northeastRegion / brazilMarketData.harvestForecast.production.cropYear2024_25Estimate.brazilTotal) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Región Sur</span>
                        <span className="text-white">
                          {brazilMarketData.harvestForecast.production.cropYear2024_25Estimate.southRegion.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-[#1a2040] h-2 rounded-full">
                        <div
                          className="bg-[#00a8ff] h-2 rounded-full"
                          style={{
                            width: `${(brazilMarketData.harvestForecast.production.cropYear2024_25Estimate.southRegion / brazilMarketData.harvestForecast.production.cropYear2024_25Estimate.brazilTotal) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Región Norte</span>
                        <span className="text-white">
                          {brazilMarketData.harvestForecast.production.cropYear2024_25Estimate.northRegion.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-[#1a2040] h-2 rounded-full">
                        <div
                          className="bg-[#00a8ff] h-2 rounded-full"
                          style={{
                            width: `${(brazilMarketData.harvestForecast.production.cropYear2024_25Estimate.northRegion / brazilMarketData.harvestForecast.production.cropYear2024_25Estimate.brazilTotal) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0a0f29] border-[#1a2040]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg">Productividad</CardTitle>
                  <CardDescription className="text-gray-400">En kg/ha</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-3xl font-bold text-white">
                        {brazilMarketData.harvestForecast.productivity.cropYear2024_25Estimate.brazilTotal.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-400">Estimación 2024/25</p>
                    </div>
                    <div className="p-3 rounded-full bg-red-500/10">
                      {renderTrend(
                        brazilMarketData.harvestForecast.productivity.cropYear2024_25Estimate.variationPercentage,
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#1a2040] p-3 rounded-lg">
                        <p className="text-gray-400 text-xs mb-1">Sudeste</p>
                        <p className="text-white font-medium">
                          {brazilMarketData.harvestForecast.productivity.cropYear2024_25Estimate.southeastRegion.toLocaleString()}{" "}
                          kg/ha
                        </p>
                      </div>

                      <div className="bg-[#1a2040] p-3 rounded-lg">
                        <p className="text-gray-400 text-xs mb-1">Centro-Oeste</p>
                        <p className="text-white font-medium">
                          {brazilMarketData.harvestForecast.productivity.cropYear2024_25Estimate.midwestRegion.toLocaleString()}{" "}
                          kg/ha
                        </p>
                      </div>

                      <div className="bg-[#1a2040] p-3 rounded-lg">
                        <p className="text-gray-400 text-xs mb-1">Nordeste</p>
                        <p className="text-white font-medium">
                          {brazilMarketData.harvestForecast.productivity.cropYear2024_25Estimate.northeastRegion.toLocaleString()}{" "}
                          kg/ha
                        </p>
                      </div>

                      <div className="bg-[#1a2040] p-3 rounded-lg">
                        <p className="text-gray-400 text-xs mb-1">Sur</p>
                        <p className="text-white font-medium">
                          {brazilMarketData.harvestForecast.productivity.cropYear2024_25Estimate.southRegion.toLocaleString()}{" "}
                          kg/ha
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm text-gray-400 mb-2">Comparación con cosecha anterior</p>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-[#00a8ff]"></div>
                        <span className="text-gray-400 text-sm">2023/24:</span>
                        <span className="text-white text-sm">
                          {brazilMarketData.harvestForecast.productivity.cropYear2023_24.brazilTotal.toLocaleString()}{" "}
                          kg/ha
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-gray-400 text-sm">2024/25:</span>
                        <span className="text-white text-sm">
                          {brazilMarketData.harvestForecast.productivity.cropYear2024_25Estimate.brazilTotal.toLocaleString()}{" "}
                          kg/ha
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-900/30 rounded-md p-3">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-300">
                  La disminución en la productividad (-4.1%) podría indicar desafíos climáticos o agronómicos que
                  afectan al sector azucarero brasileño. Este factor debe ser monitoreado de cerca ya que Brasil es el
                  mayor productor mundial.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Pestaña de Área Cultivada */}
          <TabsContent value="area" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-[#0a0f29] border-[#1a2040]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg">Área Plantada y Cosechada</CardTitle>
                  <CardDescription className="text-gray-400">En miles de hectáreas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-3xl font-bold text-white">
                        {brazilMarketData.harvestForecast.areaPlantedAndHarvested.cropYear2024_25Estimate.brazilTotal.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-400">Estimación 2024/25</p>
                    </div>
                    <div className="p-3 rounded-full bg-green-500/10">
                      {renderTrend(
                        brazilMarketData.harvestForecast.areaPlantedAndHarvested.cropYear2024_25Estimate
                          .variationPercentage,
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Región Sudeste</span>
                        <span className="text-white">
                          {brazilMarketData.harvestForecast.areaPlantedAndHarvested.cropYear2024_25Estimate.southeastRegion.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-[#1a2040] h-2 rounded-full">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${(brazilMarketData.harvestForecast.areaPlantedAndHarvested.cropYear2024_25Estimate.southeastRegion / brazilMarketData.harvestForecast.areaPlantedAndHarvested.cropYear2024_25Estimate.brazilTotal) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Región Centro-Oeste</span>
                        <span className="text-white">
                          {brazilMarketData.harvestForecast.areaPlantedAndHarvested.cropYear2024_25Estimate.midwestRegion.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-[#1a2040] h-2 rounded-full">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${(brazilMarketData.harvestForecast.areaPlantedAndHarvested.cropYear2024_25Estimate.midwestRegion / brazilMarketData.harvestForecast.areaPlantedAndHarvested.cropYear2024_25Estimate.brazilTotal) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Otras Regiones</span>
                        <span className="text-white">
                          {(
                            brazilMarketData.harvestForecast.areaPlantedAndHarvested.cropYear2024_25Estimate
                              .northeastRegion +
                            brazilMarketData.harvestForecast.areaPlantedAndHarvested.cropYear2024_25Estimate
                              .southRegion +
                            brazilMarketData.harvestForecast.areaPlantedAndHarvested.cropYear2024_25Estimate.northRegion
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-[#1a2040] h-2 rounded-full">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${
                              ((brazilMarketData.harvestForecast.areaPlantedAndHarvested.cropYear2024_25Estimate
                                .northeastRegion +
                                brazilMarketData.harvestForecast.areaPlantedAndHarvested.cropYear2024_25Estimate
                                  .southRegion +
                                brazilMarketData.harvestForecast.areaPlantedAndHarvested.cropYear2024_25Estimate
                                  .northRegion) /
                                brazilMarketData.harvestForecast.areaPlantedAndHarvested.cropYear2024_25Estimate
                                  .brazilTotal) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0a0f29] border-[#1a2040]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg">Comparación Interanual</CardTitle>
                  <CardDescription className="text-gray-400">Cosecha 2023/24 vs 2024/25</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Cosecha 2023/24</p>
                        <p className="text-white text-xl font-medium">
                          {brazilMarketData.harvestForecast.areaPlantedAndHarvested.cropYear2023_24.brazilTotal.toLocaleString()}{" "}
                          mil ha
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Cosecha 2024/25</p>
                        <p className="text-white text-xl font-medium">
                          {brazilMarketData.harvestForecast.areaPlantedAndHarvested.cropYear2024_25Estimate.brazilTotal.toLocaleString()}{" "}
                          mil ha
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Variación</p>
                        <p className="text-green-500 text-xl font-medium">
                          +
                          {
                            brazilMarketData.harvestForecast.areaPlantedAndHarvested.cropYear2024_25Estimate
                              .variationPercentage
                          }
                          %
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#1a2040] p-3 rounded-lg">
                      <p className="text-white text-sm mb-2">Variación por Región (2024/25 vs 2023/24)</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400 text-xs">Sudeste:</span>
                          <span className="text-green-500 text-xs">
                            +
                            {(
                              (brazilMarketData.harvestForecast.areaPlantedAndHarvested.cropYear2024_25Estimate
                                .southeastRegion /
                                brazilMarketData.harvestForecast.areaPlantedAndHarvested.cropYear2023_24
                                  .southeastRegion -
                                1) *
                              100
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 text-xs">Centro-Oeste:</span>
                          <span className="text-green-500 text-xs">
                            +
                            {(
                              (brazilMarketData.harvestForecast.areaPlantedAndHarvested.cropYear2024_25Estimate
                                .midwestRegion /
                                brazilMarketData.harvestForecast.areaPlantedAndHarvested.cropYear2023_24.midwestRegion -
                                1) *
                              100
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 text-xs">Nordeste:</span>
                          <span className="text-green-500 text-xs">
                            +
                            {(
                              (brazilMarketData.harvestForecast.areaPlantedAndHarvested.cropYear2024_25Estimate
                                .northeastRegion /
                                brazilMarketData.harvestForecast.areaPlantedAndHarvested.cropYear2023_24
                                  .northeastRegion -
                                1) *
                              100
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 text-xs">Sur:</span>
                          <span className="text-red-500 text-xs">
                            {(
                              (brazilMarketData.harvestForecast.areaPlantedAndHarvested.cropYear2024_25Estimate
                                .southRegion /
                                brazilMarketData.harvestForecast.areaPlantedAndHarvested.cropYear2023_24.southRegion -
                                1) *
                              100
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400 mt-2">
                      El aumento del área plantada indica una expansión del sector azucarero en Brasil, principalmente
                      en las regiones Sudeste y Centro-Oeste, que son las principales zonas productoras.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Pestaña de Producción de Azúcar */}
          <TabsContent value="azucar" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-[#0a0f29] border-[#1a2040]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg">Producción de Azúcar</CardTitle>
                  <CardDescription className="text-gray-400">En miles de toneladas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-3xl font-bold text-white">
                        {brazilMarketData.harvestForecast.sugarProduction.cropYear2024_25Estimate.brazilTotal.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-400">Estimación 2024/25</p>
                    </div>
                    <div className="p-3 rounded-full bg-green-500/10">
                      {renderTrend(
                        brazilMarketData.harvestForecast.sugarProduction.cropYear2024_25Estimate.percentageVariation,
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Región Sudeste</span>
                        <span className="text-white">
                          {brazilMarketData.harvestForecast.sugarProduction.cropYear2024_25Estimate.southeastRegion.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-[#1a2040] h-2 rounded-full">
                        <div
                          className="bg-[#00a8ff] h-2 rounded-full"
                          style={{
                            width: `${(brazilMarketData.harvestForecast.sugarProduction.cropYear2024_25Estimate.southeastRegion / brazilMarketData.harvestForecast.sugarProduction.cropYear2024_25Estimate.brazilTotal) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Región Centro-Oeste</span>
                        <span className="text-white">
                          {brazilMarketData.harvestForecast.sugarProduction.cropYear2024_25Estimate.midwestRegion.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-[#1a2040] h-2 rounded-full">
                        <div
                          className="bg-[#00a8ff] h-2 rounded-full"
                          style={{
                            width: `${(brazilMarketData.harvestForecast.sugarProduction.cropYear2024_25Estimate.midwestRegion / brazilMarketData.harvestForecast.sugarProduction.cropYear2024_25Estimate.brazilTotal) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Región Nordeste</span>
                        <span className="text-white">
                          {brazilMarketData.harvestForecast.sugarProduction.cropYear2024_25Estimate.northeastRegion.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-[#1a2040] h-2 rounded-full">
                        <div
                          className="bg-[#00a8ff] h-2 rounded-full"
                          style={{
                            width: `${(brazilMarketData.harvestForecast.sugarProduction.cropYear2024_25Estimate.northeastRegion / brazilMarketData.harvestForecast.sugarProduction.cropYear2024_25Estimate.brazilTotal) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Región Sur</span>
                        <span className="text-white">
                          {brazilMarketData.harvestForecast.sugarProduction.cropYear2024_25Estimate.southRegion.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-[#1a2040] h-2 rounded-full">
                        <div
                          className="bg-[#00a8ff] h-2 rounded-full"
                          style={{
                            width: `${(brazilMarketData.harvestForecast.sugarProduction.cropYear2024_25Estimate.southRegion / brazilMarketData.harvestForecast.sugarProduction.cropYear2024_25Estimate.brazilTotal) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0a0f29] border-[#1a2040]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg">ATR (Azúcar Total Recuperable)</CardTitle>
                  <CardDescription className="text-gray-400">Promedio en kg/tonelada</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-3xl font-bold text-white">
                        {brazilMarketData.harvestForecast.atrProduction.cropYear2024_25Estimate.brazilTotal.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-400">Estimación 2024/25</p>
                    </div>
                    <div className="p-3 rounded-full bg-green-500/10">
                      {renderTrend(
                        brazilMarketData.harvestForecast.atrProduction.cropYear2024_25Estimate.variationPercentage,
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#1a2040] p-3 rounded-lg">
                        <p className="text-gray-400 text-xs mb-1">Sudeste</p>
                        <p className="text-white font-medium">
                          {brazilMarketData.harvestForecast.atrProduction.cropYear2024_25Estimate.southeastRegion.toLocaleString()}{" "}
                          kg/t
                        </p>
                      </div>

                      <div className="bg-[#1a2040] p-3 rounded-lg">
                        <p className="text-gray-400 text-xs mb-1">Centro-Oeste</p>
                        <p className="text-white font-medium">
                          {brazilMarketData.harvestForecast.atrProduction.cropYear2024_25Estimate.midwestRegion.toLocaleString()}{" "}
                          kg/t
                        </p>
                      </div>

                      <div className="bg-[#1a2040] p-3 rounded-lg">
                        <p className="text-gray-400 text-xs mb-1">Nordeste</p>
                        <p className="text-white font-medium">
                          {brazilMarketData.harvestForecast.atrProduction.cropYear2024_25Estimate.northeastRegion.toLocaleString()}{" "}
                          kg/t
                        </p>
                      </div>

                      <div className="bg-[#1a2040] p-3 rounded-lg">
                        <p className="text-gray-400 text-xs mb-1">Sur</p>
                        <p className="text-white font-medium">
                          {brazilMarketData.harvestForecast.atrProduction.cropYear2024_25Estimate.southRegion.toLocaleString()}{" "}
                          kg/t
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm text-gray-400 mb-2">Producción Total de ATR</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-xs">2023/24</p>
                          <p className="text-white text-sm">
                            {(
                              brazilMarketData.harvestForecast.atrProduction.atrTotalProduction.cropYear2023_24
                                .brazilTotal / 1000000
                            ).toFixed(2)}{" "}
                            millones t
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">2024/25</p>
                          <p className="text-white text-sm">
                            {(
                              brazilMarketData.harvestForecast.atrProduction.atrTotalProduction.cropYear2024_25Estimate
                                .brazilTotal / 1000000
                            ).toFixed(2)}{" "}
                            millones t
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Variación</p>
                          <p className="text-red-500 text-sm">
                            {
                              brazilMarketData.harvestForecast.atrProduction.atrTotalProduction.cropYear2024_25Estimate
                                .variationPercentage
                            }
                            %
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-blue-900/20 border border-blue-900/30 rounded-md p-3">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-300">
                  A pesar de la disminución en la producción total de caña (-3.8%), la producción de azúcar muestra un
                  ligero aumento (+1.3%). Esto sugiere una mayor destinación de la caña a la producción de azúcar en
                  detrimento del etanol, posiblemente debido a mejores precios relativos del azúcar en el mercado
                  internacional.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Pestaña de Análisis de Impacto */}
          <TabsContent value="analisis" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-[#0a0f29] border-[#1a2040]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg">Datos Clave</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {brazilMarketData.keyInsights.map((insight, index) => (
                      <li key={index} className="flex items-start">
                        <div className="h-5 w-5 rounded-full bg-[#1a2040] flex items-center justify-center text-[#00a8ff] text-xs mr-2 flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-sm text-gray-300">{insight}</p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-[#0a0f29] border-[#1a2040]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg">Impacto en el Mercado</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {brazilMarketData.marketImpact.map((impact, index) => (
                      <li key={index} className="flex items-start">
                        <div className="h-5 w-5 rounded-full bg-[#1a2040] flex items-center justify-center text-[#00a8ff] text-xs mr-2 flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-sm text-gray-300">{impact}</p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-[#0a0f29] border-[#1a2040]">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg">Análisis Comparativo Regional</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-300">
                    Brasil, como mayor productor mundial de azúcar, tiene un impacto significativo en los precios y
                    tendencias globales. La comparación con otros mercados regionales como Argentina muestra contrastes
                    importantes:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#1a2040] p-3 rounded-lg">
                      <h3 className="text-white font-medium mb-2">Brasil</h3>
                      <ul className="space-y-1 text-sm text-gray-300">
                        <li className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                          Aumento en área plantada (+4.1%)
                        </li>
                        <li className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                          Disminución en productividad (-4.1%)
                        </li>
                        <li className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                          Aumento en producción de azúcar (+1.3%)
                        </li>
                        <li className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                          Enfoque en expansión de área cultivada
                        </li>
                      </ul>
                    </div>

                    <div className="bg-[#1a2040] p-3 rounded-lg">
                      <h3 className="text-white font-medium mb-2">Argentina</h3>
                      <ul className="space-y-1 text-sm text-gray-300">
                        <li className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                          Caída en exportaciones (-57.19%)
                        </li>
                        <li className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                          Exceso de oferta interna (250-300 mil ton)
                        </li>
                        <li className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                          Pérdida de participación en mercado (-25%)
                        </li>
                        <li className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                          Impacto negativo de políticas gubernamentales
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-yellow-900/20 border border-yellow-900/30 rounded-md p-3 mt-4">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-300">
                        El contraste entre el crecimiento de Brasil y las dificultades de Argentina podría generar
                        oportunidades de arbitraje y comercio regional. La diferencia en políticas gubernamentales y
                        condiciones de mercado sugiere la necesidad de estrategias comerciales diferenciadas para cada
                        mercado.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nueva pestaña de Tendencias Zafras */}
          <TabsContent value="tendencias" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-[#0a0f29] border-[#1a2040]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg">Evolución de Producción de Azúcar</CardTitle>
                  <CardDescription className="text-gray-400">
                    Comparativa de las últimas tres zafras (miles de toneladas)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BarChart2 className="h-12 w-12 text-[#00a8ff] mx-auto mb-4" />
                      <p className="text-gray-400">Visualización de gráfico en desarrollo</p>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0">
                      <div className="space-y-3 mt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                            <span className="text-gray-400 text-xs">2022/23:</span>
                          </div>
                          <span className="text-white text-xs">
                            {brazilMarketData.detailedHarvestData.sugarProduction.historicalData.cropYear2022_23.toLocaleString()}{" "}
                            mil ton
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                            <span className="text-gray-400 text-xs">2023/24:</span>
                          </div>
                          <span className="text-white text-xs">
                            {brazilMarketData.detailedHarvestData.sugarProduction.historicalData.cropYear2023_24.toLocaleString()}{" "}
                            mil ton
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                            <span className="text-gray-400 text-xs">2024/25 (est):</span>
                          </div>
                          <span className="text-white text-xs">
                            {brazilMarketData.detailedHarvestData.sugarProduction.historicalData.cropYear2024_25.toLocaleString()}{" "}
                            mil ton
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">Variación 2022/23 a 2023/24:</span>
                      <span className="text-green-500 text-sm">
                        +{brazilMarketData.detailedHarvestData.sugarProduction.historicalData.variation2022To2023}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Variación 2023/24 a 2024/25:</span>
                      <span className="text-green-500 text-sm">
                        +{brazilMarketData.detailedHarvestData.sugarProduction.historicalData.variation2023To2024}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0a0f29] border-[#1a2040]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg">Evolución de ATR</CardTitle>
                  <CardDescription className="text-gray-400">Azúcar Total Recuperable (kg/tonelada)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <LineChart className="h-12 w-12 text-[#00a8ff] mx-auto mb-4" />
                      <p className="text-gray-400">Visualización de gráfico en desarrollo</p>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0">
                      <div className="space-y-3 mt-4">
                        {brazilMarketData.detailedHarvestData.atrData.averageATR.slice(0, 5).map((region, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-[#00a8ff] mr-2"></div>
                              <span className="text-gray-400 text-xs">{region.region}:</span>
                            </div>
                            <div className="flex space-x-4">
                              <span className="text-white text-xs">
                                {region.cropYear2022_23} → {region.cropYear2023_24} → {region.cropYear2024_25} kg/t
                              </span>
                              <span
                                className={
                                  region.variation2023To2024 >= 0 ? "text-green-500 text-xs" : "text-red-500 text-xs"
                                }
                              >
                                {region.variation2023To2024 >= 0 ? "+" : ""}
                                {region.variation2023To2024}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">Producción Total ATR 2023/24:</span>
                      <span className="text-white text-sm">
                        {(brazilMarketData.detailedHarvestData.atrData.totalProduction.cropYear2023_24 / 1000).toFixed(
                          1,
                        )}{" "}
                        millones ton
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Producción Total ATR 2024/25 (est):</span>
                      <span className="text-white text-sm">
                        {(brazilMarketData.detailedHarvestData.atrData.totalProduction.cropYear2024_25 / 1000).toFixed(
                          1,
                        )}{" "}
                        millones ton
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-gray-400 text-sm">Variación:</span>
                      <span
                        className={
                          brazilMarketData.detailedHarvestData.atrData.totalProduction.variation2023To2024 >= 0
                            ? "text-green-500 text-sm"
                            : "text-red-500 text-sm"
                        }
                      >
                        {brazilMarketData.detailedHarvestData.atrData.totalProduction.variation2023To2024 >= 0
                          ? "+"
                          : ""}
                        {brazilMarketData.detailedHarvestData.atrData.totalProduction.variation2023To2024}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-[#0a0f29] border-[#1a2040]">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg">Análisis Cualitativo de Zafras</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-[#111936] p-4 rounded-lg border border-[#1a2040]">
                    <div className="flex items-center mb-2">
                      <Calendar className="h-5 w-5 text-[#00a8ff] mr-2" />
                      <h3 className="text-white font-medium">Zafra 2023/24</h3>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-300">
                        <span className="text-[#00a8ff] font-medium">Producción: </span>
                        {brazilMarketData.detailedHarvestData.qualitativeAnalysis.cropYear2023_24.productionIncrease}
                      </p>
                      <p className="text-sm text-gray-300">
                        <span className="text-[#00a8ff] font-medium">Desempeño Regional: </span>
                        {brazilMarketData.detailedHarvestData.qualitativeAnalysis.cropYear2023_24.regionalPerformance}
                      </p>
                      <p className="text-sm text-gray-300">
                        <span className="text-[#00a8ff] font-medium">Calidad ATR: </span>
                        {brazilMarketData.detailedHarvestData.qualitativeAnalysis.cropYear2023_24.atrQuality}
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#111936] p-4 rounded-lg border border-[#1a2040]">
                    <div className="flex items-center mb-2">
                      <Calendar className="h-5 w-5 text-[#00a8ff] mr-2" />
                      <h3 className="text-white font-medium">Zafra 2024/25 (Estimada)</h3>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-300">
                        <span className="text-[#00a8ff] font-medium">Producción: </span>
                        {brazilMarketData.detailedHarvestData.qualitativeAnalysis.cropYear2024_25.productionIncrease}
                      </p>
                      <p className="text-sm text-gray-300">
                        <span className="text-[#00a8ff] font-medium">Desempeño Regional: </span>
                        {brazilMarketData.detailedHarvestData.qualitativeAnalysis.cropYear2024_25.regionalPerformance}
                      </p>
                      <p className="text-sm text-gray-300">
                        <span className="text-[#00a8ff] font-medium">Calidad ATR: </span>
                        {brazilMarketData.detailedHarvestData.qualitativeAnalysis.cropYear2024_25.atrQuality}
                      </p>
                      <p className="text-sm text-gray-300">
                        <span className="text-[#00a8ff] font-medium">Contexto General: </span>
                        {brazilMarketData.detailedHarvestData.qualitativeAnalysis.cropYear2024_25.generalContext}
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-900/20 border border-blue-900/30 rounded-md p-3">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-300">
                        La tendencia de crecimiento sostenido en la producción de azúcar en Brasil durante las últimas
                        tres zafras (2022/23 a 2024/25) muestra un sector en expansión, aunque con una desaceleración en
                        el ritmo de crecimiento. El aumento del 12.2% en 2023/24 se modera a un 6.4% estimado para
                        2024/25, lo que podría indicar una estabilización del mercado o un ajuste en la distribución
                        entre producción de azúcar y etanol.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
