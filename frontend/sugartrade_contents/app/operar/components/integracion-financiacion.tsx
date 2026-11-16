"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency } from "@/lib/utils"
import { IntegracionCajaPunta } from "@/app/utilidades/financiacion/components/integracion-caja-punta"

interface OperacionProps {
  id: string
  tipo: "compra" | "venta"
  precio: number
  cantidad: number
  monto: number
  contraparte: string
  estado: "pendiente" | "completada" | "cancelada"
}

export function IntegracionFinanciacion({ operacion }: { operacion: OperacionProps }) {
  const { toast } = useToast()
  const [metodoPago, setMetodoPago] = useState<string>("echeq")
  const [mostrarIntegracion, setMostrarIntegracion] = useState(false)

  // Función para procesar el pago
  const procesarPago = () => {
    setMostrarIntegracion(true)
  }

  return (
    <div className="space-y-4">
      {!mostrarIntegracion ? (
        <Card>
          <CardHeader>
            <CardTitle>Procesar Operación</CardTitle>
            <CardDescription>Complete los detalles de pago para finalizar la operación</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <div>
                  <p className="font-medium">{operacion.tipo === "compra" ? "Compra" : "Venta"} de Certificados</p>
                  <p className="text-sm text-muted-foreground">Cantidad: {operacion.cantidad}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(operacion.monto)}</p>
                  <Badge variant={operacion.estado === "pendiente" ? "outline" : "secondary"}>{operacion.estado}</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metodo-pago">Método de Pago</Label>
                <Select value={metodoPago} onValueChange={setMetodoPago}>
                  <SelectTrigger id="metodo-pago">
                    <SelectValue placeholder="Seleccione método de pago" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="echeq">eCheq</SelectItem>
                    <SelectItem value="transferencia">Transferencia Bancaria</SelectItem>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {metodoPago === "echeq" && (
                <div className="p-3 bg-blue-50 text-blue-800 rounded-md border border-blue-200">
                  <p className="text-sm font-medium">Información sobre eCheq:</p>
                  <p className="text-sm">
                    Al utilizar eCheq como método de pago, podrá descontarlo inmediatamente a través de nuestro servicio
                    de financiación.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline">Cancelar</Button>
            <Button onClick={procesarPago}>Procesar Pago</Button>
          </CardFooter>
        </Card>
      ) : (
        <IntegracionCajaPunta
          operacionId={operacion.id}
          tipo={operacion.tipo}
          monto={operacion.monto}
          cantidad={operacion.cantidad}
          contraparte={operacion.contraparte}
          metodoPago={metodoPago as any}
        />
      )}
    </div>
  )
}
