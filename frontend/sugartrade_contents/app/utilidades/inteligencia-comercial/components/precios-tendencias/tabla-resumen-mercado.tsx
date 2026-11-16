"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Layers, ArrowUpDown, DollarSign, History, ShieldAlert } from "lucide-react"

export default function TablaResumenMercado() {
  const [activeTab, setActiveTab] = useState<"orderbook" | "historico-zafra" | "arbitraje">("orderbook")

  // Órdenes de compra simuladas en vivo
  const buyOrders = [
    { price: 38450, qty: 1200, total: "$46.140.000", buyer: "Distribuidora del Norte", time: "11:24" },
    { price: 38350, qty: 2500, total: "$95.875.000", buyer: "Industria Alimenticia BA", time: "11:21" },
    { price: 38200, qty: 4000, total: "$152.800.000", buyer: "Bebidas del Centro", time: "11:15" },
    { price: 38100, qty: 1500, total: "$57.150.000", buyer: "Cooperativa Cuyo", time: "11:08" },
  ]

  // Órdenes de venta simuladas en vivo
  const sellOrders = [
    { price: 38550, qty: 800, total: "$30.840.000", seller: "Ingenio La Florida", time: "11:25" },
    { price: 38600, qty: 3000, total: "$115.800.000", seller: "Ingenio Concepción", time: "11:19" },
    { price: 38750, qty: 5000, total: "$193.750.000", seller: "Productor Independiente Tucumán", time: "11:12" },
    { price: 38900, qty: 2000, total: "$77.800.000", seller: "Ingenio Ledesma", time: "10:55" },
  ]

  // Resumen interanual de Zafras
  const zafraData = [
    { zafra: "2026 (Actual)", promARS: "$38.450", maxARS: "$38.900", minARS: "$34.200", cambioInteranual: "+18.2%", produccion: "2.1M tn (est.)" },
    { zafra: "2025", promARS: "$32.500", maxARS: "$36.100", minARS: "$28.000", cambioInteranual: "+45.5%", produccion: "2.05M tn" },
    { zafra: "2024", promARS: "$22.340", maxARS: "$27.800", minARS: "$18.500", cambioInteranual: "+92.0%", produccion: "1.98M tn" },
    { zafra: "2023", promARS: "$11.600", maxARS: "$16.200", minARS: "$8.900", cambioInteranual: "+110%", produccion: "1.72M tn" },
  ]

  return (
    <Card className="bg-[#111936] border-[#1a2040]">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-white text-base font-semibold flex items-center">
              <Layers className="h-4 w-4 mr-2 text-[#00a8ff]" />
              Profundidad de Mercado & Comparativas
            </CardTitle>
            <CardDescription className="text-gray-400 text-xs">
              Libro de órdenes activo del Marketplace de Agro-IA e histórico de Zafras.
            </CardDescription>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-auto">
            <TabsList className="bg-[#0a0f29] border border-[#1a2040] p-0.5 h-8">
              <TabsTrigger
                value="orderbook"
                className="text-xs px-2.5 py-1 data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
              >
                Libro de Órdenes
              </TabsTrigger>
              <TabsTrigger
                value="historico-zafra"
                className="text-xs px-2.5 py-1 data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
              >
                Histórico de Zafras
              </TabsTrigger>
              <TabsTrigger
                value="arbitraje"
                className="text-xs px-2.5 py-1 data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
              >
                Paridad & Arbitraje
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="pt-3">
        {activeTab === "orderbook" && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Compras (Demanda) */}
              <div className="bg-[#0a0f29] rounded-lg border border-[#1a2040] p-3 space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-[#1a2040] text-xs">
                  <span className="font-semibold text-emerald-400 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5"></span>
                    Posturas de Compra (Demanda)
                  </span>
                  <span className="text-gray-400">Total: 9.200 bolsas</span>
                </div>
                <div className="space-y-1.5 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-gray-500 text-[11px]">
                        <th className="pb-1 font-medium">Comprador</th>
                        <th className="pb-1 font-medium text-right">Cant.</th>
                        <th className="pb-1 font-medium text-right">Precio</th>
                        <th className="pb-1 font-medium text-right">Hora</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1a2040]/50 text-gray-300">
                      {buyOrders.map((order, idx) => (
                        <tr key={idx} className="hover:bg-[#111936]/60">
                          <td className="py-1.5 text-white font-medium truncate max-w-[140px]">{order.buyer}</td>
                          <td className="py-1.5 font-mono text-right text-gray-300">{order.qty}</td>
                          <td className="py-1.5 font-mono text-right font-semibold text-emerald-400">
                            ${order.price.toLocaleString("es-AR")}
                          </td>
                          <td className="py-1.5 text-right text-gray-500 font-mono text-[10px]">{order.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Ventas (Oferta) */}
              <div className="bg-[#0a0f29] rounded-lg border border-[#1a2040] p-3 space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-[#1a2040] text-xs">
                  <span className="font-semibold text-rose-400 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-rose-400 mr-1.5"></span>
                    Posturas de Venta (Oferta)
                  </span>
                  <span className="text-gray-400">Total: 10.800 bolsas</span>
                </div>
                <div className="space-y-1.5 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-gray-500 text-[11px]">
                        <th className="pb-1 font-medium">Vendedor</th>
                        <th className="pb-1 font-medium text-right">Cant.</th>
                        <th className="pb-1 font-medium text-right">Precio</th>
                        <th className="pb-1 font-medium text-right">Hora</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1a2040]/50 text-gray-300">
                      {sellOrders.map((order, idx) => (
                        <tr key={idx} className="hover:bg-[#111936]/60">
                          <td className="py-1.5 text-white font-medium truncate max-w-[140px]">{order.seller}</td>
                          <td className="py-1.5 font-mono text-right text-gray-300">{order.qty}</td>
                          <td className="py-1.5 font-mono text-right font-semibold text-rose-400">
                            ${order.price.toLocaleString("es-AR")}
                          </td>
                          <td className="py-1.5 text-right text-gray-500 font-mono text-[10px]">{order.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs px-3 py-2 bg-[#0a0f29] rounded-lg border border-[#1a2040] text-gray-400">
              <span>Spread de Mercado Actual:</span>
              <span className="font-mono font-semibold text-amber-400">$100 ARS (0.26%)</span>
            </div>
          </div>
        )}

        {activeTab === "historico-zafra" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-gray-400 border-b border-[#1a2040] text-[11px]">
                  <th className="pb-2 font-medium">Zafra</th>
                  <th className="pb-2 font-medium text-right">Precio Promedio</th>
                  <th className="pb-2 font-medium text-right">Máximo</th>
                  <th className="pb-2 font-medium text-right">Mínimo</th>
                  <th className="pb-2 font-medium text-right">Variación Interanual</th>
                  <th className="pb-2 font-medium text-right">Producción País</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a2040]/60 text-gray-300">
                {zafraData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#0a0f29]/70">
                    <td className="py-2.5 font-semibold text-white">{row.zafra}</td>
                    <td className="py-2.5 text-right font-mono text-sky-400 font-medium">{row.promARS}</td>
                    <td className="py-2.5 text-right font-mono text-emerald-400">{row.maxARS}</td>
                    <td className="py-2.5 text-right font-mono text-rose-400">{row.minARS}</td>
                    <td className="py-2.5 text-right font-mono text-amber-400 font-semibold">{row.cambioInteranual}</td>
                    <td className="py-2.5 text-right text-gray-400">{row.produccion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "arbitraje" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-[#0a0f29] rounded-lg border border-[#1a2040] space-y-1">
              <span className="text-gray-400 text-[11px]">Paridad Exportación FOB</span>
              <div className="text-white font-mono font-bold text-base">$518.50 USD/t</div>
              <p className="text-gray-500 text-[11px]">Equivalente a ~$37.850 ARS/bolsa neto de retenciones.</p>
            </div>
            <div className="p-3 bg-[#0a0f29] rounded-lg border border-[#1a2040] space-y-1">
              <span className="text-gray-400 text-[11px]">Mercado Interno (FAS Tucumán)</span>
              <div className="text-white font-mono font-bold text-base">$38.450 ARS/bolsa</div>
              <p className="text-emerald-400 text-[11px]">+1.6% premio sobre paridad de exportación.</p>
            </div>
            <div className="p-3 bg-[#0a0f29] rounded-lg border border-[#1a2040] space-y-1">
              <span className="text-gray-400 text-[11px]">Ventana de Oportunidad</span>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[11px] mt-0.5">
                Favorece Mercado Interno
              </Badge>
              <p className="text-gray-500 text-[11px]">Mejor margen de venta directa en plaza nacional.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
