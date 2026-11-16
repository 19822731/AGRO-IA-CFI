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
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

// Datos de ejemplo para certificados disponibles
const certificadosDisponibles = [
  { id: 1, numero: "CD-2023-001", producto: "Azúcar Blanca", cantidad: "500 ton", valor: 2500000 },
  { id: 2, numero: "CD-2023-002", producto: "Azúcar Blanca", cantidad: "450 ton", valor: 2250000 },
  { id: 3, numero: "CD-2023-003", producto: "Azúcar Cruda", cantidad: "600 ton", valor: 2700000 },
]

interface OpcionesCanjeModalProps {
  isOpen: boolean
  onClose: () => void
  total: number
  equivalenteAzucar: number
  onConfirm: () => void
}

export function OpcionesCanjeModal({ isOpen, onClose, total, equivalenteAzucar, onConfirm }: OpcionesCanjeModalProps) {
  const [certificadoSeleccionado, setCertificadoSeleccionado] = useState("")

  const handleConfirmar = () => {
    onConfirm()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Opciones de Canje por Azúcar</DialogTitle>
          <DialogDescription>
            Seleccione los certificados de azúcar que desea utilizar para esta compra
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">Total a pagar:</span>
              <span className="text-sm font-bold text-blue-800">{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-blue-800">Equivalente en azúcar:</span>
              <span className="text-sm font-bold text-blue-800">{equivalenteAzucar.toFixed(2)} toneladas</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="certificado">Seleccione certificado de azúcar</Label>
            <Select value={certificadoSeleccionado} onValueChange={setCertificadoSeleccionado}>
              <SelectTrigger id="certificado">
                <SelectValue placeholder="Seleccione un certificado" />
              </SelectTrigger>
              <SelectContent>
                {certificadosDisponibles.map((cert) => (
                  <SelectItem key={cert.id} value={cert.id.toString()}>
                    {cert.numero} - {cert.producto} ({cert.cantidad})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {certificadoSeleccionado && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Certificado:</span>
                    <span className="text-sm font-medium">
                      {certificadosDisponibles.find((c) => c.id.toString() === certificadoSeleccionado)?.numero}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Producto:</span>
                    <span className="text-sm font-medium">
                      {certificadosDisponibles.find((c) => c.id.toString() === certificadoSeleccionado)?.producto}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Cantidad disponible:</span>
                    <span className="text-sm font-medium">
                      {certificadosDisponibles.find((c) => c.id.toString() === certificadoSeleccionado)?.cantidad}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Valor:</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(
                        certificadosDisponibles.find((c) => c.id.toString() === certificadoSeleccionado)?.valor || 0,
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="text-sm text-muted-foreground">
            <p>Al confirmar, se utilizará el certificado seleccionado para el pago de esta compra.</p>
            <p>El saldo restante del certificado seguirá disponible para futuras operaciones.</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmar} disabled={!certificadoSeleccionado}>
            Confirmar Canje
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
