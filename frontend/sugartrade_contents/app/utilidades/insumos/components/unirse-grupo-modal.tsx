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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/utils"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"

interface UnirseGrupoModalProps {
  isOpen: boolean
  onClose: () => void
  grupo: any
}

export function UnirseGrupoModal({ isOpen, onClose, grupo }: UnirseGrupoModalProps) {
  const [cantidad, setCantidad] = useState("1")

  if (!grupo) return null

  const handleUnirse = () => {
    // Aquí iría la lógica para unirse al grupo
    onClose()
  }

  const cantidadNum = Number.parseInt(cantidad) || 1
  const total = grupo ? grupo.precioGrupal * cantidadNum : 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Unirse al Grupo de Compra</DialogTitle>
          <DialogDescription>Complete la información para unirse al grupo "{grupo?.nombre}"</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-md">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium">{grupo?.producto}</h3>
                <p className="text-sm text-muted-foreground">
                  Precio individual: {formatCurrency(grupo?.precioUnitario)}
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-200">{grupo?.descuento}% descuento</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Precio grupal:</span>
              <span className="font-bold text-green-600">{formatCurrency(grupo?.precioGrupal)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cantidad">Cantidad ({grupo?.unidad})</Label>
            <Input id="cantidad" type="number" min="1" value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
          </div>

          <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">Total a pagar:</span>
              <span className="text-sm font-bold text-blue-800">{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-blue-800">Ahorro:</span>
              <span className="text-sm font-bold text-green-600">
                {formatCurrency((grupo?.precioUnitario - grupo?.precioGrupal) * cantidadNum)}
              </span>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              Al unirse a este grupo, se compromete a realizar la compra si se alcanza el número mínimo de
              participantes.
            </p>
            <p>El pago se realizará una vez que el grupo esté completo o se alcance la fecha límite.</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleUnirse}>Unirse al Grupo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
