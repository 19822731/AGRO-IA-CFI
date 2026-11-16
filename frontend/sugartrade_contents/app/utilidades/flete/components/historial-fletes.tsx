"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/utils"
import { Eye, Truck, MapPin } from "lucide-react"
import Link from "next/link"

interface Flete {
  id: string
  origen: string
  destino: string
  fecha: string
  estado: "pendiente" | "en_transito" | "entregado" | "cancelado"
  proveedor: string
  precio: number
}

export default function HistorialFletes() {
  const [fletes, setFletes] = useState<Flete[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulación de carga de datos
    setTimeout(() => {
      setFletes([
        {
          id: "1",
          origen: "Buenos Aires",
          destino: "Córdoba",
          fecha: "2025-03-20",
          estado: "entregado",
          proveedor: "Transportes Rápidos",
          precio: 15000,
        },
        {
          id: "2",
          origen: "Rosario",
          destino: "Mendoza",
          fecha: "2025-03-22",
          estado: "en_transito",
          proveedor: "Fletes Seguros",
          precio: 18000,
        },
        {
          id: "3",
          origen: "Tucumán",
          destino: "Salta",
          fecha: "2025-03-25",
          estado: "pendiente",
          proveedor: "Transportes Económicos",
          precio: 12000,
        },
      ])
      setIsLoading(false)
    }, 1500)
  }, [])

  const getEstadoBadge = (estado: Flete["estado"]) => {
    switch (estado) {
      case "pendiente":
        return <Badge variant="outline">Pendiente</Badge>
      case "en_transito":
        return <Badge variant="secondary">En tránsito</Badge>
      case "entregado":
        return <Badge variant="success">Entregado</Badge>
      case "cancelado":
        return <Badge variant="destructive">Cancelado</Badge>
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-5 w-20" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="flex justify-between items-center mt-4">
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-9 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (fletes.length === 0) {
    return (
      <div className="text-center py-8">
        <Truck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No hay fletes registrados</h3>
        <p className="text-muted-foreground mt-2">Cuando contrate un servicio de flete, aparecerá en esta sección</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {fletes.map((flete) => (
        <Card key={flete.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Flete #{flete.id}</h3>
              {getEstadoBadge(flete.estado)}
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start">
                <MapPin className="mr-2 h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  <strong>Ruta:</strong> {flete.origen} → {flete.destino}
                </span>
              </div>
              <div className="flex items-center">
                <Truck className="mr-2 h-4 w-4 shrink-0" />
                <span>
                  <strong>Proveedor:</strong> {flete.proveedor}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4">
              <span className="font-bold">{formatCurrency(flete.precio, "ARS")}</span>
              <Link href={`/utilidades/flete/${flete.id}`}>
                <Button size="sm" variant="outline">
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalles
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
