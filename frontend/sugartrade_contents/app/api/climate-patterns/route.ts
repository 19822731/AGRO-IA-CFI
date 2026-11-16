import { NextResponse } from "next/server"

// Función para calcular promedios mensuales a partir de datos históricos
function calculateMonthlyAverages(climateData) {
  const stations = Object.keys(climateData)
  const monthlyAverages = {}

  stations.forEach((stationId) => {
    const stationData = climateData[stationId]
    monthlyAverages[stationId] = {
      stationInfo: stationData.stationInfo,
      monthlyData: Array(12)
        .fill(0)
        .map(() => ({
          temperature: { mean: 0, min: 0, max: 0 },
          precipitation: { total: 0, days: 0 },
          humidity: 0,
          windSpeed: 0,
          sampleYears: 0,
        })),
    }

    // Acumular datos por mes
    Object.keys(stationData.data).forEach((year) => {
      stationData.data[year].forEach((monthData) => {
        const monthIndex = monthData.monthIndex
        const monthlyAvg = monthlyAverages[stationId].monthlyData[monthIndex]

        monthlyAvg.temperature.mean += monthData.temperature.mean
        monthlyAvg.temperature.min += monthData.temperature.min
        monthlyAvg.temperature.max += monthData.temperature.max
        monthlyAvg.precipitation.total += monthData.precipitation.total
        monthlyAvg.precipitation.days += monthData.precipitation.days
        monthlyAvg.humidity += monthData.humidity
        monthlyAvg.windSpeed += monthData.windSpeed
        monthlyAvg.sampleYears += 1
      })
    })

    // Calcular promedios
    monthlyAverages[stationId].monthlyData.forEach((monthlyAvg) => {
      if (monthlyAvg.sampleYears > 0) {
        monthlyAvg.temperature.mean = Number.parseFloat(
          (monthlyAvg.temperature.mean / monthlyAvg.sampleYears).toFixed(1),
        )
        monthlyAvg.temperature.min = Number.parseFloat((monthlyAvg.temperature.min / monthlyAvg.sampleYears).toFixed(1))
        monthlyAvg.temperature.max = Number.parseFloat((monthlyAvg.temperature.max / monthlyAvg.sampleYears).toFixed(1))
        monthlyAvg.precipitation.total = Number.parseFloat(
          (monthlyAvg.precipitation.total / monthlyAvg.sampleYears).toFixed(1),
        )
        monthlyAvg.precipitation.days = Math.round(monthlyAvg.precipitation.days / monthlyAvg.sampleYears)
        monthlyAvg.humidity = Number.parseFloat((monthlyAvg.humidity / monthlyAvg.sampleYears).toFixed(1))
        monthlyAvg.windSpeed = Number.parseFloat((monthlyAvg.windSpeed / monthlyAvg.sampleYears).toFixed(1))
      }
    })
  })

  return monthlyAverages
}

