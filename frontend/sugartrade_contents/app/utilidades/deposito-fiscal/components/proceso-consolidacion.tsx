"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { Consolidacion, Mercancia, Camion, Documento } from "../types/zona-primaria"
import { FormularioInicio } from "./formulario-inicio-consolidacion"
import { PasosConsolidacion } from "./pasos-consolidacion"
import { FormularioMercancia } from "./formulario-mercancia"
import { toast } from "@/components/ui/use-toast"

interface ProcesoConsolidacionProps {
  consolidacionActual: Consolidacion | null
  iniciarConsolidacion: (camion: Camion, documentos: Documento[]) => Consolidacion
  avanzarPasoConsolidacion: (observaciones?: string) => Consolidacion | null
  registrarPesoEntrada: (peso: number) => Consolidacion | null
  registrarPesoSalida: (peso: number) => Consolidacion | null
  agregarMercancia: (mercancia: Omit<Mercancia, "id">) => Consolidacion | null
  agregarDocumento: (documento: Documento) => Consolidacion | null
  cancelarConsolidacion: () => void
}

export function ProcesoConsolidacion({
  consolidacionActual,
  iniciarConsolidacion,
  avanzarPasoConsolidacion,
  registrarPesoEntrada,
  registrarPesoSalida,
  agregarMercancia,
  agregarDocumento,
  cancelarConsolidacion,
}: ProcesoConsolidacionProps) {
  const [mostrarFormularioMercancia, setMostrarFormularioMercancia] = useState(false)

  const handleIniciarConsolidacion = (camion: Camion, documentos: Documento[]) => {
    iniciarConsolidacion(camion, documentos)
    toast({
      title: "Consolidación iniciada",
      description: "Se ha iniciado el proceso de consolidación.",
    })
  }

  const handleAgregarMercancia = (mercancia: Omit<Mercancia, "id">) => {
    agregarMercancia(mercancia)
    setMostrarFormularioMercancia(false)
    toast({
      title: "Mercancía agregada",
      description: "La mercancía ha sido agregada a la consolidación.",
    })
  }

  const handleCancelarConsolidacion = () => {
    if (confirm("¿Está seguro que desea cancelar esta consolidación? Esta acción no se puede deshacer.")) {
      cancelarConsolidacion()
      toast({
        title: "Consolidación cancelada",
        description: "El proceso de consolidación ha sido cancelado.",
      })
    }
  }

  // Si no hay una consolidación en curso, mostrar el formulario de inicio
  if (!consolidacionActual) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Iniciar Proceso de Consolidación</CardTitle>
          <CardDescription>
            Complete la información inicial para comenzar un nuevo proceso de consolidación.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormularioInicio onSubmit={handleIniciarConsolidacion} />
        </CardContent>
      </Card>
    )
  }

  // Si se está mostrando el formulario de mercancía
  if (mostrarFormularioMercancia) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Agregar Mercancía a la Consolidación</CardTitle>
          <CardDescription>Registre los detalles de la mercancía que será consolidada.</CardDescription>
        </CardHeader>
        <CardContent>
          <FormularioMercancia
            onSubmit={handleAgregarMercancia}
            onCancel={() => setMostrarFormularioMercancia(false)}
          />
        </CardContent>
      </Card>
    )
  }

  // Mostrar el proceso de consolidación en curso
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Proceso de Consolidación en Curso</CardTitle>
          <CardDescription>Siga los pasos para completar el proceso de consolidación.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Información del Camión</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Patente:</p>
                <p className="font-medium">{consolidacionActual.camion.patente}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Conductor:</p>
                <p className="font-medium">{consolidacionActual.camion.conductor}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Empresa:</p>
                <p className="font-medium">{consolidacionActual.camion.empresa}</p>
              </div>
              {consolidacionActual.camion.pesoEntrada && (
                <div>
                  <p className="text-muted-foreground">Peso de entrada:</p>
                  <p className="font-medium">{consolidacionActual.camion.pesoEntrada} kg</p>
                </div>
              )}
              {consolidacionActual.camion.pesoSalida && (
                <div>
                  <p className="text-muted-foreground">Peso de salida:</p>
                  <p className="font-medium">{consolidacionActual.camion.pesoSalida} kg</p>
                </div>
              )}
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">Mercancías ({consolidacionActual.mercancias.length})</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMostrarFormularioMercancia(true)}
                disabled={consolidacionActual.estado !== "descarga-consolidacion"}
              >
                Agregar Mercancía
              </Button>
            </div>

            {consolidacionActual.mercancias.length > 0 ? (
              <div className="border rounded-md divide-y">
                {consolidacionActual.mercancias.map((mercancia) => (
                  <div key={mercancia.id} className="p-3">
                    <p className="font-medium">{mercancia.descripcion}</p>
                    <div className="grid grid-cols-3 gap-2 mt-1 text-sm">
                      <p className="text-muted-foreground">
                        Cantidad: {mercancia.cantidad} {mercancia.unidad}
                      </p>
                      <p className="text-muted-foreground">Peso: {mercancia.peso} kg</p>
                      <p className="text-muted-foreground">Valor: ${mercancia.valor}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4 border rounded-md">
                No hay mercancías registradas en esta consolidación.
              </p>
            )}
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Documentos ({consolidacionActual.documentos.length})</h3>
            {consolidacionActual.documentos.length > 0 ? (
              <div className="border rounded-md divide-y">
                {consolidacionActual.documentos.map((documento, index) => (
                  <div key={index} className="p-3">
                    <p className="font-medium">
                      {documento.tipo.charAt(0).toUpperCase() + documento.tipo.slice(1)}: {documento.numero}
                    </p>
                    {documento.descripcion && (
                      <p className="text-sm text-muted-foreground mt-1">{documento.descripcion}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4 border rounded-md">
                No hay documentos registrados en esta consolidación.
              </p>
            )}
          </div>

          <Alert className="mb-6">
            <AlertTitle>Costo acumulado: ${consolidacionActual.costoTotal}</AlertTitle>
            <AlertDescription>
              Este es el costo acumulado hasta el momento por los servicios de consolidación.
            </AlertDescription>
          </Alert>

          <PasosConsolidacion
            consolidacion={consolidacionActual}
            avanzarPaso={avanzarPasoConsolidacion}
            registrarPesoEntrada={registrarPesoEntrada}
            registrarPesoSalida={registrarPesoSalida}
            agregarDocumento={agregarDocumento}
          />
        </CardContent>
        <CardFooter>
          <Button variant="destructive" onClick={handleCancelarConsolidacion}>
            Cancelar Consolidación
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
