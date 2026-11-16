"use client"

import type React from "react"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useOperaciones } from "@/hooks/use-operaciones"
import type { ProductoType, OperacionType } from "@/store/warrants-store"
import { formatCurrency } from "@/lib/utils"

export default function OperarPage() {
  const [tab, setTab] = useState("pendientes")
  const {
    operacionesPendientes,
    operacionesCompletadas,
    warrantsDisponibles,
    crearOperacion,
    completarOperacion,
    cancelarOperacion,
  } = useOperaciones()

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    tipo: "compra" as OperacionType,
    producto: "azucar_blanco" as ProductoType,
    cantidad: 0,
    precio: 0,
    contraparte: "",
    warrantId: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    crearOperacion(formData)
    setShowForm(false)
    setFormData({
      tipo: "compra",
      producto: "azucar_blanco",
      cantidad: 0,
      precio: 0,
      contraparte: "",
      warrantId: "",
    })
  }

  return (
    <div className="container py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Operar</h1>
          <p className="text-gray-400 max-w-3xl mt-2">Gestione sus operaciones de compra y venta de productos.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700">
          {showForm ? "Cancelar" : "Nueva Operación"}
        </Button>
      </div>

      {showForm && (
        <Card className="bg-[#111936] border-[#1a2040]">
          <CardHeader>
            <CardTitle className="text-lg text-white">Nueva Operación</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Tipo de Operación</label>
                  <select
                    className="w-full p-2 rounded bg-[#1a2040] border border-[#2a3050] text-white"
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as OperacionType })}
                    required
                  >
                    <option value="compra">Compra</option>
                    <option value="venta">Venta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Producto</label>
                  <select
                    className="w-full p-2 rounded bg-[#1a2040] border border-[#2a3050] text-white"
                    value={formData.producto}
                    onChange={(e) => setFormData({ ...formData, producto: e.target.value as ProductoType })}
                    required
                  >
                    <option value="azucar_blanco">Azúcar Blanco</option>
                    <option value="azucar_crudo">Azúcar Crudo</option>
                    <option value="azucar_organico">Azúcar Orgánico</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Cantidad (BLS)</label>
                  <input
                    type="number"
                    className="w-full p-2 rounded bg-[#1a2040] border border-[#2a3050] text-white"
                    value={formData.cantidad}
                    onChange={(e) => setFormData({ ...formData, cantidad: Number.parseInt(e.target.value) })}
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Precio por BLS ($)</label>
                  <input
                    type="number"
                    className="w-full p-2 rounded bg-[#1a2040] border border-[#2a3050] text-white"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: Number.parseInt(e.target.value) })}
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Contraparte</label>
                  <input
                    type="text"
                    className="w-full p-2 rounded bg-[#1a2040] border border-[#2a3050] text-white"
                    value={formData.contraparte}
                    onChange={(e) => setFormData({ ...formData, contraparte: e.target.value })}
                    required
                  />
                </div>
                {formData.tipo === "venta" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Warrant a Vender</label>
                    <select
                      className="w-full p-2 rounded bg-[#1a2040] border border-[#2a3050] text-white"
                      value={formData.warrantId}
                      onChange={(e) => setFormData({ ...formData, warrantId: e.target.value })}
                      required
                    >
                      <option value="">Seleccione un warrant</option>
                      {warrantsDisponibles
                        .filter((w) => w.producto === formData.producto)
                        .map((warrant) => (
                          <option key={warrant.id} value={warrant.id}>
                            {warrant.numero} - {warrant.cantidad} BLS - {formatCurrency(warrant.valor)}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="flex justify-end">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Crear Operación
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="pendientes" value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="bg-[#111936] border border-[#1a2040]">
          <TabsTrigger value="pendientes" className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-white">
            Pendientes
          </TabsTrigger>
          <TabsTrigger value="completadas" className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-white">
            Completadas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pendientes" className="mt-6">
          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white">Operaciones Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              {operacionesPendientes.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1a2040]">
                      <th className="text-left py-2 text-gray-400 font-medium">Fecha</th>
                      <th className="text-left py-2 text-gray-400 font-medium">Tipo</th>
                      <th className="text-left py-2 text-gray-400 font-medium">Producto</th>
                      <th className="text-left py-2 text-gray-400 font-medium">Cantidad</th>
                      <th className="text-left py-2 text-gray-400 font-medium">Precio</th>
                      <th className="text-left py-2 text-gray-400 font-medium">Monto</th>
                      <th className="text-left py-2 text-gray-400 font-medium">Contraparte</th>
                      <th className="text-left py-2 text-gray-400 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {operacionesPendientes.map((operacion) => (
                      <tr key={operacion.id} className="border-b border-[#1a2040]">
                        <td className="py-3 text-white">{operacion.fecha}</td>
                        <td className="py-3 text-white capitalize">{operacion.tipo}</td>
                        <td className="py-3 text-white">{formatProducto(operacion.producto)}</td>
                        <td className="py-3 text-white">{operacion.cantidad} BLS</td>
                        <td className="py-3 text-white">{formatCurrency(operacion.precio)}</td>
                        <td className="py-3 text-white">{formatCurrency(operacion.monto)}</td>
                        <td className="py-3 text-white">{operacion.contraparte}</td>
                        <td className="py-3 flex space-x-2">
                          <Button
                            onClick={() => completarOperacion(operacion.id)}
                            className="bg-green-600 hover:bg-green-700 text-xs py-1 h-auto"
                          >
                            Completar
                          </Button>
                          <Button
                            onClick={() => cancelarOperacion(operacion.id)}
                            className="bg-red-600 hover:bg-red-700 text-xs py-1 h-auto"
                          >
                            Cancelar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-400">No hay operaciones pendientes</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completadas" className="mt-6">
          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white">Operaciones Completadas</CardTitle>
            </CardHeader>
            <CardContent>
              {operacionesCompletadas.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1a2040]">
                      <th className="text-left py-2 text-gray-400 font-medium">Fecha</th>
                      <th className="text-left py-2 text-gray-400 font-medium">Tipo</th>
                      <th className="text-left py-2 text-gray-400 font-medium">Producto</th>
                      <th className="text-left py-2 text-gray-400 font-medium">Cantidad</th>
                      <th className="text-left py-2 text-gray-400 font-medium">Precio</th>
                      <th className="text-left py-2 text-gray-400 font-medium">Monto</th>
                      <th className="text-left py-2 text-gray-400 font-medium">Contraparte</th>
                    </tr>
                  </thead>
                  <tbody>
                    {operacionesCompletadas.map((operacion) => (
                      <tr key={operacion.id} className="border-b border-[#1a2040]">
                        <td className="py-3 text-white">{operacion.fecha}</td>
                        <td className="py-3 text-white capitalize">{operacion.tipo}</td>
                        <td className="py-3 text-white">{formatProducto(operacion.producto)}</td>
                        <td className="py-3 text-white">{operacion.cantidad} BLS</td>
                        <td className="py-3 text-white">{formatCurrency(operacion.precio)}</td>
                        <td className="py-3 text-white">{formatCurrency(operacion.monto)}</td>
                        <td className="py-3 text-white">{operacion.contraparte}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-400">No hay operaciones completadas</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Función auxiliar para formatear productos
function formatProducto(producto: ProductoType): string {
  const map: Record<ProductoType, string> = {
    azucar_blanco: "Azúcar Blanco",
    azucar_crudo: "Azúcar Crudo",
    azucar_organico: "Azúcar Orgánico",
  }
  return map[producto] || producto
}
