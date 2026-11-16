"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TreePine, Sprout, Trash2, BadgeCheck, Shield, TrendingDown, TrendingUp } from "lucide-react"
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
import { Line, Bar } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler)

interface SustainabilityAnalysisProps {
  selectedArea: string
  selectedDate: string
}

interface DeforestationData {
  totalArea: number
  deforestedArea: {
    current: number
    previous: number
  }
  reforestedArea: {
    current: number
    previous: number
  }
  netForestChange: number
  historicalData: {
    year: number
    forestArea: number
    deforestation: number
    reforestation: number
  }[]
  hotspots: {
    lat: number
    lng: number
    intensity: number
    cause: string
  }[]
}

interface SustainablePractices {
  coverCrops: {
    area: number
    percentage: number
    change: number
  }
  noTill: {
    area: number
    percentage: number
    change: number
  }
  organicFarming: {
    area: number
    percentage: number
    change: number
  }
  waterConservation: {
    area: number
    percentage: number
    change: number
  }
  carbonFootprint: {
    value: number
    unit: string
    change: number
  }
  certifications: {
    name: string
    status: "certified" | "in-process" | "not-certified"
    expirationDate?: string
    requirements?: string[]
  }[]
}

export default function SustainabilityAnalysis({ selectedArea, selectedDate }: SustainabilityAnalysisProps) {
  const [activeTab, setActiveTab] = useState("deforestation")
  const [loading, setLoading] = useState(true)
  const [deforestationData, setDeforestationData] = useState<DeforestationData | null>(null)
  const [sustainablePractices, setSustainablePractices] = useState<SustainablePractices | null>(null)
  const [comparisonYear, setComparisonYear] = useState<string>("2023")

  // Simular carga de datos
  useEffect(() => {
    setLoading(true)

    setTimeout(() => {
      // Generar datos simulados
      const forestData = generateDeforestationData(selectedArea)
      const practicesData = generateSustainablePracticesData(selectedArea)

      setDeforestationData(forestData)
      setSustainablePractices(practicesData)
      setLoading(false)
    }, 1200)
  }, [selectedArea, selectedDate, comparisonYear])

  // Función para generar datos simulados de deforestación
  const generateDeforestationData = (area: string): DeforestationData => {
    // Datos base según el área seleccionada
    let totalArea = 0
    let baseDeforestation = 0
    let baseReforestation = 0

    if (area.includes("Tucumán")) {
      totalArea = 8000
      baseDeforestation = 120
      baseReforestation = 80
    } else if (area.includes("Salta")) {
      totalArea = 12000
      baseDeforestation = 200
      baseReforestation = 50
    } else if (area.includes("Jujuy")) {
      totalArea = 10000
      baseDeforestation = 150
      baseReforestation = 100
    } else {
      totalArea = 5000
      baseDeforestation = 80
      baseReforestation = 40
    }

    // Añadir variación aleatoria
    const currentDeforestation = Math.round(baseDeforestation * (0.9 + Math.random() * 0.2))
    const previousDeforestation = Math.round(baseDeforestation * (0.8 + Math.random() * 0.4))
    const currentReforestation = Math.round(baseReforestation * (0.9 + Math.random() * 0.2))
    const previousReforestation = Math.round(baseReforestation * (0.8 + Math.random() * 0.4))

    // Calcular cambio neto
    const netChange = currentReforestation - currentDeforestation

    // Generar datos históricos
    const historicalData = []
    let forestArea = totalArea

    for (let year = 2018; year <= 2024; year++) {
      const yearDeforestation = Math.round(baseDeforestation * (0.7 + Math.random() * 0.6))
      const yearReforestation = Math.round(baseReforestation * (0.7 + Math.random() * 0.6))

      // Ajustar área forestal
      forestArea = forestArea - yearDeforestation + yearReforestation

      historicalData.push({
        year,
        forestArea,
        deforestation: yearDeforestation,
        reforestation: yearReforestation,
      })
    }

    // Generar hotspots de deforestación
    const hotspots = []
    const numHotspots = Math.floor(Math.random() * 3) + 2 // 2-4 hotspots

    const causes = ["Expansión agrícola", "Infraestructura", "Tala ilegal", "Incendios"]

    for (let i = 0; i < numHotspots; i++) {
      // Generar coordenadas cercanas al área seleccionada
      const latOffset = (Math.random() - 0.5) * 0.2
      const lngOffset = (Math.random() - 0.5) * 0.2

      // Coordenadas base para las diferentes áreas
      let baseLat = -27.0
      let baseLng = -65.2

      if (area.includes("Salta")) {
        baseLat = -24.8
        baseLng = -65.4
      } else if (area.includes("Jujuy")) {
        baseLat = -24.2
        baseLng = -65.3
      }

      hotspots.push({
        lat: baseLat + latOffset,
        lng: baseLng + lngOffset,
        intensity: Math.floor(Math.random() * 5) + 1, // Intensidad 1-5
        cause: causes[Math.floor(Math.random() * causes.length)],
      })
    }

    return {
      totalArea,
      deforestedArea: {
        current: currentDeforestation,
        previous: previousDeforestation,
      },
      reforestedArea: {
        current: currentReforestation,
        previous: previousReforestation,
      },
      netForestChange: netChange,
      historicalData,
      hotspots,
    }
  }

  // Función para generar datos simulados de prácticas sostenibles
  const generateSustainablePracticesData = (area: string): SustainablePractices => {
    // Datos base según el área seleccionada
    let totalArea = 0

    if (area.includes("Tucumán")) {
      totalArea = 25000
    } else if (area.includes("Salta")) {
      totalArea = 30000
    } else if (area.includes("Jujuy")) {
      totalArea = 20000
    } else {
      totalArea = 15000
    }

    // Generar datos de cultivos de cobertura
    const coverCropsPercentage = Math.round(Math.random() * 30) + 10 // 10-40%
    const coverCropsArea = Math.round((totalArea * coverCropsPercentage) / 100)
    const coverCropsChange = Math.round(Math.random() * 20 - 5) // -5 a +15%

    // Generar datos de labranza cero
    const noTillPercentage = Math.round(Math.random() * 50) + 20 // 20-70%
    const noTillArea = Math.round((totalArea * noTillPercentage) / 100)
    const noTillChange = Math.round(Math.random() * 25 - 5) // -5 a +20%

    // Generar datos de agricultura orgánica
    const organicPercentage = Math.round(Math.random() * 15) + 5 // 5-20%
    const organicArea = Math.round((totalArea * organicPercentage) / 100)
    const organicChange = Math.round(Math.random() * 15 - 2) // -2 a +13%

    // Generar datos de conservación de agua
    const waterPercentage = Math.round(Math.random() * 40) + 30 // 30-70%
    const waterArea = Math.round((totalArea * waterPercentage) / 100)
    const waterChange = Math.round(Math.random() * 20 - 3) // -3 a +17%

    // Generar huella de carbono
    const carbonFootprint = Math.round(Math.random() * 1.5 + 2.5) // 2.5-4.0
    const carbonChange = Math.round(Math.random() * 15 - 10) // -10 a +5%

    // Generar certificaciones
    const certifications = [
      {
        name: "Bonsucro",
        status: Math.random() > 0.7 ? "certified" : Math.random() > 0.5 ? "in-process" : "not-certified",
        expirationDate: "2026-12-31",
        requirements: ["Auditoría de campo", "Documentación de prácticas sostenibles", "Análisis de impacto social"],
      },
      {
        name: "Rainforest Alliance",
        status: Math.random() > 0.6 ? "certified" : Math.random() > 0.3 ? "in-process" : "not-certified",
        expirationDate: "2025-10-15",
        requirements: ["Conservación de biodiversidad", "Reducción de agroquímicos", "Prácticas sostenibles"],
      },
      {
        name: "ISO 14001",
        status: Math.random() > 0.4 ? "certified" : Math.random() > 0.7 ? "in-process" : "not-certified",
        expirationDate: "2027-05-20",
        requirements: ["Sistema de gestión ambiental", "Evaluación de impacto", "Mejora continua"],
      },
    ] as SustainablePractices["certifications"]

    return {
      coverCrops: {
        area: coverCropsArea,
        percentage: coverCropsPercentage,
        change: coverCropsChange,
      },
      noTill: {
        area: noTillArea,
        percentage: noTillPercentage,
        change: noTillChange,
      },
      organicFarming: {
        area: organicArea,
        percentage: organicPercentage,
        change: organicChange,
      },
      waterConservation: {
        area: waterArea,
        percentage: waterPercentage,
        change: waterChange,
      },
      carbonFootprint: {
        value: carbonFootprint,
        unit: "tonCO2/ha",
        change: carbonChange,
      },
      certifications,
    }
  }

  // Preparar datos para el gráfico de deforestación
  const prepareDeforestationChartData = () => {
    if (!deforestationData) return null

    return {
      labels: deforestationData.historicalData.map((d) => d.year.toString()),
      datasets: [
        {
          label: "Área forestal",
          data: deforestationData.historicalData.map((d) => d.forestArea),
          borderColor: "#4CAF50",
          backgroundColor: "rgba(76, 175, 80, 0.1)",
          fill: true,
          yAxisID: "y",
        },
        {
          label: "Deforestación",
          data: deforestationData.historicalData.map((d) => d.deforestation),
          borderColor: "#F44336",
          backgroundColor: "rgba(244, 67, 54, 0.1)",
          borderDash: [5, 5],
          yAxisID: "y1",
        },
        {
          label: "Reforestación",
          data: deforestationData.historicalData.map((d) => d.reforestation),
          borderColor: "#2196F3",
          backgroundColor: "rgba(33, 150, 243, 0.1)",
          borderDash: [3, 3],
          yAxisID: "y1",
        },
      ],
    }
  }

  // Opciones para el gráfico de deforestación
  const deforestationChartOptions = {
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
        type: "linear" as const,
        display: true,
        position: "left" as const,
        title: {
          display: true,
          text: "Área Forestal (ha)",
          color: "rgba(255, 255, 255, 0.7)",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
        },
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        title: {
          display: true,
          text: "Hectáreas",
          color: "rgba(255, 255, 255, 0.7)",
        },
        grid: {
          display: false,
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
        titleColor: "#4CAF50",
        bodyColor: "white",
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
        padding: 10,
      },
    },
  }

  // Preparar datos para el gráfico de prácticas sostenibles
  const prepareSustainablePracticesChartData = () => {
    if (!sustainablePractices) return null

    return {
      labels: ["Cultivos de Cobertura", "Labranza Cero", "Agricultura Orgánica", "Conservación de Agua"],
      datasets: [
        {
          label: "Porcentaje de Adopción",
          data: [
            sustainablePractices.coverCrops.percentage,
            sustainablePractices.noTill.percentage,
            sustainablePractices.organicFarming.percentage,
            sustainablePractices.waterConservation.percentage,
          ],
          backgroundColor: [
            "rgba(75, 192, 192, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(153, 102, 255, 0.6)",
            "rgba(255, 159, 64, 0.6)",
          ],
          borderColor: [
            "rgba(75, 192, 192, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
          ],
          borderWidth: 1,
        },
      ],
    }
  }

  // Opciones para el gráfico de prácticas sostenibles
  const sustainablePracticesChartOptions = {
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
        max: 100,
        title: {
          display: true,
          text: "Porcentaje de Área (%)",
          color: "rgba(255, 255, 255, 0.7)",
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(10, 15, 41, 0.9)",
        titleColor: "#00a8ff",
        bodyColor: "white",
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context: any) => `${context.parsed.y}% del área total`,
        },
      },
    },
  }

  // Función para obtener el color de tendencia
  const getTrendColor = (value: number): string => {
    return value >= 0 ? "text-green-500" : "text-red-500"
  }

  // Función para obtener flecha de tendencia
  const getTrendArrow = (value: number) => {
    return value >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />
  }

  // Función para obtener el estado de certificación
  const getCertificationStatus = (status: "certified" | "in-process" | "not-certified") => {
    switch (status) {
      case "certified":
        return (
          <div className="flex items-center text-green-500">
            <BadgeCheck className="h-4 w-4 mr-1" /> Certificado
          </div>
        )
      case "in-process":
        return (
          <div className="flex items-center text-yellow-500">
            <Shield className="h-4 w-4 mr-1" /> En proceso
          </div>
        )
      case "not-certified":
        return (
          <div className="flex items-center text-gray-400">
            <Trash2 className="h-4 w-4 mr-1" /> No certificado
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-[#111936] border-[#1a2040]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-white">Análisis de Sostenibilidad</CardTitle>
            <CardDescription className="text-gray-400">
              Monitoreo de deforestación y prácticas sostenibles en {selectedArea}
            </CardDescription>
          </div>
          <Select value={comparisonYear} onValueChange={setComparisonYear}>
            <SelectTrigger className="w-[120px] bg-[#0a0f29] border-[#1a2040] text-white">
              <SelectValue placeholder="Comparar con" />
            </SelectTrigger>
            <SelectContent className="bg-[#0a0f29] border-[#1a2040] text-white">
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
              <SelectItem value="2021">2021</SelectItem>
              <SelectItem value="none">Sin comparación</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-[400px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00a8ff]"></div>
            </div>
          ) : (
            <div>
              <Tabs defaultValue="deforestation" onValueChange={setActiveTab}>
                <TabsList className="bg-[#0a0f29] w-full grid grid-cols-2">
                  <TabsTrigger
                    value="deforestation"
                    className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
                  >
                    <TreePine className="h-4 w-4 mr-2" />
                    Deforestación
                  </TabsTrigger>
                  <TabsTrigger
                    value="sustainable"
                    className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
                  >
                    <Sprout className="h-4 w-4 mr-2" />
                    Prácticas Sostenibles
                  </TabsTrigger>
                </TabsList>

                {/* Pestaña de Deforestación */}
                <TabsContent value="deforestation" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-[#0a0f29] p-4 rounded-lg border border-[#1a2040]">
                      <h3 className="text-gray-400 text-sm">Área deforestada ({new Date().getFullYear()})</h3>
                      <div className="flex items-baseline mt-1">
                        <span className="text-[#00a8ff] text-2xl font-bold">
                          {deforestationData!.deforestedArea.current} ha
                        </span>
                      </div>
                      <div className="flex items-center mt-1 text-sm">
                        <span className="text-gray-400 mr-1">vs. {comparisonYear}:</span>
                        <span
                          className={getTrendColor(
                            deforestationData!.deforestedArea.current - deforestationData!.deforestedArea.previous,
                          )}
                        >
                          {getTrendArrow(
                            deforestationData!.deforestedArea.current - deforestationData!.deforestedArea.previous,
                          )}
                        </span>
                        <span
                          className={`ml-1 ${getTrendColor(deforestationData!.deforestedArea.current - deforestationData!.deforestedArea.previous)}`}
                        >
                          {Math.abs(
                            deforestationData!.deforestedArea.current - deforestationData!.deforestedArea.previous,
                          )}{" "}
                          ha (
                          {Math.abs(
                            Math.round(
                              (deforestationData!.deforestedArea.current / deforestationData!.deforestedArea.previous -
                                1) *
                                100,
                            ),
                          )}
                          %)
                        </span>
                      </div>
                    </div>

                    <div className="bg-[#0a0f29] p-4 rounded-lg border border-[#1a2040]">
                      <h3 className="text-gray-400 text-sm">Área reforestada ({new Date().getFullYear()})</h3>
                      <div className="flex items-baseline mt-1">
                        <span className="text-green-500 text-2xl font-bold">
                          {deforestationData!.reforestedArea.current} ha
                        </span>
                      </div>
                      <div className="flex items-center mt-1 text-sm">
                        <span className="text-gray-400 mr-1">vs. {comparisonYear}:</span>
                        <span
                          className={getTrendColor(
                            deforestationData!.reforestedArea.current - deforestationData!.reforestedArea.previous,
                          )}
                        >
                          {getTrendArrow(
                            deforestationData!.reforestedArea.current - deforestationData!.reforestedArea.previous,
                          )}
                        </span>
                        <span
                          className={`ml-1 ${getTrendColor(deforestationData!.reforestedArea.current - deforestationData!.reforestedArea.previous)}`}
                        >
                          {Math.abs(
                            deforestationData!.reforestedArea.current - deforestationData!.reforestedArea.previous,
                          )}{" "}
                          ha (
                          {Math.abs(
                            Math.round(
                              (deforestationData!.reforestedArea.current / deforestationData!.reforestedArea.previous -
                                1) *
                                100,
                            ),
                          )}
                          %)
                        </span>
                      </div>
                    </div>

                    <div className="bg-[#0a0f29] p-4 rounded-lg border border-[#1a2040]">
                      <h3 className="text-gray-400 text-sm">Cambio neto forestal</h3>
                      <div className="flex items-baseline mt-1">
                        <span
                          className={`text-2xl font-bold ${deforestationData!.netForestChange >= 0 ? "text-green-500" : "text-red-500"}`}
                        >
                          {deforestationData!.netForestChange >= 0 ? "+" : ""}
                          {deforestationData!.netForestChange} ha
                        </span>
                      </div>
                      <div className="mt-1 text-sm">
                        <span className="text-gray-400">
                          {deforestationData!.netForestChange >= 0
                            ? "Ganancia neta de área forestal"
                            : "Pérdida neta de área forestal"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="h-[300px] mb-6">
                    {prepareDeforestationChartData() && (
                      <Line data={prepareDeforestationChartData()!} options={deforestationChartOptions} />
                    )}
                  </div>

                  <div className="bg-[#0a0f29] p-4 rounded-lg border border-[#1a2040]">
                    <h3 className="text-white font-medium mb-3">Puntos críticos de deforestación</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {deforestationData!.hotspots.map((hotspot, index) => (
                        <div key={index} className="bg-[#111936] p-3 rounded-lg border border-[#1a2040]">
                          <div className="flex justify-between items-center">
                            <span className="text-white font-medium">Punto {index + 1}</span>
                            <div className="flex">
                              {Array.from({ length: hotspot.intensity }).map((_, i) => (
                                <div key={i} className="w-2 h-2 bg-red-500 rounded-full ml-1"></div>
                              ))}
                              {Array.from({ length: 5 - hotspot.intensity }).map((_, i) => (
                                <div key={i} className="w-2 h-2 bg-gray-700 rounded-full ml-1"></div>
                              ))}
                            </div>
                          </div>
                          <div className="text-xs text-gray-400 mt-2">
                            <div>
                              Lat: {hotspot.lat.toFixed(4)}, Lng: {hotspot.lng.toFixed(4)}
                            </div>
                            <div className="mt-1">Causa: {hotspot.cause}</div>
                          </div>
                          <div className="mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-xs h-7 border-red-800 hover:bg-red-900/20"
                            >
                              Ver en mapa
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Pestaña de Prácticas Sostenibles */}
                <TabsContent value="sustainable" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="text-white font-medium mb-3">Adopción de Prácticas Sostenibles</h3>
                      <div className="h-[250px]">
                        {prepareSustainablePracticesChartData() && (
                          <Bar
                            data={prepareSustainablePracticesChartData()!}
                            options={sustainablePracticesChartOptions}
                          />
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-white font-medium mb-3">Huella de Carbono</h3>
                      <div className="bg-[#0a0f29] p-4 rounded-lg border border-[#1a2040] flex items-center">
                        <div className="w-20 h-20 rounded-full flex items-center justify-center bg-[#111936] border-4 border-yellow-600 mr-4">
                          <span className="text-xl font-bold text-white">
                            {sustainablePractices!.carbonFootprint.value}
                          </span>
                        </div>
                        <div>
                          <p className="text-white text-lg">
                            {sustainablePractices!.carbonFootprint.value} {sustainablePractices!.carbonFootprint.unit}
                          </p>
                          <div className="flex items-center mt-1 text-sm">
                            <span className="text-gray-400 mr-1">vs. {comparisonYear}:</span>
                            <span className={getTrendColor(-sustainablePractices!.carbonFootprint.change)}>
                              {getTrendArrow(-sustainablePractices!.carbonFootprint.change)}
                            </span>
                            <span className={`ml-1 ${getTrendColor(-sustainablePractices!.carbonFootprint.change)}`}>
                              {Math.abs(sustainablePractices!.carbonFootprint.change)}%
                            </span>
                          </div>
                          <p className="text-gray-400 text-xs mt-1">
                            {sustainablePractices!.carbonFootprint.change < 0
                              ? "Reducción en la huella de carbono comparado con el año anterior"
                              : "Aumento en la huella de carbono comparado con el año anterior"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-3">
                      <h3 className="text-white font-medium mb-2">Detalle de Prácticas Sostenibles</h3>

                      <div className="bg-[#0a0f29] p-3 rounded-lg border border-[#1a2040]">
                        <div className="flex justify-between">
                          <span className="text-white">Cultivos de Cobertura</span>
                          <span className="text-[#00a8ff]">{sustainablePractices!.coverCrops.percentage}%</span>
                        </div>
                        <div className="mt-1 flex justify-between text-xs">
                          <span className="text-gray-400">
                            {sustainablePractices!.coverCrops.area.toLocaleString()} ha
                          </span>
                          <div className="flex items-center">
                            <span className={getTrendColor(sustainablePractices!.coverCrops.change)}>
                              {sustainablePractices!.coverCrops.change > 0 ? "+" : ""}
                              {sustainablePractices!.coverCrops.change}%
                            </span>
                            <span className={`ml-1 ${getTrendColor(sustainablePractices!.coverCrops.change)}`}>
                              {getTrendArrow(sustainablePractices!.coverCrops.change)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#0a0f29] p-3 rounded-lg border border-[#1a2040]">
                        <div className="flex justify-between">
                          <span className="text-white">Labranza Cero</span>
                          <span className="text-[#00a8ff]">{sustainablePractices!.noTill.percentage}%</span>
                        </div>
                        <div className="mt-1 flex justify-between text-xs">
                          <span className="text-gray-400">{sustainablePractices!.noTill.area.toLocaleString()} ha</span>
                          <div className="flex items-center">
                            <span className={getTrendColor(sustainablePractices!.noTill.change)}>
                              {sustainablePractices!.noTill.change > 0 ? "+" : ""}
                              {sustainablePractices!.noTill.change}%
                            </span>
                            <span className={`ml-1 ${getTrendColor(sustainablePractices!.noTill.change)}`}>
                              {getTrendArrow(sustainablePractices!.noTill.change)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#0a0f29] p-3 rounded-lg border border-[#1a2040]">
                        <div className="flex justify-between">
                          <span className="text-white">Agricultura Orgánica</span>
                          <span className="text-[#00a8ff]">{sustainablePractices!.organicFarming.percentage}%</span>
                        </div>
                        <div className="mt-1 flex justify-between text-xs">
                          <span className="text-gray-400">
                            {sustainablePractices!.organicFarming.area.toLocaleString()} ha
                          </span>
                          <div className="flex items-center">
                            <span className={getTrendColor(sustainablePractices!.organicFarming.change)}>
                              {sustainablePractices!.organicFarming.change > 0 ? "+" : ""}
                              {sustainablePractices!.organicFarming.change}%
                            </span>
                            <span className={`ml-1 ${getTrendColor(sustainablePractices!.organicFarming.change)}`}>
                              {getTrendArrow(sustainablePractices!.organicFarming.change)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#0a0f29] p-3 rounded-lg border border-[#1a2040]">
                        <div className="flex justify-between">
                          <span className="text-white">Conservación de Agua</span>
                          <span className="text-[#00a8ff]">{sustainablePractices!.waterConservation.percentage}%</span>
                        </div>
                        <div className="mt-1 flex justify-between text-xs">
                          <span className="text-gray-400">
                            {sustainablePractices!.waterConservation.area.toLocaleString()} ha
                          </span>
                          <div className="flex items-center">
                            <span className={getTrendColor(sustainablePractices!.waterConservation.change)}>
                              {sustainablePractices!.waterConservation.change > 0 ? "+" : ""}
                              {sustainablePractices!.waterConservation.change}%
                            </span>
                            <span className={`ml-1 ${getTrendColor(sustainablePractices!.waterConservation.change)}`}>
                              {getTrendArrow(sustainablePractices!.waterConservation.change)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-white font-medium mb-2">Certificaciones</h3>
                      <div className="space-y-3">
                        {sustainablePractices!.certifications.map((cert, index) => (
                          <div key={index} className="bg-[#0a0f29] p-3 rounded-lg border border-[#1a2040]">
                            <div className="flex justify-between items-center">
                              <span className="text-white font-medium">{cert.name}</span>
                              {getCertificationStatus(cert.status)}
                            </div>
                            {cert.status === "certified" && cert.expirationDate && (
                              <div className="text-xs text-gray-400 mt-1">
                                Válido hasta: {new Date(cert.expirationDate).toLocaleDateString("es-AR")}
                              </div>
                            )}
                            {cert.status === "in-process" && cert.requirements && (
                              <div className="mt-2">
                                <div className="text-xs text-gray-400">Requisitos pendientes:</div>
                                <ul className="text-xs text-gray-400 mt-1 list-disc ml-4">
                                  {cert.requirements.map((req, idx) => (
                                    <li key={idx}>{req}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
