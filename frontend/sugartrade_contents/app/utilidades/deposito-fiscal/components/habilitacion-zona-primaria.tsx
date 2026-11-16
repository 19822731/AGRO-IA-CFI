"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import type { ZonaPrimaria, EstadoHabilitacion } from "../types/zona-primaria"
import { CheckCircle, AlertCircle, Clock, HelpCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface HabilitacionZonaPrimariaProps {
  zonaPrimaria: ZonaPrimaria
  actualizarEstadoHabilitacion: (estado: EstadoHabilitacion) => void
  actualizarRequisito: (requisito: keyof ZonaPrimaria["requisitosCompletados"], completado: boolean) => void
  iniciarProcesoHabilitacion: () => void
  completarProcesoHabilitacion: () => boolean
  todosRequisitosCompletados: () => boolean
  cargando: boolean
}

export function HabilitacionZonaPrimaria({
  zonaPrimaria,
  actualizarEstadoHabilitacion,
  actualizarRequisito,
  iniciarProcesoHabilitacion,
  completarProcesoHabilitacion,
  todosRequisitosCompletados,
  cargando,
}: HabilitacionZonaPrimariaProps) {
  const [respuestaHabilitacion, setRespuestaHabilitacion] = useState<"si" | "no" | "no-seguro" | null>(null)
  const [mostrarRequisitos, setMostrarRequisitos] = useState(false)

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Cargando información de la zona primaria...</p>
          <Progress value={80} className="w-64" />
        </div>
      </div>
    )
  }

  const handleRespuestaHabilitacion = (respuesta: "si" | "no" | "no-seguro") => {
    setRespuestaHabilitacion(respuesta)

    if (respuesta === "si") {
      actualizarEstadoHabilitacion("habilitada")
      toast({
        title: "Zona Primaria Habilitada",
        description: "Su zona primaria está habilitada para realizar consolidaciones.",
      })
    } else {
      setMostrarRequisitos(true)
    }
  }

  const handleIniciarProceso = () => {
    iniciarProcesoHabilitacion()
    toast({
      title: "Proceso de Habilitación Iniciado",
      description: "Se ha iniciado el proceso de habilitación de su zona primaria.",
    })
  }

  const handleCompletarProceso = () => {
    const exito = completarProcesoHabilitacion()

    if (exito) {
      toast({
        title: "¡Felicidades!",
        description: "Su zona primaria ha sido habilitada exitosamente.",
      })
    } else {
      toast({
        title: "No se pudo completar la habilitación",
        description: "Debe cumplir con todos los requisitos para habilitar su zona primaria.",
        variant: "destructive",
      })
    }
  }

  const getEstadoHabilitacionIcon = () => {
    switch (zonaPrimaria.estado) {
      case "habilitada":
        return <CheckCircle className="h-8 w-8 text-green-500" />
      case "no-habilitada":
        return <AlertCircle className="h-8 w-8 text-red-500" />
      case "en-proceso":
        return <Clock className="h-8 w-8 text-yellow-500" />
      case "desconocido":
      default:
        return <HelpCircle className="h-8 w-8 text-gray-500" />
    }
  }

  const getEstadoHabilitacionText = () => {
    switch (zonaPrimaria.estado) {
      case "habilitada":
        return (
          <div>
            <p className="font-medium text-green-700">
              Su zona primaria está habilitada para realizar consolidaciones.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Fecha de habilitación: {zonaPrimaria.fechaHabilitacion?.toLocaleDateString()}
            </p>
            <p className="text-sm text-muted-foreground">
              Fecha de vencimiento: {zonaPrimaria.fechaVencimiento?.toLocaleDateString()}
            </p>
          </div>
        )
      case "no-habilitada":
        return (
          <p className="font-medium text-red-700">Su zona primaria no está habilitada para realizar consolidaciones.</p>
        )
      case "en-proceso":
        return (
          <p className="font-medium text-yellow-700">El proceso de habilitación de su zona primaria está en curso.</p>
        )
      case "desconocido":
      default:
        return (
          <p className="font-medium text-gray-700">
            Desconocemos si su zona primaria está habilitada para realizar consolidaciones.
          </p>
        )
    }
  }

  const calcularProgresoRequisitos = () => {
    const totalRequisitos = Object.keys(zonaPrimaria.requisitosCompletados).length
    const requisitosCompletados = Object.values(zonaPrimaria.requisitosCompletados).filter(Boolean).length
    return Math.round((requisitosCompletados / totalRequisitos) * 100)
  }

  // Si el estado es desconocido, mostrar la pregunta inicial
  if (zonaPrimaria.estado === "desconocido" && respuestaHabilitacion === null) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estado de Habilitación de Zona Primaria</CardTitle>
          <CardDescription>
            Para realizar consolidaciones en la Zona Primaria de su depósito fiscal, esta debe estar habilitada por la
            Aduana.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <h3 className="text-xl font-medium mb-6">
              ¿Su Zona Primaria ya cuenta con la habilitación para realizar consolidaciones?
            </h3>
            <div className="flex justify-center space-x-4">
              <Button onClick={() => handleRespuestaHabilitacion("si")}>Sí</Button>
              <Button onClick={() => handleRespuestaHabilitacion("no")}>No</Button>
              <Button variant="outline" onClick={() => handleRespuestaHabilitacion("no-seguro")}>
                No estoy seguro
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            {getEstadoHabilitacionIcon()}
            <div>
              <CardTitle>Estado de Habilitación</CardTitle>
              <CardDescription>Estado actual de la habilitación de su zona primaria</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>{getEstadoHabilitacionText()}</CardContent>
        <CardFooter>
          {zonaPrimaria.estado === "no-habilitada" && (
            <Button onClick={handleIniciarProceso}>Iniciar Proceso de Habilitación</Button>
          )}
          {zonaPrimaria.estado === "en-proceso" && (
            <Button onClick={handleCompletarProceso} disabled={!todosRequisitosCompletados()}>
              Completar Habilitación
            </Button>
          )}
        </CardFooter>
      </Card>

      {(mostrarRequisitos || zonaPrimaria.estado === "en-proceso") && (
        <Card>
          <CardHeader>
            <CardTitle>Requisitos de Habilitación</CardTitle>
            <CardDescription>
              Para habilitar su zona primaria, debe cumplir con los siguientes requisitos:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Progress value={calcularProgresoRequisitos()} className="h-2" />
              <p className="text-sm text-muted-foreground mt-1">{calcularProgresoRequisitos()}% completado</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="delimitacion"
                    checked={zonaPrimaria.requisitosCompletados.delimitacion}
                    onCheckedChange={(checked) => actualizarRequisito("delimitacion", checked === true)}
                  />
                  <div className="grid gap-1.5">
                    <label
                      htmlFor="delimitacion"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Delimitación
                    </label>
                    <p className="text-sm text-muted-foreground">
                      El área debe estar claramente delimitada con muros, cercas u otras barreras físicas.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="senalizacion"
                    checked={zonaPrimaria.requisitosCompletados.senalizacion}
                    onCheckedChange={(checked) => actualizarRequisito("senalizacion", checked === true)}
                  />
                  <div className="grid gap-1.5">
                    <label
                      htmlFor="senalizacion"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Señalización
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Debe contar con señalización adecuada que identifique claramente los límites y áreas.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="iluminacion"
                    checked={zonaPrimaria.requisitosCompletados.iluminacion}
                    onCheckedChange={(checked) => actualizarRequisito("iluminacion", checked === true)}
                  />
                  <div className="grid gap-1.5">
                    <label
                      htmlFor="iluminacion"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Iluminación
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Debe tener iluminación suficiente para las operaciones, incluso durante la noche.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="pisos"
                    checked={zonaPrimaria.requisitosCompletados.pisos}
                    onCheckedChange={(checked) => actualizarRequisito("pisos", checked === true)}
                  />
                  <div className="grid gap-1.5">
                    <label
                      htmlFor="pisos"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Pisos
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Los pisos deben ser resistentes y adecuados para el tránsito y almacenamiento de mercancías.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="seguridad"
                    checked={zonaPrimaria.requisitosCompletados.seguridad}
                    onCheckedChange={(checked) => actualizarRequisito("seguridad", checked === true)}
                  />
                  <div className="grid gap-1.5">
                    <label
                      htmlFor="seguridad"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Seguridad
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Implementación de medidas de seguridad para prevenir robos y accesos no autorizados.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="oficinas"
                    checked={zonaPrimaria.requisitosCompletados.oficinas}
                    onCheckedChange={(checked) => actualizarRequisito("oficinas", checked === true)}
                  />
                  <div className="grid gap-1.5">
                    <label
                      htmlFor="oficinas"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Oficinas
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Debe contar con oficinas adecuadas para el personal de la Aduana y del depósito fiscal.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="servicios"
                    checked={zonaPrimaria.requisitosCompletados.servicios}
                    onCheckedChange={(checked) => actualizarRequisito("servicios", checked === true)}
                  />
                  <div className="grid gap-1.5">
                    <label
                      htmlFor="servicios"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Servicios
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Disponer de servicios básicos como energía eléctrica, agua potable y sanitarios.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="equipamiento"
                    checked={zonaPrimaria.requisitosCompletados.equipamiento}
                    onCheckedChange={(checked) => actualizarRequisito("equipamiento", checked === true)}
                  />
                  <div className="grid gap-1.5">
                    <label
                      htmlFor="equipamiento"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Equipamiento
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Contar con el equipamiento necesario para la manipulación de carga.
                    </p>
                  </div>
                </div>
              </div>

              <h4 className="font-medium mt-6 mb-2">Requisitos adicionales para consolidación</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="espacioSuficiente"
                    checked={zonaPrimaria.requisitosCompletados.espacioSuficiente}
                    onCheckedChange={(checked) => actualizarRequisito("espacioSuficiente", checked === true)}
                  />
                  <div className="grid gap-1.5">
                    <label
                      htmlFor="espacioSuficiente"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Espacio Suficiente
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Debe haber espacio adecuado para realizar las operaciones de consolidación.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="areaInspeccion"
                    checked={zonaPrimaria.requisitosCompletados.areaInspeccion}
                    onCheckedChange={(checked) => actualizarRequisito("areaInspeccion", checked === true)}
                  />
                  <div className="grid gap-1.5">
                    <label
                      htmlFor="areaInspeccion"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Área de Inspección
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Un área designada para la inspección de las mercancías por parte de la Aduana.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="procedimientos"
                    checked={zonaPrimaria.requisitosCompletados.procedimientos}
                    onCheckedChange={(checked) => actualizarRequisito("procedimientos", checked === true)}
                  />
                  <div className="grid gap-1.5">
                    <label
                      htmlFor="procedimientos"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Procedimientos Documentados
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Tener procedimientos operativos estándar documentados para el proceso de consolidación.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="registroOperaciones"
                    checked={zonaPrimaria.requisitosCompletados.registroOperaciones}
                    onCheckedChange={(checked) => actualizarRequisito("registroOperaciones", checked === true)}
                  />
                  <div className="grid gap-1.5">
                    <label
                      htmlFor="registroOperaciones"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Registro de Operaciones
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Mantener un registro detallado de todas las operaciones de consolidación realizadas.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="personalCapacitado"
                    checked={zonaPrimaria.requisitosCompletados.personalCapacitado}
                    onCheckedChange={(checked) => actualizarRequisito("personalCapacitado", checked === true)}
                  />
                  <div className="grid gap-1.5">
                    <label
                      htmlFor="personalCapacitado"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Personal Capacitado
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Contar con personal capacitado en las normativas aduaneras y procedimientos de consolidación.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            {zonaPrimaria.estado === "en-proceso" && (
              <Alert className={todosRequisitosCompletados() ? "bg-green-50" : "bg-yellow-50"}>
                <AlertTitle>
                  {todosRequisitosCompletados() ? "¡Todos los requisitos completados!" : "Requisitos pendientes"}
                </AlertTitle>
                <AlertDescription>
                  {todosRequisitosCompletados()
                    ? "Ya puede completar el proceso de habilitación."
                    : "Complete todos los requisitos para poder habilitar su zona primaria."}
                </AlertDescription>
              </Alert>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
