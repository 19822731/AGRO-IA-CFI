import { NextResponse } from "next/server"

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
    const year = searchParams.get("year") || "all"

    // Generar datos climáticos históricos
    const climateData = generateHistoricalClimateData()

    // Filtrar datos según los parámetros
    let responseData = climateData

    if (station !== "all") {
      responseData = { [station]: climateData[station] }
    }

    if (year !== "all" && !isNaN(Number.parseInt(year))) {
      const yearInt = Number.parseInt(year)
      Object.keys(responseData).forEach((stationId) => {
        if (responseData[stationId].data[yearInt]) {
          responseData[stationId].data = { [yearInt]: responseData[stationId].data[yearInt] }
        } else {
          responseData[stationId].data = {}
        }
      })
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Error al generar datos climáticos:", error)
    return NextResponse.json({ error: "Error al generar datos climáticos" }, { status: 500 })
  }
}
