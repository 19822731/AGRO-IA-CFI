"use client"

import { useState, useCallback, useEffect } from "react"

interface UseAsyncReturn<T, E = Error> {
  data: T | null
  error: E | null
  isLoading: boolean
  execute: (...args: any[]) => Promise<T | null>
}

export function useAsync<T, E = Error>(
  asyncFunction: (...args: any[]) => Promise<T>,
  immediate = false,
): UseAsyncReturn<T, E> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<E | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await asyncFunction(...args)
        setData(response)
        setIsLoading(false)
        return response
      } catch (e) {
        setError(e as E)
        setIsLoading(false)
        return null
      }
    },
    [asyncFunction],
  )

  // Execute immediately if requested
  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])

  return { data, error, isLoading, execute }
}
