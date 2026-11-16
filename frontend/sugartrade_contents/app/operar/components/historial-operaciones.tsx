"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, ArrowUpDown, Download } from "lucide-react"

// Tipos para las operaciones
interface OperacionHistorica {
  id: string
  fecha: string
  hora: string
  tipo: "compra" | "venta"
  precio: number
  cantidad: number
  valor: number
  estado: "completada" | "pendiente" | "cancelada"
  contraparte: string
}

// Datos de ejemplo para el historial
const operacionesIniciales: OperacionHistorica[] = [
  {
    id: "op-001",
    fecha: "2023-11-15",
    hora: "10:23:45",
    tipo: "compra",
    precio: 19.85,
    cantidad: 100,
    valor: 1985,
    estado: "completada",
    contraparte: "Trader A",
  },
  {
    id: "op-002",
    fecha: "2023-11-15",
    hora: "11:05:12",
    tipo: "venta",
    precio: 19.9,
    cantidad: 50,
    valor: 995,
    estado: "completada",
    contraparte: "Trader B",
  },
  {
    id: "op-003",
    fecha: "2023-11-14",
    hora: "15:30:22",
    tipo: "compra",
    precio: 19.75,
    cantidad: 200,
    valor: 3950,
    estado: "completada",
    contraparte: "Trader C",
  },
  {
    id: "op-004",
    fecha: "2023-11-14",
    hora: "16:45:33",
    tipo: "venta",
    precio: 19.8,
    cantidad: 150,
    valor: 2970,
    estado: "completada",
    contraparte: "Trader D",
  },
  {
    id: "op-005",
    fecha: "2023-11-13",
    hora: "09:15:10",
    tipo: "compra",
    precio: 19.7,
    cantidad: 75,
    valor: 1477.5,
    estado: "completada",
    contraparte: "Trader E",
  },
  {
    id: "op-006",
    fecha: "2023-11-13",
    hora: "14:20:05",
    tipo: "venta",
    precio: 19.65,
    cantidad: 120,
    valor: 2358,
    estado: "cancelada",
    contraparte: "Trader F",
  },
  {
    id: "op-007",
    fecha: "2023-11-12",
    hora: "11:30:45",
    tipo: "compra",
    precio: 19.6,
    cantidad: 90,
    valor: 1764,
    estado: "pendiente",
    contraparte: "Trader G",
  },
  {
    id: "op-008",
    fecha: "2023-11-12",
    hora: "13:10:30",
    tipo: "venta",
    precio: 19.55,
    cantidad: 60,
    valor: 1173,
    estado: "completada",
    contraparte: "Trader H",
  },
]

export default function HistorialOperaciones() {
  const [operaciones, setOperaciones] = useState<OperacionHistorica[]>(operacionesIniciales)
  const [busqueda, setBusqueda] = useState("")
  const [filtroTipo, setFiltroTipo] = useState<string>("todos")
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")
  const [ordenFecha, setOrdenFecha] = useState<"asc" | "desc">("desc")

  // Función para filtrar operaciones
  const operacionesFiltradas = operaciones.filter((op) => {
    // Filtro por búsqueda
    const terminoBusqueda = busqueda.toLowerCase()
    const coincideBusqueda =
      terminoBusqueda === "" ||
      op.id.toLowerCase().includes(terminoBusqueda) ||
      op.contraparte.toLowerCase().includes(terminoBusqueda) ||
      op.fecha.includes(terminoBusqueda)

    // Filtro por tipo
    const coincideTipo = filtroTipo === "todos" || op.tipo === filtroTipo

    // Filtro por estado
    const coincideEstado = filtroEstado === "todos" || op.estado === filtroEstado

    return coincideBusqueda && coincideTipo && coincideEstado
  })

  // Función para ordenar operaciones
  const operacionesOrdenadas = [...operacionesFiltradas].sort((a, b) => {
    const fechaA = new Date(`${a.fecha}T${a.hora}`).getTime()
    const fechaB = new Date(`${b.fecha}T${b.hora}`).getTime()
    return ordenFecha === "asc" ? fechaA - fechaB : fechaB - fechaA
  })

  // Función para cambiar el orden de las fechas
  const cambiarOrdenFecha = () => {
    setOrdenFecha(ordenFecha === "asc" ? "desc" : "asc")
  }

  // Función para formatear la fecha
  const formatearFecha = (fecha: string) => {
    const [año, mes, dia] = fecha.split("-")
    return `${dia}/${mes}/${año}`
  }

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-xl font-bold">Historial de Operaciones</CardTitle>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-8 h-9 w-[200px]"
              />
            </div>
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="h-9 w-[130px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="compra">Compra</SelectItem>
                <SelectItem value="venta">Venta</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="h-9 w-[130px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="completada">Completada</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="h-9">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead className="w-[120px]" onClick={cambiarOrdenFecha} className="cursor-pointer">
                  <div className="flex items-center">
                    Fecha
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Contraparte</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operacionesOrdenadas.length > 0 ? (
                operacionesOrdenadas.map((operacion) => (
                  <TableRow key={operacion.id}>
                    <TableCell className="font-medium">{operacion.id}</TableCell>
                    <TableCell>{formatearFecha(operacion.fecha)}</TableCell>
                    <TableCell>{operacion.hora}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          operacion.tipo === "compra"
                            ? "bg-green-600/10 text-green-600 border-green-600/20"
                            : "bg-red-600/10 text-red-600 border-red-600/20"
                        }
                      >
                        {operacion.tipo === "compra" ? "Compra" : "Venta"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">${operacion.precio.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{operacion.cantidad}</TableCell>
                    <TableCell className="text-right">${operacion.valor.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          operacion.estado === "completada"
                            ? "bg-green-600/10 text-green-600 border-green-600/20"
                            : operacion.estado === "pendiente"
                              ? "bg-yellow-600/10 text-yellow-600 border-yellow-600/20"
                              : "bg-red-600/10 text-red-600 border-red-600/20"
                        }
                      >
                        {operacion.estado === "completada"
                          ? "Completada"
                          : operacion.estado === "pendiente"
                            ? "Pendiente"
                            : "Cancelada"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{operacion.contraparte}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    No se encontraron operaciones
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