// Función para calcular resúmenes estacionales
function calculateSeasonalSummaries(monthlyAverages) {
  const stations = Object.keys(monthlyAverages)
  const seasonalSummaries = {}

  const seasons = [
    { name: "Verano", months: [11, 0, 1] }, // Dic, Ene, Feb
    { name: "Otoño", months: [2, 3, 4] }, // Mar, Abr, May
    { name: "Invierno", months: [5, 6, 7] }, // Jun, Jul, Ago
    { name: "Primavera", months: [8, 9, 10] }, // Sep, Oct, Nov
  ]

  stations.forEach((stationId) => {
    const stationData = monthlyAverages[stationId]
    seasonalSummaries[stationId] = {
      stationInfo: stationData.stationInfo,
      seasonalData: {},
    }

    seasons.forEach((season) => {
      const seasonData = {
        temperature: { mean: 0, min: 0, max: 0 },
        precipitation: { total: 0, days: 0 },
        humidity: 0,
        windSpeed: 0,
      }

      // Acumular datos por estación
      season.months.forEach((monthIndex) => {
        const monthData = stationData.monthlyData[monthIndex]
        seasonData.temperature.mean += monthData.temperature.mean
        seasonData.temperature.min += monthData.temperature.min
        seasonData.temperature.max += monthData.temperature.max
        seasonData.precipitation.total += monthData.precipitation.total
        seasonData.precipitation.days += monthData.precipitation.days
        seasonData.humidity += monthData.humidity
        seasonData.windSpeed += monthData.windSpeed
      })

      // Calcular promedios
      seasonData.temperature.mean = Number.parseFloat((seasonData.temperature.mean / 3).toFixed(1))
      seasonData.temperature.min = Number.parseFloat((seasonData.temperature.min / 3).toFixed(1))
      seasonData.temperature.max = Number.parseFloat((seasonData.temperature.max / 3).toFixed(1))
      seasonData.precipitation.total = Number.parseFloat(seasonData.precipitation.total.toFixed(1)) // Total acumulado
      seasonData.precipitation.days = Math.round(seasonData.precipitation.days / 3)
      seasonData.humidity = Number.parseFloat((seasonData.humidity / 3).toFixed(1))
      seasonData.windSpeed = Number.parseFloat((seasonData.windSpeed / 3).toFixed(1))

      seasonalSummaries[stationId].seasonalData[season.name] = seasonData
    })
  })

  return seasonalSummaries
}

// Función para analizar eventos extremos
function analyzeExtremeEvents(climateData) {
  const stations = Object.keys(climateData)
  const extremeEventsAnalysis = {}

  stations.forEach((stationId) => {
    const stationData = climateData[stationId]
    extremeEventsAnalysis[stationId] = {
      stationInfo: stationData.stationInfo,
      extremeEvents: {
        frost: { count: 0, byMonth: Array(12).fill(0), averageDuration: 0, totalDays: 0 },
        heatwave: { count: 0, byMonth: Array(12).fill(0), averageDuration: 0, totalDays: 0 },
        heavyRain: { count: 0, byMonth: Array(12).fill(0), averageDuration: 0, totalDays: 0 },
        drought: { count: 0, byMonth: Array(12).fill(0), averageDuration: 0, totalDays: 0 },
      },
    }

    // Contar eventos extremos por mes
    Object.keys(stationData.data).forEach((year) => {
      stationData.data[year].forEach((monthData) => {
        const monthIndex = monthData.monthIndex

        monthData.extremeEvents.forEach((event) => {
          extremeEventsAnalysis[stationId].extremeEvents[event.type].count += 1
          extremeEventsAnalysis[stationId].extremeEvents[event.type].byMonth[monthIndex] += 1
          extremeEventsAnalysis[stationId].extremeEvents[event.type].totalDays += event.days
        })
      })
    })

    // Calcular duración promedio
    Object.keys(extremeEventsAnalysis[stationId].extremeEvents).forEach((eventType) => {
      const eventData = extremeEventsAnalysis[stationId].extremeEvents[eventType]
      if (eventData.count > 0) {
        eventData.averageDuration = Number.parseFloat((eventData.totalDays / eventData.count).toFixed(1))
      }
    })
  })

  return extremeEventsAnalysis
}

