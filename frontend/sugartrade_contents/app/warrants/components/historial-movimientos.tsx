"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, FileText, QrCode, History, Package, X } from "lucide-react"
import { useWarrants } from "../hooks/use-warrants"
import type { MovimientoHistorico } from "../hooks/use-warrants"

interface HistorialMovimientosProps {
  movimientos?: MovimientoHistorico[]
  mostrarFiltros?: boolean
}

export function HistorialMovimientos({
  movimientos: movimientosProp,
  mostrarFiltros = true,
}: HistorialMovimientosProps) {
  const { movimientos: todosMovimientos } = useWarrants()
  const movimientosAMostrar = movimientosProp || todosMovimientos

  const [busqueda, setBusqueda] = useState("")
  const [tipoFiltro, setTipoFiltro] = useState("")
  const [entidadFiltro, setEntidadFiltro] = useState("")

  // Formatear la fecha
  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha)
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Obtener el ícono según el tipo de entidad
  const getIconoEntidad = (tipo: string) => {
    switch (tipo) {
      case "warrant":
        return <FileText className="h-4 w-4 text-[#00a8ff]" />
      case "certificado":
        return <QrCode className="h-4 w-4 text-[#00a8ff]" />
      case "ingreso":
        return <Package className="h-4 w-4 text-[#00a8ff]" />
      default:
        return <History className="h-4 w-4 text-[#00a8ff]" />
    }
  }

  // Filtrar movimientos
  const movimientosFiltrados = movimientosAMostrar.filter((m) => {
    // Filtrar por búsqueda
    if (busqueda && !m.descripcion.toLowerCase().includes(busqueda.toLowerCase())) {
      return false
    }

    // Filtrar por tipo
    if (tipoFiltro && m.tipo !== tipoFiltro) {
      return false
    }

    // Filtrar por entidad
    if (entidadFiltro && m.entidadTipo !== entidadFiltro) {
      return false
    }

    return true
  })

  return (
    <Card className="bg-[#111936] border-[#1a2040]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-white flex items-center">
          <History className="h-5 w-5 mr-2 text-[#00a8ff]" />
          Historial de Movimientos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {mostrarFiltros && (
          <div className="mb-4 space-y-4">
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Buscar en el historial..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="bg-[#0a0f29] border-[#1a2040] text-white pl-9"
                />
              </div>
              <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                <SelectTrigger className="w-[180px] bg-[#0a0f29] border-[#1a2040] text-white">
                  <SelectValue placeholder="Tipo de movimiento" />
                </SelectTrigger>
                <SelectContent className="bg-[#111936] border-[#1a2040] text-white">
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ingreso">Ingreso</SelectItem>
                  <SelectItem value="generacion_warrant">Generación Warrant</SelectItem>
                  <SelectItem value="generacion_certificado">Generación Certificado</SelectItem>
                  <SelectItem value="cambio_estado">Cambio de Estado</SelectItem>
                  <SelectItem value="operacion_caja_punta">Operación Caja Punta</SelectItem>
                  <SelectItem value="operacion_canje">Operación Canje</SelectItem>
                </SelectContent>
              </Select>
              <Select value={entidadFiltro} onValueChange={setEntidadFiltro}>
                <SelectTrigger className="w-[180px] bg-[#0a0f29] border-[#1a2040] text-white">
                  <SelectValue placeholder="Tipo de entidad" />
                </SelectTrigger>
                <SelectContent className="bg-[#111936] border-[#1a2040] text-white">
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="warrant">Warrant</SelectItem>
                  <SelectItem value="certificado">Certificado</SelectItem>
                  <SelectItem value="ingreso">Ingreso</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => {
                  setBusqueda("")
                  setTipoFiltro("")
                  setEntidadFiltro("")
                }}
                className="border-[#1a2040] text-gray-300 hover:bg-[#1a2040] hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="rounded-md border border-[#1a2040]">
          <Table>
            <TableHeader className="bg-[#0a0f29]">
              <TableRow className="border-[#1a2040] hover:bg-[#1a2040]/50">
                <TableHead className="text-gray-400">Fecha</TableHead>
                <TableHead className="text-gray-400">Tipo</TableHead>
                <TableHead className="text-gray-400">Descripción</TableHead>
                <TableHead className="text-gray-400">Entidad</TableHead>
                <TableHead className="text-gray-400">Usuario</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movimientosFiltrados.length === 0 ? (
                <TableRow className="border-[#1a2040] hover:bg-[#1a2040]/50">
                  <TableCell colSpan={5} className="text-center text-gray-400 py-8">
                    No se encontraron movimientos
                  </TableCell>
                </TableRow>
              ) : (
                movimientosFiltrados.map((movimiento) => (
                  <TableRow key={movimiento.id} className="border-[#1a2040] hover:bg-[#1a2040]/50">
                    <TableCell className="text-white">{formatearFecha(movimiento.fecha)}</TableCell>
                    <TableCell className="text-white capitalize">{movimiento.tipo.replace(/_/g, " ")}</TableCell>
                    <TableCell className="text-white">{movimiento.descripcion}</TableCell>
                    <TableCell className="text-white">
                      <div className="flex items-center">
                        {getIconoEntidad(movimiento.entidadTipo)}
                        <span className="ml-1 capitalize">{movimiento.entidadTipo}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-white">{movimiento.usuarioNombre}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
