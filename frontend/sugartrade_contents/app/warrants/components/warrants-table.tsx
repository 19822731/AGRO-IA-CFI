"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, FileText, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface WarrantsTableProps {
  titulo?: string
  mostrarTodos?: boolean
}

export function WarrantsTable({ titulo = "Warrants", mostrarTodos = true }: WarrantsTableProps) {
  // Datos de ejemplo
  const warrants = [
    {
      id: "warrant-1",
      numero: "W-001",
      bolsasTotal: 500,
      fechaEmision: "2023-05-15T10:00:00Z",
      fechaVencimiento: "2023-11-15T10:00:00Z",
      estado: "activo",
      certificados: ["cert-1", "cert-2"],
    },
    {
      id: "warrant-2",
      numero: "W-002",
      bolsasTotal: 300,
      fechaEmision: "2023-06-20T10:00:00Z",
      fechaVencimiento: "2023-12-20T10:00:00Z",
      estado: "activo",
      certificados: ["cert-3"],
    },
    {
      id: "warrant-3",
      numero: "W-003",
      bolsasTotal: 200,
      fechaEmision: "2023-04-10T10:00:00Z",
      fechaVencimiento: "2023-10-10T10:00:00Z",
      estado: "vencido",
      certificados: ["cert-4", "cert-5", "cert-6"],
    },
  ]

  // Formatear la fecha
  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha)
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  // Obtener el estado del warrant
  const getEstadoWarrant = (estado: string) => {
    switch (estado) {
      case "activo":
        return <Badge className="bg-green-100 text-green-800 border-green-300">Activo</Badge>
      case "vencido":
        return <Badge className="bg-red-100 text-red-800 border-red-300">Vencido</Badge>
      case "cancelado":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">Cancelado</Badge>
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  // Filtrar warrants si no se deben mostrar todos
  const warrantsAMostrar = mostrarTodos ? warrants : warrants.slice(0, 2)

  return (
    <Card className="bg-[#111936] border-[#1a2040]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-white">{titulo}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-[#1a2040]">
          <Table>
            <TableHeader className="bg-[#0a0f29]">
              <TableRow className="border-[#1a2040] hover:bg-[#1a2040]/50">
                <TableHead className="text-gray-400">Número</TableHead>
                <TableHead className="text-gray-400">Bolsas</TableHead>
                <TableHead className="text-gray-400">Emisión</TableHead>
                <TableHead className="text-gray-400">Vencimiento</TableHead>
                <TableHead className="text-gray-400">Estado</TableHead>
                <TableHead className="text-gray-400">Certificados</TableHead>
                <TableHead className="text-gray-400 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {warrantsAMostrar.length === 0 ? (
                <TableRow className="border-[#1a2040] hover:bg-[#1a2040]/50">
                  <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                    No se encontraron warrants
                  </TableCell>
                </TableRow>
              ) : (
                warrantsAMostrar.map((warrant) => (
                  <TableRow key={warrant.id} className="border-[#1a2040] hover:bg-[#1a2040]/50">
                    <TableCell className="text-white font-medium">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-[#00a8ff]" />
                        {warrant.numero}
                      </div>
                    </TableCell>
                    <TableCell className="text-white">{warrant.bolsasTotal} BLS</TableCell>
                    <TableCell className="text-white">{formatearFecha(warrant.fechaEmision)}</TableCell>
                    <TableCell className="text-white">{formatearFecha(warrant.fechaVencimiento)}</TableCell>
                    <TableCell>{getEstadoWarrant(warrant.estado)}</TableCell>
                    <TableCell className="text-white">{warrant.certificados.length}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#1a2040] text-[#00a8ff] hover:bg-[#1a2040] hover:text-white"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#1a2040] text-gray-300 hover:bg-[#1a2040] hover:text-white"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          PDF
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {!mostrarTodos && warrants.length > 2 && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              size="sm"
              className="border-[#1a2040] text-gray-300 hover:bg-[#1a2040] hover:text-white"
            >
              Ver todos los warrants
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
