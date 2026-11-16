"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"

interface DetalleCompraModalProps {
  isOpen: boolean
  onClose: () => void
  compra: any
}

export function DetalleCompraModal({ isOpen, onClose, compra }: DetalleCompraModalProps) {
  if (!compra) return null

  // Formatear fecha
  const formatearFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr)
    return fecha.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  // Obtener badge variant según estado
  const getBadgeVariant = (estado: string) => {
    switch (estado) {
      case "entregado":
        return "success"
      case "en proceso":
        return "secondary"
      case "pendiente":
        return "warning"
      default:
        return "default"
    }
  }

  // Obtener texto del método de pago
  const getMetodoPagoText = (metodoPago: string) => {
    switch (metodoPago) {
      case "efectivo":
        return "Efectivo / Transferencia"
      case "credito":
        return "Tarjeta de Crédito"
      case "debito":
        return "Tarjeta de Débito"
      case "canje":
        return "Canje por Azúcar"
      case "comunitario":
        return "Compra Comunitaria"
      default:
        return metodoPago
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detalle de Compra #{compra.id}</DialogTitle>
          <DialogDescription>Información detallada de su compra del {formatearFecha(compra.fecha)}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Estado:</p>
              <Badge variant={getBadgeVariant(compra.estado)} className="capitalize mt-1">
                {compra.estado}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Método de Pago:</p>
              <p className="font-medium">{getMetodoPagoText(compra.metodoPago)}</p>
            </div>
            {compra.grupoCompra && (
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Grupo de Compra:</p>
                <p className="font-medium">{compra.grupoCompra}</p>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Productos:</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Precio Unitario</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {compra.productos.map((producto: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{producto.nombre}</TableCell>
                    <TableCell className="text-right">{producto.cantidad}</TableCell>
                    <TableCell className="text-right">{formatCurrency(producto.precio)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(producto.precio * producto.cantidad)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="p-4 bg-muted rounded-md">
            <div className="flex justify-between mb-1">
              <span>Subtotal:</span>
              <span>{formatCurrency(compra.total / 1.21)}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>IVA (21%):</span>
              <span>{formatCurrency(compra.total - compra.total / 1.21)}</span>
            </div>
            <div className="flex justify-between font-bold pt-1 border-t">
              <span>Total:</span>
              <span>{formatCurrency(compra.total)}</span>
            </div>
            {compra.tipoPago === "azucar" && (
              <div className="flex justify-between text-blue-600 mt-2 pt-1 border-t border-blue-200">
                <span>Equivalente en azúcar:</span>
                <span>{compra.equivalenteAzucar} toneladas</span>
              </div>
            )}
          </div>

          {compra.estado === "en proceso" && (
            <div className="p-4 bg-yellow-50 rounded-md border border-yellow-200">
              <p className="text-sm text-yellow-800">
                Su pedido está siendo procesado. Recibirá una notificación cuando esté listo para entrega.
              </p>
            </div>
          )}

          {compra.estado === "entregado" && (
            <div className="p-4 bg-green-50 rounded-md border border-green-200">
              <p className="text-sm text-green-800">
                Su pedido ha sido entregado correctamente. Gracias por su compra.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
