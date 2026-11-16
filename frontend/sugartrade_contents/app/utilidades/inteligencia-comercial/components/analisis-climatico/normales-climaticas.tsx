"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useArgentinaClimateNormals } from "@/hooks/use-argentina-climate-normals"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Bar, BarChart } from "recharts"

export function NormalesClimaticas() {
  const {
    regions,
    stations,
    variables,
    selectedRegion,
    setSelectedRegion,
    selectedStation,
    setSelectedStation,
    selectedVariable,
    setSelectedVariable,
    getMonthlyChartData,
    getStationComparisonData,
    getAnnualAverages,
    sugarProducingRegions,
  } = useArgentinaClimateNormals()

  const [activeTab, setActiveTab] = useState("evolucion")
  const [selectedMonth, setSelectedMonth] = useState("ene")

  // Variables climáticas más relevantes para el azúcar
  const sugarRelevantVariables = ["Temperatura", "Precipitación total", "Humedad relativa"]

  // Nombres de los meses
  const monthNames = [
    { value: "ene", label: "Enero" },
    { value: "feb", label: "Febrero" },
    { value: "mar", label: "Marzo" },
    { value: "abr", label: "Abril" },
    { value: "may", label: "Mayo" },
    { value: "jun", label: "Junio" },
    { value: "jul", label: "Julio" },
    { value: "ago", label: "Agosto" },
    { value: "sep", label: "Septiembre" },
    { value: "oct", label: "Octubre" },
    { value: "nov", label: "Noviembre" },
    { value: "dic", label: "Diciembre" },
  ]

  // Obtener datos para el gráfico de evolución mensual
  const monthlyData = getMonthlyChartData(selectedVariable || "Temperatura")

  // Obtener datos para el gráfico de comparación entre estaciones
  const comparisonData = getStationComparisonData(selectedVariable || "Temperatura", selectedMonth)
    .sort((a, b) => (b.valor || 0) - (a.valor || 0))
    .slice(0, 10)

  // Obtener promedios anuales
  const annualAverages = getAnnualAverages()
    .filter((item) => item.promedio !== null)
    .sort((a, b) => (b.promedio || 0) - (a.promedio || 0))

  // Configurar colores para las estaciones en el gráfico
  const getStationColors = () => {
    const config: Record<string, any> = {}

    stations.forEach((station, index) => {
      config[station] = {
        label: station,
        color: `hsl(${index * 30}, 70%, 50%)`,
      }
    })

    return config
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Normales Climáticas de Argentina (1991-2020)</CardTitle>
        <CardDescription>Datos históricos promedio mensuales por estación meteorológica</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="w-full sm:w-auto">
            <label className="text-sm font-medium mb-1 block">Región</label>
            <Select
              value={selectedRegion || ""}
              onValueChange={(value) => {
                setSelectedRegion(value || null)
                setSelectedStation(null) // Resetear estación al cambiar región
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todas las regiones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las regiones</SelectItem>
                {regions.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-auto">
            <label className="text-sm font-medium mb-1 block">Estación</label>
            <Select value={selectedStation || ""} onValueChange={(value) => setSelectedStation(value || null)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todas las estaciones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las estaciones</SelectItem>
                {stations.map((station) => (
                  <SelectItem key={station} value={station}>
                    {station}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-auto">
            <label className="text-sm font-medium mb-1 block">Variable</label>
            <Select value={selectedVariable || ""} onValueChange={(value) => setSelectedVariable(value || null)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Seleccionar variable" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las variables</SelectItem>
                {variables.map((variable) => (
                  <SelectItem key={variable} value={variable}>
                    {variable}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {activeTab === "comparacion" && (
            <div className="w-full sm:w-auto">
              <label className="text-sm font-medium mb-1 block">Mes</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Seleccionar mes" />
                </SelectTrigger>
                <SelectContent>
                  {monthNames.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="evolucion">Evolución Mensual</TabsTrigger>
            <TabsTrigger value="comparacion">Comparación Estaciones</TabsTrigger>
            <TabsTrigger value="azucar">Relevancia para Azúcar</TabsTrigger>
          </TabsList>

          <TabsContent value="evolucion" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Evolución Mensual</CardTitle>
                <CardDescription>{selectedVariable || "Temperatura"} mensual promedio (1991-2020)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ChartContainer config={getStationColors()}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        {stations.slice(0, 5).map((station, index) => (
                          <Line
                            key={station}
                            type="monotone"
                            dataKey={station}
                            stroke={`var(--color-${station.replace(/\s+/g, "-")})`}
                            name={station}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                <div className="mt-4 text-sm text-muted-foreground">
                  <p>
                    El gráfico muestra la evolución mensual de {selectedVariable || "temperatura"} a lo largo del año,
                    basado en promedios históricos del período 1991-2020. Se muestran hasta 5 estaciones para mejor
                    visualización.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparacion" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Comparación entre Estaciones</CardTitle>
                <CardDescription>
                  {selectedVariable || "Temperatura"} en{" "}
                  {monthNames.find((m) => m.value === selectedMonth)?.label || "Enero"} (Top 10 estaciones)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ChartContainer
                    config={{
                      valor: {
                        label: selectedVariable || "Temperatura",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={comparisonData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="estacion" type="category" width={150} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="valor" name={selectedVariable || "Temperatura"} fill="var(--color-valor)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                <div className="mt-4 text-sm text-muted-foreground">
                  <p>
                    El gráfico muestra las 10 estaciones con los valores más altos de{" "}
                    {selectedVariable || "temperatura"}
                    durante {monthNames.find((m) => m.value === selectedMonth)?.label || "Enero"}, basado en promedios
                    históricos del período 1991-2020.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="azucar" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Relevancia para la Producción de Azúcar</CardTitle>
                <CardDescription>Análisis de variables climáticas en regiones productoras</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Regiones Productoras de Azúcar</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Las principales regiones productoras de azúcar en Argentina son el Noroeste (NOA) y el Noreste
                      (NEA), con condiciones climáticas específicas que favorecen el cultivo de caña de azúcar.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <Card>
                        <CardHeader className="p-4">
                          <CardTitle className="text-lg">NOA (Noroeste Argentino)</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Principales provincias: Tucumán, Salta, Jujuy</li>
                            <li>Temperatura media anual: 18-22°C</li>
                            <li>Precipitación anual: 600-1000 mm</li>
                            <li>Período de zafra: Mayo a Noviembre</li>
                          </ul>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="p-4">
                          <CardTitle className="text-lg">NEA (Noreste Argentino)</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Principales provincias: Misiones, Corrientes, Formosa</li>
                            <li>Temperatura media anual: 20-24°C</li>
                            <li>Precipitación anual: 1000-1800 mm</li>
                            <li>Período de zafra: Junio a Noviembre</li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Variables Climáticas Clave</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Las siguientes variables climáticas tienen un impacto significativo en la producción de azúcar:
                    </p>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardHeader className="p-4">
                            <CardTitle className="text-lg">Temperatura</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <p className="text-sm">
                              La caña de azúcar requiere temperaturas entre 20-35°C para un crecimiento óptimo.
                              Temperaturas por debajo de 15°C reducen significativamente el crecimiento.
                            </p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="p-4">
                            <CardTitle className="text-lg">Precipitación</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <p className="text-sm">
                              Requiere 1500-2000 mm de agua durante su ciclo de crecimiento. La distribución de lluvias
                              es crucial, con necesidad de períodos secos durante la maduración.
                            </p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="p-4">
                            <CardTitle className="text-lg">Humedad</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <p className="text-sm">
                              La humedad relativa óptima es de 60-80%. Niveles más altos pueden favorecer enfermedades
                              fúngicas.
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Impacto en la Producción</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      El análisis de datos históricos muestra correlaciones significativas entre variables climáticas y
                      rendimiento de azúcar:
                    </p>

                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        <span className="font-medium">Fase de crecimiento (Oct-Mar):</span> Temperaturas elevadas y
                        precipitaciones adecuadas durante este período correlacionan positivamente con mayor biomasa y
                        rendimiento potencial.
                      </li>
                      <li>
                        <span className="font-medium">Fase de maduración (Abr-Jun):</span> Temperaturas más bajas y
                        menor precipitación favorecen la acumulación de sacarosa en la caña.
                      </li>
                      <li>
                        <span className="font-medium">Fase de cosecha (May-Nov):</span> Condiciones secas son ideales
                        para maximizar el contenido de sacarosa y facilitar la cosecha.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Aplicaciones para Trading</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      El monitoreo de condiciones climáticas en regiones productoras puede proporcionar ventajas
                      estratégicas:
                    </p>

                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        <span className="font-medium">Predicción de rendimientos:</span> Desviaciones significativas de
                        las normales climáticas pueden indicar potenciales cambios en la producción nacional.
                      </li>
                      <li>
                        <span className="font-medium">Anticipación de precios:</span> Condiciones climáticas adversas
                        durante períodos críticos pueden anticipar presiones alcistas en los precios.
                      </li>
                      <li>
                        <span className="font-medium">Optimización de compras:</span> Planificar adquisiciones
                        considerando el ciclo climático y su impacto en la calidad y disponibilidad del azúcar.
                      </li>
                    </ul>
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
