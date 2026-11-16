"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DetalleCompraModal } from "./detalle-compra-modal"

// Datos de ejemplo para el historial de compras
const historialCompras = [
  {
    id: 1,
    fecha: "2025-04-01",
    productos: [
      { nombre: "Fertilizante Premium Caña", cantidad: 2, precio: 1080000 },
      { nombre: "Herbicida Selectivo Avanzado", cantidad: 1, precio: 807500 },
    ],
    total: 2967500,
    metodoPago: "efectivo",
    estado: "entregado",
    tipoPago: "dinero",
  },
  {
    id: 2,
    fecha: "2025-03-15",
    productos: [{ nombre: "Semillas Certificadas Premium", cantidad: 1, precio: 1500000 }],
    total: 1500000,
    metodoPago: "canje",
    estado: "entregado",
    tipoPago: "azucar",
    equivalenteAzucar: 1.875, // toneladas
  },
  {
    id: 3,
    fecha: "2025-03-10",
    productos: [
      { nombre: "Nutriente Foliar Concentrado", cantidad: 2, precio: 637500 },
      { nombre: "Fungicida Biológico Protector", cantidad: 1, precio: 874000 },
    ],
    total: 2149000,
    metodoPago: "credito",
    estado: "en proceso",
    tipoPago: "dinero",
  },
  {
    id: 4,
    fecha: "2025-02-28",
    productos: [{ nombre: "Fertilizante Orgánico Certificado", cantidad: 3, precio: 862400 }],
    total: 2587200,
    metodoPago: "comunitario",
    estado: "entregado",
    tipoPago: "dinero",
    grupoCompra: "Fertilizantes Tucumán Norte",
  },
]

export function HistorialCompras() {
  const [filtroEstado, setFiltroEstado] = useState("")
  const [filtroTipoPago, setFiltroTipoPago] = useState("")
  const [filtroBusqueda, setFiltroBusqueda] = useState("")
  const [compraSeleccionada, setCompraSeleccionada] = useState<any>(null)
  const [showDetalleModal, setShowDetalleModal] = useState(false)

  // Filtrar compras
  const comprasFiltradas = historialCompras.filter((compra) => {
    const matchEstado = filtroEstado ? compra.estado === filtroEstado : true
    const matchTipoPago = filtroTipoPago ? compra.tipoPago === filtroTipoPago : true
    const matchBusqueda = filtroBusqueda
      ? compra.productos.some((p) => p.nombre.toLowerCase().includes(filtroBusqueda.toLowerCase())) ||
        (compra.grupoCompra && compra.grupoCompra.toLowerCase().includes(filtroBusqueda.toLowerCase()))
      : true
    return matchEstado && matchTipoPago && matchBusqueda
  })

  // Formatear fecha
  const formatearFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr)
    return fecha.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  const handleVerDetalle = (compra: any) => {
    setCompraSeleccionada(compra)
    setShowDetalleModal(true)
  }

  // Obtener badge variant según estado
  const getBadgeVariant = (estado: string) => {
    switch (estado) {
      case "entregado":
        return "success"
      case "en proceso":
        return "secondary"
      case "pendiente":
        return "warning"
      default:
        return "default"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Historial de Compras</CardTitle>
          <CardDescription>Consulte sus compras anteriores y su estado actual</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <div className="space-y-2">
              <Label htmlFor="filtro-estado">Estado</Label>
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger id="filtro-estado">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="entregado">Entregado</SelectItem>
                  <SelectItem value="en proceso">En proceso</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="filtro-tipo-pago">Tipo de Pago</Label>
              <Select value={filtroTipoPago} onValueChange={setFiltroTipoPago}>
                <SelectTrigger id="filtro-tipo-pago">
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="dinero">Dinero</SelectItem>
                  <SelectItem value="azucar">Canje por Azúcar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="filtro-busqueda">Búsqueda</Label>
              <Input
                id="filtro-busqueda"
                placeholder="Buscar por producto o grupo..."
                value={filtroBusqueda}
                onChange={(e) => setFiltroBusqueda(e.target.value)}
              />
            </div>
          </div>

          {comprasFiltradas.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Método de Pago</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comprasFiltradas.map((compra) => (
                  <TableRow key={compra.id}>
                    <TableCell>{formatearFecha(compra.fecha)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{compra.productos[0].nombre}</p>
                        {compra.productos.length > 1 && (
                          <p className="text-sm text-muted-foreground">+{compra.productos.length - 1} productos más</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {compra.tipoPago === "azucar" ? (
                        <div>
                          <p>{formatCurrency(compra.total)}</p>
                          <p className="text-sm text-blue-600">({compra.equivalenteAzucar} ton. azúcar)</p>
                        </div>
                      ) : (
                        formatCurrency(compra.total)
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {compra.metodoPago === "comunitario"
                          ? "Compra Comunitaria"
                          : compra.metodoPago === "canje"
                            ? "Canje por Azúcar"
                            : compra.metodoPago}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(compra.estado)} className="capitalize">
                        {compra.estado}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleVerDetalle(compra)}>
                        Ver Detalle
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron compras que coincidan con los filtros
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalle */}
      <DetalleCompraModal
        isOpen={showDetalleModal}
        onClose={() => setShowDetalleModal(false)}
        compra={compraSeleccionada}
      />
    </div>
  )
}