// Función para detectar tendencias a largo plazo
function detectLongTermTrends(climateData) {
  const stations = Object.keys(climateData)
  const trends = {}

  stations.forEach((stationId) => {
    const stationData = climateData[stationId]
    trends[stationId] = {
      stationInfo: stationData.stationInfo,
      temperatureTrend: { slope: 0, significance: "none" },
      precipitationTrend: { slope: 0, significance: "none" },
    }

    // Calcular promedios anuales
    const yearlyAverages = {}
    Object.keys(stationData.data).forEach((year) => {
      const yearData = stationData.data[year]
      yearlyAverages[year] = {
        temperature: yearData.reduce((sum, month) => sum + month.temperature.mean, 0) / yearData.length,
        precipitation: yearData.reduce((sum, month) => sum + month.precipitation.total, 0),
      }
    })

    // Calcular tendencia de temperatura (pendiente simple)
    const years = Object.keys(yearlyAverages)
      .map(Number)
      .sort((a, b) => a - b)
    if (years.length > 1) {
      const firstYear = years[0]
      const lastYear = years[years.length - 1]
      const tempChange = yearlyAverages[lastYear].temperature - yearlyAverages[firstYear].temperature
      const yearSpan = lastYear - firstYear

      trends[stationId].temperatureTrend.slope = Number.parseFloat((tempChange / yearSpan).toFixed(3))

      // Determinar significancia (simplificado)
      if (Math.abs(trends[stationId].temperatureTrend.slope) > 0.05) {
        trends[stationId].temperatureTrend.significance = "high"
      } else if (Math.abs(trends[stationId].temperatureTrend.slope) > 0.02) {
        trends[stationId].temperatureTrend.significance = "medium"
      } else {
        trends[stationId].temperatureTrend.significance = "low"
      }

      // Calcular tendencia de precipitación
      const precipChange = yearlyAverages[lastYear].precipitation - yearlyAverages[firstYear].precipitation
      trends[stationId].precipitationTrend.slope = Number.parseFloat((precipChange / yearSpan).toFixed(1))

      // Determinar significancia (simplificado)
      if (Math.abs(trends[stationId].precipitationTrend.slope) > 10) {
        trends[stationId].precipitationTrend.significance = "high"
      } else if (Math.abs(trends[stationId].precipitationTrend.slope) > 5) {
        trends[stationId].precipitationTrend.significance = "medium"
      } else {
        trends[stationId].precipitationTrend.significance = "low"
      }
    }
  })

  return trends
}

// Función para generar recomendaciones agrícolas basadas en patrones climáticos
function generateAgriculturalRecommendations(monthlyAverages, seasonalSummaries, extremeEventsAnalysis, trends) {
  const stations = Object.keys(monthlyAverages)
  const recommendations = {}

  stations.forEach((stationId) => {
    const stationMonthlyData = monthlyAverages[stationId].monthlyData
    const stationSeasonalData = seasonalSummaries[stationId].seasonalData
    const stationExtremeEvents = extremeEventsAnalysis[stationId].extremeEvents
    const stationTrends = trends[stationId]

    recommendations[stationId] = {
      stationInfo: monthlyAverages[stationId].stationInfo,
      general: [],
      seasonal: {},
      riskManagement: [],
      longTermStrategy: [],
    }

    // Recomendaciones generales
    if (stationTrends.temperatureTrend.slope > 0.03) {
      recommendations[stationId].general.push(
        "Considerar variedades de caña de azúcar más resistentes al calor debido a la tendencia de aumento de temperatura.",
      )
    }

    if (stationTrends.precipitationTrend.slope < -5) {
      recommendations[stationId].general.push(
        "Implementar sistemas de riego eficientes debido a la tendencia de disminución de precipitaciones.",
      )
    }

    // Recomendaciones estacionales
    Object.keys(stationSeasonalData).forEach((season) => {
      const seasonData = stationSeasonalData[season]
      recommendations[stationId].seasonal[season] = []

      if (season === "Verano") {
        if (seasonData.precipitation.total > 400) {
          recommendations[stationId].seasonal[season].push(
            "Asegurar buen drenaje en los campos debido a las altas precipitaciones estivales.",
          )
        }
        if (seasonData.temperature.max > 32) {
          recommendations[stationId].seasonal[season].push(
            "Programar riegos frecuentes para evitar estrés térmico en la caña durante los días más calurosos.",
          )
        }
      } else if (season === "Invierno") {
        if (
          stationExtremeEvents.frost.byMonth[5] +
            stationExtremeEvents.frost.byMonth[6] +
            stationExtremeEvents.frost.byMonth[7] >
          0
        ) {
          recommendations[stationId].seasonal[season].push(
            "Implementar medidas de protección contra heladas para los cultivos sensibles.",
          )
        }
        if (seasonData.precipitation.total < 50) {
          recommendations[stationId].seasonal[season].push("Planificar riego suplementario durante el invierno seco.")
        }
      } else if (season === "Primavera") {
        recommendations[stationId].seasonal[season].push(
          "Período óptimo para la plantación de caña de azúcar aprovechando el aumento gradual de temperaturas.",
        )
      } else if (season === "Otoño") {
        recommendations[stationId].seasonal[season].push(
          "Época ideal para la cosecha de caña de azúcar antes de las primeras heladas.",
        )
      }
    })

    // Recomendaciones de gestión de riesgos
    if (stationExtremeEvents.drought.count > 0) {
      recommendations[stationId].riskManagement.push(
        "Implementar reservorios de agua y sistemas de riego eficientes para mitigar el impacto de las sequías.",
      )
    }

    if (stationExtremeEvents.heavyRain.count > 0) {
      recommendations[stationId].riskManagement.push(
        "Mejorar sistemas de drenaje y considerar seguros contra inundaciones debido a la frecuencia de lluvias intensas.",
      )
    }

    // Estrategias a largo plazo
    if (stationTrends.temperatureTrend.significance === "high" && stationTrends.temperatureTrend.slope > 0) {
      recommendations[stationId].longTermStrategy.push(
        "Investigar e introducir gradualmente variedades de caña más resistentes al calor y con menor requerimiento hídrico.",
      )
    }

    if (stationTrends.precipitationTrend.significance === "high" && stationTrends.precipitationTrend.slope < 0) {
      recommendations[stationId].longTermStrategy.push(
        "Invertir en infraestructura de riego y considerar técnicas de agricultura de precisión para optimizar el uso del agua.",
      )
    }
  })

  return recommendations
}

