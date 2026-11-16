"use client"

import { useState } from "react"
import { useZonaPrimaria } from "../hooks/use-zona-primaria"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { Camion } from "../types"
import PasosConsolidacion from "./pasos-consolidacion"
import FormularioMercancia from "./formulario-mercancia"

export default function ProcesoConsolidacion() {
  const { zonaPrimaria, consolidacionActual, iniciarConsolidacion, cancelarConsolidacion, calcularCostoTotal } =
    useZonaPrimaria()

  const [camion, setCamion] = useState<Partial<Camion>>({
    patente: "",
    chofer: "",
    empresa: "",
  })
  const [manifiestoNumero, setManifiestoNumero] = useState("")
  const [documentoTransporte, setDocumentoTransporte] = useState("")
  const [mostrarFormularioMercancia, setMostrarFormularioMercancia] = useState(false)

  const handleIniciarConsolidacion = () => {
    if (!camion.patente || !camion.chofer || !camion.empresa) {
      return
    }

    iniciarConsolidacion(camion as Camion, manifiestoNumero || undefined, documentoTransporte || undefined)
  }

  if (zonaPrimaria.estado !== "habilitada" && !consolidacionActual) {
    return (
      <Alert>
        <AlertTitle>Zona Primaria no habilitada</AlertTitle>
        <AlertDescription>
          Para realizar consolidaciones, la Zona Primaria debe estar habilitada por la Aduana. Por favor, completa el
          proceso de habilitación antes de continuar.
        </AlertDescription>
      </Alert>
    )
  }

  if (consolidacionActual) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Proceso de Consolidación en Curso</CardTitle>
            <CardDescription>
              Consolidación #{consolidacionActual.id} - Camión: {consolidacionActual.camion.patente}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="font-semibold">Chofer:</p>
                <p>{consolidacionActual.camion.chofer}</p>
              </div>
              <div>
                <p className="font-semibold">Empresa:</p>
                <p>{consolidacionActual.camion.empresa}</p>
              </div>
              <div>
                <p className="font-semibold">Hora de entrada:</p>
                <p>{consolidacionActual.camion.horaEntrada?.toLocaleTimeString()}</p>
              </div>
              <div>
                <p className="font-semibold">Estado:</p>
                <p className="capitalize">{consolidacionActual.estado.replace("_", " ")}</p>
              </div>
              {consolidacionActual.manifiestoNumero && (
                <div>
                  <p className="font-semibold">Número de Manifiesto:</p>
                  <p>{consolidacionActual.manifiestoNumero}</p>
                </div>
              )}
              {consolidacionActual.documentoTransporte && (
                <div>
                  <p className="font-semibold">Documento de Transporte:</p>
                  <p>{consolidacionActual.documentoTransporte}</p>
                </div>
              )}
            </div>

            <Separator className="my-4" />

            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Mercancías</h3>
              {consolidacionActual.mercancias.length === 0 ? (
                <p className="text-gray-500">No hay mercancías registradas</p>
              ) : (
                <div className="space-y-2">
                  {consolidacionActual.mercancias.map((mercancia) => (
                    <div key={mercancia.id} className="border p-3 rounded-md">
                      <div className="flex justify-between">
                        <p className="font-medium">{mercancia.descripcion}</p>
                        <p>
                          {mercancia.cantidad} {mercancia.unidad}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500">Peso: {mercancia.peso} kg</p>
                    </div>
                  ))}
                </div>
              )}

              <Button
                onClick={() => setMostrarFormularioMercancia(!mostrarFormularioMercancia)}
                variant="outline"
                className="mt-2"
              >
                {mostrarFormularioMercancia ? "Cancelar" : "Agregar Mercancía"}
              </Button>

              {mostrarFormularioMercancia && (
                <div className="mt-4">
                  <FormularioMercancia
                    onCancel={() => setMostrarFormularioMercancia(false)}
                    onComplete={() => setMostrarFormularioMercancia(false)}
                  />
                </div>
              )}
            </div>

            <Separator className="my-4" />

            <div>
              <h3 className="text-lg font-semibold mb-2">Costo Total</h3>
              <p className="text-xl font-bold">USD {calcularCostoTotal()}</p>
              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                <p>Ingreso a Zona Primaria: USD {consolidacionActual.costoDesglosado.ingreso}</p>
                <p>Pesaje de Entrada: USD {consolidacionActual.costoDesglosado.pesajeEntrada}</p>
                <p>Despacho del Camión: USD {consolidacionActual.costoDesglosado.despacho}</p>
                <p>Pesaje de Salida: USD {consolidacionActual.costoDesglosado.pesajeSalida}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={cancelarConsolidacion} variant="destructive">
              Cancelar Consolidación
            </Button>
          </CardFooter>
        </Card>

        <PasosConsolidacion />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Iniciar Proceso de Consolidación</CardTitle>
        <CardDescription>
          Ingresa los datos del camión y la documentación para iniciar el proceso de consolidación en la Zona Primaria.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patente">Patente del Camión *</Label>
              <Input
                id="patente"
                value={camion.patente}
                onChange={(e) => setCamion({ ...camion, patente: e.target.value })}
                placeholder="Ej. AB123CD"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chofer">Nombre del Chofer *</Label>
              <Input
                id="chofer"
                value={camion.chofer}
                onChange={(e) => setCamion({ ...camion, chofer: e.target.value })}
                placeholder="Nombre completo"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="empresa">Empresa de Transporte *</Label>
            <Input
              id="empresa"
              value={camion.empresa}
              onChange={(e) => setCamion({ ...camion, empresa: e.target.value })}
              placeholder="Nombre de la empresa"
            />
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="manifiesto">Número de Manifiesto de Carga (opcional)</Label>
              <Input
                id="manifiesto"
                value={manifiestoNumero}
                onChange={(e) => setManifiestoNumero(e.target.value)}
                placeholder="Ej. MNF-12345"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="documento">Número de Documento de Transporte (opcional)</Label>
              <Input
                id="documento"
                value={documentoTransporte}
                onChange={(e) => setDocumentoTransporte(e.target.value)}
                placeholder="Ej. BL-67890"
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleIniciarConsolidacion} disabled={!camion.patente || !camion.chofer || !camion.empresa}>
          Iniciar Consolidación
        </Button>
      </CardFooter>
    </Card>
  )
}
