"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Certificado {
  id: number
  tipo: string
  numero: string
  cantidad: number
  valorEstimado: number
  estado: string
  fechaEmision: string
  almacen: string
}

interface ResumenCertificadosProps {
  certificados: Certificado[]
}

export function ResumenCertificados({ certificados }: ResumenCertificadosProps) {
  const [certificadoSeleccionado, setCertificadoSeleccionado] = useState<Certificado | null>(null)
  const [showDialog, setShowDialog] = useState(false)

  // Formatear fechas
  const formatearFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr)
    return fecha.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  // Obtener color de badge según estado
  const getEstadoVariant = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "disponible":
        return "success"
      case "en garantía":
        return "warning"
      case "bloqueado":
        return "destructive"
      default:
        return "secondary"
    }
  }

  // Calcular totales
  const totalCertificados = certificados.length
  const totalValorEstimado = certificados.reduce((sum, cert) => sum + cert.valorEstimado, 0)
  const totalEnGarantia = certificados
    .filter((cert) => cert.estado.toLowerCase() === "en garantía")
    .reduce((sum, cert) => sum + cert.valorEstimado, 0)
  const totalDisponible = certificados
    .filter((cert) => cert.estado.toLowerCase() === "disponible")
    .reduce((sum, cert) => sum + cert.valorEstimado, 0)

  // Manejar clic en certificado
  const handleCertificadoClick = (certificado: Certificado) => {
    setCertificadoSeleccionado(certificado)
    setShowDialog(true)
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Certificados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCertificados}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValorEstimado)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En Garantía</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalEnGarantia)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {((totalEnGarantia / totalValorEstimado) * 100).toFixed(1)}% del total
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Disponible</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalDisponible)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {((totalDisponible / totalValorEstimado) * 100).toFixed(1)}% del total
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Certificados y Warrants</CardTitle>
          <CardDescription>Certificados y warrants utilizados como garantía para financiamiento</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Número</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Valor Estimado</TableHead>
                <TableHead>Almacén</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {certificados.map((certificado) => (
                <TableRow
                  key={certificado.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleCertificadoClick(certificado)}
                >
                  <TableCell>{certificado.tipo}</TableCell>
                  <TableCell>{certificado.numero}</TableCell>
                  <TableCell>{certificado.cantidad} ton</TableCell>
                  <TableCell>{formatCurrency(certificado.valorEstimado)}</TableCell>
                  <TableCell>{certificado.almacen}</TableCell>
                  <TableCell>
                    <Badge variant={getEstadoVariant(certificado.estado)}>{certificado.estado}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Ver detalles
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Diálogo de detalle de certificado */}
      {certificadoSeleccionado && (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalle del Certificado</DialogTitle>
              <DialogDescription>Información detallada del certificado seleccionado</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tipo</p>
                  <p className="text-lg font-semibold">{certificadoSeleccionado.tipo}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estado</p>
                  <Badge variant={getEstadoVariant(certificadoSeleccionado.estado)} className="mt-1">
                    {certificadoSeleccionado.estado}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Número</p>
                <p className="text-lg font-semibold">{certificadoSeleccionado.numero}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cantidad</p>
                  <p className="text-lg font-semibold">{certificadoSeleccionado.cantidad} toneladas</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Valor Estimado</p>
                  <p className="text-lg font-semibold">{formatCurrency(certificadoSeleccionado.valorEstimado)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Almacén</p>
                  <p className="text-lg font-semibold">{certificadoSeleccionado.almacen}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha de Emisión</p>
                  <p className="text-lg font-semibold">{formatearFecha(certificadoSeleccionado.fechaEmision)}</p>
                </div>
              </div>
              {certificadoSeleccionado.estado.toLowerCase() === "en garantía" && (
                <div className="p-4 bg-muted rounded-md mt-2">
                  <p className="font-medium">Información de Garantía</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Este certificado está siendo utilizado como garantía para un financiamiento activo.
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cerrar
              </Button>
              {certificadoSeleccionado.estado.toLowerCase() === "disponible" && <Button>Usar como Garantía</Button>}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
