"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { TipoUsuario, TipoContrato, DatosContrato, TipoOrden } from "../types"
import { useCobertura } from "../hooks/use-cobertura"
import { CalendarIcon, TrendingUp, DollarSign } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { EntradaOrden } from "./entrada-orden"
import { OrdenCompletada } from "./orden-completada"

interface DetalleContratoProps {
  tipoUsuario: TipoUsuario
  tipoContrato: TipoContrato
  onVolver: () => void
}

export function DetalleContrato({ tipoUsuario, tipoContrato, onVolver }: DetalleContratoProps) {
  const { obtenerDatosContrato } = useCobertura()
  const [datosContrato, setDatosContrato] = useState<DatosContrato | null>(null)
  const [cargando, setCargando] = useState(true)
  const [mostrarEntradaOrden, setMostrarEntradaOrden] = useState(false)
  const [ordenCompletada, setOrdenCompletada] = useState(false)
  const [tipoOrdenCompletada, setTipoOrdenCompletada] = useState<TipoOrden>("mercado")

  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true)
      try {
        const datos = await obtenerDatosContrato(tipoContrato)
        setDatosContrato(datos)
      } catch (error) {
        console.error("Error al cargar datos del contrato:", error)
      } finally {
        setCargando(false)
      }
    }

    cargarDatos()
  }, [tipoContrato, obtenerDatosContrato])

  const nombreContrato = tipoContrato === "contrato5" ? "Contrato #5" : "Contrato #11"
  const accionTexto = tipoUsuario === "productor" ? "Opciones de Cobertura" : "Opciones de Inversión"

  const handleVerOpciones = () => {
    setMostrarEntradaOrden(true)
  }

  const handleOrdenCompletada = () => {
    // En una implementación real, obtendríamos el tipo de orden del resultado
    setTipoOrdenCompletada("mercado")
    setMostrarEntradaOrden(false)
    setOrdenCompletada(true)
  }

  const handleNuevaOrden = () => {
    setOrdenCompletada(false)
    setMostrarEntradaOrden(true)
  }

  const handleVerPortafolio = () => {
    // En una implementación real, redirigir al portafolio
    console.log("Redirigir al portafolio")
  }

  if (cargando) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!datosContrato) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-500">Error al cargar los datos del contrato. Intente nuevamente.</p>
            <Button onClick={onVolver} className="mt-4">
              Volver
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (mostrarEntradaOrden) {
    return (
      <EntradaOrden
        tipoUsuario={tipoUsuario}
        tipoContrato={tipoContrato}
        datosContrato={datosContrato}
        onVolver={() => setMostrarEntradaOrden(false)}
        onOrdenCompletada={handleOrdenCompletada}
      />
    )
  }

  if (ordenCompletada) {
    return (
      <OrdenCompletada
        tipoOrden={tipoOrdenCompletada}
        onVerPortafolio={handleVerPortafolio}
        onNuevaOrden={handleNuevaOrden}
      />
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{nombreContrato}</CardTitle>
        <CardDescription>Información actual del contrato</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-medium">Precio Actual</h3>
              </div>
              <p className="text-2xl font-bold mt-2">{formatCurrency(datosContrato.precioActual)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-medium">Fecha de Vencimiento</h3>
              </div>
              <p className="text-2xl font-bold mt-2">{datosContrato.fechaVencimiento}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-medium">Variación</h3>
              </div>
              <p
                className={`text-2xl font-bold mt-2 ${datosContrato.variacion >= 0 ? "text-green-500" : "text-red-500"}`}
              >
                {datosContrato.variacion >= 0 ? "+" : ""}
                {datosContrato.variacion.toFixed(2)}%
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-muted">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2">Descripción:</h4>
            <p>{datosContrato.descripcion}</p>
          </CardContent>
        </Card>

        <div className="flex flex-col space-y-4">
          <Button size="lg" className="w-full" onClick={handleVerOpciones}>
            Ver {accionTexto}
          </Button>
          <div className="flex space-x-4">
            <Button variant="outline" className="flex-1" onClick={onVolver}>
              Volver a la selección de contrato
            </Button>
            <Button variant="outline" className="flex-1" onClick={handleVerPortafolio}>
              Ver mi Portafolio
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
