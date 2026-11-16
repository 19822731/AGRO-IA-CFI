"use client"

import type React from "react"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useCanje } from "@/hooks/use-canje"
import { formatCurrency } from "@/lib/utils"

export default function CanjePage() {
  const [tab, setTab] = useState("disponibles")
  const { certificadosDisponibles, warrantsActivos, certificadosCanje, ejecutarCanje } = useCanje()

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    certificadoId: "",
    warrantId: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    ejecutarCanje(formData.certificadoId, formData.warrantId)
    setShowForm(false)
    setFormData({
      certificadoId: "",
      warrantId: "",
    })
  }

  return (
    <div className="container py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Canje</h1>
          <p className="text-gray-400 max-w-3xl mt-2">
            Gestione el canje de certificados de depósito por certificados de canje.
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700">
          {showForm ? "Cancelar" : "Nuevo Canje"}
        </Button>
      </div>

      {showForm && (
        <Card className="bg-[#111936] border-[#1a2040]">
          <CardHeader>
            <CardTitle className="text-lg text-white">Nuevo Canje</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Certificado de Depósito</label>
                  <select
                    className="w-full p-2 rounded bg-[#1a2040] border border-[#2a3050] text-white"
                    value={formData.certificadoId}
                    onChange={(e) => {
                      const certificadoId = e.target.value
                      const certificado = certificadosDisponibles.find((c) => c.id === certificadoId)
                      setFormData({
                        ...formData,
                        certificadoId,
                        warrantId: certificado ? certificado.warrantId : "",
                      })
                    }}
                    required
                  >
                    <option value="">Seleccione un certificado</option>
                    {certificadosDisponibles.map((certificado) => (
                      <option key={certificado.id} value={certificado.id}>
                        {certificado.numero} - {certificado.cantidad} BLS - {formatCurrency(certificado.valor)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Warrant Asociado</label>
                  <select
                    className="w-full p-2 rounded bg-[#1a2040] border border-[#2a3050] text-white"
                    value={formData.warrantId}
                    disabled
                  >
                    <option value="">Seleccione un warrant</option>
                    {warrantsActivos.map((warrant) => (
                      <option key={warrant.id} value={warrant.id}>
                        {warrant.numero} - {warrant.cantidad} BLS - {formatCurrency(warrant.valor)}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    El warrant se selecciona automáticamente según el certificado
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700"
                  disabled={!formData.certificadoId || !formData.warrantId}
                >
                  Ejecutar Canje
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="disponibles" value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="bg-[#111936] border border-[#1a2040]">
          <TabsTrigger value="disponibles" className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-white">
            Certificados Disponibles
          </TabsTrigger>
          <TabsTrigger value="canje" className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-white">
            Certificados de Canje
          </TabsTrigger>
        </TabsList>

        <TabsContent value="disponibles" className="mt-6">
          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white">Certificados de Depósito Disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              {certificadosDisponibles.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1a2040]">
                      <th className="text-left py-2 text-gray-400 font-medium">Número</th>
                      <th className="text-left py-2 text-gray-400 font-medium">Fecha</th>
                      <th className="text-left py-2 text-gray-400 font-medium">Producto</th>
                      <th className="text-left py-2 text-gray-400 font-medium">Cantidad</th>
                      <th className="text-left py-2 text-gray-400 font-medium">Valor</th>
                      <th className="text-left py-2 text-gray-400 font-medium">Warrant</th>
                      <th className="text-left py-2 text-gray-400 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {certificadosDisponibles.map((certificado) => {
                      const warrant = warrantsActivos.find((w) => w.id === certificado.warrantId)
                      return (
                        <tr key={certificado.id} className="border-b border-[#1a2040]">
                          <td className="py-3 text-white">{certificado.numero}</td>
                          <td className="py-3 text-white">{certificado.fecha}</td>
                          <td className="py-3 text-white">{formatProducto(certificado.producto)}</td>
                          <td className="py-3 text-white">{certificado.cantidad} BLS</td>
                          <td className="py-3 text-white">{formatCurrency(certificado.valor)}</td>
                          <td className="py-3 text-white">{warrant?.numero || "-"}</td>
                          <td className="py-3">
                            <Button
                              onClick={() => {
                                setFormData({
                                  certificadoId: certificado.id,
                                  warrantId: certificado.warrantId,
                                })
                                setShowForm(true)
                              }}
                              className="bg-purple-600 hover:bg-purple-700 text-xs py-1 h-auto"
                            >
                              Canjear
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-400">No hay certificados disponibles para canje</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="canje" className="mt-6">
          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white">Certificados de Canje</CardTitle>
            </CardHeader>
            <CardContent>
              {certificadosCanje.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1a2040]">
                      <th className="text-left py-2 text-gray-400 font-medium">Número</th>
                      <th className="text-left py-2 text-gray-400 font-medium">Fecha</th>
                      <th className="text-left py-2 text-gray-400 font-medium">Producto</th>
                      <th className="text-left py-2 text-gray-400 font-medium">Cantidad</th>
                      <th className="text-left py-2 text-gray-400 font-medium">Valor</th>
                      <th className="text-left py-2 text-gray-400 font-medium">Warrant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {certificadosCanje.map((certificado) => {
                      const warrant = warrantsActivos.find((w) => w.id === certificado.warrantId)
                      return (
                        <tr key={certificado.id} className="border-b border-[#1a2040]">
                          <td className="py-3 text-white">{certificado.numero}</td>
                          <td className="py-3 text-white">{certificado.fecha}</td>
                          <td className="py-3 text-white">{formatProducto(certificado.producto)}</td>
                          <td className="py-3 text-white">{certificado.cantidad} BLS</td>
                          <td className="py-3 text-white">{formatCurrency(certificado.valor)}</td>
                          <td className="py-3 text-white">{warrant?.numero || "-"}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-400">No hay certificados de canje disponibles</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Función auxiliar para formatear productos
function formatProducto(producto: string): string {
  const map: Record<string, string> = {
    azucar_blanco: "Azúcar Blanco",
    azucar_crudo: "Azúcar Crudo",
    azucar_organico: "Azúcar Orgánico",
  }
  return map[producto] || producto
}
