"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Layers, Map, Maximize } from "lucide-react"

interface LandUseAnalysisProps {
  selectedArea: string
  selectedDate: string
}

interface LandUseData {
  totalArea: number // en hectáreas
  categories: {
    [key: string]: {
      area: number
      percentage: number
      change: number // cambio porcentual respecto al año anterior
    }
  }
}

export default function LandUseAnalysis({ selectedArea, selectedDate }: LandUseAnalysisProps) {
  const [landUseData, setLandUseData] = useState<LandUseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [comparisonYear, setComparisonYear] = useState<string>("2023")

  // Simular carga de datos
  useEffect(() => {
    setLoading(true)

    // Simular tiempo de carga
    setTimeout(() => {
      // Generar datos simulados de uso de la tierra
      const data = generateLandUseData(selectedArea)
      setLandUseData(data)
      setLoading(false)
    }, 1200)
  }, [selectedArea, selectedDate, comparisonYear])

  // Función para generar datos simulados de uso de la tierra
  const generateLandUseData = (area: string): LandUseData => {
    // Determinar área total según la región
    let totalArea = 0
    if (area.includes("Tucumán")) {
      totalArea = 25000
    } else if (area.includes("Salta")) {
      totalArea = 35000
    } else if (area.includes("Jujuy")) {
      totalArea = 20000
    } else {
      totalArea = 30000
    }

    // Generar categorías de uso de la tierra
    const categories: LandUseData["categories"] = {
      "Caña de azúcar": {
        area: Math.round(totalArea * (0.4 + Math.random() * 0.1)),
        percentage: 0, // se calculará después
        change: Math.round((Math.random() * 10 - 3) * 10) / 10,
      },
      "Otros cultivos": {
        area: Math.round(totalArea * (0.2 + Math.random() * 0.05)),
        percentage: 0,
        change: Math.round((Math.random() * 8 - 4) * 10) / 10,
      },
      Pastizales: {
        area: Math.round(totalArea * (0.15 + Math.random() * 0.05)),
        percentage: 0,
        change: Math.round((Math.random() * 6 - 3) * 10) / 10,
      },
      Bosques: {
        area: Math.round(totalArea * (0.1 + Math.random() * 0.05)),
        percentage: 0,
        change: Math.round((Math.random() * 4 - 6) * 10) / 10, // tendencia a disminuir
      },
      "Zonas urbanas": {
        area: Math.round(totalArea * (0.05 + Math.random() * 0.02)),
        percentage: 0,
        change: Math.round(Math.random() * 5 * 10) / 10, // siempre positivo (crecimiento urbano)
      },
      "Cuerpos de agua": {
        area: Math.round(totalArea * (0.03 + Math.random() * 0.01)),
        percentage: 0,
        change: 0, // generalmente estable
      },
      Otros: {
        area: 0, // se calculará después
        percentage: 0,
        change: 0,
      },
    }

    // Calcular el área de "Otros" para que sume exactamente el total
    let areaSum = 0
    for (const category in categories) {
      if (category !== "Otros") {
        areaSum += categories[category].area
      }
    }
    categories["Otros"].area = totalArea - areaSum

    // Calcular porcentajes
    for (const category in categories) {
      categories[category].percentage = Math.round((categories[category].area / totalArea) * 1000) / 10
    }

    return {
      totalArea,
      categories,
    }
  }

  // Función para obtener el color según la categoría
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Caña de azúcar":
        return "#4CAF50" // verde
      case "Otros cultivos":
        return "#8BC34A" // verde claro
      case "Pastizales":
        return "#CDDC39" // lima
      case "Bosques":
        return "#006400" // verde oscuro
      case "Zonas urbanas":
        return "#9E9E9E" // gris
      case "Cuerpos de agua":
        return "#2196F3" // azul
      case "Otros":
        return "#795548" // marrón
      default:
        return "#CCCCCC"
    }
  }

  return (
    <Card className="bg-[#111936] border-[#1a2040]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-white">Análisis de Uso de la Tierra</CardTitle>
          <CardDescription className="text-gray-400">
            Distribución de cultivos y cobertura vegetal en {selectedArea}
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
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00a8ff]"></div>
          </div>
        ) : landUseData ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Área Total Analizada</h3>
                <p className="text-[#00a8ff] text-2xl font-bold">{landUseData.totalArea.toLocaleString("es-AR")} ha</p>
              </div>
              <div className="flex space-x-2">
                <div className="p-2 rounded-lg bg-[#0a0f29] border border-[#1a2040]">
                  <Map className="h-5 w-5 text-[#00a8ff]" />
                </div>
                <div className="p-2 rounded-lg bg-[#0a0f29] border border-[#1a2040]">
                  <Layers className="h-5 w-5 text-[#00a8ff]" />
                </div>
                <div className="p-2 rounded-lg bg-[#0a0f29] border border-[#1a2040]">
                  <Maximize className="h-5 w-5 text-[#00a8ff]" />
                </div>
              </div>
            </div>

            {/* Distribución de uso de la tierra */}
            <div className="mt-4">
              <h3 className="text-white font-medium mb-3">Distribución de Uso de la Tierra</h3>
              <div className="space-y-3">
                {Object.entries(landUseData.categories)
                  .sort((a, b) => b[1].area - a[1].area) // ordenar por área descendente
                  .map(([category, data]) => (
                    <div key={category} className="bg-[#0a0f29] p-3 rounded-lg border border-[#1a2040]">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div
                            className="w-4 h-4 rounded-sm mr-2"
                            style={{ backgroundColor: getCategoryColor(category) }}
                          ></div>
                          <span className="text-white">{category}</span>
                        </div>
                        <span className="text-[#00a8ff] font-medium">{data.percentage}%</span>
                      </div>

                      {/* Barra de progreso */}
                      <div className="mt-2 bg-[#1a2040] rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${data.percentage}%`,
                            backgroundColor: getCategoryColor(category),
                          }}
                        ></div>
                      </div>

                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-400">{data.area.toLocaleString("es-AR")} ha</span>
                        {data.change !== 0 && (
                          <span className={`text-xs ${data.change > 0 ? "text-green-400" : "text-red-400"}`}>
                            {data.change > 0 ? "+" : ""}
                            {data.change}% vs {comparisonYear}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Resumen de cambios */}
            <div className="mt-4 p-4 bg-[#0a0f29] rounded-lg border border-[#1a2040]">
              <h3 className="text-white font-medium mb-2">Análisis de Cambios</h3>
              <p className="text-sm text-gray-300">
                {landUseData.categories["Caña de azúcar"].change > 0
                  ? `La superficie dedicada al cultivo de caña de azúcar ha aumentado un ${landUseData.categories["Caña de azúcar"].change}% respecto a ${comparisonYear}.`
                  : landUseData.categories["Caña de azúcar"].change < 0
                    ? `La superficie dedicada al cultivo de caña de azúcar ha disminuido un ${Math.abs(landUseData.categories["Caña de azúcar"].change)}% respecto a ${comparisonYear}.`
                    : `La superficie dedicada al cultivo de caña de azúcar se ha mantenido estable respecto a ${comparisonYear}.`}
                {landUseData.categories["Bosques"].change < -2 &&
                  ` Se observa una reducción significativa de la superficie boscosa del ${Math.abs(landUseData.categories["Bosques"].change)}%.`}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400">No hay datos disponibles para esta ubicación.</div>
        )}
      </CardContent>
    </Card>
  )
}
