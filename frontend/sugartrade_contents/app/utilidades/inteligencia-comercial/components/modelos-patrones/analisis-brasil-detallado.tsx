"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { InfoIcon, TrendingDown, TrendingUp, AlertCircle } from "lucide-react"
import { useBrazilMarketData } from "@/hooks/use-brazil-market-data"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export default function AnalisisBrasilDetallado() {
  const { data, loading, error } = useBrazilMarketData()
  const [activeTab, setActiveTab] = useState("area")

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !data) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error || "No se pudieron cargar los datos del mercado brasileño"}</AlertDescription>
      </Alert>
    )
  }

  // Transformar datos para gráficos
  const areaData = data.areaPlantedHarvested.map((item) => ({
    name: item.year,
    Norte: item.northRegion,
    Nordeste: item.northeastRegion,
    "Centro-Oeste": item.midwestRegion,
    Sudeste: item.southeastRegion,
    Sur: item.southRegion,
    Total: item.brazilTotal,
  }))

  const productivityData = data.productivity.map((item) => ({
    name: item.year,
    Norte: item.northRegion,
    Nordeste: item.northeastRegion,
    "Centro-Oeste": item.midwestRegion,
    Sudeste: item.southeastRegion,
    Sur: item.southRegion,
    Total: item.brazilTotal,
  }))

  const productionData = data.production.map((item) => ({
    name: item.year,
    Norte: item.northRegion,
    Nordeste: item.northeastRegion,
    "Centro-Oeste": item.midwestRegion,
    Sudeste: item.southeastRegion,
    Sur: item.southRegion,
    Total: item.brazilTotal,
  }))

  const sugarProductionData = data.sugarProduction.map((item) => ({
    name: item.year,
    Norte: item.northRegion,
    Nordeste: item.northeastRegion,
    "Centro-Oeste": item.midwestRegion,
    Sudeste: item.southeastRegion,
    Sur: item.southRegion,
    Total: item.brazilTotal,
    Variación: item.variationPercentage || 0,
  }))

  const atrProductionData = data.atrProduction.map((item) => ({
    name: item.year,
    Norte: item.northRegion,
    Nordeste: item.northeastRegion,
    "Centro-Oeste": item.midwestRegion,
    Sudeste: item.southeastRegion,
    Sur: item.southRegion,
    Total: item.brazilTotal,
    Variación: item.variationPercentage || 0,
  }))

  // Colores para los gráficos
  const colors = {
    Norte: "#FF6B6B",
    Nordeste: "#4ECDC4",
    "Centro-Oeste": "#FFD166",
    Sudeste: "#06D6A0",
    Sur: "#118AB2",
    Total: "#073B4C",
    Variación: "#7209B7",
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Análisis del Mercado Brasileño</CardTitle>
              <CardDescription>
                Datos de la cosecha de caña de azúcar en Brasil - Última actualización: {data.lastUpdate}
              </CardDescription>
            </div>
            <Badge variant="outline" className="ml-2">
              <InfoIcon className="h-3.5 w-3.5 mr-1" />
              Conab
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="area" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="bg-[#111936] border-[#1a2040]">
              <TabsTrigger value="area" className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]">
                Área Plantada
              </TabsTrigger>
              <TabsTrigger
                value="productivity"
                className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
              >
                Productividad
              </TabsTrigger>
              <TabsTrigger
                value="production"
                className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
              >
                Producción
              </TabsTrigger>
              <TabsTrigger
                value="sugar"
                className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
              >
                Producción de Azúcar
              </TabsTrigger>
              <TabsTrigger value="atr" className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]">
                ATR
              </TabsTrigger>
            </TabsList>

            <TabsContent value="area" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="col-span-1 md:col-span-2">
                  <CardHeader>
                    <CardTitle>Área Plantada y Cosechada (miles de hectáreas)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={areaData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          {Object.keys(colors)
                            .filter((key) => key !== "Total" && key !== "Variación")
                            .map((key) => (
                              <Bar key={key} dataKey={key} fill={colors[key as keyof typeof colors]} />
                            ))}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Variación Interanual</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="text-6xl font-bold mb-4">{data.areaPlantedHarvested[1].variationPercentage}%</div>
                      <div className="flex items-center">
                        {data.areaPlantedHarvested[1].variationPercentage! > 0 ? (
                          <TrendingUp className="h-6 w-6 text-green-500 mr-2" />
                        ) : (
                          <TrendingDown className="h-6 w-6 text-red-500 mr-2" />
                        )}
                        <span>vs {data.areaPlantedHarvested[0].year}</span>
                      </div>
                      <div className="mt-6 text-center text-sm text-gray-400">
                        Área total 2024/25: {data.areaPlantedHarvested[1].brazilTotal.toLocaleString()} mil hectáreas
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="productivity" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="col-span-1 md:col-span-2">
                  <CardHeader>
                    <CardTitle>Productividad (kg/ha)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={productivityData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          {Object.keys(colors)
                            .filter((key) => key !== "Total" && key !== "Variación")
                            .map((key) => (
                              <Bar key={key} dataKey={key} fill={colors[key as keyof typeof colors]} />
                            ))}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Variación Interanual</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="text-6xl font-bold mb-4">{data.productivity[1].variationPercentage}%</div>
                      <div className="flex items-center">
                        {data.productivity[1].variationPercentage! > 0 ? (
                          <TrendingUp className="h-6 w-6 text-green-500 mr-2" />
                        ) : (
                          <TrendingDown className="h-6 w-6 text-red-500 mr-2" />
                        )}
                        <span>vs {data.productivity[0].year}</span>
                      </div>
                      <div className="mt-6 text-center text-sm text-gray-400">
                        Productividad promedio 2024/25: {data.productivity[1].brazilTotal.toLocaleString()} kg/ha
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="production" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="col-span-1 md:col-span-2">
                  <CardHeader>
                    <CardTitle>Producción Total (miles de toneladas)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={productionData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          {Object.keys(colors)
                            .filter((key) => key !== "Total" && key !== "Variación")
                            .map((key) => (
                              <Bar key={key} dataKey={key} fill={colors[key as keyof typeof colors]} />
                            ))}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Variación Interanual</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="text-6xl font-bold mb-4">{data.production[1].variationPercentage}%</div>
                      <div className="flex items-center">
                        {data.production[1].variationPercentage! > 0 ? (
                          <TrendingUp className="h-6 w-6 text-green-500 mr-2" />
                        ) : (
                          <TrendingDown className="h-6 w-6 text-red-500 mr-2" />
                        )}
                        <span>vs {data.production[0].year}</span>
                      </div>
                      <div className="mt-6 text-center text-sm text-gray-400">
                        Producción total 2024/25: {data.production[1].brazilTotal.toLocaleString()} mil toneladas
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="sugar" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="col-span-1 md:col-span-2">
                  <CardHeader>
                    <CardTitle>Producción de Azúcar (miles de toneladas)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sugarProductionData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip />
                          <Legend />
                          <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="Total"
                            stroke={colors.Total}
                            strokeWidth={3}
                            dot={{ r: 6 }}
                          />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="Variación"
                            stroke={colors.Variación}
                            strokeDasharray="5 5"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Variación Interanual</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="text-6xl font-bold mb-4">{data.sugarProduction[2].variationPercentage}%</div>
                      <div className="flex items-center">
                        {data.sugarProduction[2].variationPercentage! > 0 ? (
                          <TrendingUp className="h-6 w-6 text-green-500 mr-2" />
                        ) : (
                          <TrendingDown className="h-6 w-6 text-red-500 mr-2" />
                        )}
                        <span>vs {data.sugarProduction[1].year}</span>
                      </div>
                      <div className="mt-6 text-center text-sm text-gray-400">
                        Producción total 2024/25: {data.sugarProduction[2].brazilTotal.toLocaleString()} mil toneladas
                      </div>
                      <div className="mt-2 text-center text-sm text-gray-400">
                        Variación absoluta: +{data.sugarProduction[2].absoluteVariation?.toLocaleString()} mil toneladas
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="atr" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="col-span-1 md:col-span-2">
                  <CardHeader>
                    <CardTitle>ATR - Azúcar Total Recuperable (kg/tonelada)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={atrProductionData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis domain={["dataMin - 5", "dataMax + 5"]} />
                          <Tooltip />
                          <Legend />
                          {Object.keys(colors)
                            .filter((key) => key !== "Variación")
                            .map((key) => (
                              <Line
                                key={key}
                                type="monotone"
                                dataKey={key}
                                stroke={colors[key as keyof typeof colors]}
                                strokeWidth={key === "Total" ? 3 : 1.5}
                                dot={{ r: key === "Total" ? 6 : 4 }}
                              />
                            ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Variación Interanual</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="text-6xl font-bold mb-4">{data.atrProduction[2].variationPercentage}%</div>
                      <div className="flex items-center">
                        {data.atrProduction[2].variationPercentage! > 0 ? (
                          <TrendingUp className="h-6 w-6 text-green-500 mr-2" />
                        ) : (
                          <TrendingDown className="h-6 w-6 text-red-500 mr-2" />
                        )}
                        <span>vs {data.atrProduction[1].year}</span>
                      </div>
                      <div className="mt-6 text-center text-sm text-gray-400">
                        ATR promedio 2024/25: {data.atrProduction[2].brazilTotal.toLocaleString()} kg/tonelada
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Análisis Comparativo</CardTitle>
          <CardDescription>Comparación de indicadores clave entre las zafras 2023/24 y 2024/25</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Área Plantada</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+4.1%</div>
                <p className="text-xs text-muted-foreground">8,673.1 mil hectáreas en 2024/25</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Productividad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">-4.1%</div>
                <p className="text-xs text-muted-foreground">82,014 kg/ha en 2024/25</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Producción Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">-3.8%</div>
                <p className="text-xs text-muted-foreground">685,856.8 mil toneladas en 2024/25</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Producción de Azúcar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">+1.3%</div>
                <p className="text-xs text-muted-foreground">46,292.2 mil toneladas en 2024/25</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
