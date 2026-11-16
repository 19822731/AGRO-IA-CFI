"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, TrendingUp, TrendingDown, CreditCard, ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

// Datos simulados de balance
const accountData = {
  balance: 5250000,
  equity: 5325000,
  marginUsed: 1250000,
  marginAvailable: 4000000,
  marginLevel: 426,
  pnlOpen: 75000,
  pnlClosed: 125000,
  deposits: 5000000,
  withdrawals: 0,
}

// Datos simulados para el gráfico de balance
const balanceChartData = {
  labels: ["1 Dic", "5 Dic", "10 Dic", "15 Dic", "20 Dic", "Hoy"],
  datasets: [
    {
      label: "Balance",
      data: [5000000, 5050000, 5100000, 5150000, 5200000, 5250000],
      borderColor: "#00a8ff",
      backgroundColor: "rgba(0, 168, 255, 0.1)",
      fill: true,
      tension: 0.4,
    },
    {
      label: "Patrimonio",
      data: [5000000, 5075000, 5125000, 5175000, 5250000, 5325000],
      borderColor: "#4ade80",
      backgroundColor: "rgba(74, 222, 128, 0.1)",
      fill: true,
      tension: 0.4,
    },
  ],
}

// Datos simulados para el historial de fondos
const fundingHistory = [
  {
    id: "F001",
    date: "2023-12-01T10:30:00",
    type: "deposit",
    amount: 3000000,
    status: "completed",
    method: "Transferencia Bancaria",
  },
  {
    id: "F002",
    date: "2023-12-05T14:15:00",
    type: "deposit",
    amount: 2000000,
    status: "completed",
    method: "Transferencia Bancaria",
  },
  {
    id: "F003",
    date: "2023-12-21T09:45:00",
    type: "withdrawal",
    amount: 500000,
    status: "pending",
    method: "Transferencia Bancaria",
  },
]

