"use client"
import { useState, useEffect } from "react"
import {
  obtenerPreciosHistoricos,
  obtenerDatosProduccionPorPeriodo,
  obtenerDatosProduccionPorDepartamento,
  obtenerProgresoMensual,
  obtenerDatosGlobales,
  obtenerDatosCorrelacion,
  obtenerDatosEstacionales,
  obtenerDatosProyeccion,
  obtenerDatosVolatilidad,
  type PrecioHistorico,
  type DatoProduccion,
  type DatoCorrelacion,
  type DatoGlobal,
  type DatoEstacional,
  type DatoProyeccion,
} from "@/lib/data-service"

// Hook para precios históricos
export function usePreciosHistoricos() {
  const [datos, setDatos] = useState<PrecioHistorico[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setCargando(true)
        const data = await obtenerPreciosHistoricos()
        setDatos(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Error desconocido"))
      } finally {
        setCargando(false)
      }
    }

    fetchData()
  }, [])

  return { datos, cargando, error }
}

// Hook para datos de producción por período
export function useDatosProduccionPorPeriodo() {
  const [datos, setDatos] = useState<DatoProduccion[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setCargando(true)
        const data = await obtenerDatosProduccionPorPeriodo()
        setDatos(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Error desconocido"))
      } finally {
        setCargando(false)
      }
    }

    fetchData()
  }, [])

  return { datos, cargando, error }
}

// Hook para datos de producción por departamento
export function useDatosProduccionPorDepartamento() {
  const [datos, setDatos] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setCargando(true)
        const data = await obtenerDatosProduccionPorDepartamento()
        setDatos(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Error desconocido"))
      } finally {
        setCargando(false)
      }
    }

    fetchData()
  }, [])

  return { datos, cargando, error }
}

// Hook para datos de progreso mensual
export function useProgresoMensual() {
  const [datos, setDatos] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setCargando(true)
        const data = await obtenerProgresoMensual()
        setDatos(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Error desconocido"))
      } finally {
        setCargando(false)
      }
    }

    fetchData()
  }, [])

  return { datos, cargando, error }
}

// Hook para datos globales
export function useDatosGlobales(tipo: "produccion" | "consumo" | "exportacion" | "importacion") {
  const [datos, setDatos] = useState<DatoGlobal[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setCargando(true)
        const data = await obtenerDatosGlobales(tipo)
        setDatos(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Error desconocido"))
      } finally {
        setCargando(false)
      }
    }

    fetchData()
  }, [tipo])

  return { datos, cargando, error }
}

// Hook para datos de correlación
export function useDatosCorrelacion(tipo: "produccion" | "clima" | "petroleo") {
  const [datos, setDatos] = useState<DatoCorrelacion[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setCargando(true)
        const data = await obtenerDatosCorrelacion(tipo)
        setDatos(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Error desconocido"))
      } finally {
        setCargando(false)
      }
    }

    fetchData()
  }, [tipo])

  return { datos, cargando, error }
}

// Hook para datos estacionales
export function useDatosEstacionales() {
  const [datos, setDatos] = useState<DatoEstacional[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setCargando(true)
        const data = await obtenerDatosEstacionales()
        setDatos(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Error desconocido"))
      } finally {
        setCargando(false)
      }
    }

    fetchData()
  }, [])

  return { datos, cargando, error }
}

// Hook para datos de proyección
export function useDatosProyeccion() {
  const [datos, setDatos] = useState<DatoProyeccion[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setCargando(true)
        const data = await obtenerDatosProyeccion()
        setDatos(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Error desconocido"))
      } finally {
        setCargando(false)
      }
    }

    fetchData()
  }, [])

  return { datos, cargando, error }
}

// Hook para datos de volatilidad
export function useDatosVolatilidad() {
  const [datos, setDatos] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setCargando(true)
        const data = await obtenerDatosVolatilidad()
        setDatos(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Error desconocido"))
      } finally {
        setCargando(false)
      }
    }

    fetchData()
  }, [])

  return { datos, cargando, error }
}

// Hook para filtrar datos históricos por período
export function useDatosHistoricosFiltrados(periodo: "1año" | "2años" | "3años" | "5años") {
  const { datos, cargando, error } = usePreciosHistoricos()
  const [datosFiltrados, setDatosFiltrados] = useState<PrecioHistorico[]>([])

  useEffect(() => {
    if (!cargando && datos.length > 0) {
      let cantidadMeses = 60 // 5 años por defecto

      switch (periodo) {
        case "1año":
          cantidadMeses = 12
          break
        case "2años":
          cantidadMeses = 24
          break
        case "3años":
          cantidadMeses = 36
          break
      }

      setDatosFiltrados(datos.slice(-cantidadMeses))
    }
  }, [datos, cargando, periodo])

  return { datos: datosFiltrados, cargando, error }
}
