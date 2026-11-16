"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, X, ExternalLink, Filter } from "lucide-react"
import Link from "next/link"

// Datos simulados de posiciones abiertas
const mockPositions = [
  {
    id: "P001",
    symbol: "Contrato #11 - Mar 2024",
    type: "long",
    quantity: 5,
    entryPrice: 19.85,
    currentPrice: 20.45,
    entryValue: 111160,
    currentValue: 114520,
    pnl: 3360,
    pnlPercent: 3.02,
    openDate: "2023-11-15T10:30:00",
  },
  {
    id: "P002",
    symbol: "Contrato #5 - May 2024",
    type: "short",
    quantity: 3,
    entryPrice: 22.15,
    currentPrice: 21.8,
    entryValue: 83524,
    currentValue: 82188,
    pnl: 1336,
    pnlPercent: 1.6,
    openDate: "2023-12-05T14:45:00",
  },
  {
    id: "P003",
    symbol: "Contrato #11 - Jul 2024",
    type: "long",
    quantity: 2,
    entryPrice: 20.1,
    currentPrice: 19.75,
    entryValue: 45024,
    currentValue: 44240,
    pnl: -784,
    pnlPercent: -1.74,
    openDate: "2023-12-10T09:15:00",
  },
  {
    id: "P004",
    symbol: "Mercado Interno - Spot",
    type: "long",
    quantity: 10,
    entryPrice: 4250.0,
    currentPrice: 4320.0,
    entryValue: 2125000,
    currentValue: 2160000,
    pnl: 35000,
    pnlPercent: 1.65,
    openDate: "2023-12-18T11:20:00",
  },
]

export default function PositionsList() {
  const [positions, setPositions] = useState(mockPositions)
  const [filter, setFilter] = useState("all")

  // Filtrar posiciones según el tipo seleccionado
  const filteredPositions = filter === "all" ? positions : positions.filter((position) => position.type === filter)

  // Calcular totales
  const totalPnl = filteredPositions.reduce((sum, position) => sum + position.pnl, 0)
  const totalValue = filteredPositions.reduce((sum, position) => sum + position.currentValue, 0)

  // Función para cerrar una posición (simulada)
  const handleClosePosition = (positionId: string) => {
    // En una implementación real, esto enviaría una orden para cerrar la posición
    // Por ahora, solo la eliminamos de la lista
    setPositions(positions.filter((position) => position.id !== positionId))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Posiciones Abiertas</h2>
          <p className="text-sm text-gray-400">Gestione sus posiciones actuales en el mercado</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[150px] bg-[#0a0f29] border-[#1a2040]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0f29] border-[#1a2040]">
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="long">Compra (Long)</SelectItem>
                <SelectItem value="short">Venta (Short)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <Card className="bg-[#111936] border-[#1a2040]">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-white">Resumen de Posiciones</CardTitle>
            <div className="flex space-x-4">
              <div>
                <CardDescription className="text-gray-400">Valor Total</CardDescription>
                <p className="text-xl font-bold text-white">$ {totalValue.toLocaleString("es-AR")}</p>
              </div>
              <div>
                <CardDescription className="text-gray-400">PNL Total</CardDescription>
                <p className={`text-xl font-bold ${totalPnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {totalPnl >= 0 ? "+" : ""}
                  {totalPnl.toLocaleString("es-AR")}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredPositions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">No tiene posiciones abiertas actualmente</p>
              <Link href="/operar">
                <Button>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Ir a Operar
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-[#1a2040]">
                    <TableHead className="text-gray-400">Símbolo</TableHead>
                    <TableHead className="text-gray-400">Tipo</TableHead>
                    <TableHead className="text-gray-400">Cantidad</TableHead>
                    <TableHead className="text-gray-400">Precio Entrada</TableHead>
                    <TableHead className="text-gray-400">Precio Actual</TableHead>
                    <TableHead className="text-gray-400">Valor</TableHead>
                    <TableHead className="text-gray-400">PNL</TableHead>
                    <TableHead className="text-gray-400">Fecha Apertura</TableHead>
                    <TableHead className="text-gray-400">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPositions.map((position) => (
                    <TableRow key={position.id} className="hover:bg-[#1a2040]">
                      <TableCell className="font-medium text-white">{position.symbol}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs ${position.type === "long" ? "bg-green-900/50 text-green-400" : "bg-red-900/50 text-red-400"}`}
                        >
                          {position.type === "long" ? "Compra" : "Venta"}
                        </span>
                      </TableCell>
                      <TableCell>{position.quantity}</TableCell>
                      <TableCell>{position.entryPrice.toFixed(2)}</TableCell>
                      <TableCell className="font-medium">{position.currentPrice.toFixed(2)}</TableCell>
                      <TableCell>$ {position.currentValue.toLocaleString("es-AR")}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className={`font-medium ${position.pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {position.pnl >= 0 ? "+" : ""}
                            {position.pnl.toLocaleString("es-AR")}
                          </span>
                          <span className={`text-xs ${position.pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {position.pnl >= 0 ? "+" : ""}
                            {position.pnlPercent.toFixed(2)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(position.openDate).toLocaleDateString("es-AR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleClosePosition(position.id)}>
                            <X className="h-4 w-4 text-gray-400 hover:text-red-500" />
                          </Button>
                          <Link
                            href={`/operar?symbol=${encodeURIComponent(position.symbol)}&action=${position.type === "long" ? "sell" : "buy"}&quantity=${position.quantity}`}
                          >
                            <Button variant="ghost" size="icon">
                              <ExternalLink className="h-4 w-4 text-gray-400 hover:text-[#00a8ff]" />
                            </Button>
                          </Link>
                        </div>
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
