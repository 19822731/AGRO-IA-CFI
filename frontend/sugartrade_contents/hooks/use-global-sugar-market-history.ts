"use client"

import { useState, useEffect } from "react"

// Tipos para los datos históricos del mercado mundial
export interface GlobalSugarProduction {
  year: string
  total: number
  brazil: number
  india: number
  thailand: number
  eu: number
  usa: number
  china: number
  mexico: number
  pakistan?: number
  australia?: number
  others: number
}

export interface GlobalSugarConsumption {
  year: string
  total: number
  india: number
  eu: number
  china: number
  usa: number
  brazil: number
  indonesia: number
  others: number
}

export interface GlobalSugarExports {
  year: string
  total: number
  brazil: number
  thailand: number
  india: number
  australia: number
  eu: number
  others: number
}

export interface GlobalSugarImports {
  year: string
  total: number
  indonesia: number
  china: number
  usa: number
  bangladesh: number
  eu: number
  others: number
}

export interface GlobalSugarPrices {
  year: string
  rawSugarNY11: number // centavos/libra
  whiteSugarLondon5: number // $/tonelada
  usRawSugar: number // centavos/libra
  usRefinedSugar: number // centavos/libra
  euRefinedSugar: number // €/tonelada
}

export interface GlobalSugarMarketHistory {
  production: GlobalSugarProduction[]
  consumption: GlobalSugarConsumption[]
  exports: GlobalSugarExports[]
  imports: GlobalSugarImports[]
  prices: GlobalSugarPrices[]
  lastUpdate: string
}

