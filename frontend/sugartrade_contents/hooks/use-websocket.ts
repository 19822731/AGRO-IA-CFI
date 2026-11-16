import { useEffect, useRef, useState, useCallback } from 'react'

interface WebSocketMessage {
    type: string
    product_id?: number
    bids?: { precio: number, cantidad: number }[]
    asks?: { precio: number, cantidad: number }[]
    [key: string]: any
}

interface UseWebSocketOptions {
    url: string
    onMessage?: (message: WebSocketMessage) => void
    shouldConnect?: boolean
}

export function useWebSocket({ url, onMessage, shouldConnect = true }: UseWebSocketOptions) {
    const [isConnected, setIsConnected] = useState(false)
    const wsRef = useRef<WebSocket | null>(null)
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

    // Use a ref for onMessage to avoid re-connecting when the handler changes
    const onMessageRef = useRef(onMessage)

    // Use refs to access latest values in connect without re-triggering it
    const urlRef = useRef(url)
    const shouldConnectRef = useRef(shouldConnect)

    useEffect(() => {
        urlRef.current = url
        shouldConnectRef.current = shouldConnect
    }, [url, shouldConnect])

    const connect = useCallback(() => {
        const currentUrl = urlRef.current
        const currentShouldConnect = shouldConnectRef.current

        if (!currentShouldConnect || !currentUrl) return

        // Close existing connection if any
        if (wsRef.current) {
            wsRef.current.close()
        }

        try {
            const ws = new WebSocket(currentUrl)
            wsRef.current = ws

            ws.onopen = () => {
                setIsConnected(true)
            }

            ws.onclose = () => {
                setIsConnected(false)
                // Attempt reconnect after 3 seconds
                reconnectTimeoutRef.current = setTimeout(() => {
                    connect()
                }, 3000)
            }

            ws.onerror = (error) => {
                console.error("WebSocket Error:", error)
                ws.close()
            }

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data)
                    if (onMessageRef.current) {
                        onMessageRef.current(data)
                    }
                } catch (e) {
                    console.error("Error parsing WebSocket message:", e)
                }
            }

        } catch (error) {
            console.error("WebSocket connection failed:", error)
        }
    }, []) // Empty dependency array - connect is stable

    useEffect(() => {
        if (shouldConnectRef.current) {
            connect()
        }
        return () => {
            if (wsRef.current) {
                wsRef.current.close()
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current)
            }
        }
    }, []) // Run only once on mount

    return { isConnected }
}
