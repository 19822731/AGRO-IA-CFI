"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Download, ExternalLink } from "lucide-react"
import { useEUMarketData, historicalPrices } from "@/hooks/use-eu-market-data"

// Colores para los gráficos
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function AnalisisEuropaDetallado() {
  const { data, loading, error } = useEUMarketData()
  const [activeTab, setActiveTab] = useState("precios")

  if (loading) return <div className="text-center p-8 text-white">Cargando datos del mercado europeo...</div>
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>
  if (!data) return <div className="text-center p-8 text-white">No hay datos disponibles</div>

  // Función para exportar datos
  const handleExportData = () => {
    // Convertir a JSON
    const dataStr = JSON.stringify(data, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    // Crear nombre de archivo
    const exportFileDefaultName = `mercado-azucar-ue-${new Date().toISOString().split("T")[0]}.json`

    // Crear elemento de descarga
    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard del Azúcar - Unión Europea</h2>
          <p className="text-gray-400">Análisis del mercado del azúcar en la UE y a nivel mundial</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            className="bg-[#1a2040] border-[#2a3050] hover:bg-[#2a3050] text-white"
            onClick={() =>
              window.open(
                "https://agriculture.ec.europa.eu/farming/crop-productions-and-plant-based-products/sugar_en",
                "_blank",
              )
            }
          >
            <ExternalLink className="h-4 w-4 mr-2 text-[#00a8ff]" />
            Fuente UE
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="bg-[#1a2040] border-[#2a3050] hover:bg-[#2a3050]"
            onClick={handleExportData}
          >
            <Download className="h-4 w-4 text-[#00a8ff]" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="precios" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList className="bg-[#111936] border-[#1a2040]">
          <TabsTrigger value="precios" className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]">
            Precios
          </TabsTrigger>
          <TabsTrigger value="comercio" className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]">
            Comercio
          </TabsTrigger>
          <TabsTrigger
            value="contingentes"
            className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
          >
            Contingentes
          </TabsTrigger>
          <TabsTrigger
            value="tendencias"
            className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
          >
            Tendencias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="precios" className="space-y-4">
          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white text-lg">Evolución de Precios del Azúcar Blanco en la UE</CardTitle>
              <CardDescription className="text-gray-400">Precios mensuales en €/tonelada (2013-2025)</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  euPrice: {
                    label: "Precio UE",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalPrices}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2040" />
                    <XAxis
                      dataKey="date"
                      stroke="#4a5070"
                      tickFormatter={(value) => {
                        const date = new Date(value)
                        return `${date.getFullYear().toString().substr(2, 2)}`
                      }}
                    />
                    <YAxis stroke="#4a5070" domain={[300, 600]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="euPrice"
                      stroke="var(--color-euPrice)"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="mt-4 space-y-2 text-sm text-gray-300">
                <p>
                  <span className="font-medium text-[#00a8ff]">Precio actual:</span> 557 €/tonelada (enero 2025)
                </p>
                <p>
                  <span className="font-medium text-[#00a8ff]">Evolución mensual:</span> +4.0% respecto al mes anterior
                </p>
                <p>
                  <span className="font-medium text-[#00a8ff]">Tendencia:</span> Los precios del azúcar blanco en la UE
                  muestran una tendencia alcista desde 2020, con un aumento significativo en los últimos 12 meses.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white text-lg">Comparativa de Precios Mundiales</CardTitle>
              <CardDescription className="text-gray-400">
                Precios del azúcar blanco (Londres N°5) y crudo (NY N°11)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  worldWhitePrice: {
                    label: "Azúcar Blanco (Londres N°5)",
                    color: "hsl(var(--chart-2))",
                  },
                  worldRawPrice: {
                    label: "Azúcar Crudo (NY N°11)",
                    color: "hsl(var(--chart-4))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalPrices}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2040" />
                    <XAxis
                      dataKey="date"
                      stroke="#4a5070"
                      tickFormatter={(value) => {
                        const date = new Date(value)
                        return `${date.getFullYear().toString().substr(2, 2)}`
                      }}
                    />
                    <YAxis yAxisId="left" stroke="#4a5070" domain={[300, 600]} />
                    <YAxis yAxisId="right" orientation="right" stroke="#4a5070" domain={[10, 30]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="worldWhitePrice"
                      stroke="var(--color-worldWhitePrice)"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="worldRawPrice"
                      stroke="var(--color-worldRawPrice)"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="mt-4 space-y-2 text-sm text-gray-300">
                <p>
                  <span className="font-medium text-[#00a8ff]">Azúcar Blanco (Londres N°5):</span> 560.2 $/tonelada
                  (mayo 2025), +14.0% respecto al mes anterior
                </p>
                <p>
                  <span className="font-medium text-[#00a8ff]">Azúcar Crudo (NY N°11):</span> 21.31 ¢/libra (marzo
                  2025), +12.0% respecto al mes anterior
                </p>
                <p>
                  <span className="font-medium text-[#00a8ff]">Análisis:</span> Los precios mundiales muestran una
                  tendencia alcista similar a los precios de la UE, con aumentos significativos en los últimos meses.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comercio" className="space-y-4">
          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white text-lg">Importaciones Acumuladas de Azúcar en la UE</CardTitle>
              <CardDescription className="text-gray-400">
                Volumen acumulado por período (octubre-febrero)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  volume: {
                    label: "Volumen",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.imports}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2040" />
                    <XAxis dataKey="period" stroke="#4a5070" />
                    <YAxis stroke="#4a5070" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="volume" fill="var(--color-volume)" name="Volumen (toneladas)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="mt-4 space-y-2 text-sm text-gray-300">
                <p>
                  <span className="font-medium text-[#00a8ff]">Importaciones 2024/2025:</span> 800,000 toneladas (datos
                  provisionales hasta el 18 de febrero de 2025)
                </p>
                <p>
                  <span className="font-medium text-[#00a8ff]">Comparación con 2023/2024:</span> -38.5% (reducción
                  significativa en las importaciones)
                </p>
                <p>
                  <span className="font-medium text-[#00a8ff]">Análisis:</span> La reducción en las importaciones podría
                  estar relacionada con el aumento de la producción interna y las restricciones comerciales.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white text-lg">Principales Orígenes de Importación (2023/2024)</CardTitle>
              <CardDescription className="text-gray-400">Distribución por país de origen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ChartContainer
                  config={{
                    value: {
                      label: "Volumen",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.importOrigins}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="volume"
                        nameKey="country"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {data.importOrigins.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <div className="flex flex-col justify-center">
                  <div className="space-y-4">
                    {data.importOrigins.map((origin, index) => (
                      <div key={index} className="flex items-center">
                        <div
                          className="w-4 h-4 rounded-full mr-2"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span className="text-white">{origin.country}</span>
                            <span className="text-gray-400">{origin.volume.toLocaleString()} ton</span>
                          </div>
                          <div className="w-full bg-[#0a0f29] h-2 mt-1 rounded-full">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${origin.percentage}%`,
                                backgroundColor: COLORS[index % COLORS.length],
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contingentes" className="space-y-4">
          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white text-lg">Contingentes Arancelarios de la UE</CardTitle>
              <CardDescription className="text-gray-400">
                Disponibilidad y asignación por país/acuerdo comercial
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  allocated: {
                    label: "Asignado",
                    color: "hsl(var(--chart-1))",
                  },
                  available: {
                    label: "Disponible",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.tariffQuotas}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2040" />
                    <XAxis type="number" stroke="#4a5070" />
                    <YAxis dataKey="country" type="category" stroke="#4a5070" width={100} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="allocated" stackId="a" fill="var(--color-allocated)" name="Asignado (toneladas)" />
                    <Bar dataKey="available" stackId="a" fill="var(--color-available)" name="Disponible (toneladas)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="mt-4 space-y-2 text-sm text-gray-300">
                <p>
                  <span className="font-medium text-[#00a8ff]">Asignación promedio:</span> 95% de los contingentes
                  disponibles han sido asignados
                </p>
                <p>
                  <span className="font-medium text-[#00a8ff]">Principales beneficiarios:</span> América Central
                  (150,000 ton), Sudáfrica (150,000 ton) y Colombia (62,000 ton)
                </p>
                <p>
                  <span className="font-medium text-[#00a8ff]">Análisis:</span> La alta tasa de utilización de los
                  contingentes arancelarios indica una fuerte demanda de importaciones de azúcar a la UE bajo
                  condiciones preferenciales.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tendencias" className="space-y-4">
          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white text-lg">Análisis de Tendencias del Mercado</CardTitle>
              <CardDescription className="text-gray-400">
                Principales patrones y tendencias identificadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-[#0a0f29] border border-[#1a2040] rounded-lg p-4">
                  <h3 className="text-white font-medium mb-2">Tendencia de Precios</h3>
                  <p className="text-sm text-gray-300">
                    Los precios del azúcar blanco en la UE muestran una clara tendencia alcista desde 2020, con un
                    aumento acumulado de aproximadamente 55% en los últimos 5 años. Esta tendencia se ha acelerado en
                    los últimos 12 meses, con un aumento del 7.1% desde enero de 2024.
                  </p>
                </div>
                <div className="bg-[#0a0f29] border border-[#1a2040] rounded-lg p-4">
                  <h3 className="text-white font-medium mb-2">Correlación con Mercados Mundiales</h3>
                  <p className="text-sm text-gray-300">
                    Existe una fuerte correlación entre los precios del azúcar en la UE y los precios mundiales, con un
                    coeficiente de correlación de 0.85 para el azúcar blanco y 0.78 para el azúcar crudo. Los
                    movimientos en los mercados mundiales tienden a reflejarse en el mercado europeo con un retraso de
                    1-2 meses.
                  </p>
                </div>
                <div className="bg-[#0a0f29] border border-[#1a2040] rounded-lg p-4">
                  <h3 className="text-white font-medium mb-2">Patrones de Importación</h3>
                  <p className="text-sm text-gray-300">
                    Las importaciones de azúcar a la UE muestran una tendencia decreciente en el período 2024/2025, con
                    una reducción del 38.5% respecto al mismo período del año anterior. Brasil sigue siendo el principal
                    proveedor, seguido por Ucrania y el Reino Unido.
                  </p>
                </div>
                <div className="bg-[#0a0f29] border border-[#1a2040] rounded-lg p-4">
                  <h3 className="text-white font-medium mb-2">Impacto de Políticas Comerciales</h3>
                  <p className="text-sm text-gray-300">
                    Los contingentes arancelarios de la UE juegan un papel crucial en la regulación del mercado del
                    azúcar. La alta tasa de utilización (95%) indica una fuerte demanda de importaciones bajo
                    condiciones preferenciales, lo que podría estar limitando el potencial alcista de los precios en la
                    UE.
                  </p>
                </div>
                <div className="bg-[#0a0f29] border border-[#1a2040] rounded-lg p-4">
                  <h3 className="text-white font-medium mb-2">Perspectivas Futuras</h3>
                  <p className="text-sm text-gray-300">
                    Basado en las tendencias actuales, se espera que los precios del azúcar en la UE continúen su
                    tendencia alcista en los próximos 6-12 meses, aunque a un ritmo más moderado. Los factores clave a
                    monitorear incluyen la producción global, las políticas comerciales de la UE y las condiciones
                    climáticas en los principales países productores.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
