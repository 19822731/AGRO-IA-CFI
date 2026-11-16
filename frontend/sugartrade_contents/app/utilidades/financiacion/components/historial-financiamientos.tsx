"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"

// Datos de ejemplo para el historial
const historialEjemplo = [
  {
    id: "fin1",
    tipo: "sgr",
    descripcion: "Financiamiento SGR para capital de trabajo",
    monto: 5000000,
    plazo: 12,
    tasa: 9.5,
    estado: "completado",
  },
  {
    id: "fin2",
    tipo: "echeq",
    descripcion: "Descuento de eCheq",
    monto: 2500000,
    plazo: 6,
    tasa: 8.75,
    estado: "rechazado",
  },
  {
    id: "fin3",
    tipo: "agroinsumos",
    descripcion: "Compra de fertilizantes",
    monto: 850000,
    plazo: 3,
    tasa: 12.5,
    estado: "completado",
  },
]

export function HistorialFinanciamientos() {
  // Función para obtener el color de la badge según el estado
  const getBadgeVariant = (estado?: string) => {
    switch (estado) {
      case "completado":
        return "success"
      case "rechazado":
        return "destructive"
      case "pendiente":
        return "warning"
      case "aprobado":
        return "default"
      default:
        return "secondary"
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Historial de Financiamientos</CardTitle>
      </CardHeader>
      <CardContent>
        {historialEjemplo.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No hay financiamientos en el historial</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead className="text-right">Plazo</TableHead>
                <TableHead className="text-right">Tasa</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historialEjemplo.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="capitalize">{item.tipo}</TableCell>
                  <TableCell>{item.descripcion}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.monto)}</TableCell>
                  <TableCell className="text-right">{item.plazo} meses</TableCell>
                  <TableCell className="text-right">{item.tasa}%</TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(item.estado) as any} className="capitalize">
                      {item.estado}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
