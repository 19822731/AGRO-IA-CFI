"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, AlertTriangle, Droplets } from "lucide-react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { Line } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

interface NdviAnalysisProps {
  selectedArea: string
  selectedDate: string
}

export default function NdviAnalysis({ selectedArea, selectedDate }: NdviAnalysisProps) {
  const [timeRange, setTimeRange] = useState<"1m" | "3m" | "6m" | "1y">("3m")
  const [ndviData, setNdviData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [healthStatus, setHealthStatus] = useState<"healthy" | "stressed" | "critical">("healthy")
  const [stressType, setStressType] = useState<"water" | "nutrient" | "pest" | null>(null)
  const [yieldPrediction, setYieldPrediction] = useState<number | null>(null)
  const [comparisonYear, setComparisonYear] = useState<string>("2024")

  // Simular carga de datos
  useEffect(() => {
    setLoading(true)

    // Simular tiempo de carga
    setTimeout(() => {
      // Generar datos simulados para el NDVI
      const data = generateNdviData(selectedArea, timeRange, selectedDate)
      setNdviData(data)

      // Determinar estado de salud basado en los últimos valores de NDVI
      const lastValues = data.datasets[0].data.slice(-3)
      const avgNdvi = lastValues.reduce((sum: number, val: number) => sum + val, 0) / lastValues.length

      if (avgNdvi > 0.7) {
        setHealthStatus("healthy")
        setStressType(null)
      } else if (avgNdvi > 0.5) {
        setHealthStatus("stressed")
        setStressType(Math.random() > 0.5 ? "water" : "nutrient")
      } else {
        setHealthStatus("critical")
        setStressType(Math.random() > 0.7 ? "water" : Math.random() > 0.5 ? "nutrient" : "pest")
      }

      // Simular predicción de rendimiento
      const baseYield = 75 // toneladas por hectárea
      const variationFactor = avgNdvi * 1.2
      setYieldPrediction(Math.round(baseYield * variationFactor))

      setLoading(false)
    }, 1200)
  }, [selectedArea, timeRange, selectedDate])

  // Función para generar datos simulados de NDVI
  const generateNdviData = (area: string, range: string, date: string) => {
    // Determinar número de puntos de datos según el rango
    let numPoints = 0
    switch (range) {
      case "1m":
        numPoints = 30
        break
      case "3m":
        numPoints = 90
        break
      case "6m":
        numPoints = 180
        break
      case "1y":
        numPoints = 365
        break
      default:
        numPoints = 90
    }

    // Generar fechas
    const endDate = new Date(date)
    const labels = []
    for (let i = numPoints - 1; i >= 0; i--) {
      const d = new Date(endDate)
      d.setDate(d.getDate() - i)
      labels.push(d.toLocaleDateString("es-AR", { day: "numeric", month: "short" }))
    }

    // Generar valores de NDVI
    // Simular un patrón estacional con algo de ruido
    const ndviValues = []
    const seasonalComponent = area.includes("Tucumán") ? 0.2 : area.includes("Salta") ? 0.15 : 0.1
    const baseValue = area.includes("Tucumán") ? 0.7 : area.includes("Salta") ? 0.65 : 0.6

    for (let i = 0; i < numPoints; i++) {
      // Componente estacional (ciclo anual)
      const dayOfYear = (i % 365) / 365
      const seasonal = Math.sin(dayOfYear * Math.PI * 2) * seasonalComponent

      // Añadir ruido aleatorio
      const noise = (Math.random() - 0.5) * 0.1

      // Calcular valor final de NDVI
      let ndvi = baseValue + seasonal + noise

      // Asegurar que el valor esté en el rango [0, 1]
      ndvi = Math.max(0, Math.min(1, ndvi))

      ndviValues.push(ndvi)
    }

    // Generar datos de comparación con el año anterior
    const prevYearNdviValues = ndviValues.map((val) => {
      const variation = (Math.random() - 0.5) * 0.15
      return Math.max(0, Math.min(1, val + variation))
    })

    return {
      labels,
      datasets: [
        {
          label: `NDVI ${new Date().getFullYear()}`,
          data: ndviValues,
          borderColor: "#00a8ff",
          backgroundColor: "rgba(0, 168, 255, 0.1)",
          fill: true,
          tension: 0.4,
        },
        {
          label: `NDVI ${comparisonYear}`,
          data: prevYearNdviValues,
          borderColor: "#aaaaaa",
          backgroundColor: "rgba(170, 170, 170, 0.1)",
          borderDash: [5, 5],
          fill: false,
          tension: 0.4,
        },
      ],
    }
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
        },
        min: 0,
        max: 1,
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
  }

  return (
    <Card className="bg-[#111936] border-[#1a2040]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-white">Análisis Temporal de NDVI</CardTitle>
          <CardDescription className="text-gray-400">
            Evolución del índice de vegetación para {selectedArea}
          </CardDescription>
        </div>
        <div className="flex space-x-2">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
            <SelectTrigger className="w-[100px] bg-[#0a0f29] border-[#1a2040] text-white">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent className="bg-[#0a0f29] border-[#1a2040] text-white">
              <SelectItem value="1m">1 mes</SelectItem>
              <SelectItem value="3m">3 meses</SelectItem>
              <SelectItem value="6m">6 meses</SelectItem>
              <SelectItem value="1y">1 año</SelectItem>
            </SelectContent>
          </Select>

          <Select value={comparisonYear} onValueChange={setComparisonYear}>
            <SelectTrigger className="w-[120px] bg-[#0a0f29] border-[#1a2040] text-white">
              <SelectValue placeholder="Comparar con" />
            </SelectTrigger>
            <SelectContent className="bg-[#0a0f29] border-[#1a2040] text-white">
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
              <SelectItem value="none">Sin comparación</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00a8ff]"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="h-[300px]">
              <Line data={ndviData} options={chartOptions} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {/* Estado de salud del cultivo */}
              <div
                className={`p-4 rounded-lg border ${
                  healthStatus === "healthy"
                    ? "bg-green-900/20 border-green-700"
                    : healthStatus === "stressed"
                      ? "bg-yellow-900/20 border-yellow-700"
                      : "bg-red-900/20 border-red-700"
                }`}
              >
                <div className="flex items-start">
                  <div
                    className={`p-2 rounded-full mr-3 ${
                      healthStatus === "healthy"
                        ? "bg-green-700"
                        : healthStatus === "stressed"
                          ? "bg-yellow-700"
                          : "bg-red-700"
                    }`}
                  >
                    {healthStatus === "healthy" ? (
                      <TrendingUp className="h-5 w-5 text-white" />
                    ) : healthStatus === "stressed" ? (
                      <AlertTriangle className="h-5 w-5 text-white" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Estado del Cultivo</h3>
                    <p
                      className={`text-sm ${
                        healthStatus === "healthy"
                          ? "text-green-400"
                          : healthStatus === "stressed"
                            ? "text-yellow-400"
                            : "text-red-400"
                      }`}
                    >
                      {healthStatus === "healthy"
                        ? "Saludable"
                        : healthStatus === "stressed"
                          ? "Bajo estrés"
                          : "Estado crítico"}
                    </p>
                    {stressType && (
                      <p className="text-xs text-gray-400 mt-1">
                        Posible causa:{" "}
                        {stressType === "water"
                          ? "Estrés hídrico"
                          : stressType === "nutrient"
                            ? "Deficiencia nutricional"
                            : "Plaga o enfermedad"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Predicción de rendimiento */}
              <div className="bg-[#0a0f29] p-4 rounded-lg border border-[#1a2040]">
                <div className="flex items-start">
                  <div className="p-2 rounded-full mr-3 bg-[#1a2040]">
                    <TrendingUp className="h-5 w-5 text-[#00a8ff]" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Rendimiento Estimado</h3>
                    <p className="text-[#00a8ff] text-lg font-bold">{yieldPrediction} ton/ha</p>
                    <p className="text-xs text-gray-400 mt-1">Basado en el análisis de NDVI y datos históricos</p>
                  </div>
                </div>
              </div>

              {/* Recomendaciones */}
              <div className="bg-[#0a0f29] p-4 rounded-lg border border-[#1a2040]">
                <div className="flex items-start">
                  <div className="p-2 rounded-full mr-3 bg-[#1a2040]">
                    <Droplets className="h-5 w-5 text-[#00a8ff]" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Recomendaciones</h3>
                    {healthStatus === "healthy" ? (
                      <p className="text-sm text-gray-300">Mantener el régimen actual de riego y fertilización.</p>
                    ) : stressType === "water" ? (
                      <p className="text-sm text-gray-300">Aumentar el riego en las próximas 48-72 horas.</p>
                    ) : stressType === "nutrient" ? (
                      <p className="text-sm text-gray-300">Considerar aplicación de fertilizante nitrogenado.</p>
                    ) : (
                      <p className="text-sm text-gray-300">Inspeccionar el cultivo para detectar posibles plagas.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
