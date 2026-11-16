"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PriceDisplayProps {
    productId?: number
}

export default function PriceDisplay({ productId = 2 }: PriceDisplayProps) {
    const [prices, setPrices] = useState({
        current_price: 0,
        prd: 0
    })
    const [loading, setLoading] = useState(true)
    const [flash, setFlash] = useState(false)

    useEffect(() => {
        const fetchPrices = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/market/prices/${productId}`)
                if (response.ok) {
                    const data = await response.json()
                    if (data.current_price !== prices.current_price) {
                        setFlash(true)
                        setTimeout(() => setFlash(false), 1000)
                    }
                    setPrices(data)
                }
            } catch (error) {
                console.error("Error fetching prices:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchPrices()
        // Refresh every 1 second for faster updates
        const interval = setInterval(fetchPrices, 1000)
        return () => clearInterval(interval)
    }, [productId, prices.current_price])

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("es-AR", {
            style: "currency",
            currency: "ARS",
            minimumFractionDigits: 2
        }).format(value)
    }

    return (
        <Card className="bg-[#111936] border-[#1a2040] mb-6 shadow-lg shadow-blue-900/10">
            <CardContent className="p-6">
                <div className="flex flex-col gap-6">
                    {/* PRD Section - Highlighted */}
                    <div className="flex flex-col items-center justify-center p-4 bg-[#1a2040]/50 rounded-lg border border-[#00a8ff]/20">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[#00a8ff] text-base font-bold uppercase tracking-wider">PRD (Bolsa 50kg)</span>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="h-4 w-4 text-[#00a8ff]" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Precio de Referencia Dinámico por Bolsa de 50kg</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <div className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                            {loading ? "..." : formatCurrency(prices.prd / 20)}
                        </div>
                        <p className="text-sm text-gray-400 mt-1 font-medium">Valor sugerido de mercado</p>
                    </div>

                    {/* Current Price Section */}
                    <div className={`flex flex-col items-center justify-center p-4 rounded-lg border border-gray-800 transition-all duration-300 ${flash ? 'bg-blue-900/30 border-blue-500 scale-105' : ''}`}>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Precio Actual (Bolsa 50kg)</span>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="h-4 w-4 text-gray-500" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Último precio operado por Bolsa de 50kg</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <div className={`text-3xl md:text-4xl font-bold ${prices.current_price >= prices.prd ? 'text-green-500' : 'text-red-500'}`}>
                            {loading ? "..." : formatCurrency(prices.current_price / 20)}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                            {prices.current_price >= prices.prd ? (
                                <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : (
                                <TrendingDown className="h-4 w-4 text-red-500" />
                            )}
                            <p className="text-sm text-gray-500 font-medium">
                                {prices.current_price >= prices.prd ? "Sobre PRD" : "Bajo PRD"}
                                <span className="ml-1 font-bold">
                                    ({prices.prd > 0 ? ((Math.abs(prices.current_price - prices.prd) / prices.prd) * 100).toFixed(2) : "0.00"}%)
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
