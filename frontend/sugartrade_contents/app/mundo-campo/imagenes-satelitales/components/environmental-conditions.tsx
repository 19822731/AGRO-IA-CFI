"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Cloud, Droplets, Thermometer, Wind } from "lucide-react"

interface EnvironmentalConditionsProps {
  selectedArea: string
  selectedDate: string
}

interface WeatherData {
  temperature: number
  humidity: number
  precipitation: number
  windSpeed: number
  forecast: Array<{
    date: string
    condition: "sunny" | "cloudy" | "rainy" | "stormy"
    temperature: number
    precipitation: number
  }>
}

export default function EnvironmentalConditions({ selectedArea, selectedDate }: EnvironmentalConditionsProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [droughtRisk, setDroughtRisk] = useState<"low" | "moderate" | "high">("low")
  const [floodRisk, setFloodRisk] = useState<"low" | "moderate" | "high">("low")

  // Simular carga de datos meteorológicos
  useEffect(() => {
    setLoading(true)

    // Simular tiempo de carga
    setTimeout(() => {
      // Generar datos simulados de clima
      const data = generateWeatherData(selectedArea, selectedDate)
      setWeatherData(data)

      // Calcular riesgo de sequía basado en precipitación y temperatura
      if (data.precipitation < 10 && data.temperature > 30) {
        setDroughtRisk("high")
      } else if (data.precipitation < 20 && data.temperature > 25) {
        setDroughtRisk("moderate")
      } else {
        setDroughtRisk("low")
      }

      // Calcular riesgo de inundación basado en precipitación reciente
      const recentPrecipitation = data.forecast.slice(0, 3).reduce((sum, day) => sum + day.precipitation, 0)
      if (recentPrecipitation > 100) {
        setFloodRisk("high")
      } else if (recentPrecipitation > 50) {
        setFloodRisk("moderate")
      } else {
        setFloodRisk("low")
      }

      setLoading(false)
    }, 1000)
  }, [selectedArea, selectedDate])

  // Función para generar datos simulados de clima
  const generateWeatherData = (area: string, date: string): WeatherData => {
    // Generar temperatura base según la región
    let baseTemp = 0
    if (area.includes("Tucumán")) {
      baseTemp = 28
    } else if (area.includes("Salta")) {
      baseTemp = 30
    } else if (area.includes("Jujuy")) {
      baseTemp = 26
    } else {
      baseTemp = 29
    }

    // Ajustar según la fecha (simulando estacionalidad)
    const dateObj = new Date(date)
    const month = dateObj.getMonth()
    // En Argentina, verano es diciembre-febrero, invierno es junio-agosto
    if (month >= 11 || month <= 1) {
      // Verano
      baseTemp += 5
    } else if (month >= 5 && month <= 7) {
      // Invierno
      baseTemp -= 8
    } else if (month >= 2 && month <= 4) {
      // Otoño
      baseTemp -= 3
    } else {
      // Primavera
      baseTemp += 2
    }

    // Añadir variación aleatoria
    const tempVariation = (Math.random() - 0.5) * 4
    const finalTemp = baseTemp + tempVariation

    // Generar humedad (inversamente relacionada con la temperatura)
    const baseHumidity = 100 - finalTemp * 1.5
    const humidityVariation = (Math.random() - 0.5) * 10
    const finalHumidity = Math.max(30, Math.min(95, baseHumidity + humidityVariation))

    // Generar precipitación (relacionada con la humedad)
    let basePrecipitation = 0
    if (finalHumidity > 80) {
      basePrecipitation = 30 + (finalHumidity - 80) * 2
    } else if (finalHumidity > 60) {
      basePrecipitation = 10 + (finalHumidity - 60)
    } else {
      basePrecipitation = Math.max(0, finalHumidity - 50)
    }
    const precipitationVariation = (Math.random() - 0.5) * 15
    const finalPrecipitation = Math.max(0, basePrecipitation + precipitationVariation)

    // Generar velocidad del viento
    const windSpeed = 5 + Math.random() * 15

    // Generar pronóstico para los próximos 5 días
    const forecast = []
    for (let i = 0; i < 5; i++) {
      const forecastDate = new Date(dateObj)
      forecastDate.setDate(forecastDate.getDate() + i + 1)

      const tempChange = (Math.random() - 0.5) * 6
      const dayTemp = finalTemp + tempChange

      const precipChange = (Math.random() - 0.5) * 20
      const dayPrecip = Math.max(0, finalPrecipitation + precipChange)

      let condition: "sunny" | "cloudy" | "rainy" | "stormy"
      if (dayPrecip > 30) {
        condition = "stormy"
      } else if (dayPrecip > 10) {
        condition = "rainy"
      } else if (dayTemp < 20 || Math.random() > 0.7) {
        condition = "cloudy"
      } else {
        condition = "sunny"
      }

      forecast.push({
        date: forecastDate.toLocaleDateString("es-AR", { day: "numeric", month: "short" }),
        condition,
        temperature: Math.round(dayTemp),
        precipitation: Math.round(dayPrecip),
      })
    }

    return {
      temperature: Math.round(finalTemp),
      humidity: Math.round(finalHumidity),
      precipitation: Math.round(finalPrecipitation),
      windSpeed: Math.round(windSpeed),
      forecast,
    }
  }

  // Función para obtener el ícono según la condición climática
  const getWeatherIcon = (condition: "sunny" | "cloudy" | "rainy" | "stormy") => {
    switch (condition) {
      case "sunny":
        return "☀️"
      case "cloudy":
        return "☁️"
      case "rainy":
        return "🌧️"
      case "stormy":
        return "⛈️"
      default:
        return "☁️"
    }
  }

  return (
    <Card className="bg-[#111936] border-[#1a2040]">
      <CardHeader>
        <CardTitle className="text-white">Condiciones Ambientales</CardTitle>
        <CardDescription className="text-gray-400">Datos meteorológicos para {selectedArea}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[200px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00a8ff]"></div>
          </div>
        ) : weatherData ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Temperatura */}
              <div className="bg-[#0a0f29] p-4 rounded-lg border border-[#1a2040]">
                <div className="flex items-center">
                  <div className="p-2 rounded-full mr-3 bg-[#1a2040]">
                    <Thermometer className="h-5 w-5 text-[#00a8ff]" />
                  </div>
                  <div>
                    <h3 className="text-gray-400 text-sm">Temperatura</h3>
                    <p className="text-white text-lg font-medium">{weatherData.temperature}°C</p>
                  </div>
                </div>
              </div>

              {/* Humedad */}
              <div className="bg-[#0a0f29] p-4 rounded-lg border border-[#1a2040]">
                <div className="flex items-center">
                  <div className="p-2 rounded-full mr-3 bg-[#1a2040]">
                    <Droplets className="h-5 w-5 text-[#00a8ff]" />
                  </div>
                  <div>
                    <h3 className="text-gray-400 text-sm">Humedad</h3>
                    <p className="text-white text-lg font-medium">{weatherData.humidity}%</p>
                  </div>
                </div>
              </div>

              {/* Precipitación */}
              <div className="bg-[#0a0f29] p-4 rounded-lg border border-[#1a2040]">
                <div className="flex items-center">
                  <div className="p-2 rounded-full mr-3 bg-[#1a2040]">
                    <Cloud className="h-5 w-5 text-[#00a8ff]" />
                  </div>
                  <div>
                    <h3 className="text-gray-400 text-sm">Precipitación</h3>
                    <p className="text-white text-lg font-medium">{weatherData.precipitation} mm</p>
                  </div>
                </div>
              </div>

              {/* Viento */}
              <div className="bg-[#0a0f29] p-4 rounded-lg border border-[#1a2040]">
                <div className="flex items-center">
                  <div className="p-2 rounded-full mr-3 bg-[#1a2040]">
                    <Wind className="h-5 w-5 text-[#00a8ff]" />
                  </div>
                  <div>
                    <h3 className="text-gray-400 text-sm">Viento</h3>
                    <p className="text-white text-lg font-medium">{weatherData.windSpeed} km/h</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pronóstico */}
            <div className="mt-6">
              <h3 className="text-white font-medium mb-3">Pronóstico a 5 días</h3>
              <div className="grid grid-cols-5 gap-2">
                {weatherData.forecast.map((day, index) => (
                  <div key={index} className="bg-[#0a0f29] p-3 rounded-lg border border-[#1a2040] text-center">
                    <p className="text-2xl mb-1">{getWeatherIcon(day.condition)}</p>
                    <p className="text-white text-sm">{day.date}</p>
                    <p className="text-[#00a8ff] font-medium">{day.temperature}°C</p>
                    <p className="text-xs text-gray-400">{day.precipitation} mm</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Alertas de riesgo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Riesgo de sequía */}
              <div
                className={`p-4 rounded-lg border ${
                  droughtRisk === "low"
                    ? "bg-green-900/20 border-green-700"
                    : droughtRisk === "moderate"
                      ? "bg-yellow-900/20 border-yellow-700"
                      : "bg-red-900/20 border-red-700"
                }`}
              >
                <h3 className="text-white font-medium flex items-center">
                  <Droplets className="h-4 w-4 mr-2" />
                  Riesgo de Sequía
                </h3>
                <div className="flex items-center mt-2">
                  <div
                    className={`h-3 w-3 rounded-full mr-2 ${
                      droughtRisk === "low"
                        ? "bg-green-500"
                        : droughtRisk === "moderate"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                  ></div>
                  <p className="text-sm text-gray-300">
                    {droughtRisk === "low" ? "Bajo" : droughtRisk === "moderate" ? "Moderado" : "Alto"}
                  </p>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {droughtRisk === "low"
                    ? "Condiciones normales de humedad."
                    : droughtRisk === "moderate"
                      ? "Monitorear niveles de humedad del suelo."
                      : "Considerar riego suplementario urgente."}
                </p>
              </div>

              {/* Riesgo de inundación */}
              <div
                className={`p-4 rounded-lg border ${
                  floodRisk === "low"
                    ? "bg-green-900/20 border-green-700"
                    : floodRisk === "moderate"
                      ? "bg-yellow-900/20 border-yellow-700"
                      : "bg-red-900/20 border-red-700"
                }`}
              >
                <h3 className="text-white font-medium flex items-center">
                  <Cloud className="h-4 w-4 mr-2" />
                  Riesgo de Inundación
                </h3>
                <div className="flex items-center mt-2">
                  <div
                    className={`h-3 w-3 rounded-full mr-2 ${
                      floodRisk === "low" ? "bg-green-500" : floodRisk === "moderate" ? "bg-yellow-500" : "bg-red-500"
                    }`}
                  ></div>
                  <p className="text-sm text-gray-300">
                    {floodRisk === "low" ? "Bajo" : floodRisk === "moderate" ? "Moderado" : "Alto"}
                  </p>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {floodRisk === "low"
                    ? "Sin alertas de precipitaciones intensas."
                    : floodRisk === "moderate"
                      ? "Posibles lluvias intensas en los próximos días."
                      : "Alerta de precipitaciones muy intensas."}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400">No hay datos disponibles para esta ubicación.</div>
        )}
      </CardContent>
    </Card>
  )
}
