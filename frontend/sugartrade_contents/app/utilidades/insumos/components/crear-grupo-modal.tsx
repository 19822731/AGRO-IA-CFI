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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

// Datos de ejemplo para productos disponibles para compra comunitaria
const productosDisponibles = [
  { id: 1, nombre: "Fertilizante Premium Caña", precio: 1200000, unidad: "Tonelada" },
  { id: 2, nombre: "Herbicida Selectivo Avanzado", precio: 850000, unidad: "1000 litros" },
  { id: 3, nombre: "Semillas Certificadas Premium", precio: 1500000, unidad: "Tonelada" },
  { id: 4, nombre: "Nutriente Foliar Concentrado", precio: 750000, unidad: "500 litros" },
  { id: 5, nombre: "Fungicida Biológico Protector", precio: 950000, unidad: "1000 litros" },
]

interface CrearGrupoModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CrearGrupoModal({ isOpen, onClose }: CrearGrupoModalProps) {
  const [nombreGrupo, setNombreGrupo] = useState("")
  const [productoSeleccionado, setProductoSeleccionado] = useState("")
  const [participantesMax, setParticipantesMax] = useState("10")
  const [fechaLimite, setFechaLimite] = useState("")

  const handleCrearGrupo = () => {
    // Aquí iría la lógica para crear el grupo
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Grupo de Compra</DialogTitle>
          <DialogDescription>Complete la información para crear un nuevo grupo de compra comunitaria</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre-grupo">Nombre del Grupo</Label>
            <Input
              id="nombre-grupo"
              placeholder="Ej: Fertilizantes Tucumán Norte"
              value={nombreGrupo}
              onChange={(e) => setNombreGrupo(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="producto">Producto</Label>
            <Select value={productoSeleccionado} onValueChange={setProductoSeleccionado}>
              <SelectTrigger id="producto">
                <SelectValue placeholder="Seleccione un producto" />
              </SelectTrigger>
              <SelectContent>
                {productosDisponibles.map((producto) => (
                  <SelectItem key={producto.id} value={producto.id.toString()}>
                    {producto.nombre} ({producto.unidad})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="participantes-max">Participantes Máximos</Label>
              <Input
                id="participantes-max"
                type="number"
                min="2"
                max="50"
                value={participantesMax}
                onChange={(e) => setParticipantesMax(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha-limite">Fecha Límite</Label>
              <Input
                id="fecha-limite"
                type="date"
                value={fechaLimite}
                onChange={(e) => setFechaLimite(e.target.value)}
              />
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Descuentos por volumen estimados:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>5-9 participantes: 10% de descuento</li>
              <li>10-19 participantes: 15% de descuento</li>
              <li>20+ participantes: 20% de descuento</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleCrearGrupo} disabled={!nombreGrupo || !productoSeleccionado || !fechaLimite}>
            Crear Grupo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
