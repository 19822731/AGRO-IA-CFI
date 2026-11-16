"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download, ZoomIn, ZoomOut, Maximize2, FileDown } from "lucide-react"
import { HARVEST_2016_MAP_URL, HARVEST_2016_PDF_URL } from "@/lib/services/historical-harvest-service"

export default function MapaZafra2016() {
  const [zoom, setZoom] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const handleZoomIn = () => {
    if (zoom < 2) setZoom(zoom + 0.2)
  }

  const handleZoomOut = () => {
    if (zoom > 0.5) setZoom(zoom - 0.2)
  }

  const toggleFullscreen = () => {
    const element = document.getElementById("mapa-container")
    if (!element) return

    if (!isFullscreen) {
      if (element.requestFullscreen) {
        element.requestFullscreen()
      }
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
      setIsFullscreen(false)
    }
  }

  const handleDownloadPDF = () => {
    window.open(HARVEST_2016_PDF_URL, "_blank")
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Mapa de Niveles de Producción - Zafra 2016</CardTitle>
        <CardDescription>
          Superficie cosechable de caña de azúcar según niveles de producción por departamento en la Provincia de
          Tucumán. Fuente: Estación Experimental Agroindustrial Obispo Colombres.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="mapa" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mapa">Visualización</TabsTrigger>
            <TabsTrigger value="info">Información</TabsTrigger>
          </TabsList>

          <TabsContent value="mapa" className="space-y-4">
            <div className="flex justify-end space-x-2 mb-2">
              <Button variant="outline" size="icon" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={toggleFullscreen}>
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleDownloadPDF}>
                <FileDown className="h-4 w-4" />
              </Button>
            </div>

            <div id="mapa-container" className="relative overflow-auto border rounded-md" style={{ height: "500px" }}>
              <div
                className="relative transition-transform duration-200 ease-in-out"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: "top left",
                  width: "fit-content",
                  margin: "0 auto",
                }}
              >
                <Image
                  src={HARVEST_2016_MAP_URL || "/placeholder.svg"}
                  alt="Mapa de niveles de producción de caña de azúcar - Zafra 2016"
                  width={800}
                  height={600}
                  className="object-contain"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="info">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Descripción</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Este mapa muestra la superficie cosechable de caña de azúcar, según niveles de producción por
                  departamento en la Provincia de Tucumán de la campaña de zafra 2016. Los datos fueron recopilados y
                  procesados por la Estación Experimental Agroindustrial Obispo Colombres.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium">Metadatos</h3>
                <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                  <li>
                    <strong>Título:</strong> Mapa de niveles de producción de la campaña de zafra 2016 de la Provincia
                    de Tucumán
                  </li>
                  <li>
                    <strong>Fecha de publicación:</strong> 19/10/2016
                  </li>
                  <li>
                    <strong>Sistema de referencia:</strong> Posgar 1998 Argentina Faja 3
                  </li>
                  <li>
                    <strong>Escala:</strong> 1:880000
                  </li>
                  <li>
                    <strong>Resolución espacial:</strong> 100 m
                  </li>
                  <li>
                    <strong>Organización:</strong> Red de Información para el Desarrollo Productivo
                  </li>
                </ul>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleDownloadPDF} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Descargar PDF
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
