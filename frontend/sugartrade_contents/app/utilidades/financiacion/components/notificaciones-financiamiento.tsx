"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Notificacion {
  id: number
  tipo: string
  mensaje: string
  fecha: string
  leida: boolean
}

interface NotificacionesFinanciamientoProps {
  notificaciones: Notificacion[]
}

export function NotificacionesFinanciamiento({ notificaciones }: NotificacionesFinanciamientoProps) {
  const [activeTab, setActiveTab] = useState("todas")
  const [notificacionesState, setNotificacionesState] = useState(notificaciones)

  // Formatear fechas
  const formatearFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr)
    return fecha.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  // Filtrar notificaciones según la pestaña activa
  const getNotificacionesFiltradas = () => {
    switch (activeTab) {
      case "todas":
        return notificacionesState
      case "noLeidas":
        return notificacionesState.filter((n) => !n.leida)
      case "alertas":
        return notificacionesState.filter((n) => n.tipo === "alerta")
      default:
        return notificacionesState
    }
  }

  // Marcar como leída
  const marcarComoLeida = (id: number) => {
    setNotificacionesState((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)))
  }

  // Marcar todas como leídas
  const marcarTodasComoLeidas = () => {
    setNotificacionesState((prev) => prev.map((n) => ({ ...n, leida: true })))
  }

  // Obtener color de notificación según tipo
  const getTipoVariant = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case "alerta":
        return "destructive"
      case "info":
        return "default"
      case "exito":
        return "success"
      default:
        return "secondary"
    }
  }

  // Obtener icono según tipo
  const getTipoIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case "alerta":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-destructive"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        )
      case "info":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-primary"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        )
      case "exito":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-green-500"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        )
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        )
    }
  }

  const notificacionesFiltradas = getNotificacionesFiltradas()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Notificaciones</CardTitle>
          <CardDescription>Alertas y mensajes relacionados con su financiamiento</CardDescription>
        </div>
        <Button variant="outline" onClick={marcarTodasComoLeidas} disabled={!notificacionesState.some((n) => !n.leida)}>
          Marcar todas como leídas
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3 w-[400px]">
            <TabsTrigger value="todas">
              Todas
              {notificacionesState.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {notificacionesState.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="noLeidas">
              No leídas
              {notificacionesState.filter((n) => !n.leida).length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {notificacionesState.filter((n) => !n.leida).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="alertas">
              Alertas
              {notificacionesState.filter((n) => n.tipo === "alerta").length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {notificacionesState.filter((n) => n.tipo === "alerta").length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {notificacionesFiltradas.length > 0 ? (
              notificacionesFiltradas.map((notificacion) => (
                <div
                  key={notificacion.id}
                  className={`flex items-start space-x-4 p-4 rounded-lg ${
                    notificacion.leida ? "bg-muted/30" : "bg-muted/50 border-l-4 border-primary"
                  }`}
                >
                  <div className="flex-shrink-0">{getTipoIcon(notificacion.tipo)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <Badge variant={getTipoVariant(notificacion.tipo)}>
                        {notificacion.tipo.charAt(0).toUpperCase() + notificacion.tipo.slice(1)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{formatearFecha(notificacion.fecha)}</span>
                    </div>
                    <p className="mt-2">{notificacion.mensaje}</p>
                  </div>
                  {!notificacion.leida && (
                    <Button variant="ghost" size="sm" onClick={() => marcarComoLeida(notificacion.id)}>
                      Marcar como leída
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">No hay notificaciones para mostrar</div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
