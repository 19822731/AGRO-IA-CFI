"use client"

import { useState, useEffect } from "react"

export interface TemperatureData {
  fecha: string
  temperaturaMaxima: number | null
  temperaturaMinima: number | null
  ubicacion: string
  year: number
  month: number
  day: number
}

// Datos históricos de temperatura en Argentina
const rawTemperatureData = [
  { fecha: "2024-03-18", temperaturaMaxima: 36.2, temperaturaMinima: 21.0, ubicacion: "TINOGASTA" },
  { fecha: "2024-03-18", temperaturaMaxima: 22.6, temperaturaMinima: 5.3, ubicacion: "TRELEW AERO" },
  { fecha: "2024-03-18", temperaturaMaxima: 27.6, temperaturaMinima: 21.0, ubicacion: "TRENQUE LAUQUEN" },
  { fecha: "2024-03-18", temperaturaMaxima: 28.5, temperaturaMinima: 16.7, ubicacion: "TRES ARROYOS" },
  { fecha: "2024-03-18", temperaturaMaxima: 29.5, temperaturaMinima: 22.3, ubicacion: "TUCUMAN AERO" },
  { fecha: "2024-03-18", temperaturaMaxima: 6.9, temperaturaMinima: 1.2, ubicacion: "USHUAIA AERO" },
  { fecha: "2024-03-18", temperaturaMaxima: 30.2, temperaturaMinima: 9.3, ubicacion: "USPALLATA" },
  { fecha: "2024-03-18", temperaturaMaxima: 30.3, temperaturaMinima: 20.5, ubicacion: "VENADO TUERTO AERO" },
  { fecha: "2024-03-18", temperaturaMaxima: 27.0, temperaturaMinima: null, ubicacion: "VICTORICA" },
  { fecha: "2024-03-18", temperaturaMaxima: null, temperaturaMinima: 4.7, ubicacion: "VIEDMA AERO" },
  { fecha: "2024-03-18", temperaturaMaxima: 29.7, temperaturaMinima: 22.9, ubicacion: "VILLA DE MARIA DEL RIO SECO" },
  { fecha: "2024-03-18", temperaturaMaxima: 34.5, temperaturaMinima: 23.2, ubicacion: "VILLA DOLORES AERO" },
  { fecha: "2024-03-18", temperaturaMaxima: 24.2, temperaturaMinima: 15.3, ubicacion: "VILLA GESELL AERO" },
  { fecha: "2024-03-18", temperaturaMaxima: 25.0, temperaturaMinima: 20.4, ubicacion: "VILLA REYNOLDS AERO" },
  { fecha: "2025-03-17", temperaturaMaxima: 26.5, temperaturaMinima: 19.8, ubicacion: "AEROPARQUE AERO" },
  { fecha: "2025-03-17", temperaturaMaxima: 27.2, temperaturaMinima: 12.1, ubicacion: "AZUL AERO" },
  { fecha: "2025-03-17", temperaturaMaxima: 31.5, temperaturaMinima: 16.6, ubicacion: "BAHIA BLANCA AERO" },
  { fecha: "2025-03-17", temperaturaMaxima: 19.3, temperaturaMinima: 10.9, ubicacion: "BARILOCHE AERO" },
  { fecha: "2025-03-17", temperaturaMaxima: -9.0, temperaturaMinima: -15.1, ubicacion: "BASE BELGRANO II" },
  { fecha: "2025-03-17", temperaturaMaxima: 6.0, temperaturaMinima: 2.3, ubicacion: "BASE CARLINI (EX JUBANY)" },
  { fecha: "2025-03-17", temperaturaMaxima: 6.3, temperaturaMinima: -1.1, ubicacion: "BASE ESPERANZA" },
  { fecha: "2025-03-17", temperaturaMaxima: 4.6, temperaturaMinima: -1.2, ubicacion: "BASE MARAMBIO" },
  { fecha: "2025-03-17", temperaturaMaxima: 5.4, temperaturaMinima: 0.3, ubicacion: "BASE ORCADAS" },
  { fecha: "2025-03-17", temperaturaMaxima: 4.9, temperaturaMinima: 0.3, ubicacion: "BASE SAN MARTIN" },
  { fecha: "2025-03-17", temperaturaMaxima: 27.4, temperaturaMinima: 13.4, ubicacion: "BENITO JUAREZ" },
  { fecha: "2025-03-17", temperaturaMaxima: 28.0, temperaturaMinima: 18.9, ubicacion: "BERNARDO DE IRIGOYEN AERO" },
  { fecha: "2025-03-17", temperaturaMaxima: 28.5, temperaturaMinima: 13.5, ubicacion: "BOLIVAR AERO" },
]

// Procesar los datos para añadir año, mes y día
const processedTemperatureData: TemperatureData[] = rawTemperatureData.map((item) => {
  const date = new Date(item.fecha)
  return {
    ...item,
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  }
})

