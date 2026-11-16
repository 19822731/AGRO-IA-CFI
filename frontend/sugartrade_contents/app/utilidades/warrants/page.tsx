import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, FileText, ArrowUpDown } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

// Datos de ejemplo para los warrants
const warrants = [
  {
    id: "W-001",
    numero: "WAR-2023-001",
    fechaEmision: "2023-10-15",
    fechaVencimiento: "2024-04-15",
    almacen: "Almacén Central Veracruz",
    cantidad: 5000,
    calidad: "Estándar",
    valorEstimado: 250000,
    estado: "Activo",
  },
  {
    id: "W-002",
    numero: "WAR-2023-002",
    fechaEmision: "2023-11-05",
    fechaVencimiento: "2024-05-05",
    almacen: "Bodega Norte",
    cantidad: 3500,
    calidad: "Premium",
    valorEstimado: 192500,
    estado: "Activo",
  },
  {
    id: "W-003",
    numero: "WAR-2023-003",
    fechaEmision: "2023-12-10",
    fechaVencimiento: "2024-06-10",
    almacen: "Almacén Sur",
    cantidad: 4200,
    calidad: "Estándar",
    valorEstimado: 210000,
    estado: "En Proceso",
  },
]

// Datos de ejemplo para los certificados
const certificados = [
  {
    id: "C-001",
    numero: "CERT-2023-001",
    fechaEmision: "2023-10-20",
    warrantAsociado: "WAR-2023-001",
    tipo: "Depósito",
    estado: "Emitido",
  },
  {
    id: "C-002",
    numero: "CERT-2023-002",
    fechaEmision: "2023-11-10",
    warrantAsociado: "WAR-2023-002",
    tipo: "Depósito",
    estado: "Emitido",
  },
  {
    id: "C-003",
    numero: "CERT-2023-003",
    fechaEmision: "2023-12-15",
    warrantAsociado: "WAR-2023-003",
    tipo: "Depósito",
    estado: "En Proceso",
  },
]

// Datos de ejemplo para las estadísticas
const estadisticasWarrants = [
  {
    label: "Total Warrants",
    value: 3,
    change: "+1",
    changeType: "increase",
  },
  {
    label: "Valor Total",
    value: 652500,
    change: "+210000",
    changeType: "increase",
  },
  {
    label: "Cantidad Total (kg)",
    value: 12700,
    change: "+4200",
    changeType: "increase",
  },
]

export default function WarrantsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Warrants</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nuevo Warrant
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {estadisticasWarrants &&
          estadisticasWarrants.map((stat, index) => (
            <Card key={index} className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stat.label.includes("Valor") ? formatCurrency(stat.value) : stat.value.toLocaleString()}
                </div>
                <p
                  className={`text-sm ${
                    stat.changeType === "increase"
                      ? "text-green-600"
                      : stat.changeType === "decrease"
                        ? "text-red-600"
                        : "text-gray-600"
                  }`}
                >
                  {stat.change} {stat.changeType === "increase" ? "↑" : stat.changeType === "decrease" ? "↓" : ""}
                </p>
              </CardContent>
            </Card>
          ))}
      </div>

      <Tabs defaultValue="warrants" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-3">
          <TabsTrigger value="warrants">Warrants</TabsTrigger>
          <TabsTrigger value="certificados">Certificados</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="warrants" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Warrants Activos</CardTitle>
              <CardDescription>Lista de warrants emitidos y en proceso</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-4 text-left">Número</th>
                      <th className="py-3 px-4 text-left">Emisión</th>
                      <th className="py-3 px-4 text-left">Vencimiento</th>
                      <th className="py-3 px-4 text-left">Almacén</th>
                      <th className="py-3 px-4 text-left">Cantidad</th>
                      <th className="py-3 px-4 text-left">Calidad</th>
                      <th className="py-3 px-4 text-left">Valor Estimado</th>
                      <th className="py-3 px-4 text-left">Estado</th>
                      <th className="py-3 px-4 text-left">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {warrants &&
                      warrants.map((warrant) => (
                        <tr key={warrant.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">{warrant.numero}</td>
                          <td className="py-3 px-4">{warrant.fechaEmision}</td>
                          <td className="py-3 px-4">{warrant.fechaVencimiento}</td>
                          <td className="py-3 px-4">{warrant.almacen}</td>
                          <td className="py-3 px-4">{warrant.cantidad.toLocaleString()} kg</td>
                          <td className="py-3 px-4">{warrant.calidad}</td>
                          <td className="py-3 px-4">{formatCurrency(warrant.valorEstimado)}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                warrant.estado === "Activo"
                                  ? "bg-green-100 text-green-800"
                                  : warrant.estado === "En Proceso"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {warrant.estado}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="icon">
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <ArrowUpDown className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificados" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Certificados</CardTitle>
              <CardDescription>Certificados de depósito y garantía</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-4 text-left">Número</th>
                      <th className="py-3 px-4 text-left">Fecha Emisión</th>
                      <th className="py-3 px-4 text-left">Warrant Asociado</th>
                      <th className="py-3 px-4 text-left">Tipo</th>
                      <th className="py-3 px-4 text-left">Estado</th>
                      <th className="py-3 px-4 text-left">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {certificados &&
                      certificados.map((certificado) => (
                        <tr key={certificado.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">{certificado.numero}</td>
                          <td className="py-3 px-4">{certificado.fechaEmision}</td>
                          <td className="py-3 px-4">{certificado.warrantAsociado}</td>
                          <td className="py-3 px-4">{certificado.tipo}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                certificado.estado === "Emitido"
                                  ? "bg-green-100 text-green-800"
                                  : certificado.estado === "En Proceso"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {certificado.estado}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Button variant="ghost" size="icon">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historial" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Transacciones</CardTitle>
              <CardDescription>Registro de operaciones con warrants y certificados</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Contenido del historial pendiente de implementar</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
