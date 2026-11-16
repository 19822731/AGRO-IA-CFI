"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PlaceOrderFormProps {
  contractType: "contrato5" | "contrato11" | "mercadoInterno"
}

export default function PlaceOrderForm({ contractType }: PlaceOrderFormProps) {
  const [orderType, setOrderType] = useState("limit")
  const [price, setPrice] = useState("")
  const [quantity, setQuantity] = useState("")
  const [orderSide, setOrderSide] = useState<"buy" | "sell">("buy")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Aquí iría la lógica para enviar la orden
    alert(`Orden colocada: ${orderSide === "buy" ? "Compra" : "Venta"} de ${quantity} a ${price} (${orderType})`)

    // Resetear el formulario
    setPrice("")
    setQuantity("")
  }

  const priceUnit = contractType === "mercadoInterno" ? "ARS" : "$"
  const quantityUnit = contractType === "mercadoInterno" ? "bolsas" : "contratos"

  return (
    <Card className="bg-[#111936] border-[#1a2040]">
      <CardHeader>
        <CardTitle className="text-white">Colocar Orden</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="buy" onValueChange={(value) => setOrderSide(value as "buy" | "sell")}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="buy" className="data-[state=active]:bg-green-700 data-[state=active]:text-white">
              Comprar
            </TabsTrigger>
            <TabsTrigger value="sell" className="data-[state=active]:bg-red-700 data-[state=active]:text-white">
              Vender
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buy">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Tipo de Orden</label>
                  <Select defaultValue="limit" onValueChange={setOrderType}>
                    <SelectTrigger className="bg-[#0a0f29] border-[#1a2040] text-white">
                      <SelectValue placeholder="Tipo de Orden" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0f29] border-[#1a2040] text-white">
                      <SelectItem value="limit">Límite</SelectItem>
                      <SelectItem value="market">Mercado</SelectItem>
                      <SelectItem value="stop">Stop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Precio ({priceUnit})</label>
                  <Input
                    type="number"
                    placeholder={`Precio en ${priceUnit}`}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    disabled={orderType === "market"}
                    className="bg-[#0a0f29] border-[#1a2040] text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Cantidad ({quantityUnit})</label>
                  <Input
                    type="number"
                    placeholder={`Cantidad en ${quantityUnit}`}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="bg-[#0a0f29] border-[#1a2040] text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Total</label>
                  <Input
                    type="text"
                    value={
                      price && quantity
                        ? `${priceUnit} ${(Number(price) * Number(quantity)).toLocaleString("es-AR")}`
                        : ""
                    }
                    disabled
                    className="bg-[#0a0f29] border-[#1a2040] text-white"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-green-700 hover:bg-green-800 text-white">
                Comprar {quantity ? quantity : ""} {quantity ? quantityUnit : ""}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="sell">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Tipo de Orden</label>
                  <Select defaultValue="limit" onValueChange={setOrderType}>
                    <SelectTrigger className="bg-[#0a0f29] border-[#1a2040] text-white">
                      <SelectValue placeholder="Tipo de Orden" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0f29] border-[#1a2040] text-white">
                      <SelectItem value="limit">Límite</SelectItem>
                      <SelectItem value="market">Mercado</SelectItem>
                      <SelectItem value="stop">Stop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Precio ({priceUnit})</label>
                  <Input
                    type="number"
                    placeholder={`Precio en ${priceUnit}`}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    disabled={orderType === "market"}
                    className="bg-[#0a0f29] border-[#1a2040] text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Cantidad ({quantityUnit})</label>
                  <Input
                    type="number"
                    placeholder={`Cantidad en ${quantityUnit}`}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="bg-[#0a0f29] border-[#1a2040] text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Total</label>
                  <Input
                    type="text"
                    value={
                      price && quantity
                        ? `${priceUnit} ${(Number(price) * Number(quantity)).toLocaleString("es-AR")}`
                        : ""
                    }
                    disabled
                    className="bg-[#0a0f29] border-[#1a2040] text-white"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-red-700 hover:bg-red-800 text-white">
                Vender {quantity ? quantity : ""} {quantity ? quantityUnit : ""}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
