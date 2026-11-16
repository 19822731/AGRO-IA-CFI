"use client"

import type React from "react"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye, QrCode, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useWarrants } from "../hooks/use-warrants"
import type { CertificadoDeposito } from "@/app/utilidades/almacenaje/types"

interface CertificadosTableProps {
  titulo?: string
  mostrarTodos?: boolean
  warrantId?: string
}

export function CertificadosTable({
  titulo = "Certificados de Depósito",
  mostrarTodos = true,
  warrantId,
}: CertificadosTableProps) {
  const { certificados, cargarCertificado, descargarCertificadoPDF } = useWarrants()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const handleVerCertificado = (certificado: CertificadoDeposito) => {
    setSelectedId(certificado.id)
    cargarCertificado(certificado.id)
  }

  const handleDescargarPDF = (certificadoId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    descargarCertificadoPDF(certificadoId)
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
  let certificadosFiltrados = warrantId ? certificados.filter((cert) => cert.warrantId === warrantId) : certificados

  // Limitar la cantidad si no se deben mostrar todos
  if (!mostrarTodos) {
    certificadosFiltrados = certificadosFiltrados.slice(0, 5)
  }

  // Obtener el estado del certificado
  const getEstadoCertificado = (estado: string) => {
    switch (estado) {
      case "disponible":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Disponible
          </span>
        )
      case "reservado":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            Reservado
          </span>
        )
      case "disponible-carga":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Disponible para Carga
          </span>
        )
      case "operacion-cargada":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            Operación Cargada
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Desconocido
          </span>
        )
    }
  }

  // Obtener el tipo de certificado
  const getTipoCertificado = (tipo: string) => {
    switch (tipo) {
      case "normal":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Normal
          </span>
        )
      case "canje":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            Canje
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Desconocido
          </span>
        )
    }
  }

  return (
    <Card className="bg-[#111936] border-[#1a2040]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-white">{titulo}</CardTitle>
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
                <TableHead className="text-gray-400 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {certificadosFiltrados.length === 0 ? (
                <TableRow className="border-[#1a2040] hover:bg-[#1a2040]/50">
                  <TableCell colSpan={7} className="text-center text-gray-400 py-8">
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
                    <TableCell>{getEstadoCertificado(certificado.estado)}</TableCell>
                    <TableCell>{getTipoCertificado(certificado.tipo)}</TableCell>
                    <TableCell className="text-white">{certificado.deposito}</TableCell>
                    <TableCell className="text-white">{certificado.ingenio}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#1a2040] text-[#00a8ff] hover:bg-[#1a2040] hover:text-white"
                          onClick={() => handleVerCertificado(certificado)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#1a2040] text-gray-300 hover:bg-[#1a2040] hover:text-white"
                          onClick={(e) => handleDescargarPDF(certificado.id, e)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          PDF
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {!mostrarTodos && certificados.length > 5 && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              size="sm"
              className="border-[#1a2040] text-gray-300 hover:bg-[#1a2040] hover:text-white"
            >
              Ver todos los certificados
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
