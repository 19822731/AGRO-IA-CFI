"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Loader2, Factory, Users, TrendingUp, Calendar, MapPin } from "lucide-react"
import {
  sugarFacilities,
  getFacilitiesByType,
  getFacilityById,
  getFacilityStats,
  mapMetadata,
} from "@/lib/services/sugar-facilities-service"

export function MapaActividadesAzucareras() {
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("mapa")
  const [selectedFacilityType, setSelectedFacilityType] = useState<string>("all")
  const [selectedFacility, setSelectedFacility] = useState<string | null>(null)
  const [mapImageUrl, setMapImageUrl] = useState<string | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  const facilities =
    selectedFacilityType === "all"
      ? sugarFacilities
      : getFacilitiesByType(selectedFacilityType as "ingenio" | "cooperativa")

  const facilityStats = getFacilityStats()

  // Colores para los gráficos
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#8dd1e1"]

  // Efecto para simular la carga del mapa
  useEffect(() => {
    if (activeTab === "mapa") {
      // En una implementación real, aquí cargaríamos el mapa usando Leaflet, Mapbox u otra biblioteca
      // Para esta demostración, simplemente mostramos una imagen estática

      // Simulamos un retraso en la carga del mapa
      setIsLoading(true)
      const timer = setTimeout(() => {
        // Usamos una imagen de placeholder para simular el mapa
        setMapImageUrl(`/placeholder.svg?height=600&width=800&text=Mapa+de+Actividades+Azucareras+Tucumán+2024`)
        setIsLoading(false)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [activeTab])

  // Datos para el gráfico de producción por ingenio
  const productionChartData = sugarFacilities
    .filter((f) => f.type === "ingenio" && f.production)
    .map((f) => ({
      name: f.name.replace("Ingenio ", ""),
      production: f.production,
    }))
    .sort((a, b) => (b.production || 0) - (a.production || 0))

  // Datos para el gráfico de distribución por tipo
  const distributionChartData = [
    { name: "Ingenios", value: facilityStats.totalIngenios },
    { name: "Cooperativas", value: facilityStats.totalCooperativas },
  ]

  // Función para simular la selección de una instalación en el mapa
  const handleFacilitySelect = (id: string) => {
    setSelectedFacility(id === selectedFacility ? null : id)
  }

  // Función para renderizar la información detallada de una instalación
  const renderFacilityDetails = () => {
    if (!selectedFacility) return null

    const facility = getFacilityById(selectedFacility)
    if (!facility) return null

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold">{facility.name}</h3>
            <Badge variant={facility.type === "ingenio" ? "default" : "outline"} className="mt-1">
              {facility.type === "ingenio" ? "Ingenio" : "Cooperativa"}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setSelectedFacility(null)}>
            Cerrar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
            <span>
              Lat: {facility.location.lat.toFixed(4)}, Lng: {facility.location.lng.toFixed(4)}
            </span>
          </div>

          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
            <span>Fundado en {facility.foundedYear || "N/A"}</span>
          </div>

          {facility.type === "ingenio" && (
            <>
              <div className="flex items-center">
                <Factory className="h-5 w-5 mr-2 text-muted-foreground" />
                <span>Capacidad: {facility.capacity?.toLocaleString()} ton/día</span>
              </div>

              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-muted-foreground" />
                <span>Producción: {facility.production?.toLocaleString()} ton/año</span>
              </div>
            </>
          )}

          <div className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-muted-foreground" />
            <span>Empleados: {facility.employees?.toLocaleString() || "N/A"}</span>
          </div>
        </div>

        {facility.type === "ingenio" && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Análisis de Producción</h4>
            <p className="text-sm text-muted-foreground">
              Este ingenio representa aproximadamente el
              {facility.production ? Math.round((facility.production / facilityStats.totalProduction) * 100) : "N/A"}%
              de la producción total de azúcar en Tucumán.
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{mapMetadata.title}</CardTitle>
        <CardDescription>{mapMetadata.summary.substring(0, 120)}...</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="w-full sm:w-auto">
            <label className="text-sm font-medium mb-1 block">Tipo de Instalación</label>
            <Select value={selectedFacilityType} onValueChange={setSelectedFacilityType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="ingenio">Ingenios</SelectItem>
                <SelectItem value="cooperativa">Cooperativas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mapa">Mapa</TabsTrigger>
            <TabsTrigger value="produccion">Producción</TabsTrigger>
            <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
          </TabsList>

          <TabsContent value="mapa" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Visualización Espacial</CardTitle>
                <CardDescription>Ubicación de ingenios y cooperativas cañeras en Tucumán (2024)</CardDescription>
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
                        alt="Mapa de actividades azucareras en Tucumán"
                        className="h-full w-full object-cover rounded-md"
                      />

                      {/* Simulación de marcadores en el mapa */}
                      <div className="absolute inset-0">
                        {facilities.map((facility) => {
                          // Convertir coordenadas geográficas a posición en el mapa (simulado)
                          const mapWidth = 800
                          const mapHeight = 600
                          const { west, east, south, north } = mapMetadata.geographicExtent

                          // Calcular posición relativa en el mapa
                          const x = ((facility.location.lng - west) / (east - west)) * mapWidth
                          const y = ((facility.location.lat - north) / (south - north)) * mapHeight

                          return (
                            <div
                              key={facility.id}
                              className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${
                                selectedFacility === facility.id ? "z-10" : "z-0"
                              }`}
                              style={{ left: `${x}px`, top: `${y}px` }}
                              onClick={() => handleFacilitySelect(facility.id)}
                            >
                              <div
                                className={`h-4 w-4 rounded-full ${
                                  facility.type === "ingenio" ? "bg-blue-500" : "bg-green-500"
                                } ${selectedFacility === facility.id ? "ring-4 ring-blue-200" : ""}`}
                              ></div>
                              <div
                                className={`absolute mt-1 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded text-xs shadow-md ${
                                  selectedFacility === facility.id ? "block" : "hidden"
                                }`}
                              >
                                {facility.name}
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      <div className="absolute bottom-4 right-4 bg-white p-2 rounded-md shadow-md text-xs">
                        <p>Fuente: EEAOC</p>
                        <p>Actualizado: Enero 2024</p>
                      </div>

                      {/* Leyenda del mapa */}
                      <div className="absolute top-4 right-4 bg-white p-2 rounded-md shadow-md">
                        <h4 className="text-sm font-medium mb-1">Leyenda</h4>
                        <div className="flex items-center text-xs mb-1">
                          <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                          <span>Ingenios</span>
                        </div>
                        <div className="flex items-center text-xs">
                          <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                          <span>Cooperativas</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span>No se pudo cargar el mapa</span>
                    </div>
                  )}
                </div>

                {renderFacilityDetails()}

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-lg font-semibold">Ingenios</h3>
                    <p className="text-2xl font-bold">{facilityStats.totalIngenios}</p>
                    <p className="text-sm text-muted-foreground">
                      Capacidad total: {facilityStats.totalCapacity.toLocaleString()} ton/día
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-lg font-semibold">Cooperativas</h3>
                    <p className="text-2xl font-bold">{facilityStats.totalCooperativas}</p>
                    <p className="text-sm text-muted-foreground">Organizaciones de productores cañeros</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-lg font-semibold">Empleos</h3>
                    <p className="text-2xl font-bold">{facilityStats.totalEmployees.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Empleos directos en el sector</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="produccion" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Producción por Ingenio</CardTitle>
                <CardDescription>Producción anual estimada de azúcar por ingenio (toneladas)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ChartContainer
                    config={{
                      production: {
                        label: "Producción (ton/año)",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={productionChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="production" name="Producción (ton/año)" fill="var(--color-production)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold">Análisis de Producción</h3>
                  <p className="text-sm text-muted-foreground">
                    La producción de azúcar en Tucumán está concentrada principalmente en 5 ingenios, que representan
                    aproximadamente el 75% de la capacidad total de molienda de la provincia. La producción anual
                    estimada para 2024 es de {facilityStats.totalProduction.toLocaleString()} toneladas.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 border rounded-md">
                      <h4 className="font-medium">Capacidad de Molienda</h4>
                      <p className="text-sm">
                        La capacidad promedio de molienda por ingenio es de
                        {Math.round(facilityStats.averageCapacityPerIngenio).toLocaleString()} toneladas por día, lo que
                        permite procesar eficientemente la caña durante la zafra.
                      </p>
                    </div>

                    <div className="p-3 border rounded-md">
                      <h4 className="font-medium">Eficiencia Productiva</h4>
                      <p className="text-sm">
                        Los ingenios más modernos de la provincia han implementado tecnologías que permiten aumentar el
                        rendimiento industrial, obteniendo más azúcar por tonelada de caña procesada.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="estadisticas" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas del Sector</CardTitle>
                <CardDescription>Análisis estadístico de la industria azucarera en Tucumán</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-[300px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={distributionChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {distributionChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Distribución de Instalaciones</h3>

                    <div className="space-y-2">
                      {distributionChartData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                          <div className="flex items-center">
                            <div
                              className="w-4 h-4 mr-2 rounded-sm"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            ></div>
                            <span className="font-medium">{item.name}</span>
                          </div>
                          <div>
                            <span className="font-bold">{item.value}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              (
                              {Math.round(
                                (item.value / (facilityStats.totalIngenios + facilityStats.totalCooperativas)) * 100,
                              )}
                              %)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 bg-gray-50 rounded-md mt-4">
                      <h4 className="font-medium mb-2">Impacto Económico</h4>
                      <p className="text-sm">
                        La industria azucarera genera aproximadamente {facilityStats.totalEmployees.toLocaleString()}{" "}
                        empleos directos en Tucumán, siendo uno de los principales motores económicos de la provincia.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold">Indicadores Clave</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 border rounded-md">
                      <h4 className="font-medium">Producción Total</h4>
                      <p className="text-2xl font-bold">{facilityStats.totalProduction.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Toneladas/año</p>
                    </div>

                    <div className="p-3 border rounded-md">
                      <h4 className="font-medium">Capacidad de Molienda</h4>
                      <p className="text-2xl font-bold">{facilityStats.totalCapacity.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Toneladas/día</p>
                    </div>

                    <div className="p-3 border rounded-md">
                      <h4 className="font-medium">Empleos Directos</h4>
                      <p className="text-2xl font-bold">{facilityStats.totalEmployees.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Personas empleadas en el sector</p>
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
