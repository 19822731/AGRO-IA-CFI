import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, FileText, Warehouse } from "lucide-react"

interface Certificate {
  id: string
  warrantId: string
  qrCode: string
  bags: number
  deposito: string
  ingenio: string
  enGarantia: boolean
}

interface CertificatesListProps {
  certificates: Certificate[]
}

export default function CertificatesList({ certificates }: CertificatesListProps) {
  return (
    <div className="space-y-6">
      <Card className="bg-[#111936] border-[#1a2040]">
        <CardHeader>
          <CardTitle className="text-white">Mis Certificados de Depósito</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {certificates.length === 0 ? (
              <p className="text-gray-400">No tienes certificados de depósito activos.</p>
            ) : (
              certificates.map((certificate) => (
                <div
                  key={certificate.id}
                  className="bg-[#0a0f29] border border-[#1a2040] rounded-lg p-4 hover:border-[#00a8ff] transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-[#00a8ff] font-medium">Certificado #{certificate.id}</h3>
                      <p className="text-sm text-gray-400">Warrant #{certificate.warrantId}</p>
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
                          <span>{certificate.ingenio}</span>
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
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
