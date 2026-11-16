"use client"

import { useCallback } from "react"
import { useAsyncData } from "./use-async-data"

// Tipos para los datos del modelo de análisis
export interface PuntoPrediccion {
  fecha: string
  precio: number
  prediccion: number
  intervalo: [number, number]
  confianza: number
}

export interface PatronCajaPunta {
  tipo: "alcista" | "bajista" | "continuacion" | "reversa"
  inicio: string
  fin: string
  puntos: number[]
  confiabilidad: number
  expectativa: string
  objetivoPrecio: number
}

export interface TendenciaIdentificada {
  tipo: "primaria" | "secundaria" | "terciaria"
  direccion: "alcista" | "bajista" | "lateral"
  fortaleza: number
  inicio: string
  fin: string | null
  angulo: number
  soportes: number[]
  resistencias: number[]
}

export interface IndicadorTecnico {
  nombre: string
  valor: number
  interpretacion: string
  señal: "compra" | "venta" | "neutral"
  fuerza: number
}

export interface FactorFundamental {
  nombre: string
  valor: number
  impacto: number
  descripcion: string
}

export interface Recomendacion {
  accion: "comprar" | "vender" | "mantener"
  horizonte: "corto" | "medio" | "largo"
  confianza: number
  objetivoPrecio: number
  stopLoss: number
  razonamiento: string[]
  riesgos: string[]
}

// Agregar las nuevas interfaces después de las interfaces existentes

export interface EstadisticaHistorica {
  periodo: string
  media: number
  mediana: number
  desviacionEstandar: number
  varianza: number
  maximo: number
  minimo: number
  rango: number
  skewness: number
  kurtosis: number
  percentil25: number
  percentil75: number
}

export interface AnalisisEstacional {
  periodo: string
  tendenciaEstacional: number
  confianza: number
  descripcion: string
}

export interface PatronEmergente {
  nombre: string
  descripcion: string
  fechaDeteccion: string
  confianza: number
  impactoEstimado: number
  duracionEstimada: string
  frecuenciaHistorica: number
  ultimaOcurrencia: string | null
}

export interface Anomalia {
  tipo: "precio" | "volumen" | "volatilidad" | "correlacion" | "liquidez"
  fechaInicio: string
  fechaFin: string | null
  descripcion: string
  magnitud: number
  causaProbable: string[]
  impactoMercado: number
  duracionEstimada: string | null
  estado: "activa" | "finalizada" | "en desarrollo"
}

export interface PatronCajaPuntaDetallado extends PatronCajaPunta {
  subPatrones: {
    nombre: string
    posicion: "inicio" | "medio" | "fin"
    significado: string
  }[]
  volumenConfirmacion: boolean
  divergencias: {
    tipo: string
    descripcion: string
    significado: string
  }[]
  nivelFibonacci: number[]
  zonasSoporte: number[]
  zonasResistencia: number[]
  probabilidadExito: number
}

export interface AnalisisHistorico {
  periodos: {
    diario: EstadisticaHistorica
    semanal: EstadisticaHistorica
    mensual: EstadisticaHistorica
    trimestral: EstadisticaHistorica
    anual: EstadisticaHistorica
  }
  estacionalidad: AnalisisEstacional[]
  ciclicidad: {
    ciclosIdentificados: {
      duracion: string
      descripcion: string
      confianza: number
    }[]
    faseCicloActual: string
    proximaFase: string
    tiempoEstimadoProximaFase: string
  }
  correlaciones: {
    mercados: {
      mercado: string
      correlacion: number
      descripcion: string
    }[]
    commodities: {
      commodity: string
      correlacion: number
      descripcion: string
    }[]
    factoresEconomicos: {
      factor: string
      correlacion: number
      descripcion: string
    }[]
  }
}

// Modificar la interfaz ModeloAnalisis para incluir los nuevos campos
export interface ModeloAnalisis {
  fechaAnalisis: string
  mercado: string
  precioActual: number
  predicciones: PuntoPrediccion[]
  patronesCajaPunta: PatronCajaPunta[]
  tendencias: TendenciaIdentificada[]
  indicadoresTecnicos: IndicadorTecnico[]
  factoresFundamentales: FactorFundamental[]
  recomendaciones: {
    cortoPlazo: Recomendacion
    medioPlazo: Recomendacion
    largoPlazo: Recomendacion
  }
  confianzaGeneral: number
  // Nuevos campos
  analisisHistorico: AnalisisHistorico
  patronesEmergentes: PatronEmergente[]
  anomalias: Anomalia[]
  patronesCajaPuntaDetallados: PatronCajaPuntaDetallado[]
}

// Implementación de caché simple
interface CacheItem {
  data: ModeloAnalisis
  timestamp: number
}

const cache = new Map<string, CacheItem>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos en milisegundos

export function useModeloAnalisis(mercado: string) {
  // Función para obtener los datos del análisis
  const fetchAnalisis = useCallback(async () => {
    // Verificar caché
    const cacheKey = `analisis_${mercado}`
    const cachedItem = cache.get(cacheKey)
    const now = Date.now()

    if (cachedItem && now - cachedItem.timestamp < CACHE_DURATION) {
      return cachedItem.data
    }

    const response = await fetch(`/api/prediccion-analisis?mercado=${mercado}`)

    if (!response.ok) {
      throw new Error(`Error al obtener análisis: ${response.status}`)
    }

    const data = await response.json()

    // Validar datos críticos
    if (!data || !data.predicciones || !Array.isArray(data.predicciones)) {
      throw new Error("Datos de análisis inválidos o incompletos")
    }

    // Guardar en caché
    cache.set(cacheKey, {
      data,
      timestamp: now,
    })

    return data
  }, [mercado])

  // Usar nuestro hook personalizado
  const { data: analisis, loading, error, refetch } = useAsyncData(fetchAnalisis, [mercado])

  return { analisis, loading, error, refetch }
}
