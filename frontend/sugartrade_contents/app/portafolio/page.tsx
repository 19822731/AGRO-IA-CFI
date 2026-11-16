"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Package, Warehouse, FileText, TrendingUp, Calendar } from "lucide-react"
import DataCard from "@/components/data-card"
import WarrantsList from "./components/warrants-list"
import CertificatesList from "./components/certificates-list"
import PortfolioChart from "./components/portfolio-chart"
import PositionsList from "./components/positions-list"
import OrderHistory from "./components/order-history"
import TransactionHistory from "./components/transaction-history"
import AccountBalance from "./components/account-balance"

export default function Portafolio() {
  const [activeTab, setActiveTab] = useState("resumen")

  // Datos simulados para el portafolio
  const portfolioData = {
    totalValue: 4850000,
    availableBags: 2400,
    bagsInWarrant: 1800,
    bagsInGuarantee: 600,
    lastOperation: "2023-12-15",
    pendingOperations: 3,
  }

  // Datos simulados para los warrants
  const warrants = [
    {
      id: "W001",
      totalBags: 1200,
      deposito: "Almacén Norte",
      ingenio: "Ingenio Azucarera del Norte",
      fechaEmision: "2023-10-15",
      fechaVencimiento: "2024-04-15",
      estado: "activo",
    },
    {
      id: "W002",
      totalBags: 300,
      deposito: "Almacén Sur",
      ingenio: "Ingenio La Esperanza",
      fechaEmision: "2023-11-20",
      fechaVencimiento: "2024-05-20",
      estado: "activo",
    },
    {
      id: "W003",
      totalBags: 900,
      deposito: "Almacén Central",
      ingenio: "Ingenio del Este",
      fechaEmision: "2023-09-05",
      fechaVencimiento: "2024-03-05",
      estado: "activo",
    },
  ]

  // Datos simulados para los certificados
  const certificates = [
    {
      id: "C001-1",
      warrantId: "W001",
      qrCode: "QR-CODE-123",
      bags: 600,
      deposito: "Almacén Norte",
      ingenio: "Ingenio Azucarera del Norte",
      enGarantia: false,
    },
    {
      id: "C001-2",
      warrantId: "W001",
      qrCode: "QR-CODE-456",
      bags: 600,
      deposito: "Almacén Norte",
      ingenio: "Ingenio Azucarera del Norte",
      enGarantia: true,
    },
    {
      id: "C002-1",
      warrantId: "W002",
      qrCode: "QR-CODE-789",
      bags: 300,
      deposito: "Almacén Sur",
      ingenio: "Ingenio La Esperanza",
      enGarantia: false,
    },
    {
      id: "C003-1",
      warrantId: "W003",
      qrCode: "QR-CODE-789",
      bags: 600,
      deposito: "Almacén Central",
      ingenio: "Ingenio del Este",
      enGarantia: false,
    },
    {
      id: "C003-2",
      warrantId: "W003",
      qrCode: "QR-CODE-XYZ",
      bags: 300,
      deposito: "Almacén Central",
      ingenio: "Ingenio del Este",
      enGarantia: true,
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Portafolio</h1>

      <Tabs defaultValue="resumen" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="posiciones">Posiciones</TabsTrigger>
          <TabsTrigger value="ordenes">Órdenes</TabsTrigger>
          <TabsTrigger value="transacciones">Transacciones</TabsTrigger>
          <TabsTrigger value="balance">Balance</TabsTrigger>
          <TabsTrigger value="warrants">Warrants</TabsTrigger>
          <TabsTrigger value="certificados">Certificados</TabsTrigger>
        </TabsList>

        <TabsContent value="resumen" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DataCard
              title="Valor Total"
              value={`$ ${portfolioData.totalValue.toLocaleString("es-AR")}`}
              subtitle="Valor estimado en ARS"
              icon={<DollarSign size={20} />}
            />
            <DataCard
              title="Bolsas Disponibles"
              value={portfolioData.availableBags.toLocaleString("es-AR")}
              subtitle="Bolsas de 50kg"
              icon={<Package size={20} />}
            />
            <DataCard
              title="Bolsas en Warrant"
              value={portfolioData.bagsInWarrant.toLocaleString("es-AR")}
              subtitle="En depósito"
              icon={<Warehouse size={20} />}
            />
            <DataCard
              title="Bolsas en Garantía"
              value={portfolioData.bagsInGuarantee.toLocaleString("es-AR")}
              subtitle="Utilizadas como garantía"
              icon={<FileText size={20} />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-[#111936] border-[#1a2040] lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-white">Evolución del Portafolio</CardTitle>
                <CardDescription className="text-gray-400">Valor estimado en los últimos 6 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <PortfolioChart />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#111936] border-[#1a2040]">
              <CardHeader>
                <CardTitle className="text-white">Actividad Reciente</CardTitle>
                <CardDescription className="text-gray-400">Últimas operaciones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="mr-4 bg-[#1a2040] p-2 rounded-full">
                      <TrendingUp className="h-5 w-5 text-[#00a8ff]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Venta de 200 bolsas</p>
                      <p className="text-xs text-gray-400">15 Dic 2023</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-4 bg-[#1a2040] p-2 rounded-full">
                      <Warehouse className="h-5 w-5 text-[#00a8ff]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Nuevo Warrant #W003</p>
                      <p className="text-xs text-gray-400">5 Sep 2023</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-4 bg-[#1a2040] p-2 rounded-full">
                      <FileText className="h-5 w-5 text-[#00a8ff]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Certificado en garantía</p>
                      <p className="text-xs text-gray-400">20 Nov 2023</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white">Próximos Vencimientos</CardTitle>
              <CardDescription className="text-gray-400">Warrants que vencen en los próximos 90 días</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {warrants
                  .filter((warrant) => {
                    const vencimiento = new Date(warrant.fechaVencimiento)
                    const hoy = new Date()
                    const diff = vencimiento.getTime() - hoy.getTime()
                    const dias = diff / (1000 * 3600 * 24)
                    return dias <= 90
                  })
                  .map((warrant) => (
                    <div key={warrant.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="mr-4 bg-[#1a2040] p-2 rounded-full">
                          <Calendar className="h-5 w-5 text-[#00a8ff]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">Warrant #{warrant.id}</p>
                          <p className="text-xs text-gray-400">{warrant.ingenio}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-white">{warrant.fechaVencimiento}</p>
                        <p className="text-xs text-gray-400">{warrant.totalBags} bolsas</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posiciones">
          <PositionsList />
        </TabsContent>

        <TabsContent value="ordenes">
          <OrderHistory />
        </TabsContent>

        <TabsContent value="transacciones">
          <TransactionHistory />
        </TabsContent>

        <TabsContent value="balance">
          <AccountBalance />
        </TabsContent>

        <TabsContent value="warrants">
          <WarrantsList warrants={warrants} />
        </TabsContent>

        <TabsContent value="certificados">
          <CertificatesList certificates={certificates} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
