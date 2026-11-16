"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Filter, Search, Download, FileText } from "lucide-react"

// Datos simulados de historial de transacciones
const mockTransactions = [
  {
    id: "T001",
    date: "2023-12-20T09:30:15",
    type: "buy",
    symbol: "Contrato #11 - Mar 2024",
    quantity: 3,
    price: 19.85,
    value: 66808.5,
    commission: 334.04,
    orderId: "O001",
    pnl: null,
  },
  {
    id: "T002",
    date: "2023-12-19T14:15:30",
    type: "sell",
    symbol: "Contrato #5 - May 2024",
    quantity: 2,
    price: 22.15,
    value: 55375.0,
    commission: 276.88,
    orderId: "O002",
    pnl: 1250.0,
  },
  {
    id: "T003",
    date: "2023-12-18T11:45:22",
    type: "buy",
    symbol: "Contrato #11 - Jul 2024",
    quantity: 2,
    price: 20.1,
    value: 45024.0,
    commission: 225.12,
    orderId: "O003",
    pnl: null,
  },
  {
    id: "T004",
    date: "2023-12-18T10:30:45",
    type: "buy",
    symbol: "Mercado Interno - Spot",
    quantity: 10,
    price: 4250.0,
    value: 2125000.0,
    commission: 10625.0,
    orderId: "O004",
    pnl: null,
  },
  {
    id: "T005",
    date: "2023-12-17T15:20:10",
    type: "buy",
    symbol: "Contrato #11 - Mar 2024",
    quantity: 2,
    price: 19.75,
    value: 44240.0,
    commission: 221.2,
    orderId: "O005",
    pnl: null,
  },
  {
    id: "T006",
    date: "2023-12-15T09:45:33",
    type: "sell",
    symbol: "Contrato #5 - May 2024",
    quantity: 1,
    price: 22.25,
    value: 27812.5,
    commission: 139.06,
    orderId: "O006",
    pnl: 625.0,
  },
  {
    id: "T007",
    date: "2023-12-14T13:10:05",
    type: "sell",
    symbol: "Mercado Interno - Spot",
    quantity: 5,
    price: 4200.0,
    value: 1050000.0,
    commission: 5250.0,
    orderId: "O011",
    pnl: -12500.0,
  },
  {
    id: "T008",
    date: "2023-12-12T10:05:18",
    type: "buy",
    symbol: "Mercado Interno - Spot",
    quantity: 5,
    price: 4225.0,
    value: 1056250.0,
    commission: 5281.25,
    orderId: "O012",
    pnl: null,
  },
]

export default function TransactionHistory() {
  const [transactions] = useState(mockTransactions)
  const [typeFilter, setTypeFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState("all")

  // Filtrar transacciones según los criterios seleccionados
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesType = typeFilter === "all" || transaction.type === typeFilter
    const matchesSearch =
      searchQuery === "" ||
      transaction.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchQuery.toLowerCase())

    // Filtrar por rango de fecha
    let matchesDate = true
    if (dateRange !== "all") {
      const txDate = new Date(transaction.date)
      const today = new Date()
      const lastWeek = new Date()
      lastWeek.setDate(today.getDate() - 7)
      const lastMonth = new Date()
      lastMonth.setMonth(today.getMonth() - 1)

      if (dateRange === "today") {
        matchesDate = txDate.toDateString() === today.toDateString()
      } else if (dateRange === "week") {
        matchesDate = txDate >= lastWeek
      } else if (dateRange === "month") {
        matchesDate = txDate >= lastMonth
      }
    }

    return matchesType && matchesSearch && matchesDate
  })

  // Calcular totales
  const totalValue = filteredTransactions.reduce((sum, tx) => sum + tx.value, 0)
  const totalCommission = filteredTransactions.reduce((sum, tx) => sum + tx.commission, 0)
  const totalPnl = filteredTransactions.reduce((sum, tx) => sum + (tx.pnl || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Historial de Transacciones</h2>
          <p className="text-sm text-gray-400">Consulte sus operaciones ejecutadas</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px] bg-[#0a0f29] border-[#1a2040]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent className="bg-[#0a0f29] border-[#1a2040]">
              <SelectItem value="all">Todo</SelectItem>
              <SelectItem value="today">Hoy</SelectItem>
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Último mes</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <Card className="bg-[#111936] border-[#1a2040]">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <CardDescription className="text-gray-400">Valor Total</CardDescription>
                <p className="text-lg font-bold text-white">$ {totalValue.toLocaleString("es-AR")}</p>
              </div>
              <div>
                <CardDescription className="text-gray-400">Comisiones</CardDescription>
                <p className="text-lg font-bold text-red-400">$ {totalCommission.toLocaleString("es-AR")}</p>
              </div>
              <div>
                <CardDescription className="text-gray-400">PNL Realizado</CardDescription>
                <p className={`text-lg font-bold ${totalPnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {totalPnl >= 0 ? "+" : ""}$ {totalPnl.toLocaleString("es-AR")}
                </p>
              </div>
            </div>
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
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No se encontraron transacciones con los filtros seleccionados</p>
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
                    <TableHead className="text-gray-400">Precio</TableHead>
                    <TableHead className="text-gray-400">Valor</TableHead>
                    <TableHead className="text-gray-400">Comisión</TableHead>
                    <TableHead className="text-gray-400">PNL</TableHead>
                    <TableHead className="text-gray-400">Detalles</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id} className="hover:bg-[#1a2040]">
                      <TableCell className="font-medium text-white">{transaction.id}</TableCell>
                      <TableCell>
                        {new Date(transaction.date).toLocaleDateString("es-AR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs ${transaction.type === "buy" ? "bg-green-900/50 text-green-400" : "bg-red-900/50 text-red-400"}`}
                        >
                          {transaction.type === "buy" ? "Compra" : "Venta"}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium text-white">{transaction.symbol}</TableCell>
                      <TableCell>{transaction.quantity}</TableCell>
                      <TableCell>{transaction.price.toFixed(2)}</TableCell>
                      <TableCell>$ {transaction.value.toLocaleString("es-AR")}</TableCell>
                      <TableCell className="text-red-400">$ {transaction.commission.toLocaleString("es-AR")}</TableCell>
                      <TableCell>
                        {transaction.pnl !== null ? (
                          <span className={transaction.pnl >= 0 ? "text-green-500" : "text-red-500"}>
                            {transaction.pnl >= 0 ? "+" : ""}$ {transaction.pnl.toLocaleString("es-AR")}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <FileText className="h-4 w-4 text-gray-400 hover:text-[#00a8ff]" />
                        </Button>
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
