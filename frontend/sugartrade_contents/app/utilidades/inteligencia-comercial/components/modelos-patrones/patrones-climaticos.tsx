"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Thermometer, Droplets, Cloud, AlertTriangle, Calendar, TrendingUp, Download, Leaf } from "lucide-react"
import { Line, Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { ErrorDisplay } from "@/components/error-display"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler)

export default function PatronesClimaticos() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [climatePatterns, setClimatePatterns] = useState<any>(null)
  const [selectedStation, setSelectedStation] = useState<string>("SMT")
  const [activeTab, setActiveTab] = useState("promedios-mensuales")

  // Cargar datos de patrones climáticos
  useEffect(() => {
    const fetchClimatePatterns = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/climate-patterns?station=${selectedStation}`)

        if (!response.ok) {
          throw new Error(`Error al cargar patrones climáticos: ${response.status}`)
        }

        const data = await response.json()
        setClimatePatterns(data)
        setError(null)
      } catch (err) {
        console.error("Error al cargar patrones climáticos:", err)
        setError("No se pudieron cargar los patrones climáticos. Por favor, intente nuevamente.")
      } finally {
        setLoading(false)
      }
    }

    fetchClimatePatterns()
  }, [selectedStation])

  // Preparar datos para el gráfico de temperatura mensual
  const prepareMonthlyTemperatureData = () => {
    if (!climatePatterns || !climatePatterns.monthlyAverages || !climatePatterns.monthlyAverages[selectedStation])
      return null

    const monthlyData = climatePatterns.monthlyAverages[selectedStation].monthlyData
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

    return {
      labels: months,
      datasets: [
        {
          label: "Temperatura Máxima",
          data: monthlyData.map((month) => month.temperature.max),
          borderColor: "#ff6384",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          fill: false,
          tension: 0.4,
        },
        {
          label: "Temperatura Media",
          data: monthlyData.map((month) => month.temperature.mean),
          borderColor: "#36a2eb",
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          fill: false,
          tension: 0.4,
        },
        {
          label: "Temperatura Mínima",
          data: monthlyData.map((month) => month.temperature.min),
          borderColor: "#4bc0c0",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          fill: false,
          tension: 0.4,
        },
      ],
    }
  }

  // Preparar datos para el gráfico de precipitación mensual
  const prepareMonthlyPrecipitationData = () => {
    if (!climatePatterns || !climatePatterns.monthlyAverages || !climatePatterns.monthlyAverages[selectedStation])
      return null

    const monthlyData = climatePatterns.monthlyAverages[selectedStation].monthlyData
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

    return {
      labels: months,
      datasets: [
        {
          label: "Precipitación Total (mm)",
          data: monthlyData.map((month) => month.precipitation.total),
          backgroundColor: "rgba(54, 162, 235, 0.7)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    }
  }

  // Preparar datos para el gráfico de eventos extremos
  const prepareExtremeEventsData = () => {
    if (
      !climatePatterns ||
      !climatePatterns.extremeEventsAnalysis ||
      !climatePatterns.extremeEventsAnalysis[selectedStation]
    )
      return null

    const extremeEvents = climatePatterns.extremeEventsAnalysis[selectedStation].extremeEvents
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

    return {
      labels: months,
      datasets: [
        {
          label: "Heladas",
          data: extremeEvents.frost.byMonth,
          backgroundColor: "rgba(54, 162, 235, 0.7)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
        {
          label: "Olas de Calor",
          data: extremeEvents.heatwave.byMonth,
          backgroundColor: "rgba(255, 99, 132, 0.7)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
        {
          label: "Lluvias Intensas",
          data: extremeEvents.heavyRain.byMonth,
          backgroundColor: "rgba(75, 192, 192, 0.7)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
        {
          label: "Sequías",
          data: extremeEvents.drought.byMonth,
          backgroundColor: "rgba(255, 159, 64, 0.7)",
          borderColor: "rgba(255, 159, 64, 1)",
          borderWidth: 1,
        },
      ],
    }
  }

  // Opciones para los gráficos
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
        },
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
        },
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "white",
        },
      },
      tooltip: {
        backgroundColor: "rgba(10, 15, 41, 0.9)",
        titleColor: "#00a8ff",
        bodyColor: "white",
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
        padding: 10,
      },
    },
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
  }

  const barChartOptions = {
    ...lineChartOptions,
    scales: {
      ...lineChartOptions.scales,
      y: {
        ...lineChartOptions.scales.y,
        beginAtZero: true,
      },
    },
  }

  // Renderizar componente de carga
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00a8ff]"></div>
      </div>
    )
  }

  // Renderizar mensaje de error
  if (error) {
    return (
      <ErrorDisplay
        error={error}
        title="Error al cargar patrones climáticos"
        action={<Button onClick={() => window.location.reload()}>Reintentar</Button>}
      />
    )
  }

  // Si no hay datos
  if (!climatePatterns) {
    return (
      <Card className="bg-[#111936] border-[#1a2040]">
        <CardContent className="p-6">
          <p className="text-gray-400">No hay datos de patrones climáticos disponibles.</p>
        </CardContent>
      </Card>
    )
  }

  // Verificar si los datos necesarios están disponibles
  if (!climatePatterns.monthlyAverages || !climatePatterns.monthlyAverages[selectedStation]) {
    return (
      <ErrorDisplay
        error="Los datos de la estación seleccionada no están disponibles."
        title="Datos incompletos"
        action={
          <Select value={selectedStation} onValueChange={setSelectedStation}>
            <SelectTrigger className="w-[200px] bg-[#0a0f29] border-[#1a2040]">
              <SelectValue placeholder="Seleccionar otra estación" />
            </SelectTrigger>
            <SelectContent className="bg-[#0a0f29] border-[#1a2040]">
              <SelectItem value="SMT">San Miguel de Tucumán</SelectItem>
              <SelectItem value="FAM">Famaillá</SelectItem>
              <SelectItem value="MON">Monteros</SelectItem>
              <SelectItem value="CON">Concepción</SelectItem>
              <SelectItem value="TAF">Tafí Viejo</SelectItem>
            </SelectContent>
          </Select>
        }
      />
    )
  }

  // Obtener información de la estación seleccionada
  const stationInfo = climatePatterns.monthlyAverages[selectedStation]?.stationInfo

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Patrones Climáticos y Cultivo</h2>
          <p className="text-sm text-gray-400">Análisis de patrones climáticos históricos para la región de Tucumán</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedStation} onValueChange={setSelectedStation}>
            <SelectTrigger className="w-[200px] bg-[#0a0f29] border-[#1a2040]">
              <SelectValue placeholder="Seleccionar estación" />
            </SelectTrigger>
            <SelectContent className="bg-[#0a0f29] border-[#1a2040]">
              <SelectItem value="SMT">San Miguel de Tucumán</SelectItem>
              <SelectItem value="FAM">Famaillá</SelectItem>
              <SelectItem value="MON">Monteros</SelectItem>
              <SelectItem value="CON">Concepción</SelectItem>
              <SelectItem value="TAF">Tafí Viejo</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar Datos
          </Button>
        </div>
      </div>

      {stationInfo && (
        <Card className="bg-[#111936] border-[#1a2040]">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="bg-[#1a2040] p-3 rounded-full mr-3">
                <Cloud className="h-5 w-5 text-[#00a8ff]" />
              </div>
              <div>
                <h3 className="text-white font-medium">{stationInfo.name}</h3>
                <p className="text-sm text-gray-400">
                  Lat: {stationInfo.lat.toFixed(4)}, Lng: {stationInfo.lng.toFixed(4)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="promedios-mensuales" onValueChange={setActiveTab}>
        <TabsList className="bg-[#0a0f29]">
          <TabsTrigger
            value="promedios-mensuales"
            className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
          >
            <Thermometer className="h-4 w-4 mr-2" />
            Promedios Mensuales
          </TabsTrigger>
          <TabsTrigger
            value="resumen-estacional"
            className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Resumen Estacional
          </TabsTrigger>
          <TabsTrigger
            value="eventos-extremos"
            className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Eventos Extremos
          </TabsTrigger>
          <TabsTrigger
            value="tendencias"
            className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Tendencias
          </TabsTrigger>
          <TabsTrigger
            value="recomendaciones"
            className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
          >
            <Leaf className="h-4 w-4 mr-2" />
            Recomendaciones
          </TabsTrigger>
        </TabsList>

        {/* Contenido de las pestañas */}
        <TabsContent value="promedios-mensuales" className="space-y-6 mt-4">
          {/* Contenido de promedios mensuales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-[#111936] border-[#1a2040]">
              <CardHeader>
                <CardTitle className="text-white">Temperatura Mensual</CardTitle>
                <CardDescription className="text-gray-400">Promedios históricos de temperatura (°C)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {prepareMonthlyTemperatureData() && (
                    <Line data={prepareMonthlyTemperatureData()!} options={lineChartOptions} />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#111936] border-[#1a2040]">
              <CardHeader>
                <CardTitle className="text-white">Precipitación Mensual</CardTitle>
                <CardDescription className="text-gray-400">Promedios históricos de precipitación (mm)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {prepareMonthlyPrecipitationData() && (
                    <Bar data={prepareMonthlyPrecipitationData()!} options={barChartOptions} />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resumen-estacional" className="space-y-6 mt-4">
          {/* Contenido de resumen estacional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {climatePatterns.seasonalSummaries &&
              climatePatterns.seasonalSummaries[selectedStation] &&
              Object.entries(climatePatterns.seasonalSummaries[selectedStation].seasonalData || {}).map(
                ([season, data]: [string, any]) => (
                  <Card key={season} className="bg-[#111936] border-[#1a2040]">
                    <CardHeader>
                      <CardTitle className="text-white">{season}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <div className="p-2 bg-[#1a2040] rounded-full mr-3">
                            <Thermometer className="h-5 w-5 text-[#00a8ff]" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Temperatura</p>
                            <p className="text-white">
                              Media: {data.temperature.mean}°C (Mín: {data.temperature.min}°C, Máx:{" "}
                              {data.temperature.max}
                              °C)
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <div className="p-2 bg-[#1a2040] rounded-full mr-3">
                            <Droplets className="h-5 w-5 text-[#00a8ff]" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Precipitación</p>
                            <p className="text-white">
                              Total: {data.precipitation.total} mm ({data.precipitation.days} días de lluvia)
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ),
              )}
          </div>
        </TabsContent>

        <TabsContent value="eventos-extremos" className="space-y-6 mt-4">
          {/* Contenido de eventos extremos */}
          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white">Frecuencia Mensual de Eventos Extremos</CardTitle>
              <CardDescription className="text-gray-400">
                Distribución mensual de eventos meteorológicos extremos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {prepareExtremeEventsData() && <Bar data={prepareExtremeEventsData()!} options={barChartOptions} />}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tendencias" className="space-y-6 mt-4">
          {/* Contenido de tendencias */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-[#111936] border-[#1a2040]">
              <CardHeader>
                <CardTitle className="text-white">Tendencia de Temperatura</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-3 bg-[#1a2040] rounded-full mr-4">
                      <Thermometer className="h-6 w-6 text-[#00a8ff]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Cambio anual promedio</p>
                      <p className="text-2xl font-bold text-red-500">+0.02°C/año</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#111936] border-[#1a2040]">
              <CardHeader>
                <CardTitle className="text-white">Tendencia de Precipitación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-3 bg-[#1a2040] rounded-full mr-4">
                      <Droplets className="h-6 w-6 text-[#00a8ff]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Cambio anual promedio</p>
                      <p className="text-2xl font-bold text-amber-500">-2.5 mm/año</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recomendaciones" className="space-y-6 mt-4">
          {/* Contenido de recomendaciones */}
          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white">Recomendaciones Generales</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="bg-[#1a2040] p-1 rounded-full mr-2 mt-1">
                    <Leaf className="h-4 w-4 text-[#00a8ff]" />
                  </div>
                  <span className="text-gray-300">
                    Optimizar el uso del agua mediante sistemas de riego eficientes.
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="bg-[#1a2040] p-1 rounded-full mr-2 mt-1">
                    <Leaf className="h-4 w-4 text-[#00a8ff]" />
                  </div>
                  <span className="text-gray-300">
                    Implementar prácticas de conservación del suelo para reducir la erosión.
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
