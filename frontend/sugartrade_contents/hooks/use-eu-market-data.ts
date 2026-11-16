"use client"

import { useState, useEffect } from "react"

// Tipos para los datos del mercado europeo
export interface EUWhiteSugarPrice {
  date: string
  price: number
  change: number
  changePercent: number
}

export interface WorldMarketPrice {
  date: string
  whitePrice: number
  whiteChangePercent: number
  rawPrice: number
  rawChangePercent: number
}

export interface EUImport {
  period: string
  volume: number
  cumulative: number
}

export interface ImportOrigin {
  country: string
  volume: number
  percentage: number
}

export interface TariffQuota {
  country: string
  available: number
  allocated: number
  percentAllocated: number
}

export interface EUMarketData {
  whiteSugarPrices: EUWhiteSugarPrice[]
  worldMarketPrices: WorldMarketPrice[]
  imports: EUImport[]
  importOrigins: ImportOrigin[]
  tariffQuotas: TariffQuota[]
  lastUpdate: string
}

// Datos estáticos para el mercado europeo
const staticData: EUMarketData = {
  whiteSugarPrices: [
    { date: "2024-12-01", price: 535, change: 10, changePercent: 1.9 },
    { date: "2025-01-01", price: 557, change: 22, changePercent: 4.0 },
  ],
  worldMarketPrices: [
    {
      date: "2025-01-01",
      whitePrice: 560.2,
      whiteChangePercent: 14.0,
      rawPrice: 21.31,
      rawChangePercent: 12.0,
    },
  ],
  imports: [
    { period: "2022/2023", volume: 1200000, cumulative: 1200000 },
    { period: "2023/2024", volume: 1300000, cumulative: 1300000 },
    { period: "2024/2025", volume: 800000, cumulative: 800000 },
  ],
  importOrigins: [
    { country: "Brasil", volume: 350000, percentage: 26.9 },
    { country: "Ucrania", volume: 250000, percentage: 19.2 },
    { country: "Reino Unido", volume: 180000, percentage: 13.8 },
    { country: "Colombia", volume: 120000, percentage: 9.2 },
    { country: "Otros", volume: 400000, percentage: 30.9 },
  ],
  tariffQuotas: [
    { country: "Ucrania", available: 40000, allocated: 38000, percentAllocated: 95 },
    { country: "América Central", available: 150000, allocated: 142500, percentAllocated: 95 },
    { country: "Colombia", available: 62000, allocated: 58900, percentAllocated: 95 },
    { country: "Perú", available: 43500, allocated: 41325, percentAllocated: 95 },
    { country: "Sudáfrica", available: 150000, allocated: 142500, percentAllocated: 95 },
    { country: "Vietnam", available: 20000, allocated: 19000, percentAllocated: 95 },
    { country: "Ecuador", available: 15000, allocated: 14250, percentAllocated: 95 },
    { country: "Moldavia", available: 34000, allocated: 32300, percentAllocated: 95 },
  ],
  lastUpdate: "2025-02-18",
}

// Datos históricos para entrenamiento de ML
export const historicalPrices = [
  { date: "2013-01-01", euPrice: 380, worldWhitePrice: 410, worldRawPrice: 18.5 },
  { date: "2013-07-01", euPrice: 375, worldWhitePrice: 405, worldRawPrice: 18.2 },
  { date: "2014-01-01", euPrice: 370, worldWhitePrice: 400, worldRawPrice: 17.9 },
  { date: "2014-07-01", euPrice: 365, worldWhitePrice: 395, worldRawPrice: 17.6 },
  { date: "2015-01-01", euPrice: 360, worldWhitePrice: 390, worldRawPrice: 17.3 },
  { date: "2015-07-01", euPrice: 355, worldWhitePrice: 385, worldRawPrice: 17.0 },
  { date: "2016-01-01", euPrice: 350, worldWhitePrice: 380, worldRawPrice: 16.7 },
  { date: "2016-07-01", euPrice: 345, worldWhitePrice: 375, worldRawPrice: 16.4 },
  { date: "2017-01-01", euPrice: 420, worldWhitePrice: 450, worldRawPrice: 19.5 },
  { date: "2017-07-01", euPrice: 410, worldWhitePrice: 440, worldRawPrice: 19.0 },
  { date: "2018-01-01", euPrice: 400, worldWhitePrice: 430, worldRawPrice: 18.5 },
  { date: "2018-07-01", euPrice: 390, worldWhitePrice: 420, worldRawPrice: 18.0 },
  { date: "2019-01-01", euPrice: 380, worldWhitePrice: 410, worldRawPrice: 17.5 },
  { date: "2019-07-01", euPrice: 370, worldWhitePrice: 400, worldRawPrice: 17.0 },
  { date: "2020-01-01", euPrice: 360, worldWhitePrice: 390, worldRawPrice: 16.5 },
  { date: "2020-07-01", euPrice: 380, worldWhitePrice: 410, worldRawPrice: 17.5 },
  { date: "2021-01-01", euPrice: 400, worldWhitePrice: 430, worldRawPrice: 18.5 },
  { date: "2021-07-01", euPrice: 420, worldWhitePrice: 450, worldRawPrice: 19.5 },
  { date: "2022-01-01", euPrice: 440, worldWhitePrice: 470, worldRawPrice: 20.5 },
  { date: "2022-07-01", euPrice: 460, worldWhitePrice: 490, worldRawPrice: 21.5 },
  { date: "2023-01-01", euPrice: 480, worldWhitePrice: 510, worldRawPrice: 22.5 },
  { date: "2023-07-01", euPrice: 500, worldWhitePrice: 530, worldRawPrice: 23.5 },
  { date: "2024-01-01", euPrice: 520, worldWhitePrice: 550, worldRawPrice: 24.5 },
  { date: "2024-07-01", euPrice: 540, worldWhitePrice: 570, worldRawPrice: 25.5 },
  { date: "2025-01-01", euPrice: 557, worldWhitePrice: 560.2, worldRawPrice: 21.31 },
]

export function useEUMarketData() {
  const [data, setData] = useState<EUMarketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simulamos una carga de datos
    const fetchData = async () => {
      try {
        // En una implementación real, aquí se haría una llamada a la API
        // Por ahora, simplemente devolvemos los datos estáticos después de un pequeño retraso
        await new Promise((resolve) => setTimeout(resolve, 500))
        setData(staticData)
        setLoading(false)
      } catch (err) {
        setError("Error al cargar los datos del mercado europeo")
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
}
