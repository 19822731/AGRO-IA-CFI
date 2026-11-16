"use client"

import { useState, useEffect, useMemo } from "react"

export interface ClimateNormal {
  estacion: string
  variable: string
  unidad: string
  ene: number | null
  feb: number | null
  mar: number | null
  abr: number | null
  may: number | null
  jun: number | null
  jul: number | null
  ago: number | null
  sep: number | null
  oct: number | null
  nov: number | null
  dic: number | null
  region?: string
}

// Datos climáticos históricos de Argentina (promedios 1991-2020)
const rawClimateData: ClimateNormal[] = [
  {
    estacion: "LA QUIACA OBSERVATORIO",
    variable: "Temperatura",
    unidad: "°C",
    ene: 13.2,
    feb: 13.0,
    mar: 12.8,
    abr: 11.3,
    may: 7.3,
    jun: 4.8,
    jul: 4.5,
    ago: 7.0,
    sep: 10.0,
    oct: 12.4,
    nov: 13.4,
    dic: 13.9,
    region: "NOA",
  },
  {
    estacion: "LA QUIACA OBSERVATORIO",
    variable: "Temperatura máxima",
    unidad: "°C",
    ene: 20.6,
    feb: 20.4,
    mar: 20.6,
    abr: 20.3,
    may: 17.8,
    jun: 16.3,
    jul: 16.1,
    ago: 18.0,
    sep: 20.0,
    oct: 21.7,
    nov: 22.5,
    dic: 22.2,
    region: "NOA",
  },
  {
    estacion: "LA QUIACA OBSERVATORIO",
    variable: "Temperatura mínima",
    unidad: "°C",
    ene: 7.7,
    feb: 7.6,
    mar: 6.6,
    abr: 3.1,
    may: -2.5,
    jun: -5.7,
    jul: -6.2,
    ago: -4.0,
    sep: -0.4,
    oct: 3.3,
    nov: 5.5,
    dic: 7.3,
    region: "NOA",
  },
  {
    estacion: "LA QUIACA OBSERVATORIO",
    variable: "Humedad relativa",
    unidad: "%",
    ene: 62.6,
    feb: 63.2,
    mar: 63.6,
    abr: 63.6,
    may: 63.2,
    jun: 61.9,
    jul: 59.5,
    ago: 56.8,
    sep: 57.6,
    oct: 59.5,
    nov: 61.1,
    dic: 61.9,
    region: "NOA",
  },
  {
    estacion: "LA QUIACA OBSERVATORIO",
    variable: "Velocidad del Viento",
    unidad: "km/h",
    ene: null,
    feb: null,
    mar: null,
    abr: null,
    may: null,
    jun: null,
    jul: null,
    ago: null,
    sep: null,
    oct: null,
    nov: null,
    dic: null,
    region: "NOA",
  },
  {
    estacion: "LA QUIACA OBSERVATORIO",
    variable: "Nubosidad total",
    unidad: "octavos",
    ene: 3.7,
    feb: 3.9,
    mar: 4.1,
    abr: 4.4,
    may: 4.4,
    jun: 4.5,
    jul: 4.3,
    ago: 4.0,
    sep: 3.9,
    oct: 3.7,
    nov: 3.6,
    dic: 3.5,
    region: "NOA",
  },
  {
    estacion: "LA QUIACA OBSERVATORIO",
    variable: "Precipitación total",
    unidad: "mm",
    ene: 25.7,
    feb: 21.8,
    mar: 22.9,
    abr: 10.8,
    may: 4.2,
    jun: 2.1,
    jul: 2.5,
    ago: 2.4,
    sep: 5.3,
    oct: 10.9,
    nov: 14.8,
    dic: 21.7,
    region: "NOA",
  },
  {
    estacion: "JUJUY AERO",
    variable: "Temperatura",
    unidad: "°C",
    ene: 19.9,
    feb: 19.4,
    mar: 18.7,
    abr: 16.1,
    may: 12.1,
    jun: 9.0,
    jul: 8.6,
    ago: 11.0,
    sep: 14.3,
    oct: 17.8,
    nov: 19.6,
    dic: 20.4,
    region: "NOA",
  },
  {
    estacion: "JUJUY AERO",
    variable: "Temperatura máxima",
    unidad: "°C",
    ene: 26.2,
    feb: 25.3,
    mar: 24.2,
    abr: 22.0,
    may: 18.6,
    jun: 16.0,
    jul: 15.9,
    ago: 18.1,
    sep: 21.0,
    oct: 24.0,
    nov: 25.6,
    dic: 26.4,
    region: "NOA",
  },
  {
    estacion: "JUJUY AERO",
    variable: "Temperatura mínima",
    unidad: "°C",
    ene: 14.9,
    feb: 14.5,
    mar: 14.0,
    abr: 11.4,
    may: 7.8,
    jun: 4.9,
    jul: 4.2,
    ago: 6.6,
    sep: 9.3,
    oct: 12.2,
    nov: 14.0,
    dic: 15.1,
    region: "NOA",
  },
  {
    estacion: "JUJUY AERO",
    variable: "Humedad relativa",
    unidad: "%",
    ene: 69.9,
    feb: 72.0,
    mar: 74.0,
    abr: 75.9,
    may: 76.0,
    jun: 75.3,
    jul: 72.9,
    ago: 68.6,
    sep: 64.1,
    oct: 62.0,
    nov: 64.3,
    dic: 66.5,
    region: "NOA",
  },
  {
    estacion: "JUJUY AERO",
    variable: "Velocidad del Viento",
    unidad: "km/h",
    ene: null,
    feb: null,
    mar: null,
    abr: null,
    may: null,
    jun: null,
    jul: null,
    ago: null,
    sep: null,
    oct: null,
    nov: null,
    dic: null,
    region: "NOA",
  },
  {
    estacion: "JUJUY AERO",
    variable: "Nubosidad total",
    unidad: "octavos",
    ene: 4.3,
    feb: 4.5,
    mar: 4.8,
    abr: 5.0,
    may: 5.1,
    jun: 5.3,
    jul: 5.0,
    ago: 4.6,
    sep: 4.3,
    oct: 4.0,
    nov: 3.9,
    dic: 3.9,
    region: "NOA",
  },
  {
    estacion: "JUJUY AERO",
    variable: "Precipitación total",
    unidad: "mm",
    ene: 158.1,
    feb: 117.8,
    mar: 104.4,
    abr: 31.8,
    may: 8.5,
    jun: 3.5,
    jul: 4.1,
    ago: 4.7,
    sep: 10.8,
    oct: 32.1,
    nov: 59.4,
    dic: 102.7,
    region: "NOA",
  },
  {
    estacion: "SALTA AERO",
    variable: "Temperatura",
    unidad: "°C",
    ene: 21.4,
    feb: 20.6,
    mar: 19.7,
    abr: 16.8,
    may: 12.4,
    jun: 8.9,
    jul: 8.3,
    ago: 11.0,
    sep: 14.7,
    oct: 18.7,
    nov: 20.8,
    dic: 21.9,
    region: "NOA",
  },
  {
    estacion: "SALTA AERO",
    variable: "Temperatura máxima",
    unidad: "°C",
    ene: 28.1,
    feb: 27.0,
    mar: 25.9,
    abr: 23.0,
    may: 19.0,
    jun: 16.0,
    jul: 15.7,
    ago: 18.0,
    sep: 21.2,
    oct: 25.0,
    nov: 27.1,
    dic: 28.2,
    region: "NOA",
  },
  {
    estacion: "SALTA AERO",
    variable: "Temperatura mínima",
    unidad: "°C",
    ene: 15.9,
    feb: 15.3,
    mar: 14.5,
    abr: 11.4,
    may: 7.5,
    jun: 4.4,
    jul: 3.6,
    ago: 6.2,
    sep: 9.5,
    oct: 13.0,
    nov: 14.9,
    dic: 16.1,
    region: "NOA",
  },
  {
    estacion: "SALTA AERO",
    variable: "Humedad relativa",
    unidad: "%",
    ene: 68.3,
    feb: 70.6,
    mar: 73.0,
    abr: 75.8,
    may: 77.0,
    jun: 76.9,
    jul: 74.0,
    ago: 69.0,
    sep: 63.9,
    oct: 60.5,
    nov: 63.1,
    dic: 65.7,
    region: "NOA",
  },
  {
    estacion: "SALTA AERO",
    variable: "Velocidad del Viento",
    unidad: "km/h",
    ene: null,
    feb: null,
    mar: null,
    abr: null,
    may: null,
    jun: null,
    jul: null,
    ago: null,
    sep: null,
    oct: null,
    nov: null,
    dic: null,
    region: "NOA",
  },
  {
    estacion: "SALTA AERO",
    variable: "Nubosidad total",
    unidad: "octavos",
    ene: 4.1,
    feb: 4.3,
    mar: 4.6,
    abr: 4.9,
    may: 5.1,
    jun: 5.3,
    jul: 5.0,
    ago: 4.6,
    sep: 4.2,
    oct: 3.9,
    nov: 3.8,
    dic: 3.8,
    region: "NOA",
  },
  {
    estacion: "SALTA AERO",
    variable: "Precipitación total",
    unidad: "mm",
    ene: 170.7,
    feb: 115.8,
    mar: 98.1,
    abr: 28.5,
    may: 7.1,
    jun: 3.0,
    jul: 3.6,
    ago: 4.4,
    sep: 10.2,
    oct: 28.7,
    nov: 58.2,
    dic: 99.7,
    region: "NOA",
  },
  {
    estacion: "TUCUMAN AERO",
    variable: "Temperatura",
    unidad: "°C",
    ene: 23.8,
    feb: 22.8,
    mar: 21.4,
    abr: 17.8,
    may: 13.4,
    jun: 9.8,
    jul: 9.0,
    ago: 11.8,
    sep: 15.6,
    oct: 19.9,
    nov: 22.2,
    dic: 23.8,
    region: "NOA",
  },
  {
    estacion: "TUCUMAN AERO",
    variable: "Temperatura máxima",
    unidad: "°C",
    ene: 30.9,
    feb: 29.5,
    mar: 27.8,
    abr: 24.2,
    may: 20.0,
    jun: 16.5,
    jul: 16.1,
    ago: 18.8,
    sep: 22.1,
    oct: 26.0,
    nov: 28.3,
    dic: 30.4,
    region: "NOA",
  },
  {
    estacion: "TUCUMAN AERO",
    variable: "Temperatura mínima",
    unidad: "°C",
    ene: 18.1,
    feb: 17.3,
    mar: 16.1,
    abr: 12.6,
    may: 8.7,
    jun: 5.4,
    jul: 4.4,
    ago: 7.1,
    sep: 10.7,
    oct: 14.6,
    nov: 16.7,
    dic: 18.0,
    region: "NOA",
  },
  {
    estacion: "TUCUMAN AERO",
    variable: "Humedad relativa",
    unidad: "%",
    ene: 69.4,
    feb: 72.0,
    mar: 74.4,
    abr: 77.3,
    may: 78.5,
    jun: 78.1,
    jul: 75.2,
    ago: 70.1,
    sep: 64.5,
    oct: 61.2,
    nov: 64.0,
    dic: 66.5,
    region: "NOA",
  },
  {
    estacion: "TUCUMAN AERO",
    variable: "Velocidad del Viento",
    unidad: "km/h",
    ene: null,
    feb: null,
    mar: null,
    abr: null,
    may: null,
    jun: null,
    jul: null,
    ago: null,
    sep: null,
    oct: null,
    nov: null,
    dic: null,
    region: "NOA",
  },
  {
    estacion: "TUCUMAN AERO",
    variable: "Nubosidad total",
    unidad: "octavos",
    ene: 4.0,
    feb: 4.2,
    mar: 4.5,
    abr: 4.8,
    may: 5.1,
    jun: 5.4,
    jul: 5.1,
    ago: 4.7,
    sep: 4.2,
    oct: 3.9,
    nov: 3.8,
    dic: 3.8,
    region: "NOA",
  },
  {
    estacion: "TUCUMAN AERO",
    variable: "Precipitación total",
    unidad: "mm",
    ene: 153.8,
    feb: 110.7,
    mar: 92.9,
    abr: 28.8,
    may: 7.3,
    jun: 3.0,
    jul: 3.5,
    ago: 4.4,
    sep: 9.7,
    oct: 27.6,
    nov: 54.7,
    dic: 95.9,
    region: "NOA",
  },
  // Continúa con más estaciones...
  {
    estacion: "FORMOSA AERO",
    variable: "Temperatura",
    unidad: "°C",
    ene: 26.6,
    feb: 25.4,
    mar: 24.0,
    abr: 20.7,
    may: 16.6,
    jun: 13.2,
    jul: 12.5,
    ago: 14.8,
    sep: 18.1,
    oct: 22.2,
    nov: 24.6,
    dic: 26.5,
    region: "NEA",
  },
  {
    estacion: "FORMOSA AERO",
    variable: "Precipitación total",
    unidad: "mm",
    ene: 130.4,
    feb: 107.8,
    mar: 101.9,
    abr: 55.5,
    may: 17.6,
    jun: 6.0,
    jul: 6.9,
    ago: 8.7,
    sep: 16.0,
    oct: 44.8,
    nov: 69.8,
    dic: 103.4,
    region: "NEA",
  },
  {
    estacion: "CORRIENTES AERO",
    variable: "Temperatura",
    unidad: "°C",
    ene: 25.7,
    feb: 24.5,
    mar: 23.0,
    abr: 19.7,
    may: 15.6,
    jun: 12.2,
    jul: 11.6,
    ago: 14.0,
    sep: 17.3,
    oct: 21.4,
    nov: 23.8,
    dic: 25.6,
    region: "NEA",
  },
  {
    estacion: "CORRIENTES AERO",
    variable: "Precipitación total",
    unidad: "mm",
    ene: 122.2,
    feb: 106.7,
    mar: 102.5,
    abr: 59.9,
    may: 22.3,
    jun: 8.2,
    jul: 9.3,
    ago: 11.5,
    sep: 20.0,
    oct: 50.1,
    nov: 75.1,
    dic: 103.1,
    region: "NEA",
  },
  {
    estacion: "POSADAS OBSERVATORIO",
    variable: "Temperatura",
    unidad: "°C",
    ene: 24.6,
    feb: 23.5,
    mar: 22.0,
    abr: 18.8,
    may: 14.8,
    jun: 11.5,
    jul: 10.9,
    ago: 13.2,
    sep: 16.4,
    oct: 20.4,
    nov: 22.8,
    dic: 24.5,
    region: "NEA",
  },
  {
    estacion: "POSADAS OBSERVATORIO",
    variable: "Precipitación total",
    unidad: "mm",
    ene: 163.8,
    feb: 136.8,
    mar: 131.3,
    abr: 79.1,
    may: 35.1,
    jun: 13.3,
    jul: 15.3,
    ago: 17.8,
    sep: 29.9,
    oct: 65.5,
    nov: 95.7,
    dic: 131.8,
    region: "NEA",
  },
  // Estaciones de la región pampeana (relevantes para producción de azúcar)
  {
    estacion: "SANTA ROSA AERO",
    variable: "Temperatura",
    unidad: "°C",
    ene: 23.0,
    feb: 22.0,
    mar: 20.1,
    abr: 15.9,
    may: 11.1,
    jun: 7.5,
    jul: 6.8,
    ago: 9.8,
    sep: 13.9,
    oct: 18.5,
    nov: 21.0,
    dic: 23.2,
    region: "PAMPEANA",
  },
  {
    estacion: "SANTA ROSA AERO",
    variable: "Precipitación total",
    unidad: "mm",
    ene: 68.9,
    feb: 59.2,
    mar: 62.7,
    abr: 34.5,
    may: 11.9,
    jun: 4.2,
    jul: 4.8,
    ago: 6.0,
    sep: 12.6,
    oct: 30.6,
    nov: 49.3,
    dic: 60.4,
    region: "PAMPEANA",
  },
  // Estaciones de la Patagonia
  {
    estacion: "NEUQUEN AERO",
    variable: "Temperatura",
    unidad: "°C",
    ene: 22.9,
    feb: 21.3,
    mar: 18.7,
    abr: 13.8,
    may: 8.9,
    jun: 5.2,
    jul: 4.6,
    ago: 8.1,
    sep: 12.7,
    oct: 18.0,
    nov: 21.1,
    dic: 23.4,
    region: "PATAGONIA",
  },
  {
    estacion: "NEUQUEN AERO",
    variable: "Precipitación total",
    unidad: "mm",
    ene: 15.7,
    feb: 13.8,
    mar: 18.6,
    abr: 17.1,
    may: 7.0,
    jun: 4.0,
    jul: 4.1,
    ago: 5.2,
    sep: 9.5,
    oct: 17.8,
    nov: 20.9,
    dic: 19.5,
    region: "PATAGONIA",
  },
  {
    estacion: "USHUAIA AERO",
    variable: "Temperatura",
    unidad: "°C",
    ene: 9.2,
    feb: 9.0,
    mar: 7.7,
    abr: 4.9,
    may: 1.8,
    jun: -0.8,
    jul: -1.8,
    ago: 0.1,
    sep: 3.1,
    oct: 5.9,
    nov: 7.5,
    dic: 8.9,
    region: "PATAGONIA",
  },
  {
    estacion: "USHUAIA AERO",
    variable: "Precipitación total",
    unidad: "mm",
    ene: 56.4,
    feb: 51.7,
    mar: 60.8,
    abr: 56.9,
    may: 51.9,
    jun: 41.4,
    jul: 41.9,
    ago: 46.1,
    sep: 49.9,
    oct: 55.5,
    nov: 51.8,
    dic: 53.9,
    region: "PATAGONIA",
  },
]