export default function AccountBalance() {
  const [activeTab, setActiveTab] = useState("resumen")

  // Opciones para el gráfico
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
        },
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
          callback: (value: any) => "$ " + (value / 1000000).toFixed(1) + "M",
        },
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "white",
        },
      },
      tooltip: {
        backgroundColor: "rgba(10, 15, 41, 0.9)",
        titleColor: "#00a8ff",
        bodyColor: "white",
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context: any) => "$ " + context.raw.toLocaleString("es-AR"),
        },
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Balance y Margen</h2>
          <p className="text-sm text-gray-400">Gestione sus fondos y visualice su estado financiero</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button>
            <ArrowUpRight className="h-4 w-4 mr-2" />
            Depositar
          </Button>
          <Button variant="outline">
            <ArrowDownLeft className="h-4 w-4 mr-2" />
            Retirar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-[#111936] border-[#1a2040]">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm mb-1">Balance</p>
                <p className="text-[#00a8ff] text-2xl font-bold">$ {accountData.balance.toLocaleString("es-AR")}</p>
                <p className="text-xs text-gray-400 mt-1">Fondos disponibles</p>
              </div>
              <div className="p-2 bg-[#1a2040] rounded-full">
                <DollarSign className="h-5 w-5 text-[#00a8ff]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111936] border-[#1a2040]">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm mb-1">Patrimonio</p>
                <p className="text-[#00a8ff] text-2xl font-bold">$ {accountData.equity.toLocaleString("es-AR")}</p>
                <p className="text-xs text-gray-400 mt-1">Balance + PNL no realizado</p>
              </div>
              <div className="p-2 bg-[#1a2040] rounded-full">
                <CreditCard className="h-5 w-5 text-[#00a8ff]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111936] border-[#1a2040]">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm mb-1">Margen Utilizado</p>
                <p className="text-[#00a8ff] text-2xl font-bold">$ {accountData.marginUsed.toLocaleString("es-AR")}</p>
                <p className="text-xs text-gray-400 mt-1">Fondos bloqueados como garantía</p>
              </div>
              <div className="p-2 bg-[#1a2040] rounded-full">
                <TrendingDown className="h-5 w-5 text-[#00a8ff]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111936] border-[#1a2040]">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm mb-1">Margen Disponible</p>
                <p className="text-[#00a8ff] text-2xl font-bold">
                  $ {accountData.marginAvailable.toLocaleString("es-AR")}
                </p>
                <p className="text-xs text-gray-400 mt-1">Fondos disponibles para operar</p>
              </div>
              <div className="p-2 bg-[#1a2040] rounded-full">
                <TrendingUp className="h-5 w-5 text-[#00a8ff]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="resumen" onValueChange={setActiveTab}>
        <TabsList className="bg-[#0a0f29]">
          <TabsTrigger value="resumen" className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]">
            Resumen
          </TabsTrigger>
          <TabsTrigger value="fondos" className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]">
            Historial de Fondos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resumen" className="space-y-6 mt-4">
          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white">Evolución del Balance</CardTitle>
              <CardDescription className="text-gray-400">
                Evolución de su balance y patrimonio en el último mes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <Line data={balanceChartData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-[#111936] border-[#1a2040]">
              <CardHeader>
                <CardTitle className="text-white">Detalles de la Cuenta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-[#1a2040]">
                    <span className="text-gray-400">Nivel de Margen</span>
                    <span className="text-white font-medium">{accountData.marginLevel}%</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-[#1a2040]">
                    <span className="text-gray-400">PNL No Realizado</span>
                    <span className={`font-medium ${accountData.pnlOpen >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {accountData.pnlOpen >= 0 ? "+" : ""}$ {accountData.pnlOpen.toLocaleString("es-AR")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-[#1a2040]">
                    <span className="text-gray-400">PNL Realizado</span>
                    <span className={`font-medium ${accountData.pnlClosed >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {accountData.pnlClosed >= 0 ? "+" : ""}$ {accountData.pnlClosed.toLocaleString("es-AR")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-[#1a2040]">
                    <span className="text-gray-400">Total Depositado</span>
                    <span className="text-white font-medium">$ {accountData.deposits.toLocaleString("es-AR")}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-400">Total Retirado</span>
                    <span className="text-white font-medium">$ {accountData.withdrawals.toLocaleString("es-AR")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#111936] border-[#1a2040]">
              <CardHeader>
                <CardTitle className="text-white">Información de Margen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-400 mb-1">Uso de Margen</p>
                    <div className="w-full bg-[#0a0f29] h-4 rounded-full overflow-hidden">
                      <div
                        className="bg-[#00a8ff] h-full rounded-full"
                        style={{ width: `${(accountData.marginUsed / accountData.equity) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs">
                      <span className="text-gray-400">
                        Utilizado: {((accountData.marginUsed / accountData.equity) * 100).toFixed(1)}%
                      </span>
                      <span className="text-gray-400">
                        Disponible: {((accountData.marginAvailable / accountData.equity) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <p className="text-gray-400 mb-2">Niveles de Margen</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-2 px-3 bg-[#0a0f29] rounded-lg">
                        <span className="text-white">Nivel Actual</span>
                        <span className="text-green-500 font-medium">{accountData.marginLevel}%</span>
                      </div>
                      <div className="flex justify-between items-center py-2 px-3 bg-[#0a0f29] rounded-lg">
                        <span className="text-white">Nivel de Advertencia</span>
                        <span className="text-yellow-500 font-medium">120%</span>
                      </div>
                      <div className="flex justify-between items-center py-2 px-3 bg-[#0a0f29] rounded-lg">
                        <span className="text-white">Nivel de Stop Out</span>
                        <span className="text-red-500 font-medium">80%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fondos" className="space-y-6 mt-4">
          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white">Historial de Depósitos y Retiros</CardTitle>
            </CardHeader>
            <CardContent>
              {fundingHistory.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No hay transacciones de fondos registradas</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-[#1a2040]">
                        <TableHead className="text-gray-400">ID</TableHead>
                        <TableHead className="text-gray-400">Fecha</TableHead>
                        <TableHead className="text-gray-400">Tipo</TableHead>
                        <TableHead className="text-gray-400">Monto</TableHead>
                        <TableHead className="text-gray-400">Método</TableHead>
                        <TableHead className="text-gray-400">Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fundingHistory.map((transaction) => (
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
                              className={`px-2 py-1 rounded text-xs ${transaction.type === "deposit" ? "bg-green-900/50 text-green-400" : "bg-red-900/50 text-red-400"}`}
                            >
                              {transaction.type === "deposit" ? "Depósito" : "Retiro"}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium">
                            <span className={transaction.type === "deposit" ? "text-green-500" : "text-red-500"}>
                              {transaction.type === "deposit" ? "+" : "-"}$ {transaction.amount.toLocaleString("es-AR")}
                            </span>
                          </TableCell>
                          <TableCell>{transaction.method}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded text-xs ${transaction.status === "completed" ? "bg-green-900/50 text-green-400" : "bg-yellow-900/50 text-yellow-400"}`}
                            >
                              {transaction.status === "completed" ? "Completado" : "Pendiente"}
                              {transaction.status === "pending" && <Clock className="h-3 w-3 ml-1 inline-block" />}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-[#111936] border-[#1a2040]">
              <CardHeader>
                <CardTitle className="text-white">Realizar Depósito</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-400">Seleccione un método de depósito para fondear su cuenta.</p>
                  <div className="grid grid-cols-1 gap-2">
                    <Button className="justify-start">
                      <ArrowUpRight className="h-4 w-4 mr-2" />
                      Transferencia Bancaria
                    </Button>
                    <Button className="justify-start" variant="outline">
                      <ArrowUpRight className="h-4 w-4 mr-2" />
                      Tarjeta de Crédito/Débito
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#111936] border-[#1a2040]">
              <CardHeader>
                <CardTitle className="text-white">Solicitar Retiro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-400">Seleccione un método para retirar fondos de su cuenta.</p>
                  <div className="grid grid-cols-1 gap-2">
                    <Button className="justify-start" variant="outline">
                      <ArrowDownLeft className="h-4 w-4 mr-2" />
                      Transferencia Bancaria
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
