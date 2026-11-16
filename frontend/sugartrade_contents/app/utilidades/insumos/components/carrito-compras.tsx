"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { OpcionesCanjeModal } from "./opciones-canje-modal"
import { ConfirmacionCompraModal } from "./confirmacion-compra-modal"

interface CarritoComprasProps {
  items: any[]
  eliminarItem: (id: number) => void
  actualizarCantidad: (id: number, cantidad: number) => void
  vaciarCarrito: () => void
}

export function CarritoCompras({ items, eliminarItem, actualizarCantidad, vaciarCarrito }: CarritoComprasProps) {
  const [metodoPago, setMetodoPago] = useState("efectivo")
  const [usarCanje, setUsarCanje] = useState(false)
  const [showCanjeModal, setShowCanjeModal] = useState(false)
  const [showConfirmacionModal, setShowConfirmacionModal] = useState(false)

  // Calcular totales
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
  const descuento = items.reduce((sum, item) => sum + (item.subtotal * (item.descuento || 0)) / 100, 0)
  const impuestos = (subtotal - descuento) * 0.21 // IVA 21%
  const total = subtotal - descuento + impuestos

  // Calcular equivalente en azúcar (ejemplo simplificado)
  const precioAzucarPorTonelada = 800000 // Precio ficticio por tonelada de azúcar
  const equivalenteAzucar = total / precioAzucarPorTonelada

  const handleProcesarCompra = () => {
    if (usarCanje) {
      setShowCanjeModal(true)
    } else {
      setShowConfirmacionModal(true)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Carrito de Compras</CardTitle>
          <CardDescription>Revise sus productos seleccionados antes de finalizar la compra</CardDescription>
        </CardHeader>
        <CardContent>
          {items.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Precio Unitario</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Descuento</TableHead>
                  <TableHead>Subtotal</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.nombre}</p>
                        <p className="text-sm text-muted-foreground">{item.categoria}</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(item.precio)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                          disabled={item.cantidad <= 1}
                        >
                          -
                        </Button>
                        <span>{item.cantidad}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.descuento ? (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          {item.descuento}%
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(item.subtotal * (1 - (item.descuento || 0) / 100))}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => eliminarItem(item.id)}>
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No hay productos en el carrito</div>
          )}
        </CardContent>
        {items.length > 0 && (
          <CardFooter className="flex-col space-y-4">
            <div className="w-full flex justify-end">
              <Button variant="outline" onClick={vaciarCarrito}>
                Vaciar Carrito
              </Button>
            </div>

            <div className="w-full border-t pt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Método de Pago</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="metodo-pago">Seleccione método de pago</Label>
                        <Select value={metodoPago} onValueChange={setMetodoPago}>
                          <SelectTrigger id="metodo-pago">
                            <SelectValue placeholder="Seleccione método de pago" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="efectivo">Efectivo / Transferencia</SelectItem>
                            <SelectItem value="credito">Tarjeta de Crédito</SelectItem>
                            <SelectItem value="debito">Tarjeta de Débito</SelectItem>
                            <SelectItem value="financiacion">Financiación</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="usar-canje"
                          checked={usarCanje}
                          onCheckedChange={(checked) => setUsarCanje(!!checked)}
                        />
                        <Label htmlFor="usar-canje" className="text-sm font-medium">
                          Usar canje por azúcar
                        </Label>
                      </div>

                      {usarCanje && (
                        <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                          <p className="text-sm text-blue-800 font-medium">Equivalente en azúcar:</p>
                          <p className="text-sm text-blue-700">{equivalenteAzucar.toFixed(2)} toneladas de azúcar</p>
                          <p className="text-xs text-blue-600 mt-1">Basado en el precio actual del mercado</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Resumen de la Compra</h3>
                    <div className="space-y-2 p-4 bg-muted rounded-md">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>Descuento:</span>
                        <span>-{formatCurrency(descuento)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Impuestos (21%):</span>
                        <span>{formatCurrency(impuestos)}</span>
                      </div>
                      <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                        <span>Total:</span>
                        <span>{formatCurrency(total)}</span>
                      </div>
                    </div>

                    <Button className="w-full mt-4" size="lg" onClick={handleProcesarCompra}>
                      Procesar Compra
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Modales */}
      <OpcionesCanjeModal
        isOpen={showCanjeModal}
        onClose={() => setShowCanjeModal(false)}
        total={total}
        equivalenteAzucar={equivalenteAzucar}
        onConfirm={() => {
          setShowCanjeModal(false)
          setShowConfirmacionModal(true)
        }}
      />

      <ConfirmacionCompraModal
        isOpen={showConfirmacionModal}
        onClose={() => setShowConfirmacionModal(false)}
        metodoPago={metodoPago}
        usarCanje={usarCanje}
        total={total}
        onConfirm={() => {
          setShowConfirmacionModal(false)
          vaciarCarrito()
        }}
      />
    </div>
  )
}
