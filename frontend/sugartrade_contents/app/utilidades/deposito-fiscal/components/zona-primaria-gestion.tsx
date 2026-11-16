"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HabilitacionZonaPrimaria } from "./habilitacion-zona-primaria"
import { ProcesoConsolidacion } from "./proceso-consolidacion"
import { HistorialConsolidaciones } from "./historial-consolidaciones"
import { RequisitosZonaPrimaria } from "./requisitos-zona-primaria"
import { useZonaPrimaria } from "../hooks/use-zona-primaria"

export function ZonaPrimariaGestion() {
  const [activeTab, setActiveTab] = useState("habilitacion")
  const zonaPrimaria = useZonaPrimaria()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Zona Primaria y Consolidación</CardTitle>
        <CardDescription>
          Administre la habilitación de su zona primaria y realice procesos de consolidación.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="habilitacion" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="habilitacion">Habilitación</TabsTrigger>
            <TabsTrigger value="consolidacion" disabled={zonaPrimaria.zonaPrimaria.estado !== "habilitada"}>
              Consolidación
            </TabsTrigger>
            <TabsTrigger value="historial">Historial</TabsTrigger>
            <TabsTrigger value="requisitos">Requisitos</TabsTrigger>
          </TabsList>

          <TabsContent value="habilitacion" className="mt-6">
            <HabilitacionZonaPrimaria
              zonaPrimaria={zonaPrimaria.zonaPrimaria}
              actualizarEstadoHabilitacion={zonaPrimaria.actualizarEstadoHabilitacion}
              actualizarRequisito={zonaPrimaria.actualizarRequisito}
              iniciarProcesoHabilitacion={zonaPrimaria.iniciarProcesoHabilitacion}
              completarProcesoHabilitacion={zonaPrimaria.completarProcesoHabilitacion}
              todosRequisitosCompletados={zonaPrimaria.todosRequisitosCompletados}
              cargando={zonaPrimaria.cargando}
            />
          </TabsContent>

          <TabsContent value="consolidacion" className="mt-6">
            <ProcesoConsolidacion
              consolidacionActual={zonaPrimaria.consolidacionActual}
              iniciarConsolidacion={zonaPrimaria.iniciarConsolidacion}
              avanzarPasoConsolidacion={zonaPrimaria.avanzarPasoConsolidacion}
              registrarPesoEntrada={zonaPrimaria.registrarPesoEntrada}
              registrarPesoSalida={zonaPrimaria.registrarPesoSalida}
              agregarMercancia={zonaPrimaria.agregarMercancia}
              agregarDocumento={zonaPrimaria.agregarDocumento}
              cancelarConsolidacion={zonaPrimaria.cancelarConsolidacion}
            />
          </TabsContent>

          <TabsContent value="historial" className="mt-6">
            <HistorialConsolidaciones consolidaciones={zonaPrimaria.zonaPrimaria.consolidaciones} />
          </TabsContent>

          <TabsContent value="requisitos" className="mt-6">
            <RequisitosZonaPrimaria />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