// Datos históricos del mercado mundial del azúcar (2020-2024)
const historicalData: GlobalSugarMarketHistory = {
  production: [
    {
      year: "2020/21",
      total: 182.0,
      brazil: 39.5,
      india: 33.5,
      thailand: 13.5,
      eu: 16.3,
      usa: 7.7,
      china: 10.8,
      mexico: 6.3,
      others: 54.4,
    },
    {
      year: "2021/22",
      total: 174.5,
      brazil: 32.5,
      india: 35.0,
      thailand: 11.5,
      eu: 15.9,
      usa: 7.8,
      china: 10.6,
      mexico: 6.3,
      others: 54.9,
    },
    {
      year: "2022/23",
      total: 178.4,
      brazil: 36.0,
      india: 34.0,
      thailand: 11.3,
      eu: 15.3,
      usa: 7.8,
      china: 10.0,
      mexico: 6.0,
      australia: 4.4,
      others: 53.6,
    },
    {
      year: "2023/24",
      total: 185.4,
      brazil: 40.7,
      india: 37.0,
      thailand: 8.2,
      eu: 15.5,
      usa: 7.7,
      china: 10.2,
      mexico: 5.9,
      pakistan: 6.8,
      others: 53.4,
    },
    {
      year: "2024/25",
      total: 182.3,
      brazil: 38.7,
      india: 32.8,
      thailand: 10.5,
      eu: 14.6,
      usa: 7.6,
      china: 10.5,
      mexico: 5.8,
      pakistan: 6.8,
      others: 55.0,
    },
  ],
  consumption: [
    {
      year: "2020/21",
      total: 171.0,
      india: 28.5,
      eu: 18.2,
      china: 15.2,
      usa: 10.8,
      brazil: 10.5,
      indonesia: 7.4,
      others: 80.4,
    },
    {
      year: "2021/22",
      total: 172.4,
      india: 29.0,
      eu: 18.0,
      china: 15.5,
      usa: 10.9,
      brazil: 10.6,
      indonesia: 7.6,
      others: 80.8,
    },
    {
      year: "2022/23",
      total: 175.4,
      india: 29.5,
      eu: 17.8,
      china: 15.8,
      usa: 11.0,
      brazil: 10.7,
      indonesia: 7.8,
      others: 82.8,
    },
    {
      year: "2023/24",
      total: 177.4,
      india: 30.0,
      eu: 17.6,
      china: 16.0,
      usa: 11.1,
      brazil: 10.8,
      indonesia: 8.0,
      others: 83.9,
    },
    {
      year: "2024/25",
      total: 179.7,
      india: 30.5,
      eu: 17.5,
      china: 16.2,
      usa: 11.2,
      brazil: 10.9,
      indonesia: 8.2,
      others: 85.2,
    },
  ],
  exports: [
    {
      year: "2020/21",
      total: 61.4,
      brazil: 29.8,
      thailand: 6.5,
      india: 5.7,
      australia: 4.5,
      eu: 3.5,
      others: 11.4,
    },
    {
      year: "2021/22",
      total: 57.7,
      brazil: 23.0,
      thailand: 5.5,
      india: 6.0,
      australia: 4.4,
      eu: 3.3,
      others: 15.5,
    },
    {
      year: "2022/23",
      total: 61.8,
      brazil: 26.3,
      thailand: 10.8,
      india: 6.2,
      australia: 3.6,
      eu: 3.2,
      others: 11.7,
    },
    {
      year: "2023/24",
      total: 64.4,
      brazil: 29.8,
      thailand: 6.0,
      india: 7.5,
      australia: 4.3,
      eu: 3.0,
      others: 13.8,
    },
    {
      year: "2024/25",
      total: 62.8,
      brazil: 27.3,
      thailand: 8.0,
      india: 5.3,
      australia: 4.5,
      eu: 2.8,
      others: 14.9,
    },
  ],
  imports: [
    {
      year: "2020/21",
      total: 61.4,
      indonesia: 4.1,
      china: 3.4,
      usa: 3.0,
      bangladesh: 2.4,
      eu: 2.2,
      others: 46.3,
    },
    {
      year: "2021/22",
      total: 57.7,
      indonesia: 3.7,
      china: 5.7,
      usa: 3.3,
      bangladesh: 2.4,
      eu: 2.0,
      others: 40.6,
    },
    {
      year: "2022/23",
      total: 61.8,
      indonesia: 3.7,
      china: 5.3,
      usa: 3.4,
      bangladesh: 2.5,
      eu: 1.8,
      others: 45.1,
    },
    {
      year: "2023/24",
      total: 64.4,
      indonesia: 3.7,
      china: 5.5,
      usa: 3.3,
      bangladesh: 2.5,
      eu: 1.7,
      others: 47.7,
    },
    {
      year: "2024/25",
      total: 62.8,
      indonesia: 3.7,
      china: 5.6,
      usa: 3.3,
      bangladesh: 2.6,
      eu: 1.6,
      others: 46.0,
    },
  ],
  prices: [
    {
      year: "2020",
      rawSugarNY11: 19.25,
      whiteSugarLondon5: 487.86,
      usRawSugar: 30.4,
      usRefinedSugar: 68.4,
      euRefinedSugar: 375.0,
    },
    {
      year: "2021",
      rawSugarNY11: 27.17,
      whiteSugarLondon5: 679.89,
      usRawSugar: 34.7,
      usRefinedSugar: 80.4,
      euRefinedSugar: 430.0,
    },
    {
      year: "2022",
      rawSugarNY11: 26.51,
      whiteSugarLondon5: 675.79,
      usRawSugar: 36.5,
      usRefinedSugar: 85.2,
      euRefinedSugar: 480.0,
    },
    {
      year: "2023",
      rawSugarNY11: 26.37,
      whiteSugarLondon5: 501.89,
      usRawSugar: 38.2,
      usRefinedSugar: 87.5,
      euRefinedSugar: 520.0,
    },
    {
      year: "2024",
      rawSugarNY11: 29.99,
      whiteSugarLondon5: 557.0,
      usRawSugar: 39.5,
      usRefinedSugar: 89.8,
      euRefinedSugar: 557.0,
    },
  ],
  lastUpdate: "2025-03-15",
}

export function useGlobalSugarMarketHistory() {
  const [data, setData] = useState<GlobalSugarMarketHistory | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simulamos una carga de datos
    const fetchData = async () => {
      try {
        // En una implementación real, aquí se haría una llamada a la API
        // Por ahora, simplemente devolvemos los datos estáticos después de un pequeño retraso
        await new Promise((resolve) => setTimeout(resolve, 500))
        setData(historicalData)
        setLoading(false)
      } catch (err) {
        setError("Error al cargar los datos históricos del mercado mundial del azúcar")
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
}
