import type React from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default function InteligenciaComercialLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="border-b">
        <div className="container flex h-16 items-center px-4">
          <Tabs defaultValue="panel" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="panel" asChild>
                <Link href="/utilidades/inteligencia-comercial/panel-interactivo">Panel Interactivo</Link>
              </TabsTrigger>
              <TabsTrigger value="visualizacion" asChild>
                <Link href="/utilidades/inteligencia-comercial/visualizacion-mercado">Visualización de Mercado</Link>
              </TabsTrigger>
              <TabsTrigger value="analisis-espacial" asChild>
                <Link href="/utilidades/inteligencia-comercial/analisis-espacial">Análisis Espacial</Link>
              </TabsTrigger>
              <TabsTrigger value="analisis-datos" asChild>
                <Link href="/utilidades/inteligencia-comercial/analisis-datos">Análisis de Datos</Link>
              </TabsTrigger>
              <TabsTrigger value="reportes" asChild>
                <Link href="/utilidades/inteligencia-comercial/reportes">Reportes</Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  )
}
