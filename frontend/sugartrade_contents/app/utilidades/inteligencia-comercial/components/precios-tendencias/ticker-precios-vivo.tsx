"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUp, ArrowDown, RefreshCw, Activity, DollarSign, Globe, TrendingUp } from "lucide-react"

interface MarketQuote {
  id: string
  name: string
  ticker: string
  price: number
  currency: string
  unit: string
  changePercent: number
  changeAmount: number
  high24h: number
  low24h: number
  volume: string
  market: "Local" | "Internacional"
}

const initialQuotes: MarketQuote[] = [
  {
    id: "blanco-local",
    name: "Azúcar Blanco Tipo A (50kg)",
    ticker: "SUGAR-AR",
    price: 38450,
    currency: "ARS",
    unit: "bolsa 50kg",
    changePercent: 1.85,
    changeAmount: 700,
    high24h: 38900,
    low24h: 37800,
    volume: "14.250 bolsas",
    market: "Local",
  },
  {
    id: "ice-ny-11",
    name: "Azúcar Crudo Contrato #11",
    ticker: "SB (ICE NY)",
    price: 21.42,
    currency: "USD",
    unit: "¢/lb",
    changePercent: -0.46,
    changeAmount: -0.10,
    high24h: 21.68,
    low24h: 21.32,
    volume: "38.410 contratos",
    market: "Internacional",
  },
  {
    id: "ice-london-5",
    name: "Azúcar Blanco Contrato #5",
    ticker: "LSU (ICE London)",
    price: 542.80,
    currency: "USD",
    unit: "USD/t",
    changePercent: 0.93,
    changeAmount: 5.0,
    high24h: 546.50,
    low24h: 537.20,
    volume: "12.890 lotes",
    market: "Internacional",
  },
  {
    id: "paridad-fob",
    name: "Paridad Exportación FOB Bs.As.",
    ticker: "FOB-ARG",
    price: 518.50,
    currency: "USD",
    unit: "USD/t",
    changePercent: 1.15,
    changeAmount: 5.9,
    high24h: 521.00,
    low24h: 512.00,
    volume: "Estimado teórico",
    market: "Local",
  },
]

interface TickerPreciosVivoProps {
  selectedTicker: string
  onSelectTicker: (id: string) => void
}

export default function TickerPreciosVivo({ selectedTicker, onSelectTicker }: TickerPreciosVivoProps) {
  const [quotes, setQuotes] = useState<MarketQuote[]>(initialQuotes)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>("En vivo")

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      // Simulación de fluctuación de mercado en vivo
      setQuotes((prev) =>
        prev.map((q) => {
          const delta = (Math.random() - 0.48) * 0.008
          const newPrice = Math.round((q.price * (1 + delta)) * 100) / 100
          const diff = Math.round((newPrice - q.price) * 100) / 100
          const newPct = Math.round(((diff / q.price) * 100 + q.changePercent) * 100) / 100
          return {
            ...q,
            price: newPrice,
            changeAmount: diff !== 0 ? diff : q.changeAmount,
            changePercent: newPct,
          }
        })
      )
      setLastUpdated(new Date().toLocaleTimeString())
      setIsRefreshing(false)
    }, 600)
  }

  useEffect(() => {
    // Intentar leer precio actual dinámico del backend si está disponible
    const fetchBackendPrices = async () => {
      try {
        const res = await fetch("http://localhost:8002/mercado/precio-referencia-dinamico/1")
        if (res.ok) {
          const data = await res.json()
          if (data && data.precio) {
            setQuotes((prev) =>
              prev.map((q) =>
                q.id === "blanco-local"
                  ? {
                      ...q,
                      price: data.precio,
                    }
                  : q
              )
            )
          }
        }
      } catch {
        // Backend en proceso o offline, fallback transparente
      }
    }
    fetchBackendPrices()
  }, [])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Mercado Activo • {lastUpdated}
          </span>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center text-xs text-gray-400 hover:text-[#00a8ff] transition-colors bg-[#0a0f29] px-2.5 py-1.5 rounded-md border border-[#1a2040]"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRefreshing ? "animate-spin text-[#00a8ff]" : ""}`} />
          Actualizar Cotizaciones
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {quotes.map((quote) => {
          const isSelected = selectedTicker === quote.id
          const isPositive = quote.changePercent >= 0

          return (
            <Card
              key={quote.id}
              onClick={() => onSelectTicker(quote.id)}
              className={`cursor-pointer transition-all border ${
                isSelected
                  ? "bg-gradient-to-br from-[#111936] to-[#1a2750] border-[#00a8ff] ring-1 ring-[#00a8ff] shadow-lg shadow-[#00a8ff]/10"
                  : "bg-[#111936]/80 border-[#1a2040] hover:border-[#00a8ff]/50 hover:bg-[#162044]"
              }`}
            >
              <CardContent className="p-3.5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-[#00a8ff] tracking-tight">{quote.ticker}</span>
                    <h4 className="text-sm font-medium text-white truncate max-w-[170px]">{quote.name}</h4>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 border ${
                      quote.market === "Local"
                        ? "border-sky-500/30 text-sky-400 bg-sky-500/10"
                        : "border-purple-500/30 text-purple-400 bg-purple-500/10"
                    }`}
                  >
                    {quote.market}
                  </Badge>
                </div>

                <div className="mt-2.5 flex items-baseline justify-between">
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-xl font-bold text-white tracking-tight">
                      {quote.currency === "ARS" ? "$" : quote.unit === "¢/lb" ? "" : "$"}
                      {quote.price.toLocaleString("es-AR")}
                    </span>
                    <span className="text-[11px] text-gray-400">{quote.unit}</span>
                  </div>

                  <div
                    className={`flex items-center text-xs font-semibold ${
                      isPositive ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {isPositive ? <ArrowUp className="h-3.5 w-3.5 mr-0.5" /> : <ArrowDown className="h-3.5 w-3.5 mr-0.5" />}
                    <span>{isPositive ? "+" : ""}{quote.changePercent}%</span>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-[#1a2040] flex items-center justify-between text-[11px] text-gray-400">
                  <span>Rango 24h:</span>
                  <span className="font-mono text-gray-300">
                    {quote.low24h} - {quote.high24h}
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
