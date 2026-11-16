"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

interface TradingHeaderProps {
  contractType: "contrato5" | "contrato11" | "mercadoInterno"
  label: string
}

export default function TradingHeader({ contractType, label }: TradingHeaderProps) {
  const [price, setPrice] = useState<number | null>(null)
  const [change, setChange] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    // Simular carga de datos
    const fetchData = () => {
      // Precios base simulados
      const basePrice = contractType === "contrato5" ? 19.75 : contractType === "contrato11" ? 16.8 : 4275.5

      // Simular cambio aleatorio
      const randomChange = (Math.random() - 0.5) * 2 // Entre -1% y 1%
      const newPrice = basePrice * (1 + randomChange / 100)

      setPrice(newPrice)
      setChange(randomChange)
      setLoading(false)
    }

    fetchData()

    // Actualizar cada 5 segundos
    const interval = setInterval(() => {
      if (price) {
        // Simular pequeña variación
        const randomVariation = (Math.random() - 0.5) * 0.5 // Entre -0.25% y 0.25%
        const newPrice = price * (1 + randomVariation / 100)
        setPrice(newPrice)
        setChange(randomVariation)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [contractType])

  const priceUnit = contractType === "mercadoInterno" ? "ARS/bolsa" : "centavos/libra"

  return (
    <Card className="bg-[#111936] border-[#1a2040]">
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">{label}</h2>
            <p className="text-sm text-gray-400">Precio actual en {priceUnit}</p>
          </div>

          {loading ? (
            <div className="animate-pulse flex flex-col items-end">
              <div className="h-8 w-32 bg-[#1a2040] rounded mb-1"></div>
              <div className="h-5 w-20 bg-[#1a2040] rounded"></div>
            </div>
          ) : (
            <div className="flex flex-col items-end">
              <div className="text-3xl font-bold text-white">
                {price?.toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <div
                className={`flex items-center ${change >= 0 ? "text-green-500" : "text-red-500"} text-sm font-medium`}
              >
                {change >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                {change >= 0 ? "+" : ""}
                {change.toFixed(2)}%
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
