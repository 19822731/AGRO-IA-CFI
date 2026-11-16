"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye, QrCode } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { EstadoBadge, TipoBadge } from "./estado-badge"
import { useAlmacenaje } from "../hooks/use-almacenaje"
import type { CertificadoDeposito } from "../types"

interface CertificadosTableProps {
  titulo?: string
  descripcion?: string
  warrantId?: string
}

export function CertificadosTable({
  titulo = "Certificados de Depósito",
  descripcion,
  warrantId,
}: CertificadosTableProps) {
  const { certificados, cargarCertificado } = useAlmacenaje()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const handleVerCertificado = (certificado: CertificadoDeposito) => {
    setSelectedId(certificado.id)
    cargarCertificado(certificado.id)
  }

  // Formatear la fecha
  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha)
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  // Filtrar certificados si se proporciona un ID de warrant
  const certificadosFiltrados = warrantId ? certificados.filter((cert) => cert.warrantId === warrantId) : certificados

  return (
    <Card className="bg-[#111936] border-[#1a2040]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-white">{titulo}</CardTitle>
        {descripcion && <CardDescription className="text-gray-400">{descripcion}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-[#1a2040]">
          <Table>
            <TableHeader className="bg-[#0a0f29]">
              <TableRow className="border-[#1a2040] hover:bg-[#1a2040]/50">
                <TableHead className="text-gray-400">Número</TableHead>
                <TableHead className="text-gray-400">Bolsas</TableHead>
                <TableHead className="text-gray-400">Estado</TableHead>
                <TableHead className="text-gray-400">Tipo</TableHead>
                <TableHead className="text-gray-400">Depósito</TableHead>
                <TableHead className="text-gray-400">Ingenio</TableHead>
                <TableHead className="text-gray-400">Modificación</TableHead>
                <TableHead className="text-gray-400 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {certificadosFiltrados.length === 0 ? (
                <TableRow className="border-[#1a2040] hover:bg-[#1a2040]/50">
                  <TableCell colSpan={8} className="text-center text-gray-400 py-8">
                    No se encontraron certificados
                  </TableCell>
                </TableRow>
              ) : (
                certificadosFiltrados.map((certificado) => (
                  <TableRow
                    key={certificado.id}
                    className={`border-[#1a2040] hover:bg-[#1a2040]/50 ${selectedId === certificado.id ? "bg-[#1a2040]/70" : ""}`}
                  >
                    <TableCell className="text-white font-medium">
                      <div className="flex items-center">
                        <QrCode className="h-4 w-4 mr-2 text-[#00a8ff]" />
                        {certificado.numero}
                      </div>
                    </TableCell>
                    <TableCell className="text-white">{certificado.bolsas} BLS</TableCell>
                    <TableCell>
                      <EstadoBadge estado={certificado.estado} />
                    </TableCell>
                    <TableCell>
                      <TipoBadge tipo={certificado.tipo} />
                    </TableCell>
                    <TableCell className="text-white">{certificado.deposito}</TableCell>
                    <TableCell className="text-white">{certificado.ingenio}</TableCell>
                    <TableCell className="text-white">{formatearFecha(certificado.fechaModificacion)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#1a2040] text-[#00a8ff] hover:bg-[#1a2040] hover:text-white"
                        onClick={() => handleVerCertificado(certificado)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
