"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapaUbicacion } from "./mapa-ubicacion"
import type { DatosFinca, DatosProductor } from "../types/seguro"

interface InformacionFincaProps {
  datosProductor: DatosProductor
  datosFinca: DatosFinca
  onDatosProductorChange: (datos: Partial<DatosProductor>) => void
  onDatosFincaChange: (datos: Partial<DatosFinca>) => void
  onUbicacionChange: (lat: number, lng: number) => void
  onAnterior: () => void
  onSiguiente: () => void
}

export function InformacionFinca({
  datosProductor,
  datosFinca,
  onDatosProductorChange,
  onDatosFincaChange,
  onUbicacionChange,
  onAnterior,
  onSiguiente,
}: InformacionFincaProps) {
  const [errores, setErrores] = useState<Record<string, string>>({})

  const validarCampos = () => {
    const nuevosErrores: Record<string, string> = {}

    // Validar datos del productor
    if (!datosProductor.nombre) nuevosErrores.nombre = "El nombre es requerido"
    if (!datosProductor.documento) nuevosErrores.documento = "El documento es requerido"
    if (!datosProductor.telefono) nuevosErrores.telefono = "El teléfono es requerido"
    if (!datosProductor.email) nuevosErrores.email = "El email es requerido"
    if (datosProductor.email && !/\S+@\S+\.\S+/.test(datosProductor.email)) nuevosErrores.email = "Email inválido"

    // Validar datos de la finca
    if (!datosFinca.nombre) nuevosErrores.nombreFinca = "El nombre de la finca es requerido"
    if (!datosFinca.superficie) nuevosErrores.superficie = "La superficie es requerida"
    if (!datosFinca.tipoSuelo) nuevosErrores.tipoSuelo = "El tipo de suelo es requerido"
    if (!datosFinca.cultivoAnterior) nuevosErrores.cultivoAnterior = "El cultivo anterior es requerido"
    if (!datosFinca.rendimientoPromedio) nuevosErrores.rendimientoPromedio = "El rendimiento promedio es requerido"

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleSiguiente = () => {
    if (validarCampos()) {
      onSiguiente()
    }
  }

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Datos del Productor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre Completo</Label>
              <Input
                id="nombre"
                value={datosProductor.nombre}
                onChange={(e) => onDatosProductorChange({ nombre: e.target.value })}
                placeholder="Ingrese su nombre completo"
                className={errores.nombre ? "border-destructive" : ""}
              />
              {errores.nombre && <p className="text-xs text-destructive">{errores.nombre}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="documento">Documento de Identidad</Label>
              <Input
                id="documento"
                value={datosProductor.documento}
                onChange={(e) => onDatosProductorChange({ documento: e.target.value })}
                placeholder="Ingrese su documento"
                className={errores.documento ? "border-destructive" : ""}
              />
              {errores.documento && <p className="text-xs text-destructive">{errores.documento}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={datosProductor.telefono}
                onChange={(e) => onDatosProductorChange({ telefono: e.target.value })}
                placeholder="Ingrese su teléfono"
                className={errores.telefono ? "border-destructive" : ""}
              />
              {errores.telefono && <p className="text-xs text-destructive">{errores.telefono}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={datosProductor.email}
                onChange={(e) => onDatosProductorChange({ email: e.target.value })}
                placeholder="Ingrese su correo electrónico"
                className={errores.email ? "border-destructive" : ""}
              />
              {errores.email && <p className="text-xs text-destructive">{errores.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="experiencia">Años de Experiencia</Label>
              <Input
                id="experiencia"
                type="number"
                value={datosProductor.experiencia || ""}
                onChange={(e) => onDatosProductorChange({ experiencia: Number.parseInt(e.target.value) || 0 })}
                placeholder="Ingrese sus años de experiencia"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Datos de la Finca</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombreFinca">Nombre de la Finca</Label>
              <Input
                id="nombreFinca"
                value={datosFinca.nombre}
                onChange={(e) => onDatosFincaChange({ nombre: e.target.value })}
                placeholder="Ingrese el nombre de la finca"
                className={errores.nombreFinca ? "border-destructive" : ""}
              />
              {errores.nombreFinca && <p className="text-xs text-destructive">{errores.nombreFinca}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="superficie">Superficie (hectáreas)</Label>
              <Input
                id="superficie"
                type="number"
                value={datosFinca.superficie || ""}
                onChange={(e) => onDatosFincaChange({ superficie: Number.parseFloat(e.target.value) || 0 })}
                placeholder="Ingrese la superficie en hectáreas"
                className={errores.superficie ? "border-destructive" : ""}
              />
              {errores.superficie && <p className="text-xs text-destructive">{errores.superficie}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipoSuelo">Tipo de Suelo</Label>
              <Select value={datosFinca.tipoSuelo} onValueChange={(value) => onDatosFincaChange({ tipoSuelo: value })}>
                <SelectTrigger id="tipoSuelo" className={errores.tipoSuelo ? "border-destructive" : ""}>
                  <SelectValue placeholder="Seleccione el tipo de suelo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="arcilloso">Arcilloso</SelectItem>
                  <SelectItem value="arenoso">Arenoso</SelectItem>
                  <SelectItem value="limoso">Limoso</SelectItem>
                  <SelectItem value="franco">Franco</SelectItem>
                  <SelectItem value="humifero">Humífero</SelectItem>
                </SelectContent>
              </Select>
              {errores.tipoSuelo && <p className="text-xs text-destructive">{errores.tipoSuelo}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cultivoAnterior">Cultivo Anterior</Label>
              <Select
                value={datosFinca.cultivoAnterior}
                onValueChange={(value) => onDatosFincaChange({ cultivoAnterior: value })}
              >
                <SelectTrigger id="cultivoAnterior" className={errores.cultivoAnterior ? "border-destructive" : ""}>
                  <SelectValue placeholder="Seleccione el cultivo anterior" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="caña">Caña de Azúcar</SelectItem>
                  <SelectItem value="soja">Soja</SelectItem>
                  <SelectItem value="maiz">Maíz</SelectItem>
                  <SelectItem value="trigo">Trigo</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
              {errores.cultivoAnterior && <p className="text-xs text-destructive">{errores.cultivoAnterior}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rendimientoPromedio">Rendimiento Promedio (ton/ha)</Label>
              <Input
                id="rendimientoPromedio"
                type="number"
                value={datosFinca.rendimientoPromedio || ""}
                onChange={(e) => onDatosFincaChange({ rendimientoPromedio: Number.parseFloat(e.target.value) || 0 })}
                placeholder="Ingrese el rendimiento promedio"
                className={errores.rendimientoPromedio ? "border-destructive" : ""}
              />
              {errores.rendimientoPromedio && <p className="text-xs text-destructive">{errores.rendimientoPromedio}</p>}
            </div>
          </div>

          <div className="mt-6">
            <MapaUbicacion ubicacionInicial={datosFinca.ubicacion} onUbicacionChange={onUbicacionChange} />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onAnterior}>
            Anterior
          </Button>
          <Button onClick={handleSiguiente}>Siguiente</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
