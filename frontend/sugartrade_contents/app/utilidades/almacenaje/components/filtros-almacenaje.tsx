"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, FilterX, Filter } from "lucide-react"
import type { FiltrosAlmacenaje } from "../types"
import { useAlmacenaje } from "../hooks/use-almacenaje"

export function FiltrosAlmacenaje() {
  const { depositos, ingenios, actualizarFiltros, limpiarFiltros, filtros: filtrosActuales } = useAlmacenaje()

  const [filtrosLocales, setFiltrosLocales] = useState<FiltrosAlmacenaje>({
    numero: filtrosActuales.numero || "",
    deposito: filtrosActuales.deposito || "",
    ingenio: filtrosActuales.ingenio || "",
    estado: filtrosActuales.estado || undefined,
    tipo: filtrosActuales.tipo || undefined,
    fechaDesde: filtrosActuales.fechaDesde || "",
    fechaHasta: filtrosActuales.fechaHasta || "",
  })

  // Manejar cambios en los filtros
  const handleChange = (campo: keyof FiltrosAlmacenaje, valor: string) => {
    setFiltrosLocales({
      ...filtrosLocales,
      [campo]: valor,
    })
  }

  // Aplicar filtros
  const aplicarFiltros = () => {
    actualizarFiltros(filtrosLocales)
  }

  // Limpiar filtros
  const borrarFiltros = () => {
    setFiltrosLocales({
      numero: "",
      deposito: "",
      ingenio: "",
      estado: undefined,
      tipo: undefined,
      fechaDesde: "",
      fechaHasta: "",
    })
    limpiarFiltros()
  }

  return (
    <Card className="bg-[#111936] border-[#1a2040]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-white">Filtros de Búsqueda</CardTitle>
        <CardDescription className="text-gray-400">Filtrar y buscar warrants y certificados</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Filtro por número */}
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Número de Certificado/Warrant</label>
            <div className="relative">
              <Input
                placeholder="Buscar por número..."
                value={filtrosLocales.numero}
                onChange={(e) => handleChange("numero", e.target.value)}
                className="bg-[#0a0f29] border-[#1a2040] text-white placeholder:text-gray-500"
              />
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
            </div>
          </div>

          {/* Filtro por estado */}
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Estado</label>
            <Select
              value={filtrosLocales.estado || "todos"}
              onValueChange={(value) => handleChange("estado", value === "todos" ? "" : value)}
            >
              <SelectTrigger className="bg-[#0a0f29] border-[#1a2040] text-white">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0f29] border-[#1a2040] text-white">
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="disponible">Disponible</SelectItem>
                <SelectItem value="reservado">Reservado</SelectItem>
                <SelectItem value="disponible-carga">Disponible para Carga</SelectItem>
                <SelectItem value="operacion-cargada">Operación Cargada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por tipo */}
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Tipo de Certificado</label>
            <Select
              value={filtrosLocales.tipo || "todos"}
              onValueChange={(value) => handleChange("tipo", value === "todos" ? "" : value)}
            >
              <SelectTrigger className="bg-[#0a0f29] border-[#1a2040] text-white">
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0f29] border-[#1a2040] text-white">
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="canje">Para Canje</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por depósito */}
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Depósito</label>
            <Select
              value={filtrosLocales.deposito || "todos"}
              onValueChange={(value) => handleChange("deposito", value === "todos" ? "" : value)}
            >
              <SelectTrigger className="bg-[#0a0f29] border-[#1a2040] text-white">
                <SelectValue placeholder="Todos los depósitos" />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0f29] border-[#1a2040] text-white">
                <SelectItem value="todos">Todos</SelectItem>
                {depositos.map((deposito) => (
                  <SelectItem key={deposito.id} value={deposito.nombre}>
                    {deposito.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por ingenio */}
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Ingenio</label>
            <Select
              value={filtrosLocales.ingenio || "todos"}
              onValueChange={(value) => handleChange("ingenio", value === "todos" ? "" : value)}
            >
              <SelectTrigger className="bg-[#0a0f29] border-[#1a2040] text-white">
                <SelectValue placeholder="Todos los ingenios" />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0f29] border-[#1a2040] text-white">
                <SelectItem value="todos">Todos</SelectItem>
                {ingenios.map((ingenio) => (
                  <SelectItem key={ingenio.id} value={ingenio.nombre}>
                    {ingenio.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por fecha desde */}
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Fecha Desde</label>
            <Input
              type="date"
              value={filtrosLocales.fechaDesde}
              onChange={(e) => handleChange("fechaDesde", e.target.value)}
              className="bg-[#0a0f29] border-[#1a2040] text-white"
            />
          </div>

          {/* Filtro por fecha hasta */}
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Fecha Hasta</label>
            <Input
              type="date"
              value={filtrosLocales.fechaHasta}
              onChange={(e) => handleChange("fechaHasta", e.target.value)}
              className="bg-[#0a0f29] border-[#1a2040] text-white"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t border-[#1a2040] pt-4">
        <Button
          variant="outline"
          className="border-[#1a2040] text-gray-300 hover:bg-[#1a2040] hover:text-white"
          onClick={borrarFiltros}
        >
          <FilterX className="h-4 w-4 mr-2" />
          Limpiar Filtros
        </Button>
        <Button className="bg-[#00a8ff] hover:bg-[#00a8ff]/90 text-white" onClick={aplicarFiltros}>
          <Filter className="h-4 w-4 mr-2" />
          Aplicar Filtros
        </Button>
      </CardFooter>
    </Card>
  )
}