// Regiones productoras de azúcar en Argentina
const sugarProducingRegions = ["NOA", "NEA"]

export function useArgentinaClimateNormals() {
  const [climateData, setClimateData] = useState<ClimateNormal[]>(rawClimateData)
  const [filteredData, setFilteredData] = useState<ClimateNormal[]>(rawClimateData)
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [selectedStation, setSelectedStation] = useState<string | null>(null)
  const [selectedVariable, setSelectedVariable] = useState<string | null>(null)

  // Obtener regiones únicas
  const regions = useMemo(() => {
    return [...new Set(climateData.map((item) => item.region))].filter(Boolean).sort() as string[]
  }, [climateData])

  // Obtener estaciones únicas
  const stations = useMemo(() => {
    let stationsData = climateData

    if (selectedRegion) {
      stationsData = stationsData.filter((item) => item.region === selectedRegion)
    }

    return [...new Set(stationsData.map((item) => item.estacion))].sort()
  }, [climateData, selectedRegion])

  // Obtener variables únicas
  const variables = useMemo(() => {
    return [...new Set(climateData.map((item) => item.variable))].sort()
  }, [climateData])

  // Filtrar datos según selecciones
  useEffect(() => {
    let filtered = [...climateData]

    if (selectedRegion) {
      filtered = filtered.filter((item) => item.region === selectedRegion)
    }

    if (selectedStation) {
      filtered = filtered.filter((item) => item.estacion === selectedStation)
    }

    if (selectedVariable) {
      filtered = filtered.filter((item) => item.variable === selectedVariable)
    }

    setFilteredData(filtered)
  }, [climateData, selectedRegion, selectedStation, selectedVariable])

  // Preparar datos para gráficos de línea (evolución mensual)
  const getMonthlyChartData = (variable = "Temperatura") => {
    let data = filteredData

    if (variable) {
      data = data.filter((item) => item.variable === variable)
    }

    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

    return monthNames.map((month, index) => {
      const monthKey = month.toLowerCase() as keyof ClimateNormal

      const stationData: Record<string, any> = {
        month,
      }

      data.forEach((item) => {
        if (item[monthKey] !== null) {
          stationData[item.estacion] = item[monthKey]
        }
      })

      return stationData
    })
  }

  // Preparar datos para gráficos de barras (comparación entre estaciones)
  const getStationComparisonData = (variable = "Temperatura", month = "ene") => {
    let data = filteredData

    if (variable) {
      data = data.filter((item) => item.variable === variable)
    }

    const monthKey = month.toLowerCase() as keyof ClimateNormal

    return data
      .map((item) => ({
        estacion: item.estacion,
        valor: item[monthKey],
        region: item.region,
      }))
      .filter((item) => item.valor !== null)
  }

  // Calcular promedios anuales por estación y variable
  const getAnnualAverages = () => {
    return filteredData.map((item) => {
      const monthValues = [
        item.ene,
        item.feb,
        item.mar,
        item.abr,
        item.may,
        item.jun,
        item.jul,
        item.ago,
        item.sep,
        item.oct,
        item.nov,
        item.dic,
      ].filter((val) => val !== null) as number[]

      const average =
        monthValues.length > 0 ? monthValues.reduce((sum, val) => sum + val, 0) / monthValues.length : null

      return {
        estacion: item.estacion,
        variable: item.variable,
        unidad: item.unidad,
        promedio: average,
        region: item.region,
      }
    })
  }

  // Obtener datos para regiones productoras de azúcar
  const getSugarRegionsData = () => {
    return climateData.filter((item) => sugarProducingRegions.includes(item.region || ""))
  }

  // Calcular correlaciones entre variables climáticas y producción de azúcar
  // (Simulado para demostración)
  const getClimateSugarCorrelations = () => {
    // Datos simulados de correlación entre variables climáticas y producción de azúcar
    return [
      {
        variable: "Temperatura",
        correlacion: 0.72,
        impacto: "Alto positivo",
        descripcion: "Mayor temperatura en fase de crecimiento aumenta rendimiento",
      },
      {
        variable: "Precipitación total",
        correlacion: 0.65,
        impacto: "Alto positivo",
        descripcion: "Precipitaciones adecuadas durante crecimiento mejoran rendimiento",
      },
      {
        variable: "Humedad relativa",
        correlacion: 0.48,
        impacto: "Medio positivo",
        descripcion: "Humedad moderada favorece desarrollo vegetativo",
      },
      {
        variable: "Temperatura máxima",
        correlacion: 0.38,
        impacto: "Medio positivo",
        descripcion: "Temperaturas máximas moderadas favorecen fotosíntesis",
      },
      {
        variable: "Temperatura mínima",
        correlacion: 0.56,
        impacto: "Medio positivo",
        descripcion: "Temperaturas mínimas elevadas reducen estrés por frío",
      },
      {
        variable: "Nubosidad total",
        correlacion: -0.32,
        impacto: "Medio negativo",
        descripcion: "Exceso de nubosidad reduce radiación solar disponible",
      },
    ]
  }

  return {
    climateData,
    filteredData,
    regions,
    stations,
    variables,
    selectedRegion,
    setSelectedRegion,
    selectedStation,
    setSelectedStation,
    selectedVariable,
    setSelectedVariable,
    getMonthlyChartData,
    getStationComparisonData,
    getAnnualAverages,
    getSugarRegionsData,
    getClimateSugarCorrelations,
    sugarProducingRegions,
  }
}
