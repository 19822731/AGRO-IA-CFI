"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Package, Warehouse, Calendar, FileText, AlertTriangle } from "lucide-react"

interface Warrant {
  id: string
  totalBags: number
  deposito: string
  ingenio: string
  fechaEmision: string
  fechaVencimiento: string
  estado: string
}

interface Certificate {
  id: string
  warrantId: string
  qrCode: string
  bags: number
  deposito: string
  ingenio: string
  enGarantia: boolean
}

export default function WarrantDetail() {
  const params = useParams()
  const router = useRouter()
  const { id } = params
  const [warrant, setWarrant] = useState<Warrant | null>(null)
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulación de carga de datos
    setLoading(true)

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
    const allCertificates = [
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

    // Buscar el warrant por ID
    const foundWarrant = warrants.find((w) => w.id === id)
    if (foundWarrant) {
      setWarrant(foundWarrant)
      // Filtrar certificados por warrantId
      const warrantCertificates = allCertificates.filter((c) => c.warrantId === id)
      setCertificates(warrantCertificates)
    }

    setLoading(false)
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00a8ff]"></div>
      </div>
    )
  }

  if (!warrant) {
    return (
      <div className="bg-red-900/20 border border-red-900 rounded-lg p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Warrant no encontrado</h2>
        <p className="text-gray-400 mb-4">No se encontró el warrant con ID: {id}</p>
        <Button onClick={() => router.push("/portafolio")} variant="outline">
          Volver al Portafolio
        </Button>
      </div>
    )
  }

  // Calcular bolsas en garantía
  const bagsInGuarantee = certificates.reduce((total, cert) => total + (cert.enGarantia ? cert.bags : 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" onClick={() => router.push("/portafolio")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-white">Warrant #{warrant.id}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#111936] border-[#1a2040]">
          <CardHeader>
            <CardTitle className="text-white">Información General</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <Package className="h-5 w-5 text-[#00a8ff] mr-3" />
                <div>
                  <p className="text-sm text-gray-400">Total de Bolsas</p>
                  <p className="text-lg font-medium text-white">{warrant.totalBags} bolsas de 50kg</p>
                </div>
              </div>
              <div className="flex items-center">
                <Warehouse className="h-5 w-5 text-[#00a8ff] mr-3" />
                <div>
                  <p className="text-sm text-gray-400">Depósito</p>
                  <p className="text-lg font-medium text-white">{warrant.deposito}</p>
                </div>
              </div>
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-[#00a8ff] mr-3" />
                <div>
                  <p className="text-sm text-gray-400">Ingenio</p>
                  <p className="text-lg font-medium text-white">{warrant.ingenio}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-[#00a8ff] mr-3" />
                <div>
                  <p className="text-sm text-gray-400">Fecha de Emisión</p>
                  <p className="text-lg font-medium text-white">{warrant.fechaEmision}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-[#00a8ff] mr-3" />
                <div>
                  <p className="text-sm text-gray-400">Fecha de Vencimiento</p>
                  <p className="text-lg font-medium text-white">{warrant.fechaVencimiento}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111936] border-[#1a2040]">
          <CardHeader>
            <CardTitle className="text-white">Estado Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-[#0a0f29] p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-400">Bolsas Disponibles</p>
                  <p className="text-lg font-medium text-white">{warrant.totalBags - bagsInGuarantee} bolsas</p>
                </div>
                <div className="bg-green-700 px-3 py-1 rounded-full text-white text-sm">Disponible</div>
              </div>
              <div className="flex items-center justify-between bg-[#0a0f29] p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-400">Bolsas en Garantía</p>
                  <p className="text-lg font-medium text-white">{bagsInGuarantee} bolsas</p>
                </div>
                <div className="bg-amber-700 px-3 py-1 rounded-full text-white text-sm">En Garantía</div>
              </div>
              <div className="flex items-center justify-between bg-[#0a0f29] p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-400">Estado del Warrant</p>
                  <p className="text-lg font-medium text-white">{warrant.estado}</p>
                </div>
                <div className="bg-blue-700 px-3 py-1 rounded-full text-white text-sm">Activo</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#111936] border-[#1a2040]">
        <CardHeader>
          <CardTitle className="text-white">Certificados de Depósito</CardTitle>
        </CardHeader>
        <CardContent>
          {certificates.length === 0 ? (
            <p className="text-gray-400">No hay certificados asociados a este warrant.</p>
          ) : (
            <div className="space-y-4">
              {certificates.map((certificate) => (
                <div
                  key={certificate.id}
                  className="bg-[#0a0f29] border border-[#1a2040] rounded-lg p-4 hover:border-[#00a8ff] transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-[#00a8ff] font-medium">Certificado #{certificate.id}</h3>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center text-sm text-gray-400">
                          <Package className="h-4 w-4 mr-2" />
                          <span>{certificate.bags} bolsas</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-400">
                          <Warehouse className="h-4 w-4 mr-2" />
                          <span>{certificate.deposito}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-400">
                          <FileText className="h-4 w-4 mr-2" />
                          <span>QR: {certificate.qrCode}</span>
                        </div>
                      </div>
                    </div>
                    <div
                      className={`px-2 py-1 rounded text-xs text-white uppercase ${
                        certificate.enGarantia ? "bg-amber-700" : "bg-green-700"
                      }`}
                    >
                      {certificate.enGarantia ? "En Garantía" : "Disponible"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button variant="outline">Descargar PDF</Button>
        <Button>Gestionar Certificados</Button>
      </div>
    </div>
  )
}
