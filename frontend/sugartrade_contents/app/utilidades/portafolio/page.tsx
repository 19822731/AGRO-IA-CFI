"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useWarrantsPortafolio } from "@/hooks/use-warrants-portafolio"
import { formatCurrency } from "@/lib/utils"

export default function PortafolioPage() {
  const [tab, setTab] = useState("activos")

  const { itemsPortafolio, valorTotalPortafolio } = useWarrantsPortafolio()

  return (
    <div className="container py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Portafolio</h1>
          <p className="text-gray-400 max-w-3xl mt-2">
            Gestione su portafolio de activos, incluyendo warrants y certificados de depósito.
          </p>
        </div>
        <div className="bg-[#1a2040] px-4 py-2 rounded-lg">
          <p className="text-sm text-gray-400">Valor Total del Portafolio</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(valorTotalPortafolio)}</p>
        </div>
      </div>

      <Tabs defaultValue="activos" value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="bg-[#111936] border border-[#1a2040]">
          <TabsTrigger value="activos" className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-white">
            Activos
          </TabsTrigger>
          <TabsTrigger value="warrants" className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-white">
            Warrants
          </TabsTrigger>
          <TabsTrigger value="certificados" className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-white">
            Certificados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activos" className="mt-6">
          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white">Todos los Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1a2040]">
                    <th className="text-left py-2 text-gray-400 font-medium">Tipo</th>
                    <th className="text-left py-2 text-gray-400 font-medium">Nº</th>
                    <th className="text-left py-2 text-gray-400 font-medium">Producto</th>
                    <th className="text-left py-2 text-gray-400 font-medium">Cantidad</th>
                    <th className="text-left py-2 text-gray-400 font-medium">Valor</th>
                    <th className="text-left py-2 text-gray-400 font-medium">Estado</th>
                    <th className="text-left py-2 text-gray-400 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {itemsPortafolio.map((item) => (
                    <tr key={item.id} className="border-b border-[#1a2040]">
                      <td className="py-3 text-white capitalize">{item.tipo}</td>
                      <td className="py-3 text-white">{item.numero}</td>
                      <td className="py-3 text-white">{item.producto}</td>
                      <td className="py-3 text-white">{item.cantidad} BLS</td>
                      <td className="py-3 text-white">{formatCurrency(item.valor)}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            item.estado === "Activo" || item.estado === "Disponible"
                              ? "bg-green-500/20 text-green-500"
                              : item.estado === "Pendiente" || item.estado === "En Proceso"
                                ? "bg-yellow-500/20 text-yellow-500"
                                : "bg-red-500/20 text-red-500"
                          }`}
                        >
                          {item.estado}
                        </span>
                      </td>
                      <td className="py-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 border-[#2a3050] text-[#00a8ff] hover:text-white hover:bg-[#00a8ff]"
                        >
                          Ver Detalle
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="warrants" className="mt-6">
          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white">Warrants en Portafolio</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1a2040]">
                    <th className="text-left py-2 text-gray-400 font-medium">Nº</th>
                    <th className="text-left py-2 text-gray-400 font-medium">Producto</th>
                    <th className="text-left py-2 text-gray-400 font-medium">Cantidad</th>
                    <th className="text-left py-2 text-gray-400 font-medium">Valor</th>
                    <th className="text-left py-2 text-gray-400 font-medium">Estado</th>
                    <th className="text-left py-2 text-gray-400 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {itemsPortafolio
                    .filter((item) => item.tipo === "warrant")
                    .map((item) => (
                      <tr key={item.id} className="border-b border-[#1a2040]">
                        <td className="py-3 text-white">{item.numero}</td>
                        <td className="py-3 text-white">{item.producto}</td>
                        <td className="py-3 text-white">{item.cantidad} BLS</td>
                        <td className="py-3 text-white">{formatCurrency(item.valor)}</td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              item.estado === "Activo"
                                ? "bg-green-500/20 text-green-500"
                                : item.estado === "Pendiente"
                                  ? "bg-yellow-500/20 text-yellow-500"
                                  : "bg-red-500/20 text-red-500"
                            }`}
                          >
                            {item.estado}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 border-[#2a3050] text-[#00a8ff] hover:text-white hover:bg-[#00a8ff]"
                            >
                              Ver Detalle
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 border-[#2a3050] text-[#00a8ff] hover:text-white hover:bg-[#00a8ff]"
                            >
                              Transferir
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificados" className="mt-6">
          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white">Certificados en Portafolio</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1a2040]">
                    <th className="text-left py-2 text-gray-400 font-medium">Nº</th>
                    <th className="text-left py-2 text-gray-400 font-medium">Tipo</th>
                    <th className="text-left py-2 text-gray-400 font-medium">Producto</th>
                    <th className="text-left py-2 text-gray-400 font-medium">Cantidad</th>
                    <th className="text-left py-2 text-gray-400 font-medium">Valor</th>
                    <th className="text-left py-2 text-gray-400 font-medium">Estado</th>
                    <th className="text-left py-2 text-gray-400 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {itemsPortafolio
                    .filter((item) => item.tipo === "certificado")
                    .map((item) => (
                      <tr key={item.id} className="border-b border-[#1a2040]">
                        <td className="py-3 text-white">{item.numero}</td>
                        <td className="py-3 text-white">{item.numero.startsWith("CD-") ? "Depósito" : "Canje"}</td>
                        <td className="py-3 text-white">{item.producto}</td>
                        <td className="py-3 text-white">{item.cantidad} BLS</td>
                        <td className="py-3 text-white">{formatCurrency(item.valor)}</td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              item.estado === "Disponible"
                                ? "bg-blue-500/20 text-blue-500"
                                : item.estado === "En Proceso"
                                  ? "bg-purple-500/20 text-purple-500"
                                  : "bg-gray-500/20 text-gray-400"
                            }`}
                          >
                            {item.estado}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 border-[#2a3050] text-[#00a8ff] hover:text-white hover:bg-[#00a8ff]"
                            >
                              Ver Detalle
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 border-[#2a3050] text-[#00a8ff] hover:text-white hover:bg-[#00a8ff]"
                            >
                              Utilizar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
