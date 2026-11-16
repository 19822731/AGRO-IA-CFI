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
import { formatCurrency } from "@/lib/utils"
import { CheckCircle2 } from "lucide-react"

interface ConfirmacionCompraModalProps {
  isOpen: boolean
  onClose: () => void
  metodoPago: string
  usarCanje: boolean
  total: number
  onConfirm: () => void
}

export function ConfirmacionCompraModal({
  isOpen,
  onClose,
  metodoPago,
  usarCanje,
  total,
  onConfirm,
}: ConfirmacionCompraModalProps) {
  const getMetodoPagoText = () => {
    if (usarCanje) return "Canje por Azúcar"

    switch (metodoPago) {
      case "efectivo":
        return "Efectivo / Transferencia"
      case "credito":
        return "Tarjeta de Crédito"
      case "debito":
        return "Tarjeta de Débito"
      case "financiacion":
        return "Financiación"
      default:
        return metodoPago
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Confirmación de Compra</DialogTitle>
          <DialogDescription>Su compra ha sido procesada correctamente</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-6 space-y-4">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>

          <h3 className="text-xl font-bold text-center">¡Gracias por su compra!</h3>

          <div className="text-center space-y-1">
            <p>
              Total: <span className="font-bold">{formatCurrency(total)}</span>
            </p>
            <p>
              Método de pago: <span className="font-medium">{getMetodoPagoText()}</span>
            </p>
          </div>

          <div className="text-center text-sm text-muted-foreground max-w-sm">
            <p>Recibirá un correo electrónico con los detalles de su compra y la información de entrega.</p>
            {usarCanje && (
              <p className="mt-2">
                El certificado de azúcar seleccionado ha sido actualizado con el nuevo saldo disponible.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onConfirm} className="w-full">
            Aceptar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
