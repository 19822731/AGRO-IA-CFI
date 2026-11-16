"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import CotizacionForm from "./components/cotizacion-form"
import ListaCotizaciones from "./components/lista-cotizaciones"
import HistorialFletes from "./components/historial-fletes"

export default function FletePage() {
  const [cotizaciones, setCotizaciones] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const handleCotizar = async (formData) => {
    setIsLoading(true)
    // Simulación de llamada a API
    setTimeout(() => {
      setCotizaciones([
        {
          id: "1",
          proveedor: "Transportes Rápidos",
          precio: 15000,
          tiempoEstimado: "2 días",
          calificacion: 4.5,
        },
        {
          id: "2",
          proveedor: "Fletes Seguros",
          precio: 18000,
          tiempoEstimado: "1 día",
          calificacion: 4.8,
        },
        {
          id: "3",
          proveedor: "Transportes Económicos",
          precio: 12000,
          tiempoEstimado: "3 días",
          calificacion: 4.0,
        },
      ])
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Gestión de Fletes</h1>

      <Tabs defaultValue="cotizar" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cotizar">Cotizar Flete</TabsTrigger>
          <TabsTrigger value="historial">Mis Fletes</TabsTrigger>
        </TabsList>

        <TabsContent value="cotizar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Solicitar Cotización</CardTitle>
                <CardDescription>Complete el formulario para obtener cotizaciones de flete</CardDescription>
              </CardHeader>
              <CardContent>
                <CotizacionForm onCotizar={handleCotizar} isLoading={isLoading} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cotizaciones Disponibles</CardTitle>
                <CardDescription>Seleccione la mejor opción para su carga</CardDescription>
              </CardHeader>
              <CardContent>
                <ListaCotizaciones cotizaciones={cotizaciones} isLoading={isLoading} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="historial">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Fletes</CardTitle>
              <CardDescription>Consulte sus fletes anteriores y en curso</CardDescription>
            </CardHeader>
            <CardContent>
              <HistorialFletes />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
