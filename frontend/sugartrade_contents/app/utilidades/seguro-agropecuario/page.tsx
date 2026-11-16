"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CotizacionForm } from "./components/cotizacion-form"
import { ListaCotizaciones } from "./components/lista-cotizaciones"
import { useState } from "react"
import type { Cotizacion } from "./types"

export default function SeguroAgropecuarioPage() {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleObtenerCotizaciones = async (datosCotizacion: any) => {
    setIsLoading(true)
    try {
      // En un entorno real, aquí se harían las llamadas a las APIs de las aseguradoras
      // Simulamos una demora en la respuesta
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Simulación de cotizaciones basadas en los datos ingresados
      const simulacionCotizaciones: Cotizacion[] = [
        {
          id: "1",
          aseguradora: "La Segunda",
          precio: datosCotizacion.superficie * 12 * (datosCotizacion.riesgos.length * 0.8),
          cobertura: datosCotizacion.riesgos,
          plazo: "12 meses",
          deducible: "10%",
          calificacion: 4.5,
        },
        {
          id: "2",
          aseguradora: "Sancor Seguros",
          precio: datosCotizacion.superficie * 10 * (datosCotizacion.riesgos.length * 0.9),
          cobertura: datosCotizacion.riesgos,
          plazo: "12 meses",
          deducible: "15%",
          calificacion: 4.2,
        },
        {
          id: "3",
          aseguradora: "Mapfre",
          precio: datosCotizacion.superficie * 11 * (datosCotizacion.riesgos.length * 0.85),
          cobertura: datosCotizacion.riesgos,
          plazo: "12 meses",
          deducible: "12%",
          calificacion: 4.0,
        },
      ]
      setCotizaciones(simulacionCotizaciones)
    } catch (error) {
      console.error("Error al obtener cotizaciones:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Seguro Agropecuario</h1>

      <Tabs defaultValue="cotizar" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="cotizar">Cotizar Seguro</TabsTrigger>
          <TabsTrigger value="mis-seguros">Mis Seguros</TabsTrigger>
        </TabsList>

        <TabsContent value="cotizar" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Solicitar Cotización</CardTitle>
                  <CardDescription>
                    Complete el formulario para obtener cotizaciones de seguro para su cultivo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CotizacionForm onObtenerCotizaciones={handleObtenerCotizaciones} isLoading={isLoading} />
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2">
              <ListaCotizaciones cotizaciones={cotizaciones} isLoading={isLoading} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="mis-seguros">
          <Card>
            <CardHeader>
              <CardTitle>Mis Seguros Contratados</CardTitle>
              <CardDescription>Visualice y gestione sus pólizas de seguro agropecuario</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No tiene seguros contratados actualmente.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
