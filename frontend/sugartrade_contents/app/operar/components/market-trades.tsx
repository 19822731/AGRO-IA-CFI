"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useWebSocket } from "@/hooks/use-websocket"
import { motion, AnimatePresence } from "framer-motion"
import { Activity } from "lucide-react"

interface Trade {
    id: string
    price: number
    amount: number
    timestamp: string
    type: "buy" | "sell"
    isNew?: boolean // Flag para animación
}

export default function MarketTrades() {
    const [trades, setTrades] = useState<Trade[]>([])
    const [lastPrice, setLastPrice] = useState<number>(0)
    const [debugMsg, setDebugMsg] = useState<string>("")
    const processedTradeIds = useRef<Set<string>>(new Set())

    const { isConnected } = useWebSocket({
        url: `${process.env.NEXT_PUBLIC_WS_URL}/ws/market/2`,
        onMessage: (data: any) => {
            if (data.type === "ORDER_BOOK_UPDATE" && data.last_trade) {
                const newTradeData = data.last_trade

                // Deduplicación estricta
                if (processedTradeIds.current.has(newTradeData.id)) {
                    return
                }

                // Agregar al set de procesados (limitar tamaño para evitar fugas de memoria)
                processedTradeIds.current.add(newTradeData.id)
                if (processedTradeIds.current.size > 1000) {
                    const iterator = processedTradeIds.current.values();
                    const firstVal = iterator.next().value;
                    if (firstVal) processedTradeIds.current.delete(firstVal);
                }

                const price = Number(newTradeData.price) / 20
                const amount = Number(newTradeData.amount)

                // Determinar tipo basado en precio o info del backend si estuviera
                const type = price >= lastPrice ? "buy" : "sell"

                const trade: Trade = {
                    id: newTradeData.id,
                    price: price,
                    amount: amount,
                    timestamp: new Date(newTradeData.timestamp).toLocaleTimeString(),
                    type: type,
                    isNew: true // Marcar como nuevo para animación
                }

                setLastPrice(price)
                setTrades(prev => [trade, ...prev].slice(0, 20))
            }
        }
    })

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/mercado/productos/2/historial?limit=20`
                setDebugMsg(`Fetching: ${url}`)

                const response = await fetch(url)
                if (response.ok) {
                    const data = await response.json()
                    setDebugMsg(`Data received: ${data.length} items`)

                    if (data.length === 0) return

                    const sortedData = [...data].reverse()

                    const formattedTrades: Trade[] = sortedData.map((tx: any, i: number) => {
                        const currentPrice = Number(tx.precio) / 20
                        const prevPrice = sortedData[i + 1] ? Number(sortedData[i + 1].precio) / 20 : currentPrice

                        // Agregar IDs históricos al set para evitar duplicados si llegan por WS justo después
                        processedTradeIds.current.add(tx.id)

                        return {
                            id: tx.id,
                            price: currentPrice,
                            amount: Number(tx.cantidad),
                            timestamp: new Date(tx.timestamp).toLocaleTimeString(),
                            type: currentPrice >= prevPrice ? "buy" : "sell",
                            isNew: false
                        }
                    })

                    setTrades(formattedTrades)
                    if (formattedTrades.length > 0) {
                        setLastPrice(formattedTrades[0].price)
                    }
                } else {
                    setDebugMsg(`Error: ${response.status} ${response.statusText}`)
                }
            } catch (error) {
                console.error("Failed to fetch market history:", error)
                setDebugMsg(`Exception: ${error}`)
            }
        }

        fetchHistory()
    }, [])

    return (
        <Card className="w-full shadow-md h-full flex flex-col">
            <CardHeader className="pb-2 border-b border-border/40 shrink-0">
                <CardTitle className="text-sm font-bold flex items-center uppercase tracking-wider text-muted-foreground">
                    <Activity className="h-4 w-4 mr-2" />
                    Operaciones de Mercado
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col min-h-0">
                <div className="flex justify-between px-4 py-2 text-xs font-medium text-muted-foreground border-b border-border/20 bg-secondary/10 shrink-0">
                    <span className="w-1/3">Precio</span>
                    <span className="w-1/3 text-center">Cantidad</span>
                    <span className="w-1/3 text-right">Hora</span>
                </div>
                <div className="overflow-hidden flex-1 relative">
                    <div className="absolute inset-0 overflow-y-auto">
                        <AnimatePresence mode="popLayout" initial={false}>
                            {trades.map((trade) => (
                                <motion.div
                                    key={trade.id}
                                    layout
                                    initial={trade.isNew ? {
                                        opacity: 0,
                                        x: -20,
                                        backgroundColor: trade.type === "buy" ? "rgba(34, 197, 94, 0.5)" : "rgba(239, 68, 68, 0.5)"
                                    } : { opacity: 1, x: 0 }}
                                    animate={{
                                        opacity: 1,
                                        x: 0,
                                        backgroundColor: "rgba(0,0,0,0)",
                                        transition: { backgroundColor: { duration: 1.5, ease: "easeOut" } }
                                    }}
                                    className="flex justify-between px-4 py-2 text-sm border-b border-border/10 hover:bg-secondary/5"
                                >
                                    <span className={`w-1/3 font-medium ${trade.type === "buy" ? "text-green-500" : "text-red-500"}`}>
                                        {trade.price.toFixed(2)}
                                    </span>
                                    <span className="w-1/3 text-center text-gray-300">
                                        {trade.amount.toFixed(2)}
                                    </span>
                                    <span className="w-1/3 text-right text-gray-500 text-xs">
                                        {trade.timestamp}
                                    </span>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {trades.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-xs p-4 text-center">
                                <Activity className="h-8 w-8 mb-2 opacity-20" />
                                Esperando operaciones...
                                <br /><span className="text-[10px] opacity-50 font-mono mt-2">{debugMsg}</span>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
