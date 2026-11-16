"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/utils"
import { Truck, Calendar, MapPin, Package, DollarSign, ArrowLeft, Star } from "lucide-react"
import MapaUbicaciones from "../components/mapa-ubicaciones"
import CalificacionComentarios from "../components/calificacion-comentarios"

interface DetallesFlete {
  id: string
  origen: string
  destino: string
  fechaSolicitud: string
  fechaRecogida: string
  fechaEntrega: string | null
  estado: "pendiente" | "en_transito" | "entregado" | "cancelado"
  proveedor: string
  precio: number
  tipoCarga: string
  peso: number
  seguro: boolean
  precioSeguro: number
  calificacion: number | null
  comentario: string | null
}

export default function DetalleFletePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [flete, setFlete] = useState<DetallesFlete | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulación de carga de datos
    setTimeout(() => {
      // Datos de ejemplo
      setFlete({
        id,
        origen: "Buenos Aires, Argentina",
        destino: "Córdoba, Argentina",
        fechaSolicitud: "2025-03-20",
        fechaRecogida: "2025-03-22",
        fechaEntrega: id === "1" ? "2025-03-24" : null,
        estado: id === "1" ? "entregado" : id === "2" ? "en_transito" : "pendiente",
        proveedor: "Transportes Rápidos",
        precio: 15000,
        tipoCarga: "Azúcar",
        peso: 5000,
        seguro: true,
        precioSeguro: 1500,
        calificacion: id === "1" ? 4.5 : null,
        comentario: id === "1" ? "Excelente servicio, entrega puntual." : null,
      })
      setIsLoading(false)
    }, 1500)
  }, [id])

  const getEstadoBadge = (estado: DetallesFlete["estado"]) => {
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

  const handleVolver = () => {
    router.back()
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Button variant="ghost" className="mb-6" onClick={handleVolver}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>

        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-6 w-24" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex">
                  <Skeleton className="h-4 w-4 mr-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[200px] w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!flete) {
    return (
      <div className="container mx-auto py-6">
        <Button variant="ghost" className="mb-6" onClick={handleVolver}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Truck className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Flete no encontrado</h2>
            <p className="text-muted-foreground mb-6">No se encontró información para el flete solicitado</p>
            <Button onClick={handleVolver}>Volver a mis fletes</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <Button variant="ghost" className="mb-6" onClick={handleVolver}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver
      </Button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Detalles del Flete #{flete.id}</h1>
        {getEstadoBadge(flete.estado)}
      </div>

      <Tabs defaultValue="detalles" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="detalles">Detalles del Flete</TabsTrigger>
          <TabsTrigger value="seguimiento">Seguimiento</TabsTrigger>
        </TabsList>

        <TabsContent value="detalles">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Información del Flete</CardTitle>
                <CardDescription>Detalles del servicio contratado</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="mr-3 h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Ruta</p>
                    <p className="text-sm text-muted-foreground">
                      {flete.origen} → {flete.destino}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Truck className="mr-3 h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Proveedor</p>
                    <div className="flex items-center">
                      <p className="text-sm text-muted-foreground mr-2">{flete.proveedor}</p>
                      {flete.calificacion && (
                        <div className="flex items-center text-amber-500">
                          <Star className="h-3 w-3 fill-amber-500" />
                          <span className="text-xs ml-1">{flete.calificacion.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <Package className="mr-3 h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Carga</p>
                    <p className="text-sm text-muted-foreground">
                      {flete.tipoCarga} - {flete.peso.toLocaleString()} kg
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Calendar className="mr-3 h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Fechas</p>
                    <p className="text-sm text-muted-foreground">
                      Solicitud: {new Date(flete.fechaSolicitud).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Recogida: {new Date(flete.fechaRecogida).toLocaleDateString()}
                    </p>
                    {flete.fechaEntrega && (
                      <p className="text-sm text-muted-foreground">
                        Entrega: {new Date(flete.fechaEntrega).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start">
                  <DollarSign className="mr-3 h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Costos</p>
                    <p className="text-sm text-muted-foreground">Flete: {formatCurrency(flete.precio, "ARS")}</p>
                    {flete.seguro && (
                      <p className="text-sm text-muted-foreground">
                        Seguro: {formatCurrency(flete.precioSeguro, "ARS")}
                      </p>
                    )}
                    <p className="text-sm font-medium mt-1">
                      Total: {formatCurrency(flete.precio + (flete.seguro ? flete.precioSeguro : 0), "ARS")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ubicación</CardTitle>
                  <CardDescription>Seguimiento de la ruta</CardDescription>
                </CardHeader>
                <CardContent>
                  <MapaUbicaciones origen={flete.origen} destino={flete.destino} />
                </CardContent>
              </Card>

              {flete.estado === "entregado" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Calificación</CardTitle>
                    <CardDescription>Evalúe el servicio recibido</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CalificacionComentarios
                      fleteId={flete.id}
                      calificacionActual={flete.calificacion}
                      comentarioActual={flete.comentario}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="seguimiento">
          <Card>
            <CardHeader>
              <CardTitle>Seguimiento del Flete</CardTitle>
              <CardDescription>Estado actual y actualizaciones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative border-l-2 border-muted pl-6 py-2 space-y-8">
                <div className="relative">
                  <div className="absolute -left-[25px] top-1 h-4 w-4 rounded-full bg-primary"></div>
                  <div>
                    <p className="font-medium">Solicitud Recibida</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(flete.fechaSolicitud).toLocaleDateString()} -
                      {new Date(flete.fechaSolicitud).toLocaleTimeString()}
                    </p>
                    <p className="text-sm mt-1">Su solicitud de flete ha sido recibida y procesada.</p>
                  </div>
                </div>

                <div className="relative">
                  <div
                    className={`absolute -left-[25px] top-1 h-4 w-4 rounded-full ${
                      ["en_transito", "entregado"].includes(flete.estado) ? "bg-primary" : "bg-muted"
                    }`}
                  ></div>
                  <div>
                    <p className="font-medium">En Tránsito</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(flete.fechaRecogida).toLocaleDateString()} -
                      {new Date(flete.fechaRecogida).toLocaleTimeString()}
                    </p>
                    <p className="text-sm mt-1">
                      {["en_transito", "entregado"].includes(flete.estado)
                        ? "Su carga ha sido recogida y está en camino a su destino."
                        : "Pendiente"}
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <div
                    className={`absolute -left-[25px] top-1 h-4 w-4 rounded-full ${
                      flete.estado === "entregado" ? "bg-primary" : "bg-muted"
                    }`}
                  ></div>
                  <div>
                    <p className="font-medium">Entregado</p>
                    <p className="text-sm text-muted-foreground">
                      {flete.fechaEntrega
                        ? `${new Date(flete.fechaEntrega).toLocaleDateString()} - 
                           ${new Date(flete.fechaEntrega).toLocaleTimeString()}`
                        : "Pendiente"}
                    </p>
                    <p className="text-sm mt-1">
                      {flete.estado === "entregado"
                        ? "Su carga ha sido entregada con éxito en el destino."
                        : "Pendiente"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
