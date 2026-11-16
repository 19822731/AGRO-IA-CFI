"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { TipoUsuario, TipoContrato, TipoOrden, DatosContrato } from "../types"
import { formatCurrency } from "@/lib/utils"
import { CheckCircle, AlertCircle, TrendingDown, TrendingUp } from "lucide-react"

interface ConfirmacionOrdenProps {
  tipoUsuario: TipoUsuario
  tipoContrato: TipoContrato
  tipoOrden: TipoOrden
  cantidad: number
  precioLimite?: number
  precioStopLoss?: number
  precioTakeProfit?: number
  valorNocional: number
  datosContrato: DatosContrato
  onConfirmar: () => void
  onCancelar: () => void
}

export function ConfirmacionOrden({
  tipoUsuario,
  tipoContrato,
  tipoOrden,
  cantidad,
  precioLimite,
  precioStopLoss,
  precioTakeProfit,
  valorNocional,
  datosContrato,
  onConfirmar,
  onCancelar,
}: ConfirmacionOrdenProps) {
  const accionTexto = tipoUsuario === "productor" ? "cobertura" : "inversión"
  const nombreContrato = datosContrato.nombre
  const esMercado = tipoOrden === "mercado"
  const precioTexto = esMercado
    ? `al mejor precio disponible (aproximadamente ${formatCurrency(datosContrato.precioActual)})`
    : `a un precio límite de ${formatCurrency(precioLimite!)}`

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Confirmar Orden</CardTitle>
        <CardDescription>Revisa los detalles de tu orden antes de confirmar</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-muted p-4 rounded-md space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tipo de orden:</span>
            <span className="font-medium">{esMercado ? "Orden de Mercado" : "Orden Límite"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Contrato:</span>
            <span className="font-medium">{nombreContrato}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cantidad:</span>
            <span className="font-medium">{cantidad} contratos</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Precio:</span>
            <span className="font-medium">{precioTexto}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Valor nocional:</span>
            <span className="font-medium">{formatCurrency(valorNocional)}</span>
          </div>

          {precioStopLoss && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Stop-Loss:</span>
              <span className="font-medium text-red-500">{formatCurrency(precioStopLoss)}</span>
            </div>
          )}

          {precioTakeProfit && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Take-Profit:</span>
              <span className="font-medium text-green-500">{formatCurrency(precioTakeProfit)}</span>
            </div>
          )}
        </div>

        <div className="flex items-start space-x-3 p-3 border rounded-md">
          {esMercado ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Orden de Mercado</p>
                <p className="text-sm text-muted-foreground">
                  Tu orden se ejecutará inmediatamente al mejor precio disponible en el mercado en este momento.
                </p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium">Orden Límite</p>
                <p className="text-sm text-muted-foreground">
                  Tu orden solo se ejecutará si el precio del mercado alcanza o mejora el nivel especificado de{" "}
                  {formatCurrency(precioLimite!)}.
                </p>
              </div>
            </>
          )}
        </div>

        {(precioStopLoss || precioTakeProfit) && (
          <div className="space-y-3">
            {precioStopLoss && (
              <div className="flex items-start space-x-3 p-3 border rounded-md">
                <TrendingDown className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium">Stop-Loss</p>
                  <p className="text-sm text-muted-foreground">
                    Si el precio alcanza {formatCurrency(precioStopLoss)}, se enviará automáticamente una orden para
                    cerrar tu posición y limitar pérdidas.
                  </p>
                </div>
              </div>
            )}

            {precioTakeProfit && (
              <div className="flex items-start space-x-3 p-3 border rounded-md">
                <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Take-Profit</p>
                  <p className="text-sm text-muted-foreground">
                    Si el precio alcanza {formatCurrency(precioTakeProfit)}, se enviará automáticamente una orden para
                    cerrar tu posición y asegurar ganancias.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button onClick={onConfirmar}>Confirmar Orden</Button>
      </CardFooter>
    </Card>
  )
}
