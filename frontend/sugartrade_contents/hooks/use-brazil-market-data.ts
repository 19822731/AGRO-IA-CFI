"use client"

import { useState, useEffect } from "react"

// Tipos para los datos del mercado brasileño
export interface AreaPlantedHarvested {
  year: string
  northRegion: number
  northeastRegion: number
  midwestRegion: number
  southeastRegion: number
  southRegion: number
  northNortheastRegion: number
  midSouthRegion: number
  brazilTotal: number
  variationPercentage?: number
}

export interface Productivity {
  year: string
  northRegion: number
  northeastRegion: number
  midwestRegion: number
  southeastRegion: number
  southRegion: number
  northNortheastRegion: number
  midSouthRegion: number
  brazilTotal: number
  variationPercentage?: number
}

export interface Production {
  year: string
  northRegion: number
  northeastRegion: number
  midwestRegion: number
  southeastRegion: number
  southRegion: number
  northNortheastRegion: number
  midSouthRegion: number
  brazilTotal: number
  variationPercentage?: number
}

export interface SugarProduction {
  year: string
  northRegion: number
  northeastRegion: number
  midwestRegion: number
  southeastRegion: number
  southRegion: number
  northNortheastRegion: number
  midSouthRegion: number
  brazilTotal: number
  variationPercentage?: number
  absoluteVariation?: number
}

export interface ATRProduction {
  year: string
  northRegion: number
  northeastRegion: number
  midwestRegion: number
  southeastRegion: number
  southRegion: number
  northNortheastRegion: number
  midSouthRegion: number
  brazilTotal: number
  variationPercentage?: number
}

export interface BrazilMarketData {
  areaPlantedHarvested: AreaPlantedHarvested[]
  productivity: Productivity[]
  production: Production[]
  sugarProduction: SugarProduction[]
  atrProduction: ATRProduction[]
  lastUpdate: string
}

// Datos estáticos para el mercado brasileño
const staticData: BrazilMarketData = {
  areaPlantedHarvested: [
    {
      year: "2023/24",
      northRegion: 76.458,
      northeastRegion: 883.0,
      midwestRegion: 1778.8,
      southeastRegion: 5098.8,
      southRegion: 524.4,
      northNortheastRegion: 931.9,
      midSouthRegion: 7402.0,
      brazilTotal: 8333.9,
    },
    {
      year: "2024/25",
      northRegion: 80.608,
      northeastRegion: 887.0,
      midwestRegion: 1815.7,
      southeastRegion: 5398.3,
      southRegion: 522.6,
      northNortheastRegion: 936.5,
      midSouthRegion: 7736.6,
      brazilTotal: 8673.1,
      variationPercentage: 4.1,
    },
  ],
  productivity: [
    {
      year: "2023/24",
      northRegion: 48900,
      northeastRegion: 63959,
      midwestRegion: 81537,
      southeastRegion: 91987,
      southRegion: 73860,
      northNortheastRegion: 64833,
      midSouthRegion: 88192,
      brazilTotal: 85580,
    },
    {
      year: "2024/25",
      northRegion: 49500,
      northeastRegion: 71402,
      midwestRegion: 87676,
      southeastRegion: 82858,
      southRegion: 70805,
      northNortheastRegion: 64532,
      midSouthRegion: 80840,
      brazilTotal: 82014,
      variationPercentage: -4.1,
    },
  ],
  production: [
    {
      year: "2023/24",
      northRegion: 3943.0,
      northeastRegion: 56477.8,
      midwestRegion: 145035.7,
      southeastRegion: 469026.8,
      southRegion: 38730.9,
      northNortheastRegion: 60420.8,
      midSouthRegion: 652793.3,
      brazilTotal: 713214.1,
    },
    {
      year: "2024/25",
      northRegion: 3781.5,
      northeastRegion: 56650.3,
      midwestRegion: 145686.1,
      southeastRegion: 442738.8,
      southRegion: 37000.1,
      northNortheastRegion: 60431.9,
      midSouthRegion: 625425.0,
      brazilTotal: 685856.8,
      variationPercentage: -3.8,
    },
  ],
  sugarProduction: [
    {
      year: "2022/23",
      northRegion: 3823.0,
      northeastRegion: 56866.5,
      midwestRegion: 131406.8,
      southeastRegion: 387755.3,
      southRegion: 30953.1,
      northNortheastRegion: 60689.5,
      midSouthRegion: 550115.3,
      brazilTotal: 38775.3,
    },
    {
      year: "2023/24",
      northRegion: 99.3,
      northeastRegion: 3293.1,
      midwestRegion: 5468.0,
      southeastRegion: 33927.7,
      southRegion: 2890.6,
      northNortheastRegion: 3392.4,
      midSouthRegion: 42286.3,
      brazilTotal: 45678.7,
      variationPercentage: 12.2,
    },
    {
      year: "2024/25",
      northRegion: 94.6,
      northeastRegion: 3521.1,
      midwestRegion: 5682.6,
      southeastRegion: 34031.6,
      southRegion: 2962.3,
      northNortheastRegion: 3615.7,
      midSouthRegion: 42676.4,
      brazilTotal: 46292.2,
      variationPercentage: 1.3,
      absoluteVariation: 613.5,
    },
  ],
  atrProduction: [
    {
      year: "2022/23",
      northRegion: 129.3,
      northeastRegion: 127.4,
      midwestRegion: 134.2,
      southeastRegion: 133.9,
      southRegion: 124.7,
      northNortheastRegion: 127.9,
      midSouthRegion: 133.6,
      brazilTotal: 133.0,
    },
    {
      year: "2023/24",
      northRegion: 127.6,
      northeastRegion: 126.9,
      midwestRegion: 135.8,
      southeastRegion: 135.6,
      southRegion: 128.9,
      northNortheastRegion: 127.0,
      midSouthRegion: 135.3,
      brazilTotal: 134.6,
      variationPercentage: 1.0,
    },
    {
      year: "2024/25",
      northRegion: 128.6,
      northeastRegion: 128.1,
      midwestRegion: 136.4,
      southeastRegion: 137.3,
      southRegion: 132.1,
      northNortheastRegion: 128.1,
      midSouthRegion: 136.7,
      brazilTotal: 136.0,
      variationPercentage: 1.1,
    },
  ],
  lastUpdate: "2024-04-30",
}

export function useBrazilMarketData() {
  const [data, setData] = useState<BrazilMarketData | null>(null)
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
        setError("Error al cargar los datos del mercado brasileño")
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
}
