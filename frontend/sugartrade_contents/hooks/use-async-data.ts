"use client"

import { useState, useEffect, useCallback } from "react"

interface AsyncDataState<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

/**
 * Hook personalizado para manejar estados de carga, error y datos de manera consistente
 * @param fetchFn Función asíncrona que devuelve los datos
 * @param dependencies Dependencias para volver a ejecutar la función
 * @returns Estado con datos, loading, error y función para volver a cargar
 */
export function useAsyncData<T>(fetchFn: () => Promise<T>, dependencies: any[] = []): AsyncDataState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)
  const [retryCount, setRetryCount] = useState<number>(0)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetchFn()
      setData(result)
    } catch (err) {
      console.error("Error en useAsyncData:", err)
      const errorObject =
        err instanceof Error ? err : new Error(typeof err === "string" ? err : "Error desconocido al cargar datos")
      setError(errorObject)
    } finally {
      setLoading(false)
    }
  }, [fetchFn, ...dependencies])

  useEffect(() => {
    fetchData()
  }, [fetchData, retryCount])

  const refetch = useCallback(async () => {
    setRetryCount((prev) => prev + 1)
  }, [])

  return { data, loading, error, refetch }
}
