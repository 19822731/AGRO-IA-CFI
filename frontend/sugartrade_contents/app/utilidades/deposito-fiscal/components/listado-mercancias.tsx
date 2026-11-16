"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Mercancia, EstadoMercancia } from "../types"
import { toast } from "@/components/ui/use-toast"

interface ListadoMercanciasProps {
  mercancias: Mercancia[]
  actualizarEstado: (id: string, estado: EstadoMercancia) => void
  retirarMercancia: (id: string) => void
}

export function ListadoMercancias({ mercancias, actualizarEstado, retirarMercancia }: ListadoMercanciasProps) {
  const [selectedMercancia, setSelectedMercancia] = useState<Mercancia | null>(null)
  const [nuevoEstado, setNuevoEstado] = useState<EstadoMercancia>("ingresada")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [retirarDialogOpen, setRetirarDialogOpen] = useState(false)

  const formatDate = (date: Date | null) => {
    if (!date) return "-"
    return new Date(date).toLocaleDateString()
  }

  const getEstadoBadge = (estado: EstadoMercancia) => {
    switch (estado) {
      case "ingresada":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Ingresada
          </Badge>
        )
      case "en-proceso":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            En Proceso
          </Badge>
        )
      case "retirada":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            Retirada
          </Badge>
        )
      case "en-inspección":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            En Inspección
          </Badge>
        )
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  const handleCambiarEstado = () => {
    if (selectedMercancia && nuevoEstado) {
      actualizarEstado(selectedMercancia.id, nuevoEstado)
      toast({
        title: "Estado actualizado",
        description: `La mercancía ahora tiene el estado: ${nuevoEstado}`,
      })
      setDialogOpen(false)
    }
  }

  const handleRetirarMercancia = () => {
    if (selectedMercancia) {
      retirarMercancia(selectedMercancia.id)
      toast({
        title: "Mercancía retirada",
        description: "La mercancía ha sido marcada como retirada del depósito fiscal.",
      })
      setRetirarDialogOpen(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Listado de Mercancías</CardTitle>
        <CardDescription>Gestione las mercancías almacenadas en el depósito fiscal.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descripción</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Ingreso</TableHead>
              <TableHead>Peso (kg)</TableHead>
              <TableHead>Valor (USD)</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mercancias.map((mercancia) => (
              <TableRow key={mercancia.id}>
                <TableCell className="font-medium">{mercancia.descripcion}</TableCell>
                <TableCell>{mercancia.cliente}</TableCell>
                <TableCell>{formatDate(mercancia.fechaIngreso)}</TableCell>
                <TableCell>{mercancia.peso.toLocaleString()}</TableCell>
                <TableCell>{mercancia.valor.toLocaleString()}</TableCell>
                <TableCell>{getEstadoBadge(mercancia.estado)}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedMercancia(mercancia)
                        setNuevoEstado(mercancia.estado)
                        setDialogOpen(true)
                      }}
                      disabled={mercancia.estado === "retirada"}
                    >
                      Cambiar Estado
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedMercancia(mercancia)
                        setRetirarDialogOpen(true)
                      }}
                      disabled={mercancia.estado === "retirada"}
                    >
                      Retirar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cambiar Estado de Mercancía</DialogTitle>
              <DialogDescription>
                Seleccione el nuevo estado para la mercancía: {selectedMercancia?.descripcion}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Select value={nuevoEstado} onValueChange={(value) => setNuevoEstado(value as EstadoMercancia)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar nuevo estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ingresada">Ingresada</SelectItem>
                  <SelectItem value="en-proceso">En Proceso</SelectItem>
                  <SelectItem value="en-inspección">En Inspección</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCambiarEstado}>Guardar Cambios</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={retirarDialogOpen} onOpenChange={setRetirarDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Retirar Mercancía</DialogTitle>
              <DialogDescription>
                ¿Está seguro que desea marcar esta mercancía como retirada del depósito fiscal?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="font-medium">{selectedMercancia?.descripcion}</p>
              <p className="text-sm text-muted-foreground mt-1">Cliente: {selectedMercancia?.cliente}</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRetirarDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleRetirarMercancia}>
                Confirmar Retiro
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
