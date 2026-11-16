"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { PosicionPortafolio, TipoContrato } from "../types"
import { useCobertura } from "../hooks/use-cobertura"
import { formatCurrency } from "@/lib/utils"
import { DetallePosicion } from "./detalle-posicion"

export function PortafolioPosiciones() {
  const { obtenerPosiciones, obtenerDatosContrato } = useCobertura()
  const [posiciones, setPosiciones] = useState<PosicionPortafolio[]>([])
  const [cargando, setCargando] = useState(true)
  const [posicionSeleccionada, setPosicionSeleccionada] = useState<PosicionPortafolio | null>(null)
  const [preciosActuales, setPreciosActuales] = useState<Record<TipoContrato, number>>({
    contrato5: 0,
    contrato11: 0,
  })

  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true)
      try {
        // Obtener posiciones
        const posicionesData = obtenerPosiciones()
        setPosiciones(posicionesData)

        // Obtener precios actuales
        const precios: Record<TipoContrato, number> = {
          contrato5: 0,
          contrato11: 0,
        }

        for (const tipo of ["contrato5", "contrato11"] as TipoContrato[]) {
          const datos = await obtenerDatosContrato(tipo)
          precios[tipo] = datos.precioActual
        }

        setPreciosActuales(precios)
      } catch (error) {
        console.error("Error al cargar datos del portafolio:", error)
      } finally {
        setCargando(false)
      }
    }

    cargarDatos()

    // Actualizar cada 5 segundos
    const interval = setInterval(cargarDatos, 5000)
    return () => clearInterval(interval)
  }, [obtenerPosiciones, obtenerDatosContrato])

  const handleVerDetalle = (posicion: PosicionPortafolio) => {
    setPosicionSeleccionada(posicion)
  }

  const calcularGananciaActual = (posicion: PosicionPortafolio) => {
    const precioActual = preciosActuales[posicion.tipoContrato]
    if (!precioActual) return { valor: 0, porcentaje: 0 }

    const gananciaValor = (precioActual - posicion.precioEntrada) * posicion.cantidad
    const gananciaPorcentaje = (precioActual / posicion.precioEntrada - 1) * 100

    return {
      valor: gananciaValor,
      porcentaje: gananciaPorcentaje,
    }
  }

  if (posicionSeleccionada) {
    return (
      <DetallePosicion
        posicion={posicionSeleccionada}
        precioActual={preciosActuales[posicionSeleccionada.tipoContrato]}
        onVolver={() => setPosicionSeleccionada(null)}
      />
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Posiciones de Cobertura</CardTitle>
        <CardDescription>Gestiona tus posiciones abiertas en contratos de futuros</CardDescription>
      </CardHeader>
      <CardContent>
        {cargando ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : posiciones.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No tienes posiciones abiertas actualmente.</p>
            <Button className="mt-4" variant="outline">
              Crear nueva orden
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contrato</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Precio Entrada</TableHead>
                <TableHead>Precio Actual</TableHead>
                <TableHead>Ganancia/Pérdida</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posiciones.map((posicion) => {
                const ganancia = calcularGananciaActual(posicion)
                const esGanancia = ganancia.valor >= 0

                return (
                  <TableRow key={posicion.id}>
                    <TableCell>{posicion.tipoContrato === "contrato5" ? "Contrato #5" : "Contrato #11"}</TableCell>
                    <TableCell>{posicion.cantidad}</TableCell>
                    <TableCell>{formatCurrency(posicion.precioEntrada)}</TableCell>
                    <TableCell>{formatCurrency(preciosActuales[posicion.tipoContrato])}</TableCell>
                    <TableCell>
                      <span className={esGanancia ? "text-green-500" : "text-red-500"}>
                        {formatCurrency(ganancia.valor)} ({ganancia.porcentaje.toFixed(2)}%)
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={posicion.estado === "abierta" ? "default" : "secondary"}>
                        {posicion.estado === "abierta" ? "Abierta" : "Cerrada"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => handleVerDetalle(posicion)}>
                        Ver detalle
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
