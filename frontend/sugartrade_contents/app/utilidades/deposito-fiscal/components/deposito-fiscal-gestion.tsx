"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RegistroMercancia } from "./registro-mercancia"
import { ListadoMercancias } from "./listado-mercancias"
import { GestionWarrants } from "./gestion-warrants"
import { GestionCertificados } from "./gestion-certificados"
import { ZonaPrimariaGestion } from "./zona-primaria-gestion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAlmacenaje } from "../hooks/use-almacenaje"
import { TruckIcon, DollarSign, ArrowRight } from "lucide-react"

export function DepositoFiscalGestion() {
  const [activeTab, setActiveTab] = useState("mercancias")
  const [mostrarGuiaCompleta, setMostrarGuiaCompleta] = useState(false)
  const almacenaje = useAlmacenaje()

  return (
    <div className="space-y-6">
      {/* Guía de Consolidación Destacada - ANTES de las pestañas */}
      <Card className="border-2 border-primary shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="bg-primary/10 p-4 rounded-full">
              <TruckIcon className="h-12 w-12 text-primary" />
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">Guía de Consolidación en Zona Primaria</h2>
              <p className="text-muted-foreground mb-4">
                Proceso completo para realizar la consolidación de mercaderías para exportación, incluyendo los 8 pasos
                necesarios y los costos asociados (USD 180 en total).
              </p>

              <div className="flex flex-wrap gap-3 mb-4">
                <div className="flex items-center bg-muted px-3 py-1 rounded-full">
                  <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                  <span className="text-sm font-medium">Costo total: USD 180</span>
                </div>
              </div>
            </div>

            <Button className="shrink-0" size="lg" onClick={() => setMostrarGuiaCompleta(!mostrarGuiaCompleta)}>
              {mostrarGuiaCompleta ? "Ocultar Detalles" : "Ver Detalles"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {mostrarGuiaCompleta && (
            <div className="mt-6 pt-6 border-t">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Pasos del Proceso de Consolidación:</h3>
                  <ol className="space-y-3">
                    <li className="flex items-start">
                      <div className="bg-primary/10 rounded-full h-6 w-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                        <span className="text-sm font-bold">1</span>
                      </div>
                      <div>
                        <p className="font-medium">Ingreso a Zona Primaria</p>
                        <p className="text-sm text-green-600 font-medium">Costo: USD 40</p>
                      </div>
                    </li>

                    <li className="flex items-start">
                      <div className="bg-primary/10 rounded-full h-6 w-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                        <span className="text-sm font-bold">2</span>
                      </div>
                      <div>
                        <p className="font-medium">Pesaje de Entrada</p>
                        <p className="text-sm text-green-600 font-medium">Costo: USD 30</p>
                      </div>
                    </li>

                    <li className="flex items-start">
                      <div className="bg-primary/10 rounded-full h-6 w-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                        <span className="text-sm font-bold">3</span>
                      </div>
                      <div>
                        <p className="font-medium">Descarga y Consolidación</p>
                      </div>
                    </li>

                    <li className="flex items-start">
                      <div className="bg-primary/10 rounded-full h-6 w-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                        <span className="text-sm font-bold">4</span>
                      </div>
                      <div>
                        <p className="font-medium">Control y Verificación</p>
                      </div>
                    </li>

                    <li className="flex items-start">
                      <div className="bg-primary/10 rounded-full h-6 w-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                        <span className="text-sm font-bold">5</span>
                      </div>
                      <div>
                        <p className="font-medium">Documentación</p>
                      </div>
                    </li>

                    <li className="flex items-start">
                      <div className="bg-primary/10 rounded-full h-6 w-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                        <span className="text-sm font-bold">6</span>
                      </div>
                      <div>
                        <p className="font-medium">Despacho del Camión</p>
                        <p className="text-sm text-green-600 font-medium">Costo: USD 50</p>
                      </div>
                    </li>

                    <li className="flex items-start">
                      <div className="bg-primary/10 rounded-full h-6 w-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                        <span className="text-sm font-bold">7</span>
                      </div>
                      <div>
                        <p className="font-medium">Pesaje de Salida</p>
                        <p className="text-sm text-green-600 font-medium">Costo: USD 30</p>
                      </div>
                    </li>

                    <li className="flex items-start">
                      <div className="bg-primary/10 rounded-full h-6 w-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                        <span className="text-sm font-bold">8</span>
                      </div>
                      <div>
                        <p className="font-medium">Salida de Zona Primaria</p>
                        <p className="text-sm text-green-600 font-medium">Costo: USD 30</p>
                      </div>
                    </li>
                  </ol>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold">Costo Total del Proceso:</h3>
                    <span className="text-xl font-bold text-green-600">USD 180</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pestañas normales - DESPUÉS de la guía destacada */}
      <Tabs defaultValue="mercancias" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="mercancias">Mercancías</TabsTrigger>
          <TabsTrigger value="registro">Registro</TabsTrigger>
          <TabsTrigger value="warrants">Warrants</TabsTrigger>
          <TabsTrigger value="certificados">Certificados</TabsTrigger>
          <TabsTrigger value="zona-primaria">Zona Primaria</TabsTrigger>
        </TabsList>

        <TabsContent value="mercancias" className="mt-6">
          <ListadoMercancias
            mercancias={almacenaje.mercancias}
            actualizarEstado={almacenaje.actualizarEstadoMercancia}
            retirarMercancia={almacenaje.retirarMercancia}
          />
        </TabsContent>

        <TabsContent value="registro" className="mt-6">
          <RegistroMercancia registrarMercancia={almacenaje.registrarMercancia} />
        </TabsContent>

        <TabsContent value="warrants" className="mt-6">
          <GestionWarrants
            warrants={almacenaje.warrants}
            mercancias={almacenaje.mercancias}
            emitirWarrant={almacenaje.emitirWarrant}
          />
        </TabsContent>

        <TabsContent value="certificados" className="mt-6">
          <GestionCertificados
            certificados={almacenaje.certificados}
            mercancias={almacenaje.mercancias}
            emitirCertificado={almacenaje.emitirCertificado}
          />
        </TabsContent>

        <TabsContent value="zona-primaria" className="mt-6">
          <ZonaPrimariaGestion />
        </TabsContent>
      </Tabs>
    </div>
  )
}
