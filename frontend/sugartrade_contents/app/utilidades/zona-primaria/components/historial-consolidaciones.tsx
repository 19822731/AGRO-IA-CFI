"use client"

import { useZonaPrimaria } from "../hooks/use-zona-primaria"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function HistorialConsolidaciones() {
  const { consolidaciones } = useZonaPrimaria()

  if (consolidaciones.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historial de Consolidaciones</CardTitle>
          <CardDescription>
            Aquí podrás ver el historial de todas las consolidaciones realizadas en la Zona Primaria.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-gray-500">No hay consolidaciones registradas</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Consolidaciones</CardTitle>
        <CardDescription>Historial de todas las consolidaciones realizadas en la Zona Primaria.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Camión</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Costo</TableHead>
              <TableHead>Mercancías</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {consolidaciones.map((consolidacion) => (
              <TableRow key={consolidacion.id}>
                <TableCell className="font-medium">{consolidacion.id}</TableCell>
                <TableCell>{consolidacion.camion.patente}</TableCell>
                <TableCell>{consolidacion.fechaInicio.toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      consolidacion.estado === "completada"
                        ? "default"
                        : consolidacion.estado === "cancelada"
                          ? "destructive"
                          : "outline"
                    }
                  >
                    {consolidacion.estado === "completada"
                      ? "Completada"
                      : consolidacion.estado === "cancelada"
                        ? "Cancelada"
                        : consolidacion.estado === "en_proceso"
                          ? "En proceso"
                          : "Pendiente"}
                  </Badge>
                </TableCell>
                <TableCell>USD {consolidacion.costoTotal}</TableCell>
                <TableCell>{consolidacion.mercancias.length}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
