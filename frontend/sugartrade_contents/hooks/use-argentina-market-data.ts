"use client"

import { useState, useEffect } from "react"

// Tipos para los datos del mercado argentino
export interface ProduccionAzucar {
  year: number
  produccion: number
  variacionAnual?: number
  variacion2010?: number
}

export interface ExportacionAzucar {
  year: number
  exportacion: number
  organico: number
  variacionAnual?: number
}

export interface ProduccionBioetanol {
  year: number
  produccion: number
  entregas: number
  variacionAnual?: number
  variacion2017?: number
}

export interface ParticipacionMercado {
  year: number
  azucarCana: number
  edulcorantesArtificiales: number
  edulcorantesMaiz: number
  variacionAcumulada?: number
}

export interface ExcesoOferta {
  year: number
  exceso: number
  impactoPrecios?: string
}

export interface PreciosComparativos {
  month: string
  domestico: number
  internacional: number
  diferencial?: number
}

export interface SuperficieCana {
  year: number
  superficie: number
  variacionAnual?: number
}

export interface RankingExportadores {
  year: number
  ranking: number
  variacion?: number
}

export interface MercadoArgentinoData {
  produccionAzucar: ProduccionAzucar[]
  exportacionAzucar: ExportacionAzucar[]
  produccionBioetanol: ProduccionBioetanol[]
  participacionMercado: ParticipacionMercado[]
  excesoOferta: ExcesoOferta[]
  preciosComparativos: PreciosComparativos[]
  superficieCana: SuperficieCana[]
  rankingExportadores: RankingExportadores[]
  ultimaActualizacion: string
}

