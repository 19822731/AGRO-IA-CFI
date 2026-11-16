"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, ArrowLeft, Download, QrCode } from "lucide-react"
import { useWarrants } from "../hooks/use-warrants"
import { CertificadosTable } from "./certificados-table"
import { HistorialMovimientos } from "./historial-movimientos"

export function DetalleWarrant() {
  const { warrantSeleccionado, setWarrantSeleccionado, obtenerMovimientosEntidad } = useWarrants()

  if (!warrantSeleccionado) {
    return (
      <Card className="bg-[#111936] border-[#1a2040]">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <FileText className="h-16 w-16 text-gray-500 mb-4" />
          <p className="text-gray-400 text-center">Seleccione un warrant para ver sus detalles</p>
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
    }).format(date)
  }

  // Obtener los movimientos del warrant
  const movimientosWarrant = obtenerMovimientosEntidad(warrantSeleccionado.id, "warrant")

  return (
    <Card className="bg-[#111936] border-[#1a2040]">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg text-white">Detalle del Warrant</CardTitle>
            <CardDescription className="text-gray-400">{warrantSeleccionado.numero}</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-[#1a2040] text-gray-300 hover:bg-[#1a2040] hover:text-white"
            onClick={() => setWarrantSeleccionado(null)}
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
                {warrantSeleccionado.numero}
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
                <p className="text-xs text-gray-400">Número de Warrant:</p>
                <p className="text-sm font-medium text-white">{warrantSeleccionado.numero}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Número de Bolsas:</p>
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
                <p className="text-xs text-gray-400">Estado:</p>
                <p className="text-sm font-medium text-white capitalize">{warrantSeleccionado.estado}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Certificados Asociados:</p>
                <p className="text-sm text-white">{warrantSeleccionado.certificados.length}</p>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="certificados" className="w-full">
          <TabsList className="bg-[#0a0f29] border border-[#1a2040]">
            <TabsTrigger
              value="certificados"
              className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-white"
            >
              Certificados
            </TabsTrigger>
            <TabsTrigger value="historial" className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-white">
              Historial
            </TabsTrigger>
          </TabsList>

          <TabsContent value="certificados" className="mt-4">
            <CertificadosTable titulo="Certificados Asociados" warrantId={warrantSeleccionado.id} mostrarTodos={true} />
          </TabsContent>

          <TabsContent value="historial" className="mt-4">
            <Card className="bg-[#0a0f29] border-[#1a2040]">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-white">Historial de Movimientos</CardTitle>
              </CardHeader>
              <CardContent>
                <HistorialMovimientos movimientos={movimientosWarrant} mostrarFiltros={false} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t border-[#1a2040] pt-4 flex justify-between">
        <Button
          variant="outline"
          className="border-[#1a2040] text-gray-300 hover:bg-[#1a2040] hover:text-white"
          onClick={() => setWarrantSeleccionado(null)}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver
        </Button>
        <Button className="bg-[#00a8ff] hover:bg-[#00a8ff]/90 text-white">
          <Download className="h-4 w-4 mr-1" />
          Descargar PDF
        </Button>
      </CardFooter>
    </Card>
  )
}
