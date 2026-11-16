"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, Check, Loader2 } from "lucide-react"
import type { Cotizacion, DatosFinca, DatosProductor } from "../types/seguro"
import { enviarSolicitud } from "../services/api-service"

interface ConfirmacionProps {
  datosProductor: DatosProductor
  datosFinca: DatosFinca
  cotizacionSeleccionada: Cotizacion
  onAnterior: () => void
  onFinalizar: () => void
}

export function Confirmacion({
  datosProductor,
  datosFinca,
  cotizacionSeleccionada,
  onAnterior,
  onFinalizar,
}: ConfirmacionProps) {
  const [aceptaTerminos, setAceptaTerminos] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState<{
    exito: boolean
    mensaje: string
    numeroSolicitud?: string
  } | null>(null)

  const handleEnviarSolicitud = async () => {
    if (!aceptaTerminos) return

    setEnviando(true)
    try {
      const respuesta = await enviarSolicitud(datosProductor, datosFinca, cotizacionSeleccionada.aseguradoraId)
      setResultado(respuesta)
    } catch (error) {
      setResultado({
        exito: false,
        mensaje: "Ha ocurrido un error inesperado. Por favor, inténtelo nuevamente.",
      })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Confirmación de Solicitud</CardTitle>
        <CardDescription>Revise los detalles de su solicitud antes de enviarla.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {resultado ? (
          <div
            className={`p-6 rounded-lg ${resultado.exito ? "bg-green-50" : "bg-red-50"} flex flex-col items-center text-center space-y-4`}
          >
            {resultado.exito ? (
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-8 w-8 text-green-600" />
              </div>
            ) : (
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            )}

            <div className="space-y-2">
              <h3 className={`text-xl font-medium ${resultado.exito ? "text-green-800" : "text-red-800"}`}>
                {resultado.exito ? "Solicitud Enviada con Éxito" : "Error al Enviar Solicitud"}
              </h3>
              <p className={resultado.exito ? "text-green-700" : "text-red-700"}>{resultado.mensaje}</p>
              {resultado.numeroSolicitud && (
                <p className="text-green-700 font-medium mt-2">Número de solicitud: {resultado.numeroSolicitud}</p>
              )}
            </div>

            <Button onClick={onFinalizar} variant={resultado.exito ? "default" : "outline"}>
              {resultado.exito ? "Finalizar" : "Volver al Inicio"}
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Datos del Productor</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">Nombre:</div>
                  <div>{datosProductor.nombre}</div>
                  <div className="text-muted-foreground">Documento:</div>
                  <div>{datosProductor.documento}</div>
                  <div className="text-muted-foreground">Teléfono:</div>
                  <div>{datosProductor.telefono}</div>
                  <div className="text-muted-foreground">Email:</div>
                  <div>{datosProductor.email}</div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">Datos de la Finca</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">Nombre:</div>
                  <div>{datosFinca.nombre}</div>
                  <div className="text-muted-foreground">Superficie:</div>
                  <div>{datosFinca.superficie} hectáreas</div>
                  <div className="text-muted-foreground">Tipo de Suelo:</div>
                  <div>{datosFinca.tipoSuelo}</div>
                  <div className="text-muted-foreground">Cultivo Anterior:</div>
                  <div>{datosFinca.cultivoAnterior}</div>
                  <div className="text-muted-foreground">Rendimiento Promedio:</div>
                  <div>{datosFinca.rendimientoPromedio} ton/ha</div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">Detalles de la Cotización</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">Aseguradora:</div>
                  <div>{cotizacionSeleccionada.aseguradoraNombre}</div>
                  <div className="text-muted-foreground">Prima Total:</div>
                  <div className="font-medium">${cotizacionSeleccionada.primaTotal.toLocaleString()}</div>
                  <div className="text-muted-foreground">Suma Asegurada:</div>
                  <div>${cotizacionSeleccionada.sumaAsegurada.toLocaleString()}</div>
                  <div className="text-muted-foreground">Deducible:</div>
                  <div>${cotizacionSeleccionada.deducible.toLocaleString()}</div>
                  <div className="text-muted-foreground">Plazo:</div>
                  <div>{cotizacionSeleccionada.plazo}</div>
                </div>

                <div className="mt-4">
                  <h4 className="font-medium mb-1">Coberturas incluidas:</h4>
                  <ul className="list-disc list-inside text-sm">
                    {cotizacionSeleccionada.coberturas.map((cobertura) => (
                      <li key={cobertura.id}>{cobertura.nombre}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-2 p-4 rounded-lg border bg-muted/30">
              <Checkbox
                id="terminos"
                checked={aceptaTerminos}
                onCheckedChange={(checked) => setAceptaTerminos(checked === true)}
              />
              <div className="space-y-1">
                <Label htmlFor="terminos" className="text-sm font-medium cursor-pointer">
                  Acepto los términos y condiciones
                </Label>
                <p className="text-xs text-muted-foreground">
                  Al marcar esta casilla, confirmo que he leído y acepto los términos y condiciones del seguro, y que la
                  información proporcionada es correcta y verídica.
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
      {!resultado && (
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onAnterior} disabled={enviando}>
            Anterior
          </Button>
          <Button onClick={handleEnviarSolicitud} disabled={!aceptaTerminos || enviando}>
            {enviando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar Solicitud"
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
