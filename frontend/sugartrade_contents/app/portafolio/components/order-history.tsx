"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Filter, Search, Calendar, Download, X } from "lucide-react"

// Datos simulados de historial de órdenes
const mockOrders = [
  {
    id: "O001",
    date: "2023-12-20T09:30:00",
    type: "buy",
    symbol: "Contrato #11 - Mar 2024",
    quantity: 3,
    orderType: "limit",
    limitPrice: 19.85,
    status: "executed",
    executionPrice: 19.85,
  },
  {
    id: "O002",
    date: "2023-12-19T14:15:00",
    type: "sell",
    symbol: "Contrato #5 - May 2024",
    quantity: 2,
    orderType: "limit",
    limitPrice: 22.15,
    status: "executed",
    executionPrice: 22.15,
  },
  {
    id: "O003",
    date: "2023-12-18T11:45:00",
    type: "buy",
    symbol: "Contrato #11 - Jul 2024",
    quantity: 2,
    orderType: "limit",
    limitPrice: 20.1,
    status: "executed",
    executionPrice: 20.1,
  },
  {
    id: "O004",
    date: "2023-12-18T10:30:00",
    type: "buy",
    symbol: "Mercado Interno - Spot",
    quantity: 10,
    orderType: "market",
    status: "executed",
    executionPrice: 4250.0,
  },
  {
    id: "O005",
    date: "2023-12-17T15:20:00",
    type: "buy",
    symbol: "Contrato #11 - Mar 2024",
    quantity: 2,
    orderType: "limit",
    limitPrice: 19.75,
    status: "executed",
    executionPrice: 19.75,
  },
  {
    id: "O006",
    date: "2023-12-15T09:45:00",
    type: "sell",
    symbol: "Contrato #5 - May 2024",
    quantity: 1,
    orderType: "limit",
    limitPrice: 22.25,
    status: "executed",
    executionPrice: 22.25,
  },
  {
    id: "O007",
    date: "2023-12-21T08:30:00",
    type: "buy",
    symbol: "Contrato #11 - Mar 2024",
    quantity: 5,
    orderType: "limit",
    limitPrice: 19.6,
    status: "pending",
  },
  {
    id: "O008",
    date: "2023-12-20T16:15:00",
    type: "sell",
    symbol: "Mercado Interno - Spot",
    quantity: 5,
    orderType: "limit",
    limitPrice: 4350.0,
    status: "pending",
  },
  {
    id: "O009",
    date: "2023-12-19T13:45:00",
    type: "buy",
    symbol: "Contrato #5 - May 2024",
    quantity: 3,
    orderType: "stop",
    limitPrice: 21.5,
    status: "pending",
  },
  {
    id: "O010",
    date: "2023-12-18T10:00:00",
    type: "sell",
    symbol: "Contrato #11 - Jul 2024",
    quantity: 2,
    orderType: "limit",
    limitPrice: 20.5,
    status: "cancelled",
  },
]

export default function OrderHistory() {
  const [orders, setOrders] = useState(mockOrders)
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Filtrar órdenes según los criterios seleccionados
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    const matchesType = typeFilter === "all" || order.type === typeFilter
    const matchesSearch =
      searchQuery === "" ||
      order.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesStatus && matchesType && matchesSearch
  })

  // Función para cancelar una orden pendiente (simulada)
  const handleCancelOrder = (orderId: string) => {
    setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: "cancelled" } : order)))
  }

  // Función para obtener el color según el estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case "executed":
        return "bg-green-900/50 text-green-400"
      case "pending":
        return "bg-yellow-900/50 text-yellow-400"
      case "cancelled":
        return "bg-red-900/50 text-red-400"
      default:
        return "bg-gray-900/50 text-gray-400"
    }
  }

  // Función para obtener el texto según el estado
  const getStatusText = (status: string) => {
    switch (status) {
      case "executed":
        return "Ejecutada"
      case "pending":
        return "Pendiente"
      case "cancelled":
        return "Cancelada"
      default:
        return "Desconocido"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Historial de Órdenes</h2>
          <p className="text-sm text-gray-400">Consulte y gestione sus órdenes recientes</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Filtrar por fecha
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <Card className="bg-[#111936] border-[#1a2040]">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <CardTitle className="text-white">Órdenes</CardTitle>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por símbolo o ID"
                  className="pl-8 bg-[#0a0f29] border-[#1a2040]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px] bg-[#0a0f29] border-[#1a2040]">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0f29] border-[#1a2040]">
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="executed">Ejecutadas</SelectItem>
                    <SelectItem value="pending">Pendientes</SelectItem>
                    <SelectItem value="cancelled">Canceladas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[150px] bg-[#0a0f29] border-[#1a2040]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0f29] border-[#1a2040]">
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="buy">Compra</SelectItem>
                    <SelectItem value="sell">Venta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No se encontraron órdenes con los filtros seleccionados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-[#1a2040]">
                    <TableHead className="text-gray-400">ID</TableHead>
                    <TableHead className="text-gray-400">Fecha</TableHead>
                    <TableHead className="text-gray-400">Tipo</TableHead>
                    <TableHead className="text-gray-400">Símbolo</TableHead>
                    <TableHead className="text-gray-400">Cantidad</TableHead>
                    <TableHead className="text-gray-400">Tipo de Orden</TableHead>
                    <TableHead className="text-gray-400">Precio Límite</TableHead>
                    <TableHead className="text-gray-400">Estado</TableHead>
                    <TableHead className="text-gray-400">Precio Ejecución</TableHead>
                    <TableHead className="text-gray-400">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-[#1a2040]">
                      <TableCell className="font-medium text-white">{order.id}</TableCell>
                      <TableCell>
                        {new Date(order.date).toLocaleDateString("es-AR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs ${order.type === "buy" ? "bg-green-900/50 text-green-400" : "bg-red-900/50 text-red-400"}`}
                        >
                          {order.type === "buy" ? "Compra" : "Venta"}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium text-white">{order.symbol}</TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>
                        <span className="capitalize">
                          {order.orderType === "market"
                            ? "Mercado"
                            : order.orderType === "limit"
                              ? "Límite"
                              : order.orderType === "stop"
                                ? "Stop"
                                : order.orderType}
                        </span>
                      </TableCell>
                      <TableCell>{order.limitPrice ? order.limitPrice.toFixed(2) : "-"}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </TableCell>
                      <TableCell>{order.executionPrice ? order.executionPrice.toFixed(2) : "-"}</TableCell>
                      <TableCell>
                        {order.status === "pending" && (
                          <Button variant="ghost" size="icon" onClick={() => handleCancelOrder(order.id)}>
                            <X className="h-4 w-4 text-gray-400 hover:text-red-500" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
