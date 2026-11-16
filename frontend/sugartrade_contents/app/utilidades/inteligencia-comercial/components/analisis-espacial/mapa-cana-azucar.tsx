"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTucumanSugarMap } from "@/hooks/use-tucuman-sugar-map"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from "recharts"
import { Loader2 } from "lucide-react"

export function MapaCaniaAzucar() {
  const {
    isLoading,
    features,
    stats,
    metadata,
    departments,
    availableYears,
    selectedDepartment,
    selectedYear,
    filterByDepartment,
    changeYear,
  } = useTucumanSugarMap()

  const [activeTab, setActiveTab] = useState("mapa")
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [mapImageUrl, setMapImageUrl] = useState<string | null>(null)

  // Colores para los gráficos
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#8dd1e1",
    "#a4de6c",
    "#d0ed57",
  ]

  // Efecto para simular la carga del mapa
  useEffect(() => {
    if (activeTab === "mapa" && !isLoading) {
      // En una implementación real, aquí cargaríamos el mapa usando Leaflet, Mapbox u otra biblioteca
      // Para esta demostración, simplemente mostramos una imagen estática

      // Simulamos un retraso en la carga del mapa
      const timer = setTimeout(() => {
        // Usamos una imagen de placeholder para simular el mapa
        setMapImageUrl(`/placeholder.svg?height=600&width=800&text=Mapa+de+Caña+de+Azúcar+Tucumán+${selectedYear}`)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [activeTab, isLoading, selectedYear])

  // Preparar datos para el gráfico de distribución por departamento
  const departmentChartData = stats?.departmentBreakdown.slice(0, 10) || []

  // Preparar datos para el gráfico de progreso de cosecha
  const harvestChartData = stats?.harvestProgress
    ? [
        { name: "Cosechado", value: stats.harvestProgress.harvested },
        { name: "En Progreso", value: stats.harvestProgress.inProgress },
        { name: "Pendiente", value: stats.harvestProgress.pending },
      ]
    : []

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Mapa de Caña de Azúcar - Tucumán</CardTitle>
        <CardDescription>{metadata.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="w-full sm:w-auto">
            <label className="text-sm font-medium mb-1 block">Año</label>
            <Select value={selectedYear} onValueChange={changeYear}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Seleccionar año" />
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

          <div className="w-full sm:w-auto">
            <label className="text-sm font-medium mb-1 block">Departamento</label>
            <Select
              value={selectedDepartment || "all"}
              onValueChange={(value) => filterByDepartment(value === "all" ? null : value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todos los departamentos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los departamentos</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mapa">Mapa</TabsTrigger>
            <TabsTrigger value="distribucion">Distribución</TabsTrigger>
            <TabsTrigger value="cosecha">Progreso de Cosecha</TabsTrigger>
          </TabsList>

          <TabsContent value="mapa" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Visualización Espacial</CardTitle>
                <CardDescription>
                  Distribución espacial de cultivos de caña de azúcar en Tucumán ({selectedYear})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div ref={mapContainerRef} className="h-[600px] w-full bg-gray-100 rounded-md relative">
                  {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="ml-2">Cargando mapa...</span>
                    </div>
                  ) : mapImageUrl ? (
                    <div className="relative h-full w-full">
                      <img
                        src={mapImageUrl || "/placeholder.svg"}
                        alt="Mapa de caña de azúcar en Tucumán"
                        className="h-full w-full object-cover rounded-md"
                      />
                      <div className="absolute bottom-4 right-4 bg-white p-2 rounded-md shadow-md text-xs">
                        <p>Fuente: {metadata.source}</p>
                        <p>Actualizado: {metadata.lastUpdated}</p>
                      </div>

                      {/* Leyenda del mapa */}
                      <div className="absolute top-4 right-4 bg-white p-2 rounded-md shadow-md">
                        <h4 className="text-sm font-medium mb-1">Leyenda</h4>
                        <div className="flex items-center text-xs mb-1">
                          <div className="w-4 h-4 bg-green-600 mr-2"></div>
                          <span>Caña de Azúcar</span>
                        </div>
                        <div className="flex items-center text-xs mb-1">
                          <div className="w-4 h-4 bg-yellow-500 mr-2"></div>
                          <span>En cosecha</span>
                        </div>
                        <div className="flex items-center text-xs">
                          <div className="w-4 h-4 bg-red-500 mr-2"></div>
                          <span>Áreas críticas</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span>No se pudo cargar el mapa</span>
                    </div>
                  )}
                </div>

                {stats && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h3 className="text-lg font-semibold">Área Total</h3>
                      <p className="text-2xl font-bold">{stats.totalArea.toLocaleString()} ha</p>
                      <p className="text-sm text-muted-foreground">Hectáreas cultivadas con caña de azúcar</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-md">
                      <h3 className="text-lg font-semibold">Principal Departamento</h3>
                      <p className="text-2xl font-bold">{stats.departmentBreakdown[0]?.department}</p>
                      <p className="text-sm text-muted-foreground">
                        {stats.departmentBreakdown[0]?.area.toLocaleString()} ha (
                        {stats.departmentBreakdown[0]?.percentage}% del total)
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-md">
                      <h3 className="text-lg font-semibold">Progreso de Cosecha</h3>
                      <p className="text-2xl font-bold">
                        {stats.harvestProgress
                          ? Math.round((stats.harvestProgress.harvested / stats.totalArea) * 100)
                          : 0}
                        %
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {stats.harvestProgress?.harvested.toLocaleString()} ha cosechadas
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-4 text-sm text-muted-foreground">
                  <p>
                    El mapa muestra la distribución espacial de los cultivos de caña de azúcar en la provincia de
                    Tucumán para el año {selectedYear}. Los datos provienen de la Estación Experimental Agroindustrial
                    Obispo Colombres (EEAOC).
                  </p>
                  <p className="mt-2">
                    <strong>Nota:</strong> En una implementación real, este mapa sería interactivo y permitiría hacer
                    zoom, seleccionar parcelas específicas y obtener información detallada sobre cada área.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="distribucion" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Departamento</CardTitle>
                <CardDescription>Superficie cultivada con caña de azúcar por departamento (Top 10)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ChartContainer
                    config={{
                      area: {
                        label: "Superficie (ha)",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={departmentChartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="department" type="category" width={100} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="area" name="Superficie (ha)" fill="var(--color-area)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold">Análisis de Distribución</h3>
                  <p className="text-sm text-muted-foreground">
                    La distribución de cultivos de caña de azúcar en Tucumán muestra una concentración significativa en
                    los departamentos del este y centro de la provincia, donde las condiciones edafoclimáticas son más
                    favorables para este cultivo.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 border rounded-md">
                      <h4 className="font-medium">Concentración Geográfica</h4>
                      <p className="text-sm">
                        Los departamentos de Cruz Alta, Leales y Simoca concentran aproximadamente el
                        {stats
                          ? Math.round(
                              (((stats.departmentBreakdown.find((d) => d.department === "Cruz Alta")?.area || 0) +
                                (stats.departmentBreakdown.find((d) => d.department === "Leales")?.area || 0) +
                                (stats.departmentBreakdown.find((d) => d.department === "Simoca")?.area || 0)) /
                                stats.totalArea) *
                                100,
                            )
                          : 0}
                        % de la superficie total cultivada con caña de azúcar en la provincia.
                      </p>
                    </div>

                    <div className="p-3 border rounded-md">
                      <h4 className="font-medium">Evolución Histórica</h4>
                      <p className="text-sm">
                        La superficie cultivada con caña de azúcar en Tucumán ha mostrado una tendencia
                        {selectedYear === "2022" ? "creciente" : "variable"} en los últimos años, pasando de
                        aproximadamente {selectedYear === "2022" ? "250,000" : "230,000"} hectáreas en 2018 a{" "}
                        {stats?.totalArea.toLocaleString()} hectáreas en {selectedYear}.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cosecha" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Progreso de Cosecha</CardTitle>
                <CardDescription>
                  Estado actual de la cosecha de caña de azúcar en Tucumán ({selectedYear})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-[300px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={harvestChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {harvestChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${Number(value).toLocaleString()} ha`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Detalles de Cosecha</h3>

                    <div className="space-y-2">
                      {harvestChartData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                          <div className="flex items-center">
                            <div
                              className="w-4 h-4 mr-2 rounded-sm"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            ></div>
                            <span className="font-medium">{item.name}</span>
                          </div>
                          <div>
                            <span className="font-bold">{item.value.toLocaleString()} ha</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              ({Math.round((item.value / (stats?.totalArea || 1)) * 100)}%)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 bg-gray-50 rounded-md mt-4">
                      <h4 className="font-medium mb-2">Proyección de Finalización</h4>
                      <p className="text-sm">
                        Basado en el ritmo actual de cosecha y las condiciones climáticas previstas, se estima que la
                        zafra {selectedYear} finalizará a
                        {harvestChartData[0]?.value > harvestChartData[2]?.value
                          ? " mediados de noviembre"
                          : " finales de diciembre"}{" "}
                        de {selectedYear}.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold">Implicaciones para el Mercado</h3>
                  <p className="text-sm text-muted-foreground">
                    El progreso de la cosecha tiene implicaciones directas en la disponibilidad y precios del azúcar:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 border rounded-md">
                      <h4 className="font-medium">Oferta y Precios</h4>
                      <p className="text-sm">
                        {harvestChartData[0]?.value > harvestChartData[2]?.value
                          ? "El avanzado estado de la cosecha sugiere una buena disponibilidad de azúcar en el corto plazo, lo que podría estabilizar o reducir los precios."
                          : "El retraso en la cosecha podría generar una menor disponibilidad inmediata de azúcar, con potencial presión alcista sobre los precios."}
                      </p>
                    </div>

                    <div className="p-3 border rounded-md">
                      <h4 className="font-medium">Calidad del Producto</h4>
                      <p className="text-sm">
                        {harvestChartData[1]?.value > harvestChartData[2]?.value
                          ? "La cosecha en curso se está realizando en condiciones climáticas favorables, lo que sugiere una buena calidad del producto final."
                          : "Las condiciones climáticas durante esta etapa de la cosecha son variables, lo que podría afectar la calidad y rendimiento industrial del azúcar."}
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
