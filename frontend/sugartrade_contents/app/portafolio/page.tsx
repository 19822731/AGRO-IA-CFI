"use client"

import { useState, useEffect } from "react"
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

import { useAuth } from "@/hooks/use-auth"

import DepositModal from "@/components/wallet/deposit-modal"

export default function Portafolio() {
  const [activeTab, setActiveTab] = useState("resumen")
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)

  const [portfolioData, setPortfolioData] = useState({
    totalValue: 0,
    availableBags: 0,
    bagsInWarrant: 0,
    bagsInGuarantee: 0,
    lastOperation: "2023-12-15",
    pendingOperations: 0,
    cashBalance: 0, // New field
    cvu: "", // New field
  })

  const [certificates, setCertificates] = useState<any[]>([])

  const [warrants, setWarrants] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  const fetchPortfolioData = async () => {
    const token = localStorage.getItem("auth_token")

    if (!token) {
      setLoading(false)
      return
    }

    try {
      console.log("Fetching portfolio data...")
      // Fetch summary, warrants, and activity
      const [summaryResponse, warrantsResponse, activityResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/wallet/summary`, {
          headers: { "Authorization": `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/warrants`, {
          headers: { "Authorization": `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/wallet/activity`, {
          headers: { "Authorization": `Bearer ${token}` }
        })
      ])

      if (summaryResponse.ok) {
        const data = await summaryResponse.json()
        console.log("Wallet Summary Data:", data)

        // Process Assets
        const assetsObj = data.assets || {}
        let totalBags = 0
        let totalVal = 0
        let totalAvailable = 0

        // assetsObj is a dict keyed by product_id
        Object.values(assetsObj).forEach((asset: any) => {
          // Asset structure from API: 
          // { total: X, total_tons: Y, total_bags: Z, valuation: V, available: A, ... }

          const bags = asset.total_bags || (asset.total * 20)
          const valuation = asset.valuation || 0
          const available = asset.available || 0

          totalBags += bags
          totalVal += valuation
          totalAvailable += available
        })

        // Update warrants if response is ok
        let currentWarrants = []
        if (warrantsResponse.ok) {
          currentWarrants = await warrantsResponse.json()
          setWarrants(currentWarrants)
        }

        // Process Activity
        if (activityResponse.ok) {
          const activityData = await activityResponse.json()
          console.log("Activity Data Fetched:", activityData)
          setRecentActivity(activityData)
        } else {
          console.error("Failed to fetch activity")
        }

        // Calculate warrants total from fetched data
        const totalWarrantBags = currentWarrants.reduce((acc: number, w: any) => acc + w.totalBags, 0)

        // Use API available bags which accounts for orders AND warrants
        const availableBags = totalAvailable

        // Generate certificates based on totalBags
        const CERTIFICATE_SIZE = 600
        const fullCertificatesCount = Math.floor(totalBags / CERTIFICATE_SIZE)
        const partialBags = totalBags % CERTIFICATE_SIZE

        const newCertificates = []

        // Generate full certificates
        let bagsCoveredByWarrants = 0

        for (let i = 0; i < fullCertificatesCount; i++) {
          const isGuaranteed = bagsCoveredByWarrants < totalWarrantBags
          if (isGuaranteed) {
            bagsCoveredByWarrants += CERTIFICATE_SIZE
          }

          newCertificates.push({
            id: `C - ${1000 + i}`,
            warrantId: isGuaranteed ? `W - ${2000 + Math.floor(i / 3)}` : "-",
            qrCode: `QR - ${Date.now()} - ${i}`,
            bags: CERTIFICATE_SIZE,
            deposito: "Almacén Central",
            ingenio: "Ingenio La Esperanza",
            enGarantia: isGuaranteed,
          })
        }

        // Generate partial certificate if needed
        if (partialBags > 0) {
          newCertificates.push({
            id: `C - ${1000 + fullCertificatesCount}(Parcial)`,
            warrantId: "-",
            qrCode: `QR - ${Date.now()} - partial`,
            bags: partialBags,
            deposito: "Almacén Central",
            ingenio: "Ingenio La Esperanza",
            enGarantia: false,
          })
        }

        setCertificates(newCertificates)

        // Financials
        const cash = data.financials?.balance || 0

        setPortfolioData(prev => ({
          ...prev,
          availableBags: availableBags,
          bagsInWarrant: totalWarrantBags,
          bagsInGuarantee: 0,
          totalValue: totalVal, // Now using dynamic valuation from API
          cashBalance: cash,
          cvu: data.fiat?.cvu || ""
        }))
      } else {
        console.error("Failed to fetch portfolio:", await summaryResponse.text())
      }
    } catch (error) {
      console.error("Error fetching portfolio data", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPortfolioData()
  }, [user]) // Re-run when user changes








  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Portafolio</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setIsDepositModalOpen(true)}
            className="bg-[#1a2040] hover:bg-[#2a3050] text-[#00a8ff] border border-[#00a8ff]/30 shadow h-10 px-4 py-2 rounded-md inline-flex items-center justify-center text-sm font-medium transition-colors"
          >
            <DollarSign className="mr-2 h-4 w-4" />
            Ingresar Dinero
          </button>
          <a href="/dashboard/alta-producto" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow h-10 px-4 py-2 rounded-md inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
            <Package className="mr-2 h-4 w-4" />
            Alta de Producto
          </a>
        </div>
      </div>

      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        onSuccess={fetchPortfolioData}
        cvu={portfolioData.cvu}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
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
            <div onClick={() => setActiveTab("balance")} className="cursor-pointer transition-transform hover:scale-105">
              <DataCard
                title="Saldo Disponible"
                value={`$ ${portfolioData.cashBalance.toLocaleString("es-AR")}`}
                subtitle="ARS en cuenta"
                icon={<DollarSign size={20} className="text-green-400" />}
              />
            </div>
            <div onClick={() => setActiveTab("resumen")} className="cursor-pointer transition-transform hover:scale-105">
              <DataCard
                title="Valor en Activos"
                value={`$ ${portfolioData.totalValue.toLocaleString("es-AR")}`}
                subtitle="Valor estimado en ARS"
                icon={<TrendingUp size={20} />}
              />
            </div>
            <div onClick={() => setActiveTab("posiciones")} className="cursor-pointer transition-transform hover:scale-105">
              <DataCard
                title="Bolsas Disponibles"
                value={portfolioData.availableBags.toLocaleString("es-AR")}
                subtitle="Bolsas de 50kg"
                icon={<Package size={20} />}
              />
            </div>
            <div onClick={() => setActiveTab("warrants")} className="cursor-pointer transition-transform hover:scale-105">
              <DataCard
                title="Bolsas en Warrant"
                value={portfolioData.bagsInWarrant.toLocaleString("es-AR")}
                subtitle="En depósito"
                icon={<Warehouse size={20} />}
              />
            </div>

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
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center">
                        <div className="mr-4 bg-[#1a2040] p-2 rounded-full">
                          {activity.type === 'deposit' ? (
                            <DollarSign className="h-5 w-5 text-green-500" />
                          ) : (
                            <TrendingUp className="h-5 w-5 text-[#00a8ff]" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{activity.title}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(activity.date).toLocaleDateString()} - $ {activity.amount.toLocaleString("es-AR")}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No hay actividad reciente</p>
                  )}
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
