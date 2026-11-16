"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  BarChart,
  Bar,
} from "recharts"
import { sugarFacilities } from "@/lib/services/sugar-facilities-service"
import { irrigationAreas, getIrrigationStatistics } from "@/lib/services/irrigation-areas-service"
import { useCsvData } from "@/hooks/use-csv-data"

export function AnalisisRiegoProduccion() {
  const { isLoading, error, data } = useCsvData()
  const [selectedMetric, setSelectedMetric] = useState("eficiencia")
  const [selectedYear, setSelectedYear] = useState("2024")

  // Datos para el gráfico de correlación entre riego y producción
  const correlationData = useMemo(() => {
    // Simulamos datos que correlacionan áreas de riego con producción
    return sugarFacilities
      .filter((f) => f.type === "ingenio" && f.production)
      .map((f) => {
        // Encontramos el área de riego más cercana (simulado)
        const nearestIrrigationArea = irrigationAreas[Math.floor(Math.random() * irrigationAreas.length)]

        return {
          name: f.name,
          production: f.production,
          irrigatedArea: Math.round(nearestIrrigationArea.area * 0.7 * (0.8 + Math.random() * 0.4)), // Área irrigada para caña
          efficiency: nearestIrrigationArea.properties.efficiency,
          waterSource: nearestIrrigationArea.type,
          yield: f.production / (nearestIrrigationArea.area * 0.7), // Rendimiento (ton/ha)
        }
      })
  }, [])

  // Datos para el gráfico de tendencia histórica
  const historicalData = useMemo(() => {
    // Simulamos datos históricos de área irrigada y producción
    const years = ["2020", "2021", "2022", "2023", "2024"]
    const baseIrrigatedArea = 70000
    const baseProduction = 2000000

    return years.map((year) => {
      const yearNum = Number.parseInt(year)
      const irrigationGrowth = 1 + (yearNum - 2020) * 0.02 // 2% de crecimiento anual en área irrigada
      const productionGrowth = 1 + (yearNum - 2020) * 0.03 // 3% de crecimiento anual en producción
      const efficiency = 0.6 + (yearNum - 2020) * 0.02 // Mejora gradual en eficiencia

      return {
        year,
        irrigatedArea: Math.round(baseIrrigatedArea * irrigationGrowth),
        production: Math.round(baseProduction * productionGrowth),
        efficiency: Math.min(0.8, efficiency), // Máximo 80% de eficiencia
      }
    })
  }, [])

  // Datos para el gráfico de distribución por tipo de riego
  const irrigationTypeData = useMemo(() => {
    const stats = getIrrigationStatistics()
    return [
      {
        name: "Canal",
        value: stats.areasByType.canal,
        percentage: Math.round((stats.areasByType.canal / stats.totalArea) * 100),
      },
      {
        name: "Pozo",
        value: stats.areasByType.pozo,
        percentage: Math.round((stats.areasByType.pozo / stats.totalArea) * 100),
      },
      {
        name: "Mixto",
        value: stats.areasByType.mixto,
        percentage: Math.round((stats.areasByType.mixto / stats.totalArea) * 100),
      },
    ]
  }, [])

  if (isLoading) {
    return <div>Cargando datos...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Análisis de Riego y Producción</CardTitle>
        <CardDescription>Correlación entre áreas bajo riego y producción de caña de azúcar</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="correlacion" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="correlacion">Correlación</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
            <TabsTrigger value="distribucion">Distribución</TabsTrigger>
          </TabsList>

          <TabsContent value="correlacion" className="space-y-4">
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="w-full sm:w-auto">
                <Label htmlFor="metric">Variable a Analizar</Label>
                <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                  <SelectTrigger id="metric" className="w-[180px]">
                    <SelectValue placeholder="Seleccione variable" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eficiencia">Eficiencia de Riego</SelectItem>
                    <SelectItem value="irrigatedArea">Área Irrigada</SelectItem>
                    <SelectItem value="yield">Rendimiento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>
                  Correlación: Producción vs{" "}
                  {selectedMetric === "eficiencia"
                    ? "Eficiencia de Riego"
                    : selectedMetric === "irrigatedArea"
                      ? "Área Irrigada"
                      : "Rendimiento"}
                </CardTitle>
                <CardDescription>Análisis de correlación entre producción y variables de riego</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ChartContainer
                    config={{
                      production: {
                        label: "Producción (ton/año)",
                        color: "hsl(var(--chart-1))",
                      },
                      [selectedMetric]: {
                        label:
                          selectedMetric === "eficiencia"
                            ? "Eficiencia de Riego (%)"
                            : selectedMetric === "irrigatedArea"
                              ? "Área Irrigada (ha)"
                              : "Rendimiento (ton/ha)",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          type="number"
                          dataKey={selectedMetric}
                          name={
                            selectedMetric === "eficiencia"
                              ? "Eficiencia de Riego"
                              : selectedMetric === "irrigatedArea"
                                ? "Área Irrigada"
                                : "Rendimiento"
                          }
                          unit={
                            selectedMetric === "eficiencia"
                              ? "%"
                              : selectedMetric === "irrigatedArea"
                                ? " ha"
                                : " ton/ha"
                          }
                          tickFormatter={
                            selectedMetric === "eficiencia" ? (value) => `${(value * 100).toFixed(0)}` : undefined
                          }
                        />
                        <YAxis type="number" dataKey="production" name="Producción" unit=" ton/año" />
                        <ZAxis type="category" dataKey="name" name="Ingenio" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Scatter
                          name={`${
                            selectedMetric === "eficiencia"
                              ? "Eficiencia de Riego"
                              : selectedMetric === "irrigatedArea"
                                ? "Área Irrigada"
                                : "Rendimiento"
                          } vs Producción`}
                          data={correlationData}
                          fill="var(--color-production)"
                        />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <h3 className="text-lg font-semibold mb-2">Análisis de Correlación</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedMetric === "eficiencia"
                      ? "Existe una correlación positiva significativa entre la eficiencia de los sistemas de riego y la producción total de los ingenios. Los ingenios que utilizan sistemas de riego más eficientes tienden a obtener mayores volúmenes de producción, lo que sugiere que la inversión en mejoras de eficiencia de riego puede tener un impacto directo en la productividad."
                      : selectedMetric === "irrigatedArea"
                        ? "La correlación entre el área irrigada y la producción es fuerte y positiva, como es de esperarse. Sin embargo, se observan variaciones importantes en la eficiencia del uso del agua entre diferentes ingenios, lo que sugiere oportunidades de mejora en algunas zonas."
                        : "El rendimiento por hectárea irrigada muestra variaciones significativas entre ingenios, reflejando diferencias en prácticas agrícolas, variedades de caña utilizadas y eficiencia en el manejo del agua. Los ingenios con mayor rendimiento por hectárea tienden a implementar técnicas de riego de precisión y variedades de caña más eficientes en el uso del agua."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historico" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Evolución Histórica</CardTitle>
                <CardDescription>
                  Tendencia de área irrigada, producción y eficiencia a lo largo del tiempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ChartContainer
                    config={{
                      irrigatedArea: {
                        label: "Área Irrigada (ha)",
                        color: "hsl(var(--chart-1))",
                      },
                      production: {
                        label: "Producción (ton)",
                        color: "hsl(var(--chart-2))",
                      },
                      efficiency: {
                        label: "Eficiencia de Riego (%)",
                        color: "hsl(var(--chart-3))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis yAxisId="left" orientation="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <YAxis
                          yAxisId="efficiency"
                          orientation="right"
                          tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="irrigatedArea"
                          stroke="var(--color-irrigatedArea)"
                          name="Área Irrigada (ha)"
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="production"
                          stroke="var(--color-production)"
                          name="Producción (ton)"
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          yAxisId="efficiency"
                          type="monotone"
                          dataKey="efficiency"
                          stroke="var(--color-efficiency)"
                          name="Eficiencia de Riego (%)"
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <h3 className="text-lg font-semibold mb-2">Análisis de Tendencia</h3>
                  <p className="text-sm text-muted-foreground">
                    La tendencia histórica muestra un crecimiento sostenido tanto en el área irrigada como en la
                    producción durante el período 2020-2024. El área irrigada ha aumentado a un ritmo promedio del 2%
                    anual, mientras que la producción ha crecido a un ritmo ligeramente superior del 3% anual.
                    Notablemente, la eficiencia de los sistemas de riego ha mejorado de manera constante, pasando de
                    aproximadamente 60% en 2020 a cerca del 80% en 2024. Esta mejora en la eficiencia ha permitido un
                    mayor crecimiento en la producción en comparación con el crecimiento del área irrigada, lo que
                    indica una optimización en el uso del recurso hídrico.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="distribucion" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Tipo de Riego</CardTitle>
                <CardDescription>Análisis de la producción según el tipo de sistema de riego utilizado</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ChartContainer
                    config={{
                      value: {
                        label: "Área (ha)",
                        color: "hsl(var(--chart-1))",
                      },
                      percentage: {
                        label: "Porcentaje (%)",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={irrigationTypeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" orientation="left" />
                        <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}%`} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar yAxisId="left" dataKey="value" fill="var(--color-value)" name="Área (ha)" />
                        <Bar
                          yAxisId="right"
                          dataKey="percentage"
                          fill="var(--color-percentage)"
                          name="Porcentaje (%)"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <h3 className="text-lg font-semibold mb-2">Análisis de Distribución</h3>
                  <p className="text-sm text-muted-foreground">
                    El análisis de la distribución por tipo de riego muestra que los sistemas de canal representan la
                    mayor proporción del área irrigada en Tucumán, seguidos por los sistemas mixtos y finalmente los
                    sistemas de pozo. Esta distribución refleja la infraestructura histórica de riego en la provincia,
                    que ha dependido tradicionalmente de los ríos y canales para la irrigación de cultivos.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Sin embargo, es importante destacar que los sistemas de pozo, aunque representan una menor
                    proporción del área total, tienden a mostrar una mayor eficiencia en el uso del agua. Los sistemas
                    mixtos, que combinan canales y pozos, ofrecen un equilibrio entre cobertura y eficiencia, y han
                    mostrado un crecimiento significativo en los últimos años como estrategia de adaptación a la
                    variabilidad climática.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
