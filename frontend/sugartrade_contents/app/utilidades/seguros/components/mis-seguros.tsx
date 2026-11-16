"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, AlertCircle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

// Datos simulados de seguros contratados
const SEGUROS_CONTRATADOS = [
  {
    id: "seguro-1",
    aseguradora: "Aseguradora del Campo",
    tipoCultivo: "Caña de Azúcar",
    ubicacion: "Tucumán",
    superficie: 150,
    fechaInicio: "2024-01-15",
    fechaFin: "2025-01-15",
    estado: "activo",
    precio: 225000,
    poliza: "POL-123456",
    riesgos: ["granizo", "incendio"],
  },
  {
    id: "seguro-2",
    aseguradora: "Protección Agrícola",
    tipoCultivo: "Maíz",
    ubicacion: "Córdoba",
    superficie: 200,
    fechaInicio: "2023-09-10",
    fechaFin: "2024-09-10",
    estado: "por_renovar",
    precio: 180000,
    poliza: "POL-789012",
    riesgos: ["granizo", "sequía", "helada"],
  },
]

export function MisSeguros() {
  // Función para formatear fecha
  const formatearFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr)
    return fecha.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Función para obtener el estado del seguro con su color
  const obtenerEstadoBadge = (estado: string) => {
    switch (estado) {
      case "activo":
        return <Badge className="bg-green-500">Activo</Badge>
      case "por_renovar":
        return <Badge className="bg-yellow-500">Por renovar</Badge>
      case "vencido":
        return <Badge className="bg-red-500">Vencido</Badge>
      default:
        return <Badge className="bg-gray-500">Desconocido</Badge>
    }
  }

  // Función para formatear los riesgos
  const formatearRiesgo = (riesgo: string) => {
    return riesgo.charAt(0).toUpperCase() + riesgo.slice(1)
  }

  if (SEGUROS_CONTRATADOS.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[300px] text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No tiene seguros contratados</h3>
          <p className="text-muted-foreground max-w-md">
            Cotice y contrate un seguro para proteger su inversión agrícola.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {SEGUROS_CONTRATADOS.map((seguro) => (
        <Card key={seguro.id} className="border border-border">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{seguro.aseguradora}</CardTitle>
                <CardDescription>Póliza: {seguro.poliza}</CardDescription>
              </div>
              {obtenerEstadoBadge(seguro.estado)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Detalles del Cultivo</h4>
                <div className="space-y-1">
                  <p>
                    <span className="font-medium">Tipo:</span> {seguro.tipoCultivo}
                  </p>
                  <p>
                    <span className="font-medium">Ubicación:</span> {seguro.ubicacion}
                  </p>
                  <p>
                    <span className="font-medium">Superficie:</span> {seguro.superficie} hectáreas
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Cobertura</h4>
                <div className="space-y-1">
                  <p>
                    <span className="font-medium">Vigencia:</span> {formatearFecha(seguro.fechaInicio)} al{" "}
                    {formatearFecha(seguro.fechaFin)}
                  </p>
                  <p>
                    <span className="font-medium">Prima anual:</span> {formatCurrency(seguro.precio, "ARS")}
                  </p>
                  <p>
                    <span className="font-medium">Riesgos cubiertos:</span>{" "}
                    {seguro.riesgos.map(formatearRiesgo).join(", ")}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Ver póliza
              </Button>
              {seguro.estado === "por_renovar" && <Button size="sm">Renovar seguro</Button>}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
