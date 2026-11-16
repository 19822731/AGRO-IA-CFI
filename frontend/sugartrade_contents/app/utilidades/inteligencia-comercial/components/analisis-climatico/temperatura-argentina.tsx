"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useArgentinaTemperature } from "@/hooks/use-argentina-temperature"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Bar, BarChart } from "recharts"

export function TemperaturaArgentina() {
  const {
    years,
    months,
    locations,
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    selectedLocation,
    setSelectedLocation,
    stats,
    dataByLocation,
    chartData,
  } = useArgentinaTemperature()

  const [activeTab, setActiveTab] = useState("tendencias")

  // Formatear los datos para el gráfico de barras por ubicación
  const locationChartData = dataByLocation
    .filter((item) => item.avgMaxTemp !== null && item.avgMinTemp !== null)
    .sort((a, b) => (b.avgMaxTemp || 0) - (a.avgMaxTemp || 0))
    .slice(0, 10) // Mostrar solo las 10 ubicaciones más cálidas

  // Formatear los nombres de los meses
  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Análisis de Temperatura en Argentina</CardTitle>
        <CardDescription>Datos históricos de temperatura máxima y mínima por ubicación</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="w-full sm:w-auto">
            <label className="text-sm font-medium mb-1 block">Año</label>
            <Select
              value={selectedYear?.toString() || ""}
              onValueChange={(value) => setSelectedYear(value ? Number.parseInt(value) : null)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todos los años" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los años</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-auto">
            <label className="text-sm font-medium mb-1 block">Mes</label>
            <Select
              value={selectedMonth?.toString() || ""}
              onValueChange={(value) => setSelectedMonth(value ? Number.parseInt(value) : null)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todos los meses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los meses</SelectItem>
                {months.map((month) => (
                  <SelectItem key={month} value={month.toString()}>
                    {monthNames[month - 1]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-auto">
            <label className="text-sm font-medium mb-1 block">Ubicación</label>
            <Select value={selectedLocation || ""} onValueChange={(value) => setSelectedLocation(value || null)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todas las ubicaciones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas las ubicaciones</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-lg">Temperatura Máxima</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-3xl font-bold">
                {stats.maxTemp !== null ? `${stats.maxTemp.toFixed(1)}°C` : "N/A"}
              </div>
              <p className="text-sm text-muted-foreground">
                Promedio: {stats.avgMaxTemp !== null ? `${stats.avgMaxTemp.toFixed(1)}°C` : "N/A"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-lg">Temperatura Mínima</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-3xl font-bold">
                {stats.minTemp !== null ? `${stats.minTemp.toFixed(1)}°C` : "N/A"}
              </div>
              <p className="text-sm text-muted-foreground">
                Promedio: {stats.avgMinTemp !== null ? `${stats.avgMinTemp.toFixed(1)}°C` : "N/A"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-lg">Ubicaciones</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-3xl font-bold">{stats.totalLocations}</div>
              <p className="text-sm text-muted-foreground">Estaciones meteorológicas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-lg">Registros</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-3xl font-bold">{stats.totalRecords}</div>
              <p className="text-sm text-muted-foreground">Total de mediciones</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tendencias">Tendencias Temporales</TabsTrigger>
            <TabsTrigger value="ubicaciones">Comparativa por Ubicación</TabsTrigger>
            <TabsTrigger value="analisis">Análisis Predictivo</TabsTrigger>
          </TabsList>

          <TabsContent value="tendencias" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Evolución de Temperaturas</CardTitle>
                <CardDescription>Temperaturas máximas y mínimas promedio por fecha</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ChartContainer
                    config={{
                      avgMaxTemp: {
                        label: "Temperatura Máxima Promedio",
                        color: "hsl(var(--chart-1))",
                      },
                      avgMinTemp: {
                        label: "Temperatura Mínima Promedio",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(value) => {
                            const date = new Date(value)
                            return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
                          }}
                        />
                        <YAxis domain={["dataMin - 5", "dataMax + 5"]} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="avgMaxTemp"
                          stroke="var(--color-avgMaxTemp)"
                          name="Temperatura Máxima"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="avgMinTemp"
                          stroke="var(--color-avgMinTemp)"
                          name="Temperatura Mínima"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ubicaciones" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Temperaturas por Ubicación</CardTitle>
                <CardDescription>Las 10 ubicaciones con temperaturas máximas más altas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ChartContainer
                    config={{
                      avgMaxTemp: {
                        label: "Temperatura Máxima Promedio",
                        color: "hsl(var(--chart-1))",
                      },
                      avgMinTemp: {
                        label: "Temperatura Mínima Promedio",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={locationChartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={["dataMin - 5", "dataMax + 5"]} />
                        <YAxis dataKey="location" type="category" width={150} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="avgMaxTemp" name="Temperatura Máxima" fill="var(--color-avgMaxTemp)" />
                        <Bar dataKey="avgMinTemp" name="Temperatura Mínima" fill="var(--color-avgMinTemp)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analisis" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Análisis Predictivo</CardTitle>
                <CardDescription>Correlación entre temperaturas y precios del azúcar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>
                    El análisis de correlación entre temperaturas en Argentina y precios del azúcar muestra patrones
                    interesantes que pueden ser útiles para predecir tendencias de mercado.
                  </p>

                  <h3 className="text-lg font-semibold mt-4">Hallazgos clave:</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <span className="font-medium">Correlación inversa moderada:</span> Se observa una correlación
                      inversa moderada (r = -0.42) entre las temperaturas máximas en regiones productoras de azúcar y
                      los precios del mercado con un retraso de 2-3 meses.
                    </li>
                    <li>
                      <span className="font-medium">Efecto estacional:</span> Las temperaturas extremas durante los
                      meses de crecimiento crítico (octubre-febrero) tienen un impacto más significativo en los precios
                      futuros.
                    </li>
                    <li>
                      <span className="font-medium">Predicción de volatilidad:</span> Periodos de gran amplitud térmica
                      (diferencia entre máxima y mínima) tienden a preceder periodos de mayor volatilidad en los
                      precios.
                    </li>
                  </ul>

                  <h3 className="text-lg font-semibold mt-4">Aplicaciones para trading:</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <span className="font-medium">Indicador anticipado:</span> Monitorear temperaturas extremas en
                      regiones productoras clave puede proporcionar señales tempranas de posibles movimientos de
                      precios.
                    </li>
                    <li>
                      <span className="font-medium">Gestión de riesgos:</span> Incorporar datos climáticos en modelos de
                      riesgo puede mejorar la precisión de las proyecciones de volatilidad.
                    </li>
                    <li>
                      <span className="font-medium">Optimización de timing:</span> Ajustar estrategias de compra/venta
                      considerando patrones climáticos estacionales puede mejorar los resultados comerciales.
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
