"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingDown,
  AlertTriangle,
  BarChart,
  Factory,
  TrendingUp,
  ExternalLink,
  Info,
  DollarSign,
  Percent,
} from "lucide-react"
import { argentinaMarketData } from "@/data/argentina-market-data"

export default function AnalisisArgentina() {
  const [activeTab, setActiveTab] = useState("produccion")

  return (
    <Card className="bg-[#111936] border-[#1a2040]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white text-xl">Análisis del Mercado Argentino</CardTitle>
            <CardDescription className="text-gray-400">
              Datos históricos y tendencias del sector azucarero en Argentina
            </CardDescription>
          </div>
          <div className="bg-[#1a2040] p-2 rounded-full">
            <img src="/placeholder.svg?height=24&width=24" alt="Bandera Argentina" className="h-6 w-6" />
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
            <TabsTrigger
              value="exportaciones"
              className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Exportaciones
            </TabsTrigger>
            <TabsTrigger
              value="mercado"
              className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
            >
              <BarChart className="h-4 w-4 mr-2" />
              Mercado Interno
            </TabsTrigger>
            <TabsTrigger
              value="precios"
              className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Precios 2025
            </TabsTrigger>
            <TabsTrigger
              value="factores"
              className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
            >
              <Info className="h-4 w-4 mr-2" />
              Factores Cualitativos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="produccion" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-[#0a0f29] border-[#1a2040]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium">Producción de Azúcar</h3>
                    <div
                      className={`p-1.5 rounded-full ${argentinaMarketData.production.sugarProduction["2022-2023"] > 0 ? "bg-green-500/20" : "bg-red-500/20"}`}
                    >
                      {argentinaMarketData.production.sugarProduction["2022-2023"] > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Variación 2022-2023:</span>
                      <span
                        className={`font-medium ${argentinaMarketData.production.sugarProduction["2022-2023"] > 0 ? "text-green-500" : "text-red-500"}`}
                      >
                        {argentinaMarketData.production.sugarProduction["2022-2023"] > 0 ? "+" : ""}
                        {argentinaMarketData.production.sugarProduction["2022-2023"]}%
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Variación 2010-2023:</span>
                      <span
                        className={`font-medium ${argentinaMarketData.production.sugarProduction["2010-2023"] > 0 ? "text-green-500" : "text-red-500"}`}
                      >
                        {argentinaMarketData.production.sugarProduction["2010-2023"]}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#1a2040]">
                    <p className="text-xs text-gray-400">
                      La producción aumentó en el último año pero sigue siendo significativamente menor que en 2010,
                      mostrando un estancamiento a largo plazo.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0a0f29] border-[#1a2040]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium">Producción de Bioetanol</h3>
                    <div className="p-1.5 rounded-full bg-red-500/20">
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Producción Q1-Q3 2023:</span>
                      <span className="font-medium text-red-500">
                        {argentinaMarketData.production.bioethanol["2022-2023_Q1-Q3"].production}%
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Entregas Q1-Q3 2023:</span>
                      <span className="font-medium text-red-500">
                        {argentinaMarketData.production.bioethanol["2022-2023_Q1-Q3"].deliveries}%
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Entregas vs 2017:</span>
                      <span className="font-medium text-red-500">
                        {argentinaMarketData.production.bioethanol["2017-2023"]}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#1a2040]">
                    <p className="text-xs text-gray-400">
                      Fuerte caída en la producción y entregas de bioetanol, con una tendencia negativa sostenida desde
                      2017.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-900/30 rounded-md p-3">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-300">
                  Los problemas del sector del limón han llevado a que productores abandonen sus cultivos habituales y
                  planten caña (entre 20 a 30 mil hectáreas), agravando los problemas del mercado azucarero.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="exportaciones" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-[#0a0f29] border-[#1a2040]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium">Exportaciones 2023 (Q1-Q3)</h3>
                    <div className="p-1.5 rounded-full bg-red-500/20">
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Azúcar:</span>
                      <span className="font-medium text-red-500">
                        {argentinaMarketData.exports["2022-2023_Q1-Q3"].sugar}%
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Alcohol:</span>
                      <span className="font-medium text-red-500">
                        {argentinaMarketData.exports["2022-2023_Q1-Q3"].alcohol}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#1a2040]">
                    <p className="text-xs text-gray-400">
                      Caída drástica en las exportaciones tanto de azúcar como de alcohol en los primeros 9 meses de
                      2023 respecto al mismo periodo de 2022.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0a0f29] border-[#1a2040]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium">Azúcar Orgánica</h3>
                    <div className="p-1.5 rounded-full bg-red-500/20">
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Posición 2017-2021:</span>
                      <span className="font-medium text-green-500">Top 4 mundial</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Nivel 2023 vs años anteriores:</span>
                      <span className="font-medium text-red-500">
                        {argentinaMarketData.exports.organicSugar["2023"]}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#1a2040]">
                    <p className="text-xs text-gray-400">
                      Argentina pasó de ser uno de los 4 mayores exportadores mundiales de azúcar orgánica a reducir sus
                      exportaciones al 20% de ese nivel.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-[#0a0f29] border-[#1a2040]">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg">Análisis de Exportaciones 2025</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h3 className="text-white font-medium">Cálculo con Dólar Oficial</h3>
                    <div className="bg-[#111936] p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 text-sm">Azúcar Refinada (FOB):</span>
                        <span className="text-white font-medium">
                          $
                          {argentinaMarketData.marketAnalysis2025.externalMarket.exportCalculation.officialDollar.refinedSugar50kgBagFOB.toLocaleString(
                            "es-AR",
                            { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 text-sm">Azúcar Cruda (FOB):</span>
                        <span className="text-white font-medium">
                          $
                          {argentinaMarketData.marketAnalysis2025.externalMarket.exportCalculation.officialDollar.crudeSugar50kgBagFOB.toLocaleString(
                            "es-AR",
                            { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 text-sm">Costo Externalización:</span>
                        <span className="text-red-500 font-medium">
                          -$
                          {argentinaMarketData.marketAnalysis2025.externalMarket.exportCalculation.officialDollar.externalizationCostUSD50.toLocaleString(
                            "es-AR",
                            { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-[#1a2040]">
                        <span className="text-gray-400 text-sm">Precio Aprox. con IVA:</span>
                        <span className="text-white font-medium">
                          $
                          {argentinaMarketData.marketAnalysis2025.externalMarket.exportCalculation.officialDollar.approximateCTAWithIVA.toLocaleString(
                            "es-AR",
                            { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Precio Doméstico:</span>
                        <span className="text-white font-medium">
                          $
                          {argentinaMarketData.marketAnalysis2025.externalMarket.exportCalculation.officialDollar.domesticPriceWithIVA.toLocaleString(
                            "es-AR",
                            { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-[#1a2040]">
                        <span className="text-gray-400 text-sm">Diferencia:</span>
                        <span className="text-green-500 font-medium">
                          +$
                          {argentinaMarketData.marketAnalysis2025.externalMarket.exportCalculation.officialDollar.differenceConvenience.amount.toLocaleString(
                            "es-AR",
                            { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                          )}
                          (
                          {
                            argentinaMarketData.marketAnalysis2025.externalMarket.exportCalculation.officialDollar
                              .differenceConvenience.percentage
                          }
                          %)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-white font-medium">Cálculo con Dólar Blue</h3>
                    <div className="bg-[#111936] p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 text-sm">Azúcar Refinada (FOB):</span>
                        <span className="text-white font-medium">
                          $
                          {argentinaMarketData.marketAnalysis2025.externalMarket.exportCalculation.blueDollar.refinedSugar50kgBagFOB.toLocaleString(
                            "es-AR",
                            { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 text-sm">Azúcar Cruda (FOB):</span>
                        <span className="text-white font-medium">
                          $
                          {argentinaMarketData.marketAnalysis2025.externalMarket.exportCalculation.blueDollar.crudeSugar50kgBagFOB.toLocaleString(
                            "es-AR",
                            { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 text-sm">Costo Externalización:</span>
                        <span className="text-red-500 font-medium">
                          -$
                          {argentinaMarketData.marketAnalysis2025.externalMarket.exportCalculation.blueDollar.externalizationCostUSD50.toLocaleString(
                            "es-AR",
                            { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-[#1a2040]">
                        <span className="text-gray-400 text-sm">Precio Aprox. con IVA:</span>
                        <span className="text-white font-medium">
                          $
                          {argentinaMarketData.marketAnalysis2025.externalMarket.exportCalculation.blueDollar.approximateCTAWithIVA.toLocaleString(
                            "es-AR",
                            { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Precio Doméstico:</span>
                        <span className="text-white font-medium">
                          $
                          {argentinaMarketData.marketAnalysis2025.externalMarket.exportCalculation.blueDollar.domesticPriceWithIVA.toLocaleString(
                            "es-AR",
                            { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-[#1a2040]">
                        <span className="text-gray-400 text-sm">Diferencia:</span>
                        <span className="text-green-500 font-medium">
                          +$
                          {argentinaMarketData.marketAnalysis2025.externalMarket.exportCalculation.blueDollar.differenceConvenience.amount.toLocaleString(
                            "es-AR",
                            { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                          )}
                          (
                          {
                            argentinaMarketData.marketAnalysis2025.externalMarket.exportCalculation.blueDollar
                              .differenceConvenience.percentage
                          }
                          %)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-900/20 border border-green-900/30 rounded-md p-3 mt-4">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-300">
                      Existe una clara oportunidad de arbitraje entre el mercado doméstico y el de exportación,
                      especialmente considerando el tipo de cambio paralelo (blue). La diferencia de hasta un 27.06%
                      sugiere que la exportación podría ser más rentable que la venta en el mercado interno.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mercado" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-[#0a0f29] border-[#1a2040]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium">Participación de Mercado</h3>
                    <div className="p-1.5 rounded-full bg-red-500/20">
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Pérdida últimos 12 años:</span>
                      <span className="font-medium text-red-500">
                        {argentinaMarketData.domesticMarket["last-12-years"].marketShareLoss}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#1a2040]">
                    <p className="text-xs text-gray-400">
                      En los últimos 12 años, el azúcar de caña perdió aproximadamente un 25% de su participación en el
                      mercado interno de edulcorantes a expensas de los edulcorantes artificiales y de maíz.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0a0f29] border-[#1a2040]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium">Exceso de Oferta 2023</h3>
                    <div className="p-1.5 rounded-full bg-red-500/20">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Rango estimado:</span>
                      <span className="font-medium text-white">
                        {argentinaMarketData.domesticMarket["2023"].excessSupply.min / 1000} -{" "}
                        {argentinaMarketData.domesticMarket["2023"].excessSupply.max / 1000} mil ton
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#1a2040]">
                    <p className="text-xs text-gray-400">
                      La reducción en las exportaciones de azúcar y de entregas de bioetanol ha provocado un exceso de
                      oferta en el mercado interno de entre 250 a 300 mil toneladas de azúcar blanca.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-[#0a0f29] border-[#1a2040]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-medium">Precios Domésticos</h3>
                  <div className="p-1.5 rounded-full bg-red-500/20">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  </div>
                </div>

                <div className="mt-2">
                  <p className="text-sm text-gray-400">
                    Después de gozar de precios domésticos cercanos a los internacionales por unos 8 meses (en zafra
                    2022-23), el contexto actual provocó un estancamiento en los precios en valores nominales, que
                    implica una fuerte reducción por la alta inflación imperante desde hace 4 meses.
                  </p>

                  <p className="text-sm text-gray-400 mt-2">
                    El precio del azúcar doméstico ha sido históricamente menor al del Contrato Nº 5 de la bolsa de
                    LONDRES (precio doméstico de los más bajos del mundo, solo comparables con los de Brasil o la
                    India).
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="precios" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-[#0a0f29] border-[#1a2040]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg">Precios Actuales (13/03/2025)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-[#111936] p-3 rounded-lg">
                      <h3 className="text-white font-medium mb-2">Azúcar Blanco Tipo A (Bolsa 50kg)</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">Desde Ingenio (con IVA):</span>
                          <span className="text-white font-medium">
                            $
                            {argentinaMarketData.marketAnalysis2025.domesticMarket.currentPriceRanges.whiteSugar50kgBag.vatIncluded.fromMill.toLocaleString(
                              "es-AR",
                              { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">Con Entrega (con IVA):</span>
                          <span className="text-white font-medium">
                            $
                            {argentinaMarketData.marketAnalysis2025.domesticMarket.currentPriceRanges.whiteSugar50kgBag.vatIncluded.withDelivery.toLocaleString(
                              "es-AR",
                              { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">Venta (con IVA):</span>
                          <span className="text-white font-medium">
                            $
                            {argentinaMarketData.marketAnalysis2025.domesticMarket.currentPriceRanges.whiteSugar50kgBag.vatIncluded.sale.toLocaleString(
                              "es-AR",
                              { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#111936] p-3 rounded-lg">
                      <h3 className="text-white font-medium mb-2">Azúcar Blanco Tipo A (Bolsa 50kg) - Sin IVA</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">Desde Ingenio:</span>
                          <span className="text-white font-medium">
                            $
                            {argentinaMarketData.marketAnalysis2025.domesticMarket.currentPriceRanges.whiteSugar50kgBag.vatExcluded.fromMill.toLocaleString(
                              "es-AR",
                              { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">Con Entrega:</span>
                          <span className="text-white font-medium">
                            $
                            {argentinaMarketData.marketAnalysis2025.domesticMarket.currentPriceRanges.whiteSugar50kgBag.vatExcluded.withDelivery.toLocaleString(
                              "es-AR",
                              { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">Venta:</span>
                          <span className="text-white font-medium">
                            $
                            {argentinaMarketData.marketAnalysis2025.domesticMarket.currentPriceRanges.whiteSugar50kgBag.vatExcluded.sale.toLocaleString(
                              "es-AR",
                              { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0a0f29] border-[#1a2040]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg">Comparación Interanual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-[#111936] p-3 rounded-lg">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Precio Nominal 13/03/2024</p>
                          <p className="text-white font-medium">
                            $
                            {argentinaMarketData.marketAnalysis2025.domesticMarket.priceComparison.nominalPrice_13_03_2024.toLocaleString(
                              "es-AR",
                              { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Valor Acumulado por IPC</p>
                          <p className="text-white font-medium">
                            $
                            {argentinaMarketData.marketAnalysis2025.domesticMarket.priceComparison.accumulatedValueInterannualIPC.toLocaleString(
                              "es-AR",
                              { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Precio Nominal Actual</p>
                          <p className="text-white font-medium">
                            $
                            {argentinaMarketData.marketAnalysis2025.domesticMarket.priceComparison.currentNominalPrice_13_03_2025.toLocaleString(
                              "es-AR",
                              { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Precio Real Actual</p>
                          <p className="text-white font-medium">
                            $
                            {argentinaMarketData.marketAnalysis2025.domesticMarket.priceComparison.currentRealPrice_13_03_2025.toLocaleString(
                              "es-AR",
                              { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-[#1a2040]">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">Disminución real interanual:</span>
                          <span className="text-red-500 font-medium">
                            {
                              argentinaMarketData.marketAnalysis2025.domesticMarket.priceComparison
                                .interannualDecreaseRealPrice
                            }
                            %
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#111936] p-3 rounded-lg">
                      <h3 className="text-white font-medium mb-2">Inflación Acumulada (2024-2025)</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-xs">Octubre 2024:</span>
                          <span className="text-white text-xs">
                            {argentinaMarketData.marketAnalysis2025.domesticMarket.accumulatedInflation.october2024}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-xs">Noviembre 2024:</span>
                          <span className="text-white text-xs">
                            {argentinaMarketData.marketAnalysis2025.domesticMarket.accumulatedInflation.november2024}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-xs">Diciembre 2024:</span>
                          <span className="text-white text-xs">
                            {argentinaMarketData.marketAnalysis2025.domesticMarket.accumulatedInflation.december2024}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-xs">Enero 2025:</span>
                          <span className="text-white text-xs">
                            {argentinaMarketData.marketAnalysis2025.domesticMarket.accumulatedInflation.january2025}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-[#0a0f29] border-[#1a2040]">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg">Precios Internacionales (2025)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#111936] p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-medium">Azúcar Refinada</h3>
                      <div className="p-1.5 rounded-full bg-blue-500/20">
                        <DollarSign className="h-4 w-4 text-blue-500" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      US${" "}
                      {argentinaMarketData.marketAnalysis2025.externalMarket.internationalPriceEvolution.refinedSugarTonUSD.toLocaleString(
                        "es-AR",
                        { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                      )}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Por tonelada (sin costos de exportación)</p>
                  </div>

                  <div className="bg-[#111936] p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-medium">Azúcar Cruda</h3>
                      <div className="p-1.5 rounded-full bg-blue-500/20">
                        <DollarSign className="h-4 w-4 text-blue-500" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      US${" "}
                      {argentinaMarketData.marketAnalysis2025.externalMarket.internationalPriceEvolution.crudeSugarTonUSD.toLocaleString(
                        "es-AR",
                        { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                      )}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Por tonelada (sin costos de exportación)</p>
                  </div>

                  <div className="bg-[#111936] p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-medium">Promedio</h3>
                      <div className="p-1.5 rounded-full bg-blue-500/20">
                        <DollarSign className="h-4 w-4 text-blue-500" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      US${" "}
                      {argentinaMarketData.marketAnalysis2025.externalMarket.internationalPriceEvolution.averageSugarTonUSD.toLocaleString(
                        "es-AR",
                        { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                      )}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Por tonelada (sin costos de exportación/importación)</p>
                  </div>
                </div>

                <div className="bg-red-900/20 border border-red-900/30 rounded-md p-3 mt-4">
                  <div className="flex items-start">
                    <Percent className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-300">
                      El precio real del azúcar ha disminuido un{" "}
                      {
                        argentinaMarketData.marketAnalysis2025.domesticMarket.priceComparison
                          .interannualDecreaseRealPrice
                      }
                      % interanual debido al impacto de la inflación. A pesar del aumento nominal, el valor real ha
                      caído significativamente, afectando la rentabilidad del sector.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="factores" className="mt-4 space-y-4">
            <Card className="bg-[#0a0f29] border-[#1a2040]">
              <CardContent className="p-4">
                <h3 className="text-white font-medium mb-2">Políticas Gubernamentales</h3>

                <ul className="space-y-2 text-sm text-gray-400">
                  {argentinaMarketData.qualitativeFactors.governmentPolicies.details.map((detail, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-3 pt-3 border-t border-[#1a2040]">
                  <p className="text-xs text-gray-400">
                    El estancamiento y achique del sector Sucro-alcoholero se dio no obstante tener un mercado mundial,
                    en los últimos 20 años, muy favorable en precios y demanda del azúcar, alcohol y biocombustibles, y
                    fue consecuencia de las políticas fiscales, cambiarias y regulaciones del Gobierno Nacional.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-[#0a0f29] border-[#1a2040]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium">Tendencias de Mercado</h3>
                    <div className="p-1.5 rounded-full bg-red-500/20">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    </div>
                  </div>

                  <p className="text-sm text-gray-400">
                    {argentinaMarketData.qualitativeFactors.marketTrends.cropSubstitution.details}
                  </p>

                  <div className="mt-3 pt-3 border-t border-[#1a2040]">
                    <p className="text-xs text-gray-400">
                      Este cambio de cultivos está agravando los problemas del mercado azucarero y de estos productores.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0a0f29] border-[#1a2040]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium">Potencial de Crecimiento</h3>
                    <div className="p-1.5 rounded-full bg-green-500/20">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                  </div>

                  <ul className="space-y-1 text-sm text-gray-400">
                    {argentinaMarketData.qualitativeFactors.marketTrends.potentialGrowth.sectors.map(
                      (sector, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          <span>{sector}</span>
                        </li>
                      ),
                    )}
                  </ul>

                  <div className="mt-3 pt-3 border-t border-[#1a2040]">
                    <p className="text-xs text-gray-400">
                      Estos sectores podrían tener un desarrollo excepcional ya que la competitividad del sector
                      argentino lo permitiría, si se modifican las políticas restrictivas actuales.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-[#0a0f29] border-[#1a2040]">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg">Insights Clave (2025)</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {argentinaMarketData.marketAnalysis2025.keyInsights.map((insight, index) => (
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
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
