"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import type { TipoUsuario, TipoContrato, TipoOrden, DatosContrato } from "../types"
import { useCobertura } from "../hooks/use-cobertura"
import { formatCurrency } from "@/lib/utils"
import { ConfirmacionOrden } from "./confirmacion-orden"

interface EntradaOrdenProps {
  tipoUsuario: TipoUsuario
  tipoContrato: TipoContrato
  datosContrato: DatosContrato
  onVolver: () => void
  onOrdenCompletada: () => void
}

export function EntradaOrden({
  tipoUsuario,
  tipoContrato,
  datosContrato,
  onVolver,
  onOrdenCompletada,
}: EntradaOrdenProps) {
  const { calcularValorNocional, crearOrden } = useCobertura()
  const [cantidad, setCantidad] = useState<number>(1)
  const [tipoOrden, setTipoOrden] = useState<TipoOrden>("mercado")
  const [precioLimite, setPrecioLimite] = useState<number | undefined>(undefined)
  const [valorNocional, setValorNocional] = useState<number>(0)
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)
  const [errorCantidad, setErrorCantidad] = useState<string | null>(null)
  const [errorPrecio, setErrorPrecio] = useState<string | null>(null)

  // Nuevos estados para Stop-Loss y Take-Profit
  const [usarStopLoss, setUsarStopLoss] = useState(false)
  const [usarTakeProfit, setUsarTakeProfit] = useState(false)
  const [precioStopLoss, setPrecioStopLoss] = useState<number | undefined>(undefined)
  const [precioTakeProfit, setPrecioTakeProfit] = useState<number | undefined>(undefined)
  const [errorStopLoss, setErrorStopLoss] = useState<string | null>(null)
  const [errorTakeProfit, setErrorTakeProfit] = useState<string | null>(null)
  const [mostrarOpcionesAvanzadas, setMostrarOpcionesAvanzadas] = useState(false)

  // Actualizar valor nocional cuando cambia la cantidad
  useEffect(() => {
    if (cantidad > 0) {
      const valor = calcularValorNocional(tipoContrato, cantidad)
      setValorNocional(valor)
    }
  }, [cantidad, tipoContrato, calcularValorNocional])

  const handleCantidadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = Number.parseInt(e.target.value)
    setCantidad(valor)

    if (isNaN(valor) || valor <= 0) {
      setErrorCantidad("La cantidad debe ser un número positivo")
    } else {
      setErrorCantidad(null)
    }
  }

  const handlePrecioLimiteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = Number.parseFloat(e.target.value)
    setPrecioLimite(valor)

    if (isNaN(valor) || valor <= 0) {
      setErrorPrecio("El precio debe ser un número positivo")
    } else {
      setErrorPrecio(null)
    }
  }

  const handlePrecioStopLossChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = Number.parseFloat(e.target.value)
    setPrecioStopLoss(valor)

    if (isNaN(valor) || valor <= 0) {
      setErrorStopLoss("El precio debe ser un número positivo")
    } else {
      setErrorStopLoss(null)
    }
  }

  const handlePrecioTakeProfitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = Number.parseFloat(e.target.value)
    setPrecioTakeProfit(valor)

    if (isNaN(valor) || valor <= 0) {
      setErrorTakeProfit("El precio debe ser un número positivo")
    } else {
      setErrorTakeProfit(null)
    }
  }

  const handleContinuar = () => {
    // Validar entrada
    let hayError = false

    if (cantidad <= 0) {
      setErrorCantidad("La cantidad debe ser un número positivo")
      hayError = true
    }

    if (tipoOrden === "limite" && (!precioLimite || precioLimite <= 0)) {
      setErrorPrecio("Debe especificar un precio límite válido")
      hayError = true
    }

    if (usarStopLoss && (!precioStopLoss || precioStopLoss <= 0)) {
      setErrorStopLoss("Debe especificar un precio de Stop-Loss válido")
      hayError = true
    }

    if (usarTakeProfit && (!precioTakeProfit || precioTakeProfit <= 0)) {
      setErrorTakeProfit("Debe especificar un precio de Take-Profit válido")
      hayError = true
    }

    // Validaciones específicas según el tipo de usuario
    if (tipoUsuario === "productor") {
      // Para productores (venden futuros), el Stop-Loss debe ser menor que el precio actual/límite
      if (usarStopLoss && precioStopLoss) {
        const precioReferencia = tipoOrden === "limite" ? precioLimite! : datosContrato.precioActual
        if (precioStopLoss >= precioReferencia) {
          setErrorStopLoss("Para productores, el Stop-Loss debe ser menor que el precio de entrada")
          hayError = true
        }
      }

      // Para productores, el Take-Profit debe ser mayor que el precio actual/límite
      if (usarTakeProfit && precioTakeProfit) {
        const precioReferencia = tipoOrden === "limite" ? precioLimite! : datosContrato.precioActual
        if (precioTakeProfit <= precioReferencia) {
          setErrorTakeProfit("Para productores, el Take-Profit debe ser mayor que el precio de entrada")
          hayError = true
        }
      }
    } else {
      // Para inversores (compran futuros), el Stop-Loss debe ser menor que el precio actual/límite
      if (usarStopLoss && precioStopLoss) {
        const precioReferencia = tipoOrden === "limite" ? precioLimite! : datosContrato.precioActual
        if (precioStopLoss >= precioReferencia) {
          setErrorStopLoss("Para inversores, el Stop-Loss debe ser menor que el precio de entrada")
          hayError = true
        }
      }

      // Para inversores, el Take-Profit debe ser mayor que el precio actual/límite
      if (usarTakeProfit && precioTakeProfit) {
        const precioReferencia = tipoOrden === "limite" ? precioLimite! : datosContrato.precioActual
        if (precioTakeProfit <= precioReferencia) {
          setErrorTakeProfit("Para inversores, el Take-Profit debe ser mayor que el precio de entrada")
          hayError = true
        }
      }
    }

    if (hayError) return

    setMostrarConfirmacion(true)
  }

  const handleConfirmar = async () => {
    try {
      await crearOrden(
        tipoUsuario,
        tipoContrato,
        tipoOrden,
        cantidad,
        precioLimite,
        usarStopLoss ? precioStopLoss : undefined,
        usarTakeProfit ? precioTakeProfit : undefined,
      )
      onOrdenCompletada()
    } catch (error) {
      console.error("Error al crear la orden:", error)
    }
  }

  const accionTexto = tipoUsuario === "productor" ? "cobertura" : "inversión"
  const nombreContrato = datosContrato.nombre

  if (mostrarConfirmacion) {
    return (
      <ConfirmacionOrden
        tipoUsuario={tipoUsuario}
        tipoContrato={tipoContrato}
        tipoOrden={tipoOrden}
        cantidad={cantidad}
        precioLimite={precioLimite}
        precioStopLoss={usarStopLoss ? precioStopLoss : undefined}
        precioTakeProfit={usarTakeProfit ? precioTakeProfit : undefined}
        valorNocional={valorNocional}
        datosContrato={datosContrato}
        onConfirmar={handleConfirmar}
        onCancelar={() => setMostrarConfirmacion(false)}
      />
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Crear Orden de {accionTexto}</CardTitle>
        <CardDescription>Configura los detalles de tu orden para {nombreContrato}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="cantidad">Cantidad de contratos</Label>
          <Input
            id="cantidad"
            type="number"
            min="1"
            value={cantidad}
            onChange={handleCantidadChange}
            className={errorCantidad ? "border-red-500" : ""}
          />
          {errorCantidad && <p className="text-sm text-red-500">{errorCantidad}</p>}

          <div className="text-sm text-muted-foreground mt-1">
            Valor nocional estimado: {formatCurrency(valorNocional)}
          </div>
          <div className="text-xs text-muted-foreground">
            ({cantidad} contratos × {datosContrato.tamanoContrato} toneladas ×{" "}
            {formatCurrency(datosContrato.precioActual)})
          </div>
        </div>

        <div className="space-y-2">
          <Label>Tipo de orden</Label>
          <RadioGroup
            value={tipoOrden}
            onValueChange={(value) => setTipoOrden(value as TipoOrden)}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="mercado" id="mercado" />
              <Label htmlFor="mercado" className="cursor-pointer">
                Orden de Mercado
                <p className="text-xs text-muted-foreground">
                  Se ejecuta inmediatamente al mejor precio disponible ({formatCurrency(datosContrato.precioActual)})
                </p>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="limite" id="limite" />
              <Label htmlFor="limite" className="cursor-pointer">
                Orden Límite
                <p className="text-xs text-muted-foreground">
                  Se ejecuta solo cuando el precio alcanza o mejora el nivel especificado
                </p>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {tipoOrden === "limite" && (
          <div className="space-y-2">
            <Label htmlFor="precioLimite">Precio límite</Label>
            <Input
              id="precioLimite"
              type="number"
              step="0.01"
              min="0.01"
              value={precioLimite || ""}
              onChange={handlePrecioLimiteChange}
              className={errorPrecio ? "border-red-500" : ""}
            />
            {errorPrecio && <p className="text-sm text-red-500">{errorPrecio}</p>}
          </div>
        )}

        <div className="pt-2">
          <Button
            variant="outline"
            type="button"
            onClick={() => setMostrarOpcionesAvanzadas(!mostrarOpcionesAvanzadas)}
            className="w-full"
          >
            {mostrarOpcionesAvanzadas ? "Ocultar opciones avanzadas" : "Mostrar opciones avanzadas"}
          </Button>
        </div>

        {mostrarOpcionesAvanzadas && (
          <div className="space-y-4 border p-4 rounded-md">
            <h3 className="font-medium">Gestión de riesgo</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="stopLoss">Stop-Loss</Label>
                  <p className="text-xs text-muted-foreground">Limita pérdidas cerrando automáticamente tu posición</p>
                </div>
                <Switch id="stopLoss" checked={usarStopLoss} onCheckedChange={setUsarStopLoss} />
              </div>

              {usarStopLoss && (
                <div className="space-y-2">
                  <Label htmlFor="precioStopLoss">Precio Stop-Loss</Label>
                  <Input
                    id="precioStopLoss"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={precioStopLoss || ""}
                    onChange={handlePrecioStopLossChange}
                    className={errorStopLoss ? "border-red-500" : ""}
                  />
                  {errorStopLoss && <p className="text-sm text-red-500">{errorStopLoss}</p>}
                  <p className="text-xs text-muted-foreground">
                    {tipoUsuario === "productor"
                      ? "Recomendado: un precio por debajo de tu entrada para limitar pérdidas"
                      : "Recomendado: un precio por debajo de tu entrada para limitar pérdidas"}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="takeProfit">Take-Profit</Label>
                  <p className="text-xs text-muted-foreground">
                    Asegura ganancias cerrando automáticamente tu posición
                  </p>
                </div>
                <Switch id="takeProfit" checked={usarTakeProfit} onCheckedChange={setUsarTakeProfit} />
              </div>

              {usarTakeProfit && (
                <div className="space-y-2">
                  <Label htmlFor="precioTakeProfit">Precio Take-Profit</Label>
                  <Input
                    id="precioTakeProfit"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={precioTakeProfit || ""}
                    onChange={handlePrecioTakeProfitChange}
                    className={errorTakeProfit ? "border-red-500" : ""}
                  />
                  {errorTakeProfit && <p className="text-sm text-red-500">{errorTakeProfit}</p>}
                  <p className="text-xs text-muted-foreground">
                    {tipoUsuario === "productor"
                      ? "Recomendado: un precio por encima de tu entrada para asegurar ganancias"
                      : "Recomendado: un precio por encima de tu entrada para asegurar ganancias"}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onVolver}>
          Volver
        </Button>
        <Button onClick={handleContinuar}>Continuar</Button>
      </CardFooter>
    </Card>
  )
}
