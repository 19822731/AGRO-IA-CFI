"use client"

import { useState } from "react"
import { useZonaPrimaria } from "../hooks/use-zona-primaria"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import HabilitacionZonaPrimaria from "./habilitacion-zona-primaria"
import ProcesoConsolidacion from "./proceso-consolidacion"
import HistorialConsolidaciones from "./historial-consolidaciones"
import RequisitosZonaPrimaria from "./requisitos-zona-primaria"

export default function ZonaPrimariaGestion() {
  const [activeTab, setActiveTab] = useState("habilitacion")
  const { zonaPrimaria, consolidaciones, consolidacionActual, cargando, error } = useZonaPrimaria()

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Zona Primaria: {zonaPrimaria.nombre}</CardTitle>
          <CardDescription>Ubicación: {zonaPrimaria.ubicacion}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div>
              <span className="font-semibold">Estado de habilitación:</span>{" "}
              <span
                className={`inline-block px-2 py-1 rounded text-sm ${
                  zonaPrimaria.estado === "habilitada"
                    ? "bg-green-100 text-green-800"
                    : zonaPrimaria.estado === "en_proceso"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {zonaPrimaria.estado === "habilitada"
                  ? "Habilitada"
                  : zonaPrimaria.estado === "en_proceso"
                    ? "En proceso de habilitación"
                    : zonaPrimaria.estado === "no_habilitada"
                      ? "No habilitada"
                      : "Estado desconocido"}
              </span>
            </div>
            {zonaPrimaria.fechaHabilitacion && (
              <div>
                <span className="font-semibold">Fecha de habilitación:</span>{" "}
                {zonaPrimaria.fechaHabilitacion.toLocaleDateString()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="habilitacion">Habilitación</TabsTrigger>
          <TabsTrigger value="consolidacion" disabled={zonaPrimaria.estado !== "habilitada" && !consolidacionActual}>
            Consolidación
          </TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
          <TabsTrigger value="requisitos">Requisitos</TabsTrigger>
        </TabsList>

        <TabsContent value="habilitacion" className="mt-4">
          <HabilitacionZonaPrimaria />
        </TabsContent>

        <TabsContent value="consolidacion" className="mt-4">
          <ProcesoConsolidacion />
        </TabsContent>

        <TabsContent value="historial" className="mt-4">
          <HistorialConsolidaciones />
        </TabsContent>

        <TabsContent value="requisitos" className="mt-4">
          <RequisitosZonaPrimaria />
        </TabsContent>
      </Tabs>

      {cargando && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center">
            <LoadingSpinner size="lg" />
            <p className="mt-2">Procesando...</p>
          </div>
        </div>
      )}
    </div>
  )
}
