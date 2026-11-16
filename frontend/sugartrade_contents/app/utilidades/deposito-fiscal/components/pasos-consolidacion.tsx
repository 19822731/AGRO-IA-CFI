"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Consolidacion, Documento, EstadoConsolidacion } from "../types/zona-primaria"
import { CheckCircle, Circle, ArrowRight } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface PasosConsolidacionProps {
  consolidacion: Consolidacion
  avanzarPaso: (observaciones?: string) => Consolidacion | null
  registrarPesoEntrada: (peso: number) => Consolidacion | null
  registrarPesoSalida: (peso: number) => Consolidacion | null
  agregarDocumento: (documento: Documento) => Consolidacion | null
}

export function PasosConsolidacion({
  consolidacion,
  avanzarPaso,
  registrarPesoEntrada,
  registrarPesoSalida,
  agregarDocumento,
}: PasosConsolidacionProps) {
  const [observaciones, setObservaciones] = useState("")
  const [pesoEntrada, setPesoEntrada] = useState("")
  const [pesoSalida, setPesoSalida] = useState("")
  const [nuevoDocumento, setNuevoDocumento] = useState<Partial<Documento>>({
    tipo: "packing-list",
    numero: "",
    descripcion: "",
  })

  const pasos: { id: EstadoConsolidacion; titulo: string; descripcion: string; costo?: number }[] = [
    {
      id: "ingreso",
      titulo: "Ingreso a Zona Primaria",
      descripcion: "Registro del ingreso del camión a la zona primaria.",
      costo: 40,
    },
    {
      id: "pesaje-entrada",
      titulo: "Pesaje de Entrada",
      descripcion: "Registro del peso del camión al ingresar a la zona primaria.",
      costo: 30,
    },
    {
      id: "descarga-consolidacion",
      titulo: "Descarga y Consolidación",
      descripcion: "Proceso de descarga y consolidación de la mercancía.",
    },
    {
      id: "control-verificacion",
      titulo: "Control y Verificación",
      descripcion: "Verificación de la mercancía según la documentación.",
    },
    {
      id: "documentacion",
      titulo: "Documentación",
      descripcion: "Registro de la documentación de la consolidación.",
    },
    {
      id: "despacho",
      titulo: "Despacho del Camión",
      descripcion: "Proceso de despacho del camión una vez finalizada la consolidación.",
      costo: 50,
    },
    {
      id: "pesaje-salida",
      titulo: "Pesaje de Salida",
      descripcion: "Registro del peso del camión al salir de la zona primaria.",
      costo: 30,
    },
    {
      id: "salida",
      titulo: "Salida de Zona Primaria",
      descripcion: "Registro de la salida del camión de la zona primaria.",
      costo: 30,
    },
    {
      id: "completada",
      titulo: "Consolidación Completada",
      descripcion: "El proceso de consolidación ha sido completado exitosamente.",
    },
  ]

  const handleAvanzarPaso = () => {
    avanzarPaso(observaciones)
    setObservaciones("")
    toast({
      title: "Paso completado",
      description: "Se ha avanzado al siguiente paso del proceso de consolidación.",
    })
  }

  const handleRegistrarPesoEntrada = () => {
    if (!pesoEntrada || isNaN(Number(pesoEntrada)) || Number(pesoEntrada) <= 0) {
      toast({
        title: "Error",
        description: "Debe ingresar un peso válido.",
        variant: "destructive",
      })
      return
    }

    registrarPesoEntrada(Number(pesoEntrada))
    toast({
      title: "Peso registrado",
      description: `Se ha registrado el peso de entrada: ${pesoEntrada} kg.`,
    })
  }

  const handleRegistrarPesoSalida = () => {
    if (!pesoSalida || isNaN(Number(pesoSalida)) || Number(pesoSalida) <= 0) {
      toast({
        title: "Error",
        description: "Debe ingresar un peso válido.",
        variant: "destructive",
      })
      return
    }

    registrarPesoSalida(Number(pesoSalida))
    toast({
      title: "Peso registrado",
      description: `Se ha registrado el peso de salida: ${pesoSalida} kg.`,
    })
  }

  const handleAgregarDocumento = () => {
    if (!nuevoDocumento.numero) {
      toast({
        title: "Error",
        description: "Debe ingresar un número de documento.",
        variant: "destructive",
      })
      return
    }

    agregarDocumento(nuevoDocumento as Documento)
    setNuevoDocumento({
      tipo: "packing-list",
      numero: "",
      descripcion: "",
    })
    toast({
      title: "Documento agregado",
      description: "El documento ha sido agregado a la consolidación.",
    })
  }

  const getPasoActual = () => {
    return pasos.findIndex((paso) => paso.id === consolidacion.estado)
  }

  const renderContenidoPaso = () => {
    switch (consolidacion.estado) {
      case "ingreso":
        return (
          <div className="space-y-4">
            <p>El ingreso del camión a la Zona Primaria para realizar la consolidación tiene un costo de USD 40.</p>
            <div>
              <label className="block text-sm font-medium mb-1">Observaciones (opcional)</label>
              <Textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Ingrese observaciones sobre el ingreso del camión"
                className="w-full"
              />
            </div>
            <Button onClick={handleAvanzarPaso}>Confirmar Ingreso</Button>
          </div>
        )

      case "pesaje-entrada":
        return (
          <div className="space-y-4">
            <p>
              Se requiere el pesaje del camión al ingresar a la Zona Primaria. Este servicio tiene un costo de USD 30.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Peso de entrada (kg)</label>
                <Input
                  type="number"
                  value={pesoEntrada}
                  onChange={(e) => setPesoEntrada(e.target.value)}
                  placeholder="Ingrese el peso en kg"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleRegistrarPesoEntrada}>Registrar Peso</Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Observaciones (opcional)</label>
              <Textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Ingrese observaciones sobre el pesaje"
                className="w-full"
              />
            </div>
            <Button onClick={handleAvanzarPaso} disabled={!consolidacion.camion.pesoEntrada}>
              Confirmar Pesaje
            </Button>
          </div>
        )

      case "descarga-consolidacion":
        return (
          <div className="space-y-4">
            <p>
              Registre las mercancías que serán consolidadas en este camión. Puede agregar los detalles de cada bulto o
              ítem utilizando el botón "Agregar Mercancía".
            </p>
            <div>
              <label className="block text-sm font-medium mb-1">Observaciones (opcional)</label>
              <Textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Ingrese observaciones sobre la descarga y consolidación"
                className="w-full"
              />
            </div>
            <Button onClick={handleAvanzarPaso}>Completar Descarga y Consolidación</Button>
          </div>
        )

      case "control-verificacion":
        return (
          <div className="space-y-4">
            <p>
              Una vez completada la carga y consolidación, se debe realizar el control y la verificación de la mercancía
              según la documentación.
            </p>
            <div>
              <label className="block text-sm font-medium mb-1">Observaciones (opcional)</label>
              <Textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Ingrese observaciones sobre el control y verificación"
                className="w-full"
              />
            </div>
            <Button onClick={handleAvanzarPaso}>Confirmar Control y Verificación</Button>
          </div>
        )

      case "documentacion":
        return (
          <div className="space-y-4">
            <p>Adjunte o registre los documentos de la consolidación (lista de carga, precintos de seguridad, etc.).</p>
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Documento</label>
                <Select
                  value={nuevoDocumento.tipo}
                  onValueChange={(value) => setNuevoDocumento({ ...nuevoDocumento, tipo: value as Documento["tipo"] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el tipo de documento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="packing-list">Lista de Carga (Packing List)</SelectItem>
                    <SelectItem value="precinto">Precinto de Seguridad</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Número de Documento</label>
                <Input
                  value={nuevoDocumento.numero}
                  onChange={(e) => setNuevoDocumento({ ...nuevoDocumento, numero: e.target.value })}
                  placeholder="Ingrese el número del documento"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción (opcional)</label>
                <Input
                  value={nuevoDocumento.descripcion || ""}
                  onChange={(e) => setNuevoDocumento({ ...nuevoDocumento, descripcion: e.target.value })}
                  placeholder="Ingrese una descripción del documento"
                />
              </div>
              <Button onClick={handleAgregarDocumento}>Agregar Documento</Button>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Observaciones (opcional)</label>
              <Textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Ingrese observaciones sobre la documentación"
                className="w-full"
              />
            </div>
            <Button onClick={handleAvanzarPaso}>Completar Documentación</Button>
          </div>
        )

      case "despacho":
        return (
          <div className="space-y-4">
            <p>
              Una vez finalizada la consolidación y la documentación, se procede al despacho del camión. Este servicio
              tiene un costo de USD 50.
            </p>
            <div>
              <label className="block text-sm font-medium mb-1">Observaciones (opcional)</label>
              <Textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Ingrese observaciones sobre el despacho"
                className="w-full"
              />
            </div>
            <Button onClick={handleAvanzarPaso}>Confirmar Despacho</Button>
          </div>
        )

      case "pesaje-salida":
        return (
          <div className="space-y-4">
            <p>
              Se requiere el pesaje del camión al salir de la Zona Primaria. Este servicio tiene un costo de USD 30.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Peso de salida (kg)</label>
                <Input
                  type="number"
                  value={pesoSalida}
                  onChange={(e) => setPesoSalida(e.target.value)}
                  placeholder="Ingrese el peso en kg"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleRegistrarPesoSalida}>Registrar Peso</Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Observaciones (opcional)</label>
              <Textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Ingrese observaciones sobre el pesaje"
                className="w-full"
              />
            </div>
            <Button onClick={handleAvanzarPaso} disabled={!consolidacion.camion.pesoSalida}>
              Confirmar Pesaje
            </Button>
          </div>
        )

      case "salida":
        return (
          <div className="space-y-4">
            <p>El camión está listo para salir de la Zona Primaria. Este servicio tiene un costo de USD 30.</p>
            <div>
              <label className="block text-sm font-medium mb-1">Observaciones (opcional)</label>
              <Textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Ingrese observaciones sobre la salida"
                className="w-full"
              />
            </div>
            <Button onClick={handleAvanzarPaso}>Confirmar Salida</Button>
          </div>
        )

      case "completada":
        return (
          <div className="space-y-4">
            <p>El proceso de consolidación ha sido completado exitosamente.</p>
            <div className="p-4 bg-green-50 rounded-md border border-green-200">
              <h4 className="font-medium text-green-800 mb-2">Resumen de Costos</h4>
              <p className="text-green-700">
                El costo total por este proceso de consolidación es de USD {consolidacion.costoTotal}.
              </p>
              <ul className="mt-2 space-y-1 text-sm text-green-700">
                <li>Ingreso a Zona Primaria: USD 40</li>
                <li>Pesaje de Entrada: USD 30</li>
                <li>Despacho: USD 50</li>
                <li>Pesaje de Salida: USD 30</li>
                <li>Salida de Zona Primaria: USD 30</li>
              </ul>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Pasos del Proceso de Consolidación</h3>

      <div className="space-y-6">
        {pasos.map((paso, index) => {
          const esPasoActual = paso.id === consolidacion.estado
          const esPasoCompletado = consolidacion.pasos[paso.id]?.completado || false
          const esPasoFuturo = index > getPasoActual()

          return (
            <div
              key={paso.id}
              className={`p-4 rounded-md border ${
                esPasoActual
                  ? "border-blue-200 bg-blue-50"
                  : esPasoCompletado
                    ? "border-green-200 bg-green-50"
                    : "border-gray-200"
              }`}
            >
              <div className="flex items-start">
                <div className="mr-3 mt-0.5">
                  {esPasoCompletado ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : esPasoActual ? (
                    <ArrowRight className="h-5 w-5 text-blue-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-300" />
                  )}
                </div>
                <div className="flex-1">
                  <h4
                    className={`font-medium ${
                      esPasoActual
                        ? "text-blue-700"
                        : esPasoCompletado
                          ? "text-green-700"
                          : esPasoFuturo
                            ? "text-gray-400"
                            : "text-gray-700"
                    }`}
                  >
                    {paso.titulo}
                    {paso.costo && ` (USD ${paso.costo})`}
                  </h4>
                  <p
                    className={`text-sm ${
                      esPasoActual
                        ? "text-blue-600"
                        : esPasoCompletado
                          ? "text-green-600"
                          : esPasoFuturo
                            ? "text-gray-400"
                            : "text-gray-500"
                    }`}
                  >
                    {paso.descripcion}
                  </p>

                  {esPasoCompletado && consolidacion.pasos[paso.id]?.fechaHora && (
                    <p className="text-xs text-green-600 mt-1">
                      Completado el {new Date(consolidacion.pasos[paso.id]?.fechaHora as Date).toLocaleString()}
                    </p>
                  )}

                  {esPasoCompletado && consolidacion.pasos[paso.id]?.observaciones && (
                    <p className="text-xs text-green-600 mt-1">
                      Observaciones: {consolidacion.pasos[paso.id]?.observaciones}
                    </p>
                  )}
                </div>
              </div>

              {esPasoActual && <div className="mt-4 pl-8">{renderContenidoPaso()}</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
