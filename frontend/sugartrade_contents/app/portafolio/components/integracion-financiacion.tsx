"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency } from "@/lib/utils"
import { useWarrantsStore } from "@/store/warrants-store"
import { ArrowRight, ShieldCheck } from "lucide-react"

interface CertificadoGarantia {
  id: string
  numero: string
  cantidad: number
  valor: number
  entidad: string
  financiamiento: string
  fechaInicio: string
  fechaFin: string
}

export function IntegracionFinanciacion() {
  const { toast } = useToast()
  const [procesando, setProcesando] = useState(false)

  // Acceder al store de warrants
  const { certificados, updateCertificado, addMovimiento } = useWarrantsStore()

  // Certificados en garantía (simulados)
  const certificadosGarantia: CertificadoGarantia[] = [
    {
      id: "c1",
      numero: "CD-2001",
      cantidad: 100,
      valor: 50000,
      entidad: "Garantizar SGR",
      financiamiento: "Crédito SGR",
      fechaInicio: "01/03/2025",
      fechaFin: "01/09/2025",
    },
    {
      id: "c2",
      numero: "CD-2002",
      cantidad: 200,
      valor: 90000,
      entidad: "Banco Nación",
      financiamiento: "Descuento de eCheq",
      fechaInicio: "15/02/2025",
      fechaFin: "15/05/2025",
    },
  ]

  // Función para liberar un certificado de garantía
  const liberarCertificado = (certificadoId: string) => {
    setProcesando(true)

    // Simular tiempo de procesamiento
    setTimeout(() => {
      // Actualizar el estado del certificado
      updateCertificado(certificadoId, { estado: "disponible" })

      // Registrar el movimiento
      addMovimiento({
        fecha: new Date().toLocaleDateString("es-AR"),
        documentoId: certificadoId,
        documentoTipo: "certificado",
        accion: "actualizacion",
        usuario: "Usuario Actual",
        detalles: "Certificado liberado de garantía",
      })

      // Mostrar notificación de éxito
      toast({
        title: "Certificado liberado",
        description: "El certificado ha sido liberado de garantía y está disponible para operaciones",
        variant: "default",
      })

      setProcesando(false)
    }, 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Certificados en Garantía</CardTitle>
        <CardDescription>Certificados utilizados como garantía para financiamientos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {certificadosGarantia.length > 0 ? (
            certificadosGarantia.map((certificado) => (
              <div key={certificado.id} className="p-4 border rounded-md">
                <div className="flex justify-between items-start">
                  <div className="flex items-start">
                    <ShieldCheck className="h-5 w-5 mr-2 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">{certificado.numero}</p>
                      <p className="text-sm text-muted-foreground">
                        {certificado.cantidad} bolsas - {formatCurrency(certificado.valor)}
                      </p>
                    </div>
                  </div>
                  <Badge>En Garantía</Badge>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Entidad:</span>
                    <span className="ml-2 font-medium">{certificado.entidad}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Financiamiento:</span>
                    <span className="ml-2 font-medium">{certificado.financiamiento}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fecha inicio:</span>
                    <span className="ml-2 font-medium">{certificado.fechaInicio}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fecha fin:</span>
                    <span className="ml-2 font-medium">{certificado.fechaFin}</span>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => liberarCertificado(certificado.id)}
                    disabled={procesando}
                  >
                    {procesando ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Procesando...
                      </>
                    ) : (
                      "Liberar Certificado"
                    )}
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-muted-foreground">No hay certificados en garantía</div>
          )}

          <div className="p-3 bg-blue-50 text-blue-800 rounded-md border border-blue-200">
            <p className="text-sm font-medium">¿Qué son los certificados en garantía?</p>
            <p className="text-sm">
              Los certificados en garantía son aquellos que han sido utilizados como respaldo para obtener
              financiamiento. Estos certificados no están disponibles para operaciones hasta que finalice el plazo del
              financiamiento o sean liberados.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="outline" onClick={() => (window.location.href = "/utilidades/financiacion")}>
          Ir a Financiación <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  )
}