export function useArgentinaTemperature() {
  const [temperatureData, setTemperatureData] = useState<TemperatureData[]>(processedTemperatureData)
  const [filteredData, setFilteredData] = useState<TemperatureData[]>(processedTemperatureData)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)

  // Obtener años únicos
  const years = [...new Set(temperatureData.map((item) => item.year))].sort((a, b) => a - b)

  // Obtener meses únicos
  const months = [...new Set(temperatureData.map((item) => item.month))].sort((a, b) => a - b)

  // Obtener ubicaciones únicas
  const locations = [...new Set(temperatureData.map((item) => item.ubicacion))].sort()

  // Filtrar datos según selecciones
  useEffect(() => {
    let filtered = [...temperatureData]

    if (selectedYear !== null) {
      filtered = filtered.filter((item) => item.year === selectedYear)
    }

    if (selectedMonth !== null) {
      filtered = filtered.filter((item) => item.month === selectedMonth)
    }

    if (selectedLocation !== null) {
      filtered = filtered.filter((item) => item.ubicacion === selectedLocation)
    }

    setFilteredData(filtered)
  }, [temperatureData, selectedYear, selectedMonth, selectedLocation])

  // Calcular estadísticas
  const calculateStats = () => {
    const validMaxTemps = filteredData
      .filter((item) => item.temperaturaMaxima !== null)
      .map((item) => item.temperaturaMaxima as number)
    const validMinTemps = filteredData
      .filter((item) => item.temperaturaMinima !== null)
      .map((item) => item.temperaturaMinima as number)

    const avgMaxTemp =
      validMaxTemps.length > 0 ? validMaxTemps.reduce((sum, temp) => sum + temp, 0) / validMaxTemps.length : null
    const avgMinTemp =
      validMinTemps.length > 0 ? validMinTemps.reduce((sum, temp) => sum + temp, 0) / validMinTemps.length : null
    const maxTemp = validMaxTemps.length > 0 ? Math.max(...validMaxTemps) : null
    const minTemp = validMinTemps.length > 0 ? Math.min(...validMinTemps) : null

    return {
      avgMaxTemp,
      avgMinTemp,
      maxTemp,
      minTemp,
      totalLocations: [...new Set(filteredData.map((item) => item.ubicacion))].length,
      totalRecords: filteredData.length,
    }
  }

  // Agrupar datos por ubicación para visualización
  const getDataByLocation = () => {
    const locationMap = new Map<string, { maxTemps: number[]; minTemps: number[] }>()

    filteredData.forEach((item) => {
      if (!locationMap.has(item.ubicacion)) {
        locationMap.set(item.ubicacion, { maxTemps: [], minTemps: [] })
      }

      const locationData = locationMap.get(item.ubicacion)!

      if (item.temperaturaMaxima !== null) {
        locationData.maxTemps.push(item.temperaturaMaxima)
      }

      if (item.temperaturaMinima !== null) {
        locationData.minTemps.push(item.temperaturaMinima)
      }
    })

    return Array.from(locationMap.entries()).map(([location, data]) => {
      const avgMaxTemp =
        data.maxTemps.length > 0 ? data.maxTemps.reduce((sum, temp) => sum + temp, 0) / data.maxTemps.length : null
      const avgMinTemp =
        data.minTemps.length > 0 ? data.minTemps.reduce((sum, temp) => sum + temp, 0) / data.minTemps.length : null

      return {
        location,
        avgMaxTemp,
        avgMinTemp,
        recordCount: data.maxTemps.length + data.minTemps.length,
      }
    })
  }

  // Preparar datos para gráficos
  const getChartData = () => {
    // Agrupar por fecha para visualización de series temporales
    const dateMap = new Map<string, { maxTemps: number[]; minTemps: number[] }>()

    filteredData.forEach((item) => {
      if (!dateMap.has(item.fecha)) {
        dateMap.set(item.fecha, { maxTemps: [], minTemps: [] })
      }

      const dateData = dateMap.get(item.fecha)!

      if (item.temperaturaMaxima !== null) {
        dateData.maxTemps.push(item.temperaturaMaxima)
      }

      if (item.temperaturaMinima !== null) {
        dateData.minTemps.push(item.temperaturaMinima)
      }
    })

    return Array.from(dateMap.entries())
      .map(([date, data]) => {
        const avgMaxTemp =
          data.maxTemps.length > 0 ? data.maxTemps.reduce((sum, temp) => sum + temp, 0) / data.maxTemps.length : null
        const avgMinTemp =
          data.minTemps.length > 0 ? data.minTemps.reduce((sum, temp) => sum + temp, 0) / data.minTemps.length : null

        return {
          date,
          avgMaxTemp,
          avgMinTemp,
          locationCount: data.maxTemps.length,
        }
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  return {
    temperatureData,
    filteredData,
    years,
    months,
    locations,
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    selectedLocation,
    setSelectedLocation,
    stats: calculateStats(),
    dataByLocation: getDataByLocation(),
    chartData: getChartData(),
  }
}
