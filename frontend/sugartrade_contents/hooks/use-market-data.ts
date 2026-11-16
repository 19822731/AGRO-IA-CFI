"use client"
import { useState, useEffect, useCallback } from "react"
import { marketService, type PrecioReferencia, type OrderBookResponse, type Orden } from "@/lib/services/market-service"

export function usePrecioActual(productoId: number) {
    const [precio, setPrecio] = useState<PrecioReferencia | null>(null)
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const fetchPrecio = useCallback(async () => {
        try {
            setCargando(true)
            const data = await marketService.getPrecioActual(productoId)
            setPrecio(data)
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err : new Error("Error al obtener precio"))
        } finally {
            setCargando(false)
        }
    }, [productoId])

    useEffect(() => {
        fetchPrecio()
        // Polling every 10 seconds
        const interval = setInterval(fetchPrecio, 10000)
        return () => clearInterval(interval)
    }, [fetchPrecio])

    return { precio, cargando, error, refetch: fetchPrecio }
}

export function useOrderBook(productoId: number) {
    const [orderBook, setOrderBook] = useState<OrderBookResponse | null>(null)
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const fetchOrderBook = useCallback(async () => {
        try {
            setCargando(true)
            const data = await marketService.getOrderBook(productoId)
            setOrderBook(data)
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err : new Error("Error al obtener libro de órdenes"))
        } finally {
            setCargando(false)
        }
    }, [productoId])

    useEffect(() => {
        fetchOrderBook()
        const interval = setInterval(fetchOrderBook, 5000)
        return () => clearInterval(interval)
    }, [fetchOrderBook])

    return { orderBook, cargando, error, refetch: fetchOrderBook }
}

export function useHistorialOrdenes() {
    const [ordenes, setOrdenes] = useState<Orden[]>([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const fetchOrdenes = useCallback(async () => {
        try {
            setCargando(true)
            const data = await marketService.getHistorialOrdenes()
            setOrdenes(data)
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err : new Error("Error al obtener historial"))
        } finally {
            setCargando(false)
        }
    }, [])

    useEffect(() => {
        fetchOrdenes()
    }, [fetchOrdenes])

    return { ordenes, cargando, error, refetch: fetchOrdenes }
}