// Datos estáticos para el mercado argentino
const staticData: MercadoArgentinoData = {
  produccionAzucar: [
    { year: 2010, produccion: 100 }, // Base 100 para 2010
    { year: 2011, produccion: 95.2, variacionAnual: -4.8 },
    { year: 2012, produccion: 93.7, variacionAnual: -1.6, variacion2010: -6.3 },
    { year: 2013, produccion: 91.5, variacionAnual: -2.3, variacion2010: -8.5 },
    { year: 2014, produccion: 89.8, variacionAnual: -1.9, variacion2010: -10.2 },
    { year: 2015, produccion: 88.3, variacionAnual: -1.7, variacion2010: -11.7 },
    { year: 2016, produccion: 86.9, variacionAnual: -1.6, variacion2010: -13.1 },
    { year: 2017, produccion: 85.4, variacionAnual: -1.7, variacion2010: -14.6 },
    { year: 2018, produccion: 84.1, variacionAnual: -1.5, variacion2010: -15.9 },
    { year: 2019, produccion: 82.7, variacionAnual: -1.7, variacion2010: -17.3 },
    { year: 2020, produccion: 81.2, variacionAnual: -1.8, variacion2010: -18.8 },
    { year: 2021, produccion: 79.8, variacionAnual: -1.7, variacion2010: -20.2 },
    { year: 2022, produccion: 78.6, variacionAnual: -1.5, variacion2010: -21.4 },
    { year: 2023, produccion: 83.79, variacionAnual: 6.22, variacion2010: -16.21 }, // 6.22% más que 2022, pero -16.21% vs 2010
  ],
  exportacionAzucar: [
    { year: 2017, exportacion: 100, organico: 100 }, // Base 100 para 2017
    { year: 2018, exportacion: 95, organico: 105, variacionAnual: -5 },
    { year: 2019, exportacion: 90, organico: 110, variacionAnual: -5.3 },
    { year: 2020, exportacion: 85, organico: 115, variacionAnual: -5.6 },
    { year: 2021, exportacion: 80, organico: 120, variacionAnual: -5.9 },
    { year: 2022, exportacion: 70, organico: 90, variacionAnual: -12.5 },
    { year: 2023, exportacion: 30, organico: 20, variacionAnual: -57.19 }, // -57.19% vs 2022, orgánico al 20% de años anteriores
  ],
  produccionBioetanol: [
    { year: 2017, produccion: 100, entregas: 100 }, // Base 100 para 2017
    { year: 2018, produccion: 95, entregas: 95, variacionAnual: -5, variacion2017: -5 },
    { year: 2019, produccion: 90, entregas: 90, variacionAnual: -5.3, variacion2017: -10 },
    { year: 2020, produccion: 85, entregas: 85, variacionAnual: -5.6, variacion2017: -15 },
    { year: 2021, produccion: 80, entregas: 80, variacionAnual: -5.9, variacion2017: -20 },
    { year: 2022, produccion: 75, entregas: 75, variacionAnual: -6.3, variacion2017: -25 },
    { year: 2023, produccion: 60.92, entregas: 68.87, variacionAnual: -19.08, variacion2017: -31.13 }, // -19.08% producción, -31.13% entregas vs 2017
  ],
  participacionMercado: [
    { year: 2011, azucarCana: 100, edulcorantesArtificiales: 0, edulcorantesMaiz: 0 }, // Base 100 para 2011
    { year: 2012, azucarCana: 98, edulcorantesArtificiales: 1, edulcorantesMaiz: 1, variacionAcumulada: -2 },
    { year: 2013, azucarCana: 96, edulcorantesArtificiales: 2, edulcorantesMaiz: 2, variacionAcumulada: -4 },
    { year: 2014, azucarCana: 94, edulcorantesArtificiales: 3, edulcorantesMaiz: 3, variacionAcumulada: -6 },
    { year: 2015, azucarCana: 92, edulcorantesArtificiales: 4, edulcorantesMaiz: 4, variacionAcumulada: -8 },
    { year: 2016, azucarCana: 90, edulcorantesArtificiales: 5, edulcorantesMaiz: 5, variacionAcumulada: -10 },
    { year: 2017, azucarCana: 88, edulcorantesArtificiales: 6, edulcorantesMaiz: 6, variacionAcumulada: -12 },
    { year: 2018, azucarCana: 86, edulcorantesArtificiales: 7, edulcorantesMaiz: 7, variacionAcumulada: -14 },
    { year: 2019, azucarCana: 84, edulcorantesArtificiales: 8, edulcorantesMaiz: 8, variacionAcumulada: -16 },
    { year: 2020, azucarCana: 82, edulcorantesArtificiales: 9, edulcorantesMaiz: 9, variacionAcumulada: -18 },
    { year: 2021, azucarCana: 80, edulcorantesArtificiales: 10, edulcorantesMaiz: 10, variacionAcumulada: -20 },
    { year: 2022, azucarCana: 78, edulcorantesArtificiales: 11, edulcorantesMaiz: 11, variacionAcumulada: -22 },
    { year: 2023, azucarCana: 75, edulcorantesArtificiales: 12.5, edulcorantesMaiz: 12.5, variacionAcumulada: -25 }, // -25% vs 2011
  ],
  excesoOferta: [
    { year: 2020, exceso: 50, impactoPrecios: "Bajo" },
    { year: 2021, exceso: 100, impactoPrecios: "Moderado" },
    { year: 2022, exceso: 150, impactoPrecios: "Alto" },
    { year: 2023, exceso: 275, impactoPrecios: "Severo" }, // 250-300 mil toneladas
  ],
  preciosComparativos: [
    { month: "Ene", domestico: 85, internacional: 100, diferencial: -15 },
    { month: "Feb", domestico: 86, internacional: 102, diferencial: -16 },
    { month: "Mar", domestico: 87, internacional: 104, diferencial: -17 },
    { month: "Abr", domestico: 88, internacional: 106, diferencial: -18 },
    { month: "May", domestico: 90, internacional: 108, diferencial: -18 },
    { month: "Jun", domestico: 92, internacional: 110, diferencial: -18 },
    { month: "Jul", domestico: 94, internacional: 112, diferencial: -18 },
    { month: "Ago", domestico: 96, internacional: 114, diferencial: -18 },
    { month: "Sep", domestico: 96, internacional: 116, diferencial: -20 },
    { month: "Oct", domestico: 96, internacional: 118, diferencial: -22 },
    { month: "Nov", domestico: 96, internacional: 120, diferencial: -24 },
    { month: "Dic", domestico: 96, internacional: 122, diferencial: -26 },
  ],
  superficieCana: [
    { year: 2018, superficie: 100, variacionAnual: 0 }, // Base 100
    { year: 2019, superficie: 102, variacionAnual: 2 },
    { year: 2020, superficie: 105, variacionAnual: 2.9 },
    { year: 2021, superficie: 108, variacionAnual: 2.9 },
    { year: 2022, superficie: 112, variacionAnual: 3.7 },
    { year: 2023, superficie: 125, variacionAnual: 11.6 }, // Aumento de 20-30 mil hectáreas
  ],
  rankingExportadores: [
    { year: 2017, ranking: 4, variacion: 0 },
    { year: 2018, ranking: 4, variacion: 0 },
    { year: 2019, ranking: 4, variacion: 0 },
    { year: 2020, ranking: 4, variacion: 0 },
    { year: 2021, ranking: 4, variacion: 0 },
    { year: 2022, ranking: 8, variacion: -4 },
    { year: 2023, ranking: 12, variacion: -4 },
  ],
  ultimaActualizacion: "2023-12-31",
}

export function useArgentinaMarketData() {
  const [data, setData] = useState<MercadoArgentinoData | null>(null)
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
        setError("Error al cargar los datos del mercado argentino")
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
}
