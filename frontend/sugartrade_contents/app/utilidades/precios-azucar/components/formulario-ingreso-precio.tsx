"use client"

import type React from "react"

import { useState } from "react"
import { guardarPrecioAzucar } from "@/lib/services/precios-azucar-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function FormularioIngresoPrecio() {
  const [formData, setFormData] = useState({
    mercado: "Interno",
    fecha: new Date().toISOString().split("T")[0],
    precio: "",
    unidad: "ARS/bolsa 50kg",
  })

  const [estado, setEstado] = useState<{
    enviando: boolean
    exito: boolean | null
    error: string | null
  }>({
    enviando: false,
    exito: null,
    error: null,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEstado({ enviando: true, exito: null, error: null })

    try {
      // Validar que el precio sea un número
      const precioNumerico = Number.parseFloat(formData.precio)
      if (isNaN(precioNumerico)) {
        throw new Error("El precio debe ser un número válido")
      }

      // Enviar datos
      await guardarPrecioAzucar({
        ...formData,
        precio: precioNumerico,
      })

      // Actualizar estado
      setEstado({ enviando: false, exito: true, error: null })

      // Resetear formulario después de 2 segundos
      setTimeout(() => {
        setFormData({
          ...formData,
          precio: "",
        })
        setEstado({ enviando: false, exito: null, error: null })
      }, 2000)
    } catch (error) {
      console.error("Error al guardar precio:", error)
      setEstado({
        enviando: false,
        exito: false,
        error: error instanceof Error ? error.message : "Error al guardar el precio",
      })
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Ingresar Precio del Azúcar</CardTitle>
        <CardDescription>Ingrese los datos del precio actual del azúcar para el mercado seleccionado</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mercado">Mercado</Label>
            <Select value={formData.mercado} onValueChange={(value) => handleSelectChange("mercado", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un mercado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Interno">Mercado Interno</SelectItem>
                <SelectItem value="Contrato 5">Contrato 5</SelectItem>
                <SelectItem value="Contrato 11">Contrato 11</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha">Fecha</Label>
            <Input id="fecha" name="fecha" type="date" value={formData.fecha} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="precio">Precio</Label>
            <Input
              id="precio"
              name="precio"
              type="number"
              step="0.01"
              placeholder="Ej: 23500.00"
              value={formData.precio}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unidad">Unidad</Label>
            <Select value={formData.unidad} onValueChange={(value) => handleSelectChange("unidad", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione una unidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ARS/bolsa 50kg">ARS/bolsa 50kg</SelectItem>
                <SelectItem value="USD/tonelada">USD/tonelada</SelectItem>
                <SelectItem value="centavos/libra">centavos/libra</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {estado.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{estado.error}</AlertDescription>
            </Alert>
          )}

          {estado.exito && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>Éxito</AlertTitle>
              <AlertDescription>Precio guardado correctamente</AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" onClick={handleSubmit} disabled={estado.enviando} className="w-full">
          {estado.enviando ? "Guardando..." : "Guardar Precio"}
        </Button>
      </CardFooter>
    </Card>
  )
}
