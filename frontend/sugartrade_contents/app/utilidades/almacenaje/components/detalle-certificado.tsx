"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  QrCode,
  Package,
  Warehouse,
  FileText,
  Clock,
  History,
  ArrowLeft,
  Truck,
  CheckSquare,
  XSquare,
  SendHorizonal,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { EstadoBadge, TipoBadge } from "./estado-badge"
import { useAlmacenaje } from "../hooks/use-almacenaje"
import type { CertificadoEstado } from "../types"

export function DetalleCertificado() {
  const {
    certificadoSeleccionado,
    warrantSeleccionado,
    setCertificadoSeleccionado,
    reservarCertificado,
    marcarDisponibleCarga,
    marcarOperacionCargada,
    liberarCertificado,
    getTextoEstado,
  } = useAlmacenaje()

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

  // Manejar clic en botón de cambio de estado
  const handleCambioEstado = (accion: string, nuevoEstado: CertificadoEstado) => {
    // Verificar si el certificado ya está en ese estado
    if (certificadoSeleccionado.estado === nuevoEstado) {
      return
    }

    setAccionPendiente(accion)
    setNotas("")
    setDialogoAbierto(true)
  }

  // Confirmar cambio de estado
  const confirmarCambioEstado = async () => {
    if (!certificadoSeleccionado || !accionPendiente) return

    setProcesando(true)

    try {
      let resultado = false
      const usuario = "Usuario Demo" // En una implementación real, obtendríamos el usuario actual

      switch (accionPendiente) {
        case "reservar":
          resultado = await reservarCertificado(certificadoSeleccionado.id, usuario, notas)
          break
        case "disponible-carga":
          resultado = await marcarDisponibleCarga(certificadoSeleccionado.id, usuario, notas)
          break
        case "operacion-cargada":
          resultado = await marcarOperacionCargada(certificadoSeleccionado.id, usuario, notas)
          break
        case "liberar":
          resultado = await liberarCertificado(certificadoSeleccionado.id, usuario, notas)
          break
      }

      if (resultado) {
        setDialogoAbierto(false)
      }
    } finally {
      setProcesando(false)
    }
  }

  // Determinar qué acciones están disponibles según el estado actual
  const getAccionesDisponibles = () => {
    const estadoActual = certificadoSeleccionado.estado

    switch (estadoActual) {
      case "disponible":
        return (
          <>
            <Button
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={() => handleCambioEstado("reservar", "reservado")}
            >
              <Clock className="h-4 w-4 mr-2" />
              Reservar
            </Button>
          </>
        )
      case "reservado":
        return (
          <>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => handleCambioEstado("disponible-carga", "disponible-carga")}
            >
              <Truck className="h-4 w-4 mr-2" />
              Marcar Disponible para Carga
            </Button>
            <Button
              variant="outline"
              className="border-[#1a2040] text-gray-300 hover:bg-[#1a2040] hover:text-white"
              onClick={() => handleCambioEstado("liberar", "disponible")}
            >
              <XSquare className="h-4 w-4 mr-2" />
              Liberar
            </Button>
          </>
        )
      case "disponible-carga":
        return (
          <>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => handleCambioEstado("operacion-cargada", "operacion-cargada")}
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              Marcar Operación Cargada
            </Button>
            <Button
              variant="outline"
              className="border-[#1a2040] text-gray-300 hover:bg-[#1a2040] hover:text-white"
              onClick={() => handleCambioEstado("liberar", "disponible")}
            >
              <XSquare className="h-4 w-4 mr-2" />
              Liberar
            </Button>
          </>
        )
      case "operacion-cargada":
        return null
      default:
        return null
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
                  <EstadoBadge estado={certificadoSeleccionado.estado} className="mt-1" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Tipo:</p>
                  <TipoBadge tipo={certificadoSeleccionado.tipo} className="mt-1" />
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
              <div className="p-4 bg-[#0a0f29] rounded-md border border-[#1a2040]">
                <div className="flex items-center space-x-2 mb-2">
                  <History className="h-5 w-5 text-[#00a8ff]" />
                  <h3 className="text-sm font-medium text-white">Historial de Cambios</h3>
                </div>
                <div className="space-y-3 max-h-[300px] overflow-auto pr-2">
                  {certificadoSeleccionado.historial.length > 0 ? (
                    certificadoSeleccionado.historial.map((item, index) => (
                      <div key={item.id} className="p-3 bg-[#111936] rounded-md border border-[#1a2040]">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs text-gray-400">{formatearFecha(item.fecha)}</span>
                          <span className="text-xs bg-[#1a2040] px-2 py-0.5 rounded text-gray-300">{item.usuario}</span>
                        </div>
                        <div className="mb-1">
                          <p className="text-sm font-medium text-white">{item.accion}</p>
                        </div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs text-gray-400">Cambio de estado:</span>
                          <span className="text-xs text-gray-300">
                            {item.estadoAnterior ? getTextoEstado(item.estadoAnterior) : "Inicial"}
                            {" → "}
                            {getTextoEstado(item.estadoNuevo)}
                          </span>
                        </div>
                        {item.notas && (
                          <div className="mt-1 pt-1 border-t border-[#1a2040]">
                            <p className="text-xs text-gray-400">Notas:</p>
                            <p className="text-xs text-gray-300">{item.notas}</p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400">No hay registros en el historial.</p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="border-t border-[#1a2040] pt-4 flex justify-between">
          <div>
            <Button
              variant="outline"
              className="border-[#1a2040] text-gray-300 hover:bg-[#1a2040] hover:text-white"
              onClick={() => setCertificadoSeleccionado(null)}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver
            </Button>
          </div>
          <div className="flex space-x-2">{getAccionesDisponibles()}</div>
        </CardFooter>
      </Card>

      {/* Diálogo de confirmación para cambio de estado */}
      <Dialog open={dialogoAbierto} onOpenChange={setDialogoAbierto}>
        <DialogContent className="bg-[#111936] text-white border-[#1a2040]">
          <DialogHeader>
            <DialogTitle>Confirmar cambio de estado</DialogTitle>
            <DialogDescription className="text-gray-400">
              {accionPendiente === "reservar" &&
                "Va a reservar este certificado. Una vez reservado, quedará apartado para su uso."}
              {accionPendiente === "disponible-carga" && "Va a marcar este certificado como disponible para carga."}
              {accionPendiente === "operacion-cargada" && "Va a marcar este certificado como operación cargada."}
              {accionPendiente === "liberar" && "Va a liberar este certificado, volviéndolo a su estado disponible."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <QrCode className="h-4 w-4 text-[#00a8ff]" />
                <span className="text-sm font-medium">{certificadoSeleccionado.numero}</span>
              </div>

              <div>
                <label className="text-sm text-gray-400">Notas (opcional):</label>
                <Textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Ingrese notas o comentarios adicionales..."
                  className="mt-1 bg-[#0a0f29] border-[#1a2040] text-white h-24 resize-none"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogoAbierto(false)}
              disabled={procesando}
              className="border-[#1a2040] text-gray-300 hover:bg-[#1a2040] hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmarCambioEstado}
              disabled={procesando}
              className="bg-[#00a8ff] hover:bg-[#00a8ff]/90 text-white"
            >
              {procesando ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Procesando...
                </>
              ) : (
                <>
                  <SendHorizonal className="h-4 w-4 mr-1" />
                  Confirmar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
