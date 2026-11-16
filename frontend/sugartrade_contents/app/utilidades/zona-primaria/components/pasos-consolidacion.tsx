"use client"

import { useState } from "react"
import { useZonaPrimaria } from "../hooks/use-zona-primaria"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { PasoConsolidacion } from "../types"
import { CheckCircle, Circle } from "lucide-react"

export default function PasosConsolidacion() {
  const { pasos, completarPaso } = useZonaPrimaria()
  const [pasoActual, setPasoActual] = useState<PasoConsolidacion | null>(null)
  const [datos, setDatos] = useState<any>({})

  const handleSeleccionarPaso = (paso: PasoConsolidacion) => {
    if (paso.completado) return

    // Verificar si hay pasos anteriores sin completar
    const pasoIndex = pasos.findIndex((p) => p.id === paso.id)
    const pasoAnteriorIncompleto = pasos.slice(0, pasoIndex).some((p) => !p.completado)

    if (pasoAnteriorIncompleto) {
      alert("Debes completar los pasos anteriores primero")
      return
    }

    setPasoActual(paso)
    setDatos({})
  }

  const handleCompletarPaso = () => {
    if (!pasoActual) return

    completarPaso(pasoActual.id, datos)
    setPasoActual(null)
    setDatos({})
  }

  const renderFormularioPaso = () => {
    if (!pasoActual) return null

    switch (pasoActual.id) {
      case "1": // Ingreso a Zona Primaria
        return (
          <div className="space-y-4">
            <p>
              El ingreso del camión a la Zona Primaria para realizar la consolidación tiene un costo de USD{" "}
              {pasoActual.costo}.
            </p>
            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones (opcional)</Label>
              <Textarea
                id="observaciones"
                value={datos.observaciones || ""}
                onChange={(e) => setDatos({ ...datos, observaciones: e.target.value })}
                placeholder="Ingrese observaciones si las hay"
              />
            </div>
          </div>
        )

      case "2": // Pesaje de Entrada
        return (
          <div className="space-y-4">
            <p>
              Se requiere el pesaje del camión al ingresar a la Zona Primaria. Una vez realizado el pesaje, este
              servicio tiene un costo de USD {pasoActual.costo}.
            </p>
            <div className="space-y-2">
              <Label htmlFor="peso">Peso de Entrada (kg) *</Label>
              <Input
                id="peso"
                type="number"
                value={datos.peso || ""}
                onChange={(e) => setDatos({ ...datos, peso: Number.parseFloat(e.target.value) })}
                placeholder="Ej. 15000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones (opcional)</Label>
              <Textarea
                id="observaciones"
                value={datos.observaciones || ""}
                onChange={(e) => setDatos({ ...datos, observaciones: e.target.value })}
                placeholder="Ingrese observaciones si las hay"
              />
            </div>
          </div>
        )

      case "3": // Descarga y Consolidación
        return (
          <div className="space-y-4">
            <p>
              Registra las mercancías que serán consolidadas en este camión utilizando el formulario de "Agregar
              Mercancía" en la sección superior.
            </p>
            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones (opcional)</Label>
              <Textarea
                id="observaciones"
                value={datos.observaciones || ""}
                onChange={(e) => setDatos({ ...datos, observaciones: e.target.value })}
                placeholder="Ingrese observaciones si las hay"
              />
            </div>
          </div>
        )

      case "4": // Control y Verificación
        return (
          <div className="space-y-4">
            <p>Confirma que se ha realizado el control y la verificación de la mercancía según la documentación.</p>
            <div className="space-y-2">
              <Label htmlFor="verificadoPor">Verificado por *</Label>
              <Input
                id="verificadoPor"
                value={datos.verificadoPor || ""}
                onChange={(e) => setDatos({ ...datos, verificadoPor: e.target.value })}
                placeholder="Nombre del responsable"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones (opcional)</Label>
              <Textarea
                id="observaciones"
                value={datos.observaciones || ""}
                onChange={(e) => setDatos({ ...datos, observaciones: e.target.value })}
                placeholder="Ingrese observaciones si las hay"
              />
            </div>
          </div>
        )

      case "5": // Documentación
        return (
          <div className="space-y-4">
            <p>Registra los documentos de la consolidación.</p>
            <div className="space-y-2">
              <Label htmlFor="listaCarga">Lista de Carga Consolidada (Packing List) *</Label>
              <Input
                id="listaCarga"
                value={datos.listaCarga || ""}
                onChange={(e) =>
                  setDatos({
                    ...datos,
                    documentos: {
                      ...datos.documentos,
                      listaCarga: e.target.value,
                    },
                  })
                }
                placeholder="Número de referencia"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="precintos">Precintos de Seguridad *</Label>
              <Input
                id="precintos"
                value={datos.precintos || ""}
                onChange={(e) =>
                  setDatos({
                    ...datos,
                    documentos: {
                      ...datos.documentos,
                      precintos: e.target.value.split(",").map((p: string) => p.trim()),
                    },
                  })
                }
                placeholder="Números separados por comas"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones (opcional)</Label>
              <Textarea
                id="observaciones"
                value={datos.observaciones || ""}
                onChange={(e) => setDatos({ ...datos, observaciones: e.target.value })}
                placeholder="Ingrese observaciones si las hay"
              />
            </div>
          </div>
        )

      case "6": // Despacho del Camión
        return (
          <div className="space-y-4">
            <p>
              Una vez finalizada la consolidación y la documentación, se procede al despacho del camión. Este servicio
              tiene un costo de USD {pasoActual.costo}.
            </p>
            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones (opcional)</Label>
              <Textarea
                id="observaciones"
                value={datos.observaciones || ""}
                onChange={(e) => setDatos({ ...datos, observaciones: e.target.value })}
                placeholder="Ingrese observaciones si las hay"
              />
            </div>
          </div>
        )

      case "7": // Pesaje de Salida
        return (
          <div className="space-y-4">
            <p>
              Se requiere el pesaje del camión al salir de la Zona Primaria. Este servicio tiene un costo de USD{" "}
              {pasoActual.costo}.
            </p>
            <div className="space-y-2">
              <Label htmlFor="peso">Peso de Salida (kg) *</Label>
              <Input
                id="peso"
                type="number"
                value={datos.peso || ""}
                onChange={(e) => setDatos({ ...datos, peso: Number.parseFloat(e.target.value) })}
                placeholder="Ej. 18000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones (opcional)</Label>
              <Textarea
                id="observaciones"
                value={datos.observaciones || ""}
                onChange={(e) => setDatos({ ...datos, observaciones: e.target.value })}
                placeholder="Ingrese observaciones si las hay"
              />
            </div>
          </div>
        )

      case "8": // Salida de Zona Primaria
        return (
          <div className="space-y-4">
            <p>
              El camión está listo para salir de la Zona Primaria. Confirma la salida para completar el proceso de
              consolidación.
            </p>
            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones (opcional)</Label>
              <Textarea
                id="observaciones"
                value={datos.observaciones || ""}
                onChange={(e) => setDatos({ ...datos, observaciones: e.target.value })}
                placeholder="Ingrese observaciones si las hay"
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const isFormValid = () => {
    if (!pasoActual) return false

    switch (pasoActual.id) {
      case "2": // Pesaje de Entrada
        return !!datos.peso
      case "4": // Control y Verificación
        return !!datos.verificadoPor
      case "5": // Documentación
        return !!(datos.documentos?.listaCarga && datos.documentos?.precintos)
      case "7": // Pesaje de Salida
        return !!datos.peso
      default:
        return true
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pasos del Proceso de Consolidación</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            {pasos.map((paso) => (
              <div
                key={paso.id}
                className={`flex items-center p-3 rounded-md cursor-pointer ${
                  paso.completado
                    ? "bg-green-50"
                    : pasoActual?.id === paso.id
                      ? "bg-blue-50 border border-blue-200"
                      : "hover:bg-gray-50"
                }`}
                onClick={() => handleSeleccionarPaso(paso)}
              >
                <div className="mr-3">
                  {paso.completado ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-300" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${paso.completado ? "text-green-700" : ""}`}>{paso.titulo}</p>
                  <p className="text-sm text-gray-500">{paso.descripcion}</p>
                  {paso.costo && <p className="text-sm font-medium mt-1">Costo: USD {paso.costo}</p>}
                </div>
                {paso.fechaCompletado && (
                  <div className="text-xs text-gray-500">{paso.fechaCompletado.toLocaleTimeString()}</div>
                )}
              </div>
            ))}
          </div>

          {pasoActual && (
            <div className="border p-4 rounded-md">
              <h3 className="text-lg font-semibold mb-3">{pasoActual.titulo}</h3>
              {renderFormularioPaso()}
              <div className="flex justify-end mt-4 gap-2">
                <Button variant="outline" onClick={() => setPasoActual(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleCompletarPaso} disabled={!isFormValid()}>
                  Completar Paso
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
