"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Calendar, TrendingDown, Clock } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { CrearGrupoModal } from "./crear-grupo-modal"
import { UnirseGrupoModal } from "./unirse-grupo-modal"

// Datos de ejemplo para grupos de compra comunitaria
const gruposCompra = [
  {
    id: 1,
    nombre: "Fertilizantes Tucumán Norte",
    producto: "Fertilizante Premium Caña",
    precioUnitario: 1200000,
    precioGrupal: 980000,
    descuento: 18,
    unidad: "Tonelada",
    participantes: 8,
    participantesMax: 10,
    fechaLimite: "2025-05-15",
    estado: "activo",
  },
  {
    id: 2,
    nombre: "Herbicidas Salta Sur",
    producto: "Herbicida Selectivo Avanzado",
    precioUnitario: 850000,
    precioGrupal: 722500,
    descuento: 15,
    unidad: "1000 litros",
    participantes: 5,
    participantesMax: 8,
    fechaLimite: "2025-05-10",
    estado: "activo",
  },
  {
    id: 3,
    nombre: "Semillas Certificadas Jujuy",
    producto: "Semillas Certificadas Premium",
    precioUnitario: 1500000,
    precioGrupal: 1200000,
    descuento: 20,
    unidad: "Tonelada",
    participantes: 12,
    participantesMax: 12,
    fechaLimite: "2025-04-30",
    estado: "completo",
  },
  {
    id: 4,
    nombre: "Nutrientes Foliar Cooperativa",
    producto: "Nutriente Foliar Concentrado",
    precioUnitario: 750000,
    precioGrupal: 600000,
    descuento: 20,
    unidad: "500 litros",
    participantes: 3,
    participantesMax: 15,
    fechaLimite: "2025-05-20",
    estado: "activo",
  },
]

// Datos de ejemplo para mis grupos
const misGrupos = [
  {
    id: 1,
    nombre: "Fertilizantes Tucumán Norte",
    producto: "Fertilizante Premium Caña",
    cantidad: 2,
    precioUnitario: 980000,
    total: 1960000,
    fechaLimite: "2025-05-15",
    estado: "pendiente",
  },
  {
    id: 3,
    nombre: "Semillas Certificadas Jujuy",
    producto: "Semillas Certificadas Premium",
    cantidad: 1,
    precioUnitario: 1200000,
    total: 1200000,
    fechaLimite: "2025-04-30",
    estado: "confirmado",
  },
]

export function CompraComunitaria() {
  const [activeTab, setActiveTab] = useState("grupos-disponibles")
  const [showCrearGrupoModal, setShowCrearGrupoModal] = useState(false)
  const [showUnirseGrupoModal, setShowUnirseGrupoModal] = useState(false)
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<any>(null)

  const handleUnirseGrupo = (grupo: any) => {
    setGrupoSeleccionado(grupo)
    setShowUnirseGrupoModal(true)
  }

  // Formatear fecha
  const formatearFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr)
    return fecha.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  // Calcular días restantes
  const calcularDiasRestantes = (fechaStr: string) => {
    const fechaLimite = new Date(fechaStr)
    const hoy = new Date()
    const diferencia = fechaLimite.getTime() - hoy.getTime()
    return Math.ceil(diferencia / (1000 * 3600 * 24))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Compra Comunitaria</CardTitle>
              <CardDescription>Únase a grupos de compra para obtener mejores precios por volumen</CardDescription>
            </div>
            <Button onClick={() => setShowCrearGrupoModal(true)}>Crear Nuevo Grupo</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Grupos Activos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{gruposCompra.filter((g) => g.estado === "activo").length}</div>
                <p className="text-xs text-muted-foreground">Grupos abiertos para unirse</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ahorro Promedio</CardTitle>
                <TrendingDown className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18%</div>
                <p className="text-xs text-muted-foreground">En compras comunitarias</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Próximo Cierre</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">10/05/2025</div>
                <p className="text-xs text-muted-foreground">Herbicidas Salta Sur</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mis Participaciones</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{misGrupos.length}</div>
                <p className="text-xs text-muted-foreground">Grupos en los que participa</p>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="grupos-disponibles">Grupos Disponibles</TabsTrigger>
              <TabsTrigger value="mis-grupos">Mis Grupos</TabsTrigger>
            </TabsList>

            <TabsContent value="grupos-disponibles" className="space-y-4 pt-4">
              {gruposCompra
                .filter((g) => g.estado === "activo")
                .map((grupo) => (
                  <Card key={grupo.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{grupo.nombre}</CardTitle>
                          <CardDescription>{grupo.producto}</CardDescription>
                        </div>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                          {grupo.descuento}% descuento
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Precio individual:</p>
                          <p className="text-lg font-semibold line-through">{formatCurrency(grupo.precioUnitario)}</p>
                          <p className="text-sm text-muted-foreground">Precio grupal:</p>
                          <p className="text-lg font-bold text-green-600">{formatCurrency(grupo.precioGrupal)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Participantes:</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={(grupo.participantes / grupo.participantesMax) * 100} className="h-2" />
                            <span className="text-sm font-medium">
                              {grupo.participantes}/{grupo.participantesMax}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">Fecha límite:</p>
                          <p className="text-sm font-medium">
                            {formatearFecha(grupo.fechaLimite)} ({calcularDiasRestantes(grupo.fechaLimite)} días)
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full"
                        onClick={() => handleUnirseGrupo(grupo)}
                        disabled={grupo.participantes >= grupo.participantesMax}
                      >
                        {grupo.participantes >= grupo.participantesMax ? "Grupo Completo" : "Unirse al Grupo"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}

              {gruposCompra.filter((g) => g.estado === "activo").length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No hay grupos de compra disponibles en este momento
                </div>
              )}
            </TabsContent>

            <TabsContent value="mis-grupos" className="pt-4">
              {misGrupos.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Grupo</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Precio Unitario</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Fecha Límite</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {misGrupos.map((grupo) => (
                      <TableRow key={grupo.id}>
                        <TableCell className="font-medium">{grupo.nombre}</TableCell>
                        <TableCell>{grupo.producto}</TableCell>
                        <TableCell>{grupo.cantidad}</TableCell>
                        <TableCell>{formatCurrency(grupo.precioUnitario)}</TableCell>
                        <TableCell>{formatCurrency(grupo.total)}</TableCell>
                        <TableCell>{formatearFecha(grupo.fechaLimite)}</TableCell>
                        <TableCell>
                          <Badge variant={grupo.estado === "confirmado" ? "default" : "secondary"}>
                            {grupo.estado === "confirmado" ? "Confirmado" : "Pendiente"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No está participando en ningún grupo de compra
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modales */}
      <CrearGrupoModal isOpen={showCrearGrupoModal} onClose={() => setShowCrearGrupoModal(false)} />

      <UnirseGrupoModal
        isOpen={showUnirseGrupoModal}
        onClose={() => setShowUnirseGrupoModal(false)}
        grupo={grupoSeleccionado}
      />
    </div>
  )
}
