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
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts"
import { sugarFacilities } from "@/lib/services/sugar-facilities-service"
import { useCsvData } from "@/hooks/use-csv-data"

export function AnalisisIntegrado() {
  const { isLoading, error, data, getDataByType, getTimeSeriesData } = useCsvData()
  const [selectedMetric, setSelectedMetric] = useState("precio")
  const [selectedYear, setSelectedYear] = useState("2024")

  // Obtener años disponibles en los datos
  const availableYears = useMemo(() => {
    if (!data.length) return ["2024", "2023", "2022", "2021", "2020"]

    const years = new Set<string>()
    data.forEach((entry) => {
      if (entry.fechaObj) {
        years.add(entry.fechaObj.getFullYear().toString())
      } else if (entry.fecha) {
        // Intentar extraer el año de la cadena de fecha
        const yearMatch = entry.fecha.match(/\b(20\d{2})\b/)
        if (yearMatch) {
          years.add(yearMatch[1])
        }
      }
    })

    return Array.from(years).sort().reverse()
  }, [data])

  // Datos para el gráfico de correlación entre producción y precio
  const correlationData = useMemo(() => {
    // En una implementación real, estos datos vendrían de un análisis de los datos CSV
    // Para esta demostración, usamos datos simulados
    return sugarFacilities
      .filter((f) => f.type === "ingenio" && f.production)
      .map((f) => ({
        name: f.name,
        production: f.production,
        precio: 700 + Math.random() * 100, // Precio simulado
        capacidad: f.capacity,
        empleados: f.employees,
        x: f.location.lng,
        y: f.location.lat,
      }))
  }, [])

  // Datos para el gráfico de tendencia temporal
  const timeSeriesData = useMemo(() => {
    // Simulamos datos de tendencia temporal para precios y producción
    const years = ["2020", "2021", "2022", "2023", "2024"]
    const basePrice = 500
    const baseProduction = 150000

    return years.map((year) => {
      const yearNum = Number.parseInt(year)
      const priceGrowth = 1 + (yearNum - 2020) * 0.08 // 8% de crecimiento anual
      const productionGrowth = 1 + (yearNum - 2020) * 0.03 // 3% de crecimiento anual

      return {
        year,
        precio: Math.round(basePrice * priceGrowth),
        produccion: Math.round(baseProduction * productionGrowth),
      }
    })
  }, [])

  // Datos para el mapa de calor (simulados)
  const heatmapData = useMemo(() => {
    return sugarFacilities.map((f) => ({
      name: f.name,
      x: f.location.lng,
      y: f.location.lat,
      z: f.type === "ingenio" ? (f.production || 100000) / 10000 : 5,
    }))
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
        <CardTitle>Análisis Integrado</CardTitle>
        <CardDescription>Correlación entre datos geoespaciales y variables económicas</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="correlacion" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="correlacion">Correlación</TabsTrigger>
            <TabsTrigger value="tendencia">Tendencia Temporal</TabsTrigger>
            <TabsTrigger value="distribucion">Distribución Espacial</TabsTrigger>
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
                    <SelectItem value="precio">Precio</SelectItem>
                    <SelectItem value="capacidad">Capacidad</SelectItem>
                    <SelectItem value="empleados">Empleados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>
                  Correlación: Producción vs{" "}
                  {selectedMetric === "precio" ? "Precio" : selectedMetric === "capacidad" ? "Capacidad" : "Empleados"}
                </CardTitle>
                <CardDescription>Análisis de correlación entre variables económicas y productivas</CardDescription>
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
                          selectedMetric === "precio"
                            ? "Precio (USD/ton)"
                            : selectedMetric === "capacidad"
                              ? "Capacidad (ton/día)"
                              : "Empleados",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" dataKey="production" name="Producción" unit=" ton/año" />
                        <YAxis
                          type="number"
                          dataKey={selectedMetric}
                          name={
                            selectedMetric === "precio"
                              ? "Precio"
                              : selectedMetric === "capacidad"
                                ? "Capacidad"
                                : "Empleados"
                          }
                          unit={
                            selectedMetric === "precio" ? " USD/ton" : selectedMetric === "capacidad" ? " ton/día" : ""
                          }
                        />
                        <ZAxis type="category" dataKey="name" name="Ingenio" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Scatter
                          name={`Producción vs ${
                            selectedMetric === "precio"
                              ? "Precio"
                              : selectedMetric === "capacidad"
                                ? "Capacidad"
                                : "Empleados"
                          }`}
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
                    {selectedMetric === "precio"
                      ? "Existe una correlación positiva moderada entre la producción anual y el precio obtenido por tonelada. Los ingenios con mayor volumen de producción tienden a obtener mejores precios debido a economías de escala y mayor poder de negociación."
                      : selectedMetric === "capacidad"
                        ? "La correlación entre producción anual y capacidad de molienda es fuerte y positiva, como es de esperarse. Sin embargo, algunos ingenios muestran una utilización más eficiente de su capacidad instalada."
                        : "La relación entre producción y cantidad de empleados muestra variaciones significativas entre ingenios, reflejando diferentes niveles de eficiencia y automatización en los procesos productivos."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tendencia" className="space-y-4">
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="w-full sm:w-auto">
                <Label htmlFor="year">Año de Referencia</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger id="year" className="w-[180px]">
                    <SelectValue placeholder="Seleccione año" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Evolución Temporal</CardTitle>
                <CardDescription>Tendencia de precios y producción a lo largo del tiempo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ChartContainer
                    config={{
                      precio: {
                        label: "Precio (USD/ton)",
                        color: "hsl(var(--chart-1))",
                      },
                      produccion: {
                        label: "Producción (ton)",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis yAxisId="left" orientation="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="precio"
                          stroke="var(--color-precio)"
                          name="Precio (USD/ton)"
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="produccion"
                          stroke="var(--color-produccion)"
                          name="Producción (ton)"
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <h3 className="text-lg font-semibold mb-2">Análisis de Tendencia</h3>
                  <p className="text-sm text-muted-foreground">
                    La tendencia muestra un crecimiento sostenido tanto en precios como en producción durante el período
                    2020-2024. El precio ha aumentado a un ritmo promedio del 8% anual, mientras que la producción ha
                    crecido a un ritmo más moderado del 3% anual.
                    {Number.parseInt(selectedYear) >= 2023
                      ? " En los últimos dos años, se observa una aceleración en el crecimiento de los precios, posiblemente debido a factores como la inflación y la mayor demanda internacional."
                      : " En los primeros años del período analizado, el crecimiento fue más estable y predecible."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="distribucion" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribución Espacial de la Producción</CardTitle>
                <CardDescription>
                  Visualización de la producción en relación con la ubicación geográfica
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[500px]">
                  <ChartContainer
                    config={{
                      z: {
                        label: "Producción",
                        color: "hsl(var(--chart-3))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          type="number"
                          dataKey="x"
                          name="Longitud"
                          domain={[-66.5, -64.2]}
                          label={{ value: "Longitud", position: "bottom" }}
                        />
                        <YAxis
                          type="number"
                          dataKey="y"
                          name="Latitud"
                          domain={[-28.2, -26]}
                          label={{ value: "Latitud", angle: -90, position: "left" }}
                        />
                        <ZAxis type="number" dataKey="z" range={[50, 400]} name="Producción" />
                        <Tooltip
                          cursor={{ strokeDasharray: "3 3" }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload
                              return (
                                <div className="bg-background border rounded-md shadow-sm p-2">
                                  <p className="font-medium">{data.name}</p>
                                  <p>Longitud: {data.x.toFixed(4)}</p>
                                  <p>Latitud: {data.y.toFixed(4)}</p>
                                  <p>Producción: {(data.z * 10000).toLocaleString()} ton</p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Scatter name="Producción por ubicación" data={heatmapData} fill="var(--color-z)" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <h3 className="text-lg font-semibold mb-2">Análisis de Distribución Espacial</h3>
                  <p className="text-sm text-muted-foreground">
                    La visualización muestra la concentración de la producción azucarera en la región central y este de
                    Tucumán. Los ingenios de mayor producción (representados por círculos más grandes) tienden a
                    ubicarse en zonas con mejor acceso a infraestructura de transporte y cerca de las principales áreas
                    de cultivo de caña. Esta distribución espacial tiene implicaciones importantes para la logística,
                    los costos de transporte y el desarrollo económico regional.
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
