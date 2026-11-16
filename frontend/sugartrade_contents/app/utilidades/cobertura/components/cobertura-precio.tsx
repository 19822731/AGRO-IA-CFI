"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import type { TipoUsuario, TipoContrato, DatosContrato } from "../types"
import { useCobertura } from "../hooks/use-cobertura"
import { SeleccionContrato } from "./seleccion-contrato"
import { EntradaOrden } from "./entrada-orden"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface CoberturaPrecioProps {
  onVolver: () => void
}

export function CoberturaPrecio({ onVolver }: CoberturaPrecioProps) {
  const { obtenerDatosContrato } = useCobertura()
  const [paso, setPaso] = useState<number>(1)
  const [tipoUsuario, setTipoUsuario] = useState<TipoUsuario | null>(null)
  const [tipoContrato, setTipoContrato] = useState<TipoContrato | null>(null)
  const [datosContrato, setDatosContrato] = useState<DatosContrato | null>(null)
  const [cargando, setCargando] = useState<boolean>(false)

  const handleSeleccionUsuario = async (tipo: TipoUsuario) => {
    setTipoUsuario(tipo)
    setPaso(2)
  }

  const handleSeleccionContrato = async (tipo: TipoContrato) => {
    setTipoContrato(tipo)
    setCargando(true)

    try {
      const datos = await obtenerDatosContrato(tipo)
      setDatosContrato(datos)
      setPaso(3)
    } catch (error) {
      console.error("Error al obtener datos del contrato:", error)
    } finally {
      setCargando(false)
    }
  }

  const handleOrdenCompletada = () => {
    setPaso(4)
  }

  const handleVolverPaso = () => {
    if (paso > 1) {
      setPaso(paso - 1)
    } else {
      onVolver()
    }
  }

  const handleNuevaOperacion = () => {
    setPaso(1)
    setTipoUsuario(null)
    setTipoContrato(null)
    setDatosContrato(null)
  }

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingSpinner className="mb-4" />
        <p className="text-muted-foreground">Cargando información del contrato...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={handleVolverPaso}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-bold">Cobertura de Precio</h2>
      </div>

      {paso === 1 && (
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>¿Eres productor de azúcar o inversor?</CardTitle>
            <CardDescription>Selecciona tu perfil para personalizar la experiencia de cobertura</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className="flex flex-col items-center space-y-3 border rounded-md p-4 cursor-pointer hover:bg-muted/50"
                onClick={() => handleSeleccionUsuario("productor")}
              >
                <RadioGroupItem value="productor" id="productor" className="sr-only" />
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-semibold text-primary">P</span>
                </div>
                <Label htmlFor="productor" className="font-medium text-center">
                  Productor
                </Label>
                <p className="text-sm text-muted-foreground text-center">
                  Protege el precio futuro de tu producción de azúcar contra posibles caídas
                </p>
              </div>

              <div
                className="flex flex-col items-center space-y-3 border rounded-md p-4 cursor-pointer hover:bg-muted/50"
                onClick={() => handleSeleccionUsuario("inversor")}
              >
                <RadioGroupItem value="inversor" id="inversor" className="sr-only" />
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-semibold text-primary">I</span>
                </div>
                <Label htmlFor="inversor" className="font-medium text-center">
                  Inversor
                </Label>
                <p className="text-sm text-muted-foreground text-center">
                  Invierte en el mercado de futuros de azúcar para aprovechar movimientos de precio
                </p>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {paso === 2 && tipoUsuario && (
        <div className="space-y-6">
          <Card className="w-full max-w-2xl mx-auto mb-6">
            <CardHeader>
              <CardTitle>Información sobre Cobertura de Precio</CardTitle>
            </CardHeader>
            <CardContent>
              {tipoUsuario === "productor" ? (
                <div className="space-y-4">
                  <p>
                    Como productor, puedes usar contratos de futuros para fijar un precio de venta para tu cosecha en
                    una fecha futura, protegiéndote de posibles caídas de precio.
                  </p>
                  <p>
                    La estrategia principal para productores es <strong>vender contratos de futuros</strong>, lo que te
                    permite asegurar un precio de venta incluso si el mercado baja en el futuro.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p>
                    Como inversor, puedes usar contratos de futuros para proteger el valor de tu posición actual o
                    futura en azúcar ante fluctuaciones de precio.
                  </p>
                  <p>
                    Puedes <strong>comprar contratos</strong> si esperas que el precio suba, o{" "}
                    <strong>vender contratos</strong> si esperas que el precio baje.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <SeleccionContrato tipoUsuario={tipoUsuario} onSeleccionContrato={handleSeleccionContrato} />
        </div>
      )}

      {paso === 3 && tipoUsuario && tipoContrato && datosContrato && (
        <EntradaOrden
          tipoUsuario={tipoUsuario}
          tipoContrato={tipoContrato}
          datosContrato={datosContrato}
          onVolver={handleVolverPaso}
          onOrdenCompletada={handleOrdenCompletada}
        />
      )}

      {paso === 4 && (
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>¡Operación Completada!</CardTitle>
            <CardDescription>Tu orden de cobertura de precio ha sido procesada correctamente</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Puedes ver el estado de tu orden y gestionar tu posición en la sección de Portafolio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleNuevaOperacion} className="flex-1">
                Nueva Operación
              </Button>
              <Button variant="outline" onClick={onVolver} className="flex-1">
                Volver al Inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