// Función para generar datos climáticos históricos simulados para Tucumán
function generateHistoricalClimateData() {
  // Estaciones meteorológicas simuladas en Tucumán
  const stations = [
    { id: "SMT", name: "San Miguel de Tucumán", lat: -26.8083, lng: -65.2176 },
    { id: "FAM", name: "Famaillá", lat: -27.0589, lng: -65.4175 },
    { id: "MON", name: "Monteros", lat: -27.1667, lng: -65.5 },
    { id: "CON", name: "Concepción", lat: -27.3333, lng: -65.5833 },
    { id: "TAF", name: "Tafí Viejo", lat: -26.7333, lng: -65.2667 },
  ]

  // Años para los que generaremos datos
  const years = Array.from({ length: 10 }, (_, i) => 2014 + i)

  // Meses del año
  const months = [
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

  // Datos climáticos por estación, año y mes
  const climateData = {}

  stations.forEach((station) => {
    climateData[station.id] = {
      stationInfo: station,
      data: {},
    }

    years.forEach((year) => {
      climateData[station.id].data[year] = []

      months.forEach((month, monthIndex) => {
        // Generar datos climáticos simulados basados en patrones estacionales de Tucumán

        // Temperatura: más alta en verano (dic-feb), más baja en invierno (jun-ago)
        let baseTemp = 0
        if (monthIndex <= 1 || monthIndex === 11) {
          // Verano
          baseTemp = 25 + Math.random() * 5
        } else if (monthIndex >= 2 && monthIndex <= 4) {
          // Otoño
          baseTemp = 18 + Math.random() * 5
        } else if (monthIndex >= 5 && monthIndex <= 7) {
          // Invierno
          baseTemp = 12 + Math.random() * 5
        } else {
          // Primavera
          baseTemp = 20 + Math.random() * 5
        }

        // Añadir variación por año (tendencia de calentamiento)
        const yearEffect = (year - 2014) * 0.05
        const tempMean = baseTemp + yearEffect

        // Precipitación: mayor en verano, menor en invierno
        let basePrecip = 0
        if (monthIndex <= 1 || monthIndex === 11) {
          // Verano
          basePrecip = 150 + Math.random() * 100
        } else if (monthIndex >= 2 && monthIndex <= 4) {
          // Otoño
          basePrecip = 50 + Math.random() * 50
        } else if (monthIndex >= 5 && monthIndex <= 7) {
          // Invierno
          basePrecip = 10 + Math.random() * 20
        } else {
          // Primavera
          basePrecip = 70 + Math.random() * 60
        }

        // Humedad: inversamente relacionada con la temperatura
        const humidity = Math.max(40, Math.min(95, 100 - tempMean * 1.5 + Math.random() * 10))

        // Velocidad del viento: variable
        const windSpeed = 5 + Math.random() * 15

        // Eventos extremos
        const extremeEvents = []

        // Heladas (solo en invierno)
        if (monthIndex >= 5 && monthIndex <= 7 && Math.random() < 0.3) {
          extremeEvents.push({
            type: "frost",
            days: Math.floor(Math.random() * 5) + 1,
            intensity: Math.random() < 0.3 ? "severe" : "moderate",
          })
        }

        // Olas de calor (principalmente en verano)
        if ((monthIndex <= 1 || monthIndex === 11) && Math.random() < 0.4) {
          extremeEvents.push({
            type: "heatwave",
            days: Math.floor(Math.random() * 7) + 3,
            intensity: Math.random() < 0.3 ? "severe" : "moderate",
          })
        }

        // Lluvias intensas (principalmente en verano)
        if ((monthIndex <= 1 || monthIndex === 11) && Math.random() < 0.5) {
          extremeEvents.push({
            type: "heavyRain",
            days: Math.floor(Math.random() * 3) + 1,
            intensity: Math.random() < 0.3 ? "severe" : "moderate",
          })
        }

        // Sequías (pueden ocurrir en cualquier época)
        if (Math.random() < 0.1) {
          extremeEvents.push({
            type: "drought",
            days: Math.floor(Math.random() * 20) + 10,
            intensity: Math.random() < 0.3 ? "severe" : "moderate",
          })
        }

        climateData[station.id].data[year].push({
          month,
          monthIndex,
          temperature: {
            mean: Number.parseFloat(tempMean.toFixed(1)),
            min: Number.parseFloat((tempMean - 5 - Math.random() * 3).toFixed(1)),
            max: Number.parseFloat((tempMean + 5 + Math.random() * 3).toFixed(1)),
          },
          precipitation: {
            total: Number.parseFloat(basePrecip.toFixed(1)),
            days: Math.floor(basePrecip / 10) + Math.floor(Math.random() * 5),
          },
          humidity: Number.parseFloat(humidity.toFixed(1)),
          windSpeed: Number.parseFloat(windSpeed.toFixed(1)),
          extremeEvents,
        })
      })
    })
  })

  return climateData
}

export async function GET(request: Request) {
  try {
    // Obtener parámetros de la solicitud
    const { searchParams } = new URL(request.url)
    const station = searchParams.get("station") || "all"

    // Generar datos climáticos históricos
    const climateData = generateHistoricalClimateData()

    // Calcular patrones climáticos
    const monthlyAverages = calculateMonthlyAverages(climateData)
    const seasonalSummaries = calculateSeasonalSummaries(monthlyAverages)
    const extremeEventsAnalysis = analyzeExtremeEvents(climateData)
    const trends = detectLongTermTrends(climateData)
    const recommendations = generateAgriculturalRecommendations(
      monthlyAverages,
      seasonalSummaries,
      extremeEventsAnalysis,
      trends,
    )

    // Preparar respuesta
    const response = {
      monthlyAverages,
      seasonalSummaries,
      extremeEventsAnalysis,
      trends,
      recommendations,
    }

    // Filtrar por estación si es necesario
    if (station !== "all") {
      Object.keys(response).forEach((key) => {
        if (response[key][station]) {
          response[key] = { [station]: response[key][station] }
        } else {
          response[key] = {}
        }
      })
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error al generar patrones climáticos:", error)
    return NextResponse.json({ error: "Error al generar patrones climáticos" }, { status: 500 })
  }
}
