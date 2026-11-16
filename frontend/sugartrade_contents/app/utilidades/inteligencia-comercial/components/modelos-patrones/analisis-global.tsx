"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart2,
  LineChart,
  Globe,
  TrendingUp,
  DollarSign,
  BarChart,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  AlertTriangle,
} from "lucide-react"
import { globalSugarMarketData } from "@/data/global-sugar-market-data"

export default function AnalisisGlobal() {
  const [activeTab, setActiveTab] = useState("produccion")

  // Función para renderizar flechas de tendencia con colores
  const renderTrend = (trend: string, value: number) => {
    if (trend === "aumento" || value > 0) {
      return (
        <div className="flex items-center text-green-500">
          <ArrowUpRight className="h-4 w-4 mr-1" />
          {value > 0 ? "+" : ""}
          {Math.abs(value)}%
        </div>
      )
    } else if (trend === "disminución" || value < 0) {
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
            <CardTitle className="text-white text-xl">Análisis del Mercado Mundial del Azúcar</CardTitle>
            <CardDescription className="text-gray-400">
              Fuente: {globalSugarMarketData.globalProduction.source}
            </CardDescription>
          </div>
          <div className="bg-[#1a2040] p-2 rounded-full">
            <Globe className="h-6 w-6 text-[#00a8ff]" />
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
              <BarChart className="h-4 w-4 mr-2" />
              Producción Global
            </TabsTrigger>
            <TabsTrigger value="paises" className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]">
              <PieChart className="h-4 w-4 mr-2" />
              Principales Países
            </TabsTrigger>
            <TabsTrigger
              value="precios"
              className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Precios Mundiales
            </TabsTrigger>
            <TabsTrigger
              value="tendencias"
              className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Tendencias
            </TabsTrigger>
          </TabsList>

          {/* Pestaña de Producción Global */}
          <TabsContent value="produccion" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-[#0a0f29] border-[#1a2040]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg">Producción Mundial</CardTitle>
                  <CardDescription className="text-gray-400">En millones de toneladas métricas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-3xl font-bold text-white">
                        {globalSugarMarketData.globalProduction.yearlyData["2021/22"].production.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-400">Estimación 2021/22</p>
                    </div>
                    <div className="p-3 rounded-full bg-red-500/10">
                      {renderTrend(
                        "disminución",
                        globalSugarMarketData.globalProduction.yearlyData["2021/22"].percentageChange,
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">2019/20:</span>
                      <span className="text-white">
                        {globalSugarMarketData.globalProduction.yearlyData["2019/20"].production.toLocaleString()} mill.
                        ton.
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">2020/21:</span>
                      <span className="text-white">
                        {globalSugarMarketData.globalProduction.yearlyData["2020/21"].production.toLocaleString()} mill.
                        ton.
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">2021/22:</span>
                      <span className="text-white">
                        {globalSugarMarketData.globalProduction.yearlyData["2021/22"].production.toLocaleString()} mill.
                        ton.
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-gray-300">
                      {globalSugarMarketData.globalProduction.yearlyData["2021/22"].notes}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0a0f29] border-[#1a2040]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg">Consumo Mundial</CardTitle>
                  <CardDescription className="text-gray-400">En millones de toneladas métricas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-3xl font-bold text-white">
                        {globalSugarMarketData.globalConsumption.yearlyData["2021/22"].consumption.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-400">Estimación 2021/22</p>
                    </div>
                    <div className="p-3 rounded-full bg-green-500/10">
                      {renderTrend(
                        "aumento",
                        globalSugarMarketData.globalConsumption.yearlyData["2021/22"].percentageChange,
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">2019/20:</span>
                      <span className="text-white">
                        {globalSugarMarketData.globalConsumption.yearlyData["2019/20"].consumption.toLocaleString()}{" "}
                        mill. ton.
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">2020/21:</span>
                      <span className="text-white">
                        {globalSugarMarketData.globalConsumption.yearlyData["2020/21"].consumption.toLocaleString()}{" "}
                        mill. ton.
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">2021/22:</span>
                      <span className="text-white">
                        {globalSugarMarketData.globalConsumption.yearlyData["2021/22"].consumption.toLocaleString()}{" "}
                        mill. ton.
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-gray-300">
                      Principales mercados en crecimiento:{" "}
                      {globalSugarMarketData.globalConsumption.yearlyData["2021/22"].growthMarkets.join(", ")}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0a0f29] border-[#1a2040]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg">Exportaciones Mundiales</CardTitle>
                  <CardDescription className="text-gray-400">En millones de toneladas métricas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-3xl font-bold text-white">
                        {globalSugarMarketData.globalExports.yearlyData["2021/22"].exports.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-400">Estimación 2021/22</p>
                    </div>
                    <div className="p-3 rounded-full bg-red-500/10">
                      {renderTrend(
                        "disminución",
                        globalSugarMarketData.globalExports.yearlyData["2021/22"].percentageChange,
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">2019/20:</span>
                      <span className="text-white">
                        {globalSugarMarketData.globalExports.yearlyData["2019/20"].exports.toLocaleString()} mill. ton.
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">2020/21:</span>
                      <span className="text-white">
                        {globalSugarMarketData.globalExports.yearlyData["2020/21"].exports.toLocaleString()} mill. ton.
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">2021/22:</span>
                      <span className="text-white">
                        {globalSugarMarketData.globalExports.yearlyData["2021/22"].exports.toLocaleString()} mill. ton.
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-gray-300">
                      {globalSugarMarketData.globalExports.yearlyData["2021/22"].notes}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="h-64 relative bg-[#0a0f29] border border-[#1a2040] rounded-lg">
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <BarChart2 className="h-12 w-12 text-[#00a8ff] mx-auto mb-4" />
                <p className="text-gray-400">Visualización de gráfico en desarrollo</p>
                <p className="text-sm text-gray-500 mt-2">Producción, Consumo y Exportaciones Mundiales (2019-2022)</p>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-900/30 rounded-md p-3">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-300">
                  La disminución en la producción mundial de azúcar en 2021/22 se debe principalmente a la reducción en
                  Brasil causada por problemas climáticos. A pesar de esto, el consumo mundial continúa aumentando, lo
                  que podría generar presión sobre los precios si la producción no se recupera en la próxima temporada.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Pestaña de Principales Países */}
          <TabsContent value="paises" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-[#0a0f29] border-[#1a2040]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg">Principales Productores</CardTitle>
                  <CardDescription className="text-gray-400">
                    En millones de toneladas métricas (2021/22)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {globalSugarMarketData.countryData.production.countries.map((country, index) => (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">{country.name}</span>
                          <div className="flex items-center">
                            <span className="text-white mr-2">{country.value.toLocaleString()}</span>
                            {renderTrend(country.trend, country.percentageChange)}
                          </div>
                        </div>
                        <div className="w-full bg-[#1a2040] h-2 rounded-full">
                          <div
                            className={`${country.trend === "aumento" ? "bg-green-500" : country.trend === "disminución" ? "bg-red-500" : "bg-[#00a8ff]"} h-2 rounded-full`}
                            style={{ width: `${(country.value / 40) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 bg-[#1a2040] p-3 rounded-lg">
                    <p className="text-sm text-white font-medium mb-2">Análisis de Producción</p>
                    <p className="text-xs text-gray-300">
                      India supera a Brasil como el mayor productor mundial en 2021/22, con un aumento del 4.5% en su
                      producción. La disminución del 17.7% en Brasil se debe principalmente a condiciones climáticas
                      adversas que afectaron los rendimientos de la caña de azúcar.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0a0f29] border-[#1a2040]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg">Principales Exportadores</CardTitle>
                  <CardDescription className="text-gray-400">
                    En millones de toneladas métricas (2021/22)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {globalSugarMarketData.countryData.exports.countries.map((country, index) => (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">{country.name}</span>
                          <div className="flex items-center">
                            <span className="text-white mr-2">{country.value.toLocaleString()}</span>
                            {renderTrend(country.trend, country.percentageChange)}
                          </div>
                        </div>
                        <div className="w-full bg-[#1a2040] h-2 rounded-full">
                          <div
                            className={`${country.trend === "aumento" ? "bg-green-500" : country.trend === "disminución" ? "bg-red-500" : "bg-[#00a8ff]"} h-2 rounded-full`}
                            style={{ width: `${(country.value / 30) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 bg-[#1a2040] p-3 rounded-lg">
                    <p className="text-sm text-white font-medium mb-2">Análisis de Exportaciones</p>
                    <p className="text-xs text-gray-300">
                      A pesar de la disminución del 22.8%, Brasil sigue siendo el mayor exportador mundial. India
                      aumenta sus exportaciones en un 5.3%, consolidándose como el segundo exportador mundial. La
                      disminución en las exportaciones de Tailandia refleja problemas de producción en los últimos años.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-[#0a0f29] border-[#1a2040]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg">Principales Importadores</CardTitle>
                  <CardDescription className="text-gray-400">
                    En millones de toneladas métricas (2021/22)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {globalSugarMarketData.countryData.imports.countries.map((country, index) => (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">{country.name}</span>
                          <div className="flex items-center">
                            <span className="text-white mr-2">{country.value.toLocaleString()}</span>
                            {renderTrend(country.trend, country.percentageChange)}
                          </div>
                        </div>
                        <div className="w-full bg-[#1a2040] h-2 rounded-full">
                          <div
                            className={`${country.trend === "aumento" ? "bg-green-500" : country.trend === "disminución" ? "bg-red-500" : "bg-[#00a8ff]"} h-2 rounded-full`}
                            style={{ width: `${(country.value / 6) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 bg-[#1a2040] p-3 rounded-lg">
                    <p className="text-sm text-white font-medium mb-2">Análisis de Importaciones</p>
                    <p className="text-xs text-gray-300">
                      China emerge como el mayor importador mundial con un aumento significativo del 67.6% en sus
                      importaciones. Indonesia reduce sus importaciones en un 9.8%, mientras que Estados Unidos las
                      aumenta en un 10.0%. Bangladesh mantiene estables sus importaciones.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0a0f29] border-[#1a2040]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg">Existencias Finales</CardTitle>
                  <CardDescription className="text-gray-400">
                    En millones de toneladas métricas (2021/22)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {globalSugarMarketData.countryData.endingStocks.countries.slice(0, 4).map((country, index) => (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">{country.name}</span>
                          <div className="flex items-center">
                            <span className="text-white mr-2">{country.value.toLocaleString()}</span>
                            {renderTrend(country.trend, country.percentageChange)}
                          </div>
                        </div>
                        <div className="w-full bg-[#1a2040] h-2 rounded-full">
                          <div
                            className={`${country.trend === "aumento" ? "bg-green-500" : country.trend === "disminución" ? "bg-red-500" : "bg-[#00a8ff]"} h-2 rounded-full`}
                            style={{ width: `${(country.value / 10) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 bg-[#1a2040] p-3 rounded-lg">
                    <p className="text-sm text-white font-medium mb-2">Análisis de Existencias</p>
                    <p className="text-xs text-gray-300">
                      China aumenta sus existencias en un 35.9%, mientras que India, Brasil y Tailandia las reducen
                      significativamente. La disminución general de las existencias en los principales países
                      productores podría indicar un mercado más ajustado en el futuro.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-900/30 rounded-md p-3">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-300">
                  La disminución en la producción de Brasil y el aumento en las importaciones de China están
                  reconfigurando el mercado mundial del azúcar. Si estas tendencias continúan, podríamos ver cambios
                  significativos en los flujos comerciales y en los precios internacionales del azúcar en los próximos
                  años.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Pestaña de Precios Mundiales */}
          <TabsContent value="precios" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-[#0a0f29] border-[#1a2040]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg">Precios Minoristas por País</CardTitle>
                  <CardDescription className="text-gray-400">Noviembre 2021 (equivalente en USD/kg)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 overflow-y-auto pr-2 space-y-3">
                    {globalSugarMarketData.retailPrices.countries
                      .sort((a, b) => b.usdEquivalent - a.usdEquivalent)
                      .map((country, index) => (
                        <div key={index}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">{country.name}</span>
                            <div className="flex items-center">
                              <span className="text-white mr-2">${country.usdEquivalent.toFixed(2)}/kg</span>
                              <span className="text-gray-500 text-xs">({country.price})</span>
                            </div>
                          </div>
                          <div className="w-full bg-[#1a2040] h-2 rounded-full">
                            <div
                              className="bg-[#00a8ff] h-2 rounded-full"
                              style={{ width: `${(country.usdEquivalent / 2) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                  </div>

                  <div className="mt-4 bg-[#1a2040] p-3 rounded-lg">
                    <p className="text-sm text-white font-medium mb-2">Análisis de Precios Minoristas</p>
                    <p className="text-xs text-gray-300">
                      Existe una gran variabilidad en los precios minoristas del azúcar entre países, con Estados
                      Unidos, Japón y México entre los más altos, mientras que Irán, India y Brasil tienen los precios
                      más bajos. Estas diferencias reflejan factores como políticas gubernamentales, costos de
                      producción y niveles de importación.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0a0f29] border-[#1a2040]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg">Evolución de Precios Históricos</CardTitle>
                  <CardDescription className="text-gray-400">Azúcar crudo mundial (centavos USD/libra)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 relative">
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <LineChart className="h-12 w-12 text-[#00a8ff] mx-auto mb-4" />
                      <p className="text-gray-400">Visualización de gráfico en desarrollo</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Precios históricos del azúcar crudo mundial (1960-2017)
                      </p>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0">
                      <div className="space-y-2 mt-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">1960:</span>
                          <span className="text-white">
                            {globalSugarMarketData.historicalPrices.worldRawSugar.yearlyData["1960"]} ¢/lb
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">1980:</span>
                          <span className="text-white">
                            {globalSugarMarketData.historicalPrices.worldRawSugar.yearlyData["1980"]} ¢/lb
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">2000:</span>
                          <span className="text-white">
                            {globalSugarMarketData.historicalPrices.worldRawSugar.yearlyData["2000"]} ¢/lb
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">2017:</span>
                          <span className="text-white">
                            {globalSugarMarketData.historicalPrices.worldRawSugar.yearlyData["2017"]} ¢/lb
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 bg-[#1a2040] p-3 rounded-lg">
                    <p className="text-sm text-white font-medium mb-2">Análisis de Precios Históricos</p>
                    <p className="text-xs text-gray-300">
                      Los precios del azúcar han mostrado una alta volatilidad histórica, con picos significativos en
                      1980 y 2011. Desde 2010, los precios han fluctuado considerablemente, reflejando cambios en la
                      oferta y demanda global, así como factores climáticos que afectan a los principales productores.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-[#0a0f29] border-[#1a2040]">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg">Comparativa de Precios</CardTitle>
                <CardDescription className="text-gray-400">
                  Azúcar crudo mundial vs. EE.UU. (centavos USD/libra)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <p className="text-sm text-white font-medium">Azúcar Crudo Mundial</p>
                    <div className="space-y-2">
                      {Object.entries(globalSugarMarketData.historicalPrices.worldRawSugar.yearlyData)
                        .filter(([year]) => Number.parseInt(year) >= 2010)
                        .map(([year, price]) => (
                          <div key={year} className="flex justify-between text-sm">
                            <span className="text-gray-400">{year}:</span>
                            <span className="text-white">{price} ¢/lb</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm text-white font-medium">Azúcar Crudo EE.UU.</p>
                    <div className="space-y-2">
                      {Object.entries(globalSugarMarketData.historicalPrices.usRawSugar.yearlyData)
                        .filter(([year]) => Number.parseInt(year) >= 2010)
                        .map(([year, price]) => (
                          <div key={year} className="flex justify-between text-sm">
                            <span className="text-gray-400">{year}:</span>
                            <span className="text-white">{price} ¢/lb</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 bg-[#1a2040] p-3 rounded-lg">
                  <p className="text-sm text-white font-medium mb-2">Análisis Comparativo</p>
                  <p className="text-xs text-gray-300">
                    Los precios del azúcar crudo en EE.UU. son consistentemente más altos que los precios mundiales,
                    reflejando el efecto de las políticas de protección y cuotas de importación. La diferencia de precio
                    (prima) entre el mercado estadounidense y el mundial ha variado entre 8-12 centavos por libra en los
                    últimos años, creando oportunidades para exportadores con acceso preferencial al mercado
                    estadounidense.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="bg-blue-900/20 border border-blue-900/30 rounded-md p-3">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-300">
                  La gran variabilidad en los precios minoristas del azúcar entre países refleja diferencias en
                  políticas gubernamentales, costos de producción, niveles de importación y márgenes de
                  comercialización. Los precios históricos muestran ciclos de volatilidad que suelen estar relacionados
                  con cambios en la producción de los principales países exportadores, especialmente Brasil.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Pestaña de Tendencias */}
          <TabsContent value="tendencias" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-[#0a0f29] border-[#1a2040]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg">Tendencias Globales</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {globalSugarMarketData.qualitativeAnalysis.globalTrends.map((trend, index) => (
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
                    {globalSugarMarketData.qualitativeAnalysis.marketOutlook.map((outlook, index) => (
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
                <CardTitle className="text-white text-lg">Factores de Impacto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {globalSugarMarketData.qualitativeAnalysis.impactFactors.map((factor, index) => (
                    <div key={index} className="bg-[#1a2040] p-3 rounded-lg">
                      <div className="flex items-center mb-2">
                        <div className="h-6 w-6 rounded-full bg-[#111936] flex items-center justify-center text-[#00a8ff] text-xs mr-2">
                          {index + 1}
                        </div>
                        <p className="text-white text-sm font-medium">{factor.split(":")[0]}</p>
                      </div>
                      <p className="text-xs text-gray-300 ml-8">{factor.split(":")[1]}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 bg-[#111936] p-3 rounded-lg">
                  <p className="text-sm text-white font-medium mb-2">Análisis de Impacto</p>
                  <p className="text-xs text-gray-300">
                    Los factores mencionados interactúan de manera compleja para determinar la dinámica del mercado
                    mundial del azúcar. Las políticas gubernamentales y las condiciones climáticas son particularmente
                    influyentes a corto plazo, mientras que el crecimiento económico y las tendencias de salud tienen un
                    impacto más gradual pero sostenido a largo plazo.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="bg-yellow-900/20 border border-yellow-900/30 rounded-md p-3">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-300">
                  La reconfiguración del mercado mundial del azúcar, con India superando a Brasil como principal
                  productor y China emergiendo como mayor importador, podría tener implicaciones significativas para los
                  precios y flujos comerciales. Los comerciantes deben monitorear de cerca estas tendencias y adaptar
                  sus estrategias en consecuencia.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
