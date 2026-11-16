"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Filter, X } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useWarrants } from "../hooks/use-warrants"

interface FiltrosWarrantsProps {
  tipoFiltro: "warrants" | "certificados"
}

export function FiltrosWarrants({ tipoFiltro }: FiltrosWarrantsProps) {
  const { depositos, ingenios, actualizarFiltros, limpiarFiltros } = useWarrants()

  const [numero, setNumero] = useState("")
  const [depositoId, setDepositoId] = useState("")
  const [ingenioId, setIngenioId] = useState("")
  const [estado, setEstado] = useState("")
  const [tipo, setTipo] = useState("")
  const [fechaDesde, setFechaDesde] = useState<Date | undefined>(undefined)
  const [fechaHasta, setFechaHasta] = useState<Date | undefined>(undefined)

  const aplicarFiltros = () => {
    const filtros: any = {}

    if (numero) filtros.numero = numero
    if (depositoId) filtros.deposito = depositos.find((d) => d.id === depositoId)?.nombre
    if (ingenioId) filtros.ingenio = ingenios.find((i) => i.id === ingenioId)?.nombre
    if (estado) filtros.estado = estado
    if (tipo) filtros.tipo = tipo
    if (fechaDesde) filtros.fechaDesde = fechaDesde.toISOString()
    if (fechaHasta) filtros.fechaHasta = fechaHasta.toISOString()

    actualizarFiltros(filtros)
  }

  const limpiarTodosFiltros = () => {
    setNumero("")
    setDepositoId("")
    setIngenioId("")
    setEstado("")
    setTipo("")
    setFechaDesde(undefined)
    setFechaHasta(undefined)
    limpiarFiltros()
  }

  return (
    <Card className="bg-[#111936] border-[#1a2040]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-white flex items-center">
          <Filter className="h-5 w-5 mr-2 text-[#00a8ff]" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="numero" className="text-gray-400">
              Número
            </Label>
            <Input
              id="numero"
              placeholder={tipoFiltro === "warrants" ? "Ej: W-001" : "Ej: CD-001"}
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              className="bg-[#0a0f29] border-[#1a2040] text-white mt-1"
            />
          </div>

          <div>
            <Label htmlFor="deposito" className="text-gray-400">
              Depósito
            </Label>
            <Select value={depositoId} onValueChange={setDepositoId}>
              <SelectTrigger id="deposito" className="bg-[#0a0f29] border-[#1a2040] text-white mt-1">
                <SelectValue placeholder="Seleccionar depósito" />
              </SelectTrigger>
              <SelectContent className="bg-[#111936] border-[#1a2040] text-white">
                <SelectItem value="all">Todos</SelectItem>
                {depositos.map((deposito) => (
                  <SelectItem key={deposito.id} value={deposito.id}>
                    {deposito.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="ingenio" className="text-gray-400">
              Ingenio
            </Label>
            <Select value={ingenioId} onValueChange={setIngenioId}>
              <SelectTrigger id="ingenio" className="bg-[#0a0f29] border-[#1a2040] text-white mt-1">
                <SelectValue placeholder="Seleccionar ingenio" />
              </SelectTrigger>
              <SelectContent className="bg-[#111936] border-[#1a2040] text-white">
                <SelectItem value="all">Todos</SelectItem>
                {ingenios.map((ingenio) => (
                  <SelectItem key={ingenio.id} value={ingenio.id}>
                    {ingenio.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {tipoFiltro === "warrants" ? (
            <div>
              <Label htmlFor="estado-warrant" className="text-gray-400">
                Estado
              </Label>
              <Select value={estado} onValueChange={setEstado}>
                <SelectTrigger id="estado-warrant" className="bg-[#0a0f29] border-[#1a2040] text-white mt-1">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent className="bg-[#111936] border-[#1a2040] text-white">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="vencido">Vencido</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <>
              <div>
                <Label htmlFor="estado-certificado" className="text-gray-400">
                  Estado
                </Label>
                <Select value={estado} onValueChange={setEstado}>
                  <SelectTrigger id="estado-certificado" className="bg-[#0a0f29] border-[#1a2040] text-white mt-1">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111936] border-[#1a2040] text-white">
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="disponible">Disponible</SelectItem>
                    <SelectItem value="reservado">Reservado</SelectItem>
                    <SelectItem value="disponible-carga">Disponible para Carga</SelectItem>
                    <SelectItem value="operacion-cargada">Operación Cargada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tipo" className="text-gray-400">
                  Tipo
                </Label>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger id="tipo" className="bg-[#0a0f29] border-[#1a2040] text-white mt-1">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111936] border-[#1a2040] text-white">
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="canje">Canje</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-400">Fecha Desde</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal mt-1 bg-[#0a0f29] border-[#1a2040] text-white hover:bg-[#1a2040] hover:text-white"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fechaDesde ? format(fechaDesde, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-[#111936] border-[#1a2040]">
                  <Calendar
                    mode="single"
                    selected={fechaDesde}
                    onSelect={setFechaDesde}
                    initialFocus
                    className="bg-[#111936] text-white"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label className="text-gray-400">Fecha Hasta</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal mt-1 bg-[#0a0f29] border-[#1a2040] text-white hover:bg-[#1a2040] hover:text-white"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fechaHasta ? format(fechaHasta, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-[#111936] border-[#1a2040]">
                  <Calendar
                    mode="single"
                    selected={fechaHasta}
                    onSelect={setFechaHasta}
                    initialFocus
                    className="bg-[#111936] text-white"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button onClick={aplicarFiltros} className="flex-1 bg-[#00a8ff] hover:bg-[#00a8ff]/90 text-white">
              <Filter className="h-4 w-4 mr-1" />
              Aplicar Filtros
            </Button>
            <Button
              variant="outline"
              onClick={limpiarTodosFiltros}
              className="border-[#1a2040] text-gray-300 hover:bg-[#1a2040] hover:text-white"
            >
              <X className="h-4 w-4 mr-1" />
              Limpiar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
