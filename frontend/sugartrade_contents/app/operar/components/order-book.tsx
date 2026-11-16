"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Order {
  precio: number
  cantidad: number
}

interface OrderBookProps {
  contractType: "contrato5" | "contrato11" | "mercadoInterno"
}

export default function OrderBook({ contractType }: OrderBookProps) {
  const [buyOrders, setBuyOrders] = useState<Order[]>([])
  const [sellOrders, setSellOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    // Generar órdenes simuladas
    const generateOrders = () => {
      const basePrice = contractType === "contrato5" ? 19.75 : contractType === "contrato11" ? 16.8 : 4275.5

      const buyOrders: Order[] = []
      const sellOrders: Order[] = []

      // Generar órdenes de compra (por debajo del precio base)
      for (let i = 0; i < 5; i++) {
        const priceDiff = (i + 1) * (contractType === "mercadoInterno" ? 25 : 0.05)
        const price = basePrice - priceDiff
        const quantity = Math.floor(Math.random() * 100) + 10

        buyOrders.push({
          precio: Number(price.toFixed(contractType === "mercadoInterno" ? 2 : 2)),
          cantidad: quantity,
        })
      }

      // Generar órdenes de venta (por encima del precio base)
      for (let i = 0; i < 5; i++) {
        const priceDiff = (i + 1) * (contractType === "mercadoInterno" ? 25 : 0.05)
        const price = basePrice + priceDiff
        const quantity = Math.floor(Math.random() * 100) + 10

        sellOrders.push({
          precio: Number(price.toFixed(contractType === "mercadoInterno" ? 2 : 2)),
          cantidad: quantity,
        })
      }

      return { buyOrders, sellOrders }
    }

    const { buyOrders, sellOrders } = generateOrders()
    setBuyOrders(buyOrders)
    setSellOrders(sellOrders)
    setLoading(false)

    // Actualizar órdenes cada 3 segundos
    const interval = setInterval(() => {
      const { buyOrders, sellOrders } = generateOrders()
      setBuyOrders(buyOrders)
      setSellOrders(sellOrders)
    }, 3000)

    return () => clearInterval(interval)
  }, [contractType])

  const priceUnit = contractType === "mercadoInterno" ? "ARS" : "$"

  if (loading) {
    return (
      <Card className="bg-[#111936] border-[#1a2040] h-full">
        <CardHeader>
          <CardTitle className="text-white">Ofertas</CardTitle>
        </CardHeader>
        <CardContent className="animate-pulse">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-6 bg-[#1a2040] rounded mb-2"></div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-[#111936] border-[#1a2040] h-full">
      <CardHeader>
        <CardTitle className="text-white">Ofertas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Órdenes de venta (en orden descendente) */}
          <div>
            <h3 className="text-red-500 font-medium mb-2">Vender</h3>
            <div className="space-y-1">
              {sellOrders.map((order, index) => (
                <div key={`sell-${index}`} className="flex justify-between items-center text-sm">
                  <span className="text-red-400">
                    {priceUnit} {order.precio.toLocaleString("es-AR")}
                  </span>
                  <span className="text-gray-400">x {order.cantidad}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-[#1a2040] my-4"></div>

          {/* Órdenes de compra (en orden descendente) */}
          <div>
            <h3 className="text-green-500 font-medium mb-2">Comprar</h3>
            <div className="space-y-1">
              {buyOrders.map((order, index) => (
                <div key={`buy-${index}`} className="flex justify-between items-center text-sm">
                  <span className="text-green-400">
                    {priceUnit} {order.precio.toLocaleString("es-AR")}
                  </span>
                  <span className="text-gray-400">x {order.cantidad}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
