"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { Consolidacion } from "../types/zona-primaria"

interface HistorialConsolidacionesProps {
  consolidaciones: Consolidacion[]
}

export function HistorialConsolidaciones({ consolidaciones }: HistorialConsolidacionesProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Consolidaciones</CardTitle>
        <CardDescription>
          Registro histórico de todas las consolidaciones realizadas en la zona primaria.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {consolidaciones.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Camión</TableHead>
                <TableHead>Mercancías</TableHead>
                <TableHead>Peso</TableHead>
                <TableHead>Costo</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {consolidaciones.map((consolidacion) => {
                const pesoTotal = consolidacion.mercancias.reduce((sum, m) => sum + m.peso, 0)

                return (
                  <TableRow key={consolidacion.id}>
                    <TableCell>
                      {formatDate(consolidacion.fechaInicio)}
                      {consolidacion.fechaFinalizacion && (
                        <span className="block text-xs text-muted-foreground">
                          Finalizada: {formatDate(consolidacion.fechaFinalizacion)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{consolidacion.camion.patente}</span>
                      <span className="block text-xs text-muted-foreground">{consolidacion.camion.empresa}</span>
                    </TableCell>
                    <TableCell>{consolidacion.mercancias.length}</TableCell>
                    <TableCell>
                      {pesoTotal.toLocaleString()} kg
                      {consolidacion.camion.pesoEntrada && consolidacion.camion.pesoSalida && (
                        <span className="block text-xs text-muted-foreground">
                          Diferencia:{" "}
                          {(consolidacion.camion.pesoEntrada - consolidacion.camion.pesoSalida).toLocaleString()} kg
                        </span>
                      )}
                    </TableCell>
                    <TableCell>${consolidacion.costoTotal.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Completada
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No hay consolidaciones registradas en el historial.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
