"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"
import { SimuladorFinanciamiento } from "../../financiacion/components/simulador-financiamiento"

// Datos de ejemplo para el carrito
const datosCarritoEjemplo = [
  {
    id: "item1",
    nombre: "Fertilizante Premium",
    cantidad: 2,
    precioUnitario: 150000,
    subtotal: 300000,
  },
  {
    id: "item2",
    nombre: "Herbicida Selectivo",
    cantidad: 1,
    precioUnitario: 85000,
    subtotal: 85000,
  },
]

export function CarritoAgroinsumos() {
  const [carritoItems, setCarritoItems] = useState(datosCarritoEjemplo)
  const [simuladorAbierto, setSimuladorAbierto] = useState(false)

  // Calcular el total del carrito
  const montoTotal = carritoItems.reduce((sum, item) => sum + item.subtotal, 0)

  // Eliminar un item del carrito
  const eliminarItem = (id: string) => {
    setCarritoItems((prev) => prev.filter((item) => item.id !== id))
  }

  // Vaciar el carrito
  const vaciarCarrito = () => {
    setCarritoItems([])
  }

  // Datos para el simulador de financiamiento
  const datosFinanciamiento = {
    tipo: "Agroinsumos",
    monto: montoTotal,
    plazo: 6, // Valor predeterminado
    tasa: 12.5, // Tasa predeterminada para agroinsumos
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Carrito de Agroinsumos</CardTitle>
        </CardHeader>
        <CardContent>
          {carritoItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No hay productos en el carrito</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Precio Unitario</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {carritoItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.nombre}</TableCell>
                    <TableCell className="text-right">{item.cantidad}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.precioUnitario)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.subtotal)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => eliminarItem(item.id)}>
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div>
            <p className="text-lg font-semibold">Total: {formatCurrency(montoTotal)}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={vaciarCarrito} disabled={carritoItems.length === 0}>
              Vaciar Carrito
            </Button>
            <Button onClick={() => setSimuladorAbierto(true)} disabled={carritoItems.length === 0}>
              Financiar Compra
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Simulador de Financiamiento para Agroinsumos */}
      {simuladorAbierto && (
        <SimuladorFinanciamiento
          isOpen={simuladorAbierto}
          onClose={() => setSimuladorAbierto(false)}
          data={datosFinanciamiento}
        />
      )}
    </>
  )
}
