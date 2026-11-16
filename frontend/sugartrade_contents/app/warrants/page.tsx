"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, QrCode, Warehouse, Package, Plus } from "lucide-react"
import { WarrantsTable } from "./components/warrants-table"

export default function WarrantsPage() {
  const [tab, setTab] = useState("dashboard")

  return (
    <div className="container py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Warrants y Certificados</h1>
          <p className="text-gray-400 max-w-3xl mt-2">
            Gestione sus warrants y certificados de depósito. Realice ingresos de mercadería, consulte su estado y opere
            en la Caja de Punta.
          </p>
        </div>
        <Button className="bg-[#00a8ff] hover:bg-[#00a8ff]/90 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Ingreso
        </Button>
      </div>

      <Tabs defaultValue="dashboard" value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="bg-[#111936] border border-[#1a2040]">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-white">
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="warrants" className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-white">
            Warrants
          </TabsTrigger>
          <TabsTrigger value="certificados" className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-white">
            Certificados
          </TabsTrigger>
          <TabsTrigger value="historial" className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-white">
            Historial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <Card className="bg-[#111936] border-[#1a2040]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-white">Warrants Activos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-[#00a8ff] mr-3" />
                    <div>
                      <p className="text-3xl font-bold text-white">12</p>
                      <p className="text-sm text-gray-400">Total: 15</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#111936] border-[#1a2040]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-white">Certificados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <QrCode className="h-8 w-8 text-[#00a8ff] mr-3" />
                    <div>
                      <p className="text-3xl font-bold text-white">24</p>
                      <p className="text-sm text-gray-400">Disponibles: 18</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#111936] border-[#1a2040]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-white">Bolsas Almacenadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Package className="h-8 w-8 text-[#00a8ff] mr-3" />
                    <div>
                      <p className="text-3xl font-bold text-white">5,420</p>
                      <p className="text-sm text-gray-400">BLS</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#111936] border-[#1a2040]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-white">Certificados para Canje</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Warehouse className="h-8 w-8 text-[#00a8ff] mr-3" />
                    <div>
                      <p className="text-3xl font-bold text-white">8</p>
                      <p className="text-sm text-gray-400">Disponibles para canje</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <WarrantsTable titulo="Warrants Recientes" mostrarTodos={false} />

              <Card className="bg-[#111936] border-[#1a2040]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-white">Certificados Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 text-center text-gray-400">Aquí se mostrarán los certificados más recientes</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="warrants" className="mt-6">
          <WarrantsTable titulo="Todos los Warrants" mostrarTodos={true} />
        </TabsContent>

        <TabsContent value="certificados" className="mt-6">
          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white">Certificados de Depósito</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 text-center text-gray-400">Aquí se mostrarán todos los certificados de depósito</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historial" className="mt-6">
          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white">Historial de Movimientos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 text-center text-gray-400">Aquí se mostrará el historial de movimientos</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
