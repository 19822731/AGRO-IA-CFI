"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QrCode, Package, Warehouse, FileText, ArrowLeft, Download } from "lucide-react"
import { useWarrants } from "../hooks/use-warrants"
import { HistorialMovimientos } from "./historial-movimientos"
import type { CertificadoEstado } from "@/app/utilidades/almacenaje/types"

export function DetalleCertificado() {
  const { certificadoSeleccionado, warrantSeleccionado, setCertificadoSeleccionado, obtenerMovimientosEntidad } =
    useWarrants()

  const [tabActiva, setTabActiva] = useState("informacion")
  const [dialogoAbierto, setDialogoAbierto] = useState(false)
  const [accionPendiente, setAccionPendiente] = useState<string | null>(null)
  const [notas, setNotas] = useState("")
  const [procesando, setProcesando] = useState(false)

  if (!certificadoSeleccionado) {
    return (
      <Card className="bg-[#111936] border-[#1a2040]">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <QrCode className="h-16 w-16 text-gray-500 mb-4" />
          <p className="text-gray-400 text-center">Seleccione un certificado para ver sus detalles</p>
        </CardContent>
      </Card>
    )
  }

  // Formatear la fecha
  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha)
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Obtener los movimientos del certificado
  const movimientosCertificado = obtenerMovimientosEntidad(certificadoSeleccionado.id, "certificado")

  // Obtener el texto descriptivo del estado
  const getTextoEstado = (estado: CertificadoEstado): string => {
    switch (estado) {
      case "disponible":
        return "Disponible"
      case "reservado":
        return "Reservado"
      case "disponible-carga":
        return "Disponible para Carga"
      case "operacion-cargada":
        return "Operación Cargada"
      default:
        return "Desconocido"
    }
  }

  return (
    <>
      <Card className="bg-[#111936] border-[#1a2040]">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg text-white">Detalle del Certificado</CardTitle>
              <CardDescription className="text-gray-400">{certificadoSeleccionado.numero}</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-[#1a2040] text-gray-300 hover:bg-[#1a2040] hover:text-white"
              onClick={() => setCertificadoSeleccionado(null)}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-4">
            <div className="p-4 bg-[#0a0f29] rounded-md border border-[#1a2040] w-1/3">
              <div className="flex items-center space-x-2 mb-2">
                <QrCode className="h-5 w-5 text-[#00a8ff]" />
                <h3 className="text-sm font-medium text-white">Código QR</h3>
              </div>
              <div className="bg-white p-6 rounded-md flex items-center justify-center">
                <div className="text-black text-xs font-mono text-center">
                  {certificadoSeleccionado.codigoQR}
                  <div className="mt-2 text-gray-500">(Simulación de código QR)</div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#0a0f29] rounded-md border border-[#1a2040] w-2/3">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="h-5 w-5 text-[#00a8ff]" />
                <h3 className="text-sm font-medium text-white">Información Principal</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Número de Certificado:</p>
                  <p className="text-sm font-medium text-white">{certificadoSeleccionado.numero}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Número de Bolsas:</p>
                  <p className="text-sm font-medium text-white">{certificadoSeleccionado.bolsas} BLS</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Estado:</p>
                  <p className="text-sm font-medium text-white">{getTextoEstado(certificadoSeleccionado.estado)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Tipo:</p>
                  <p className="text-sm font-medium text-white capitalize">{certificadoSeleccionado.tipo}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Fecha de Creación:</p>
                  <p className="text-sm text-white">{formatearFecha(certificadoSeleccionado.fechaCreacion)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Última Modificación:</p>
                  <p className="text-sm text-white">{formatearFecha(certificadoSeleccionado.fechaModificacion)}</p>
                </div>
              </div>
            </div>
          </div>

          <Tabs value={tabActiva} onValueChange={setTabActiva} className="w-full">
            <TabsList className="bg-[#0a0f29] border border-[#1a2040]">
              <TabsTrigger
                value="informacion"
                className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-white"
              >
                Información
              </TabsTrigger>
              <TabsTrigger value="warrant" className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-white">
                Warrant
              </TabsTrigger>
              <TabsTrigger
                value="historial"
                className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-white"
              >
                Historial
              </TabsTrigger>
            </TabsList>

            <TabsContent value="informacion" className="mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#0a0f29] rounded-md border border-[#1a2040]">
                  <div className="flex items-center space-x-2 mb-2">
                    <Warehouse className="h-5 w-5 text-[#00a8ff]" />
                    <h3 className="text-sm font-medium text-white">Información del Depósito</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-400">Nombre del Depósito:</p>
                      <p className="text-sm font-medium text-white">{certificadoSeleccionado.deposito}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-[#0a0f29] rounded-md border border-[#1a2040]">
                  <div className="flex items-center space-x-2 mb-2">
                    <Package className="h-5 w-5 text-[#00a8ff]" />
                    <h3 className="text-sm font-medium text-white">Información del Ingenio</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-400">Nombre del Ingenio:</p>
                      <p className="text-sm font-medium text-white">{certificadoSeleccionado.ingenio}</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="warrant" className="mt-4">
              <div className="p-4 bg-[#0a0f29] rounded-md border border-[#1a2040]">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="h-5 w-5 text-[#00a8ff]" />
                  <h3 className="text-sm font-medium text-white">Información del Warrant</h3>
                </div>
                {warrantSeleccionado ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400">Número de Warrant:</p>
                      <p className="text-sm font-medium text-white">{warrantSeleccionado.numero}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Total de Bolsas:</p>
                      <p className="text-sm font-medium text-white">{warrantSeleccionado.bolsasTotal} BLS</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Fecha de Emisión:</p>
                      <p className="text-sm text-white">{formatearFecha(warrantSeleccionado.fechaEmision)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Fecha de Vencimiento:</p>
                      <p className="text-sm text-white">{formatearFecha(warrantSeleccionado.fechaVencimiento)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Estado del Warrant:</p>
                      <p className="text-sm font-medium text-white capitalize">{warrantSeleccionado.estado}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Certificados Asociados:</p>
                      <p className="text-sm text-white">{warrantSeleccionado.certificados.length}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400">No se encontró información del warrant.</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="historial" className="mt-4">
              <Card className="bg-[#0a0f29] border-[#1a2040]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-white">Historial de Movimientos</CardTitle>
                </CardHeader>
                <CardContent>
                  <HistorialMovimientos movimientos={movimientosCertificado} mostrarFiltros={false} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="border-t border-[#1a2040] pt-4 flex justify-between">
          <Button
            variant="outline"
            className="border-[#1a2040] text-gray-300 hover:bg-[#1a2040] hover:text-white"
            onClick={() => setCertificadoSeleccionado(null)}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
          <div className="flex space-x-2">
            <Button className="bg-[#00a8ff] hover:bg-[#00a8ff]/90 text-white">
              <Download className="h-4 w-4 mr-1" />
              Descargar PDF
            </Button>
          </div>
        </CardFooter>
      </Card>
    </>
  )
}
