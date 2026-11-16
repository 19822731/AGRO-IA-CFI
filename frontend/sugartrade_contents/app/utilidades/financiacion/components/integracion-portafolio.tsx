"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { formatCurrency } from "../utils/format-utils"

interface IntegracionPortafolioProps {
  tipo: "sgr" | "echeq" | "agroinsumos" | "pre-venta"
  monto: number
  entidad: string
  plazo: number
  certificadosRequeridos: number
}

export function IntegracionPortafolio({
  tipo,
  monto,
  entidad,
  plazo,
  certificadosRequeridos,
}: IntegracionPortafolioProps) {
  const [aceptaTerminos, setAceptaTerminos] = useState(false)
  const [procesando, setProcesando] = useState(false)
  const [completado, setCompletado] = useState(false)

  const handleProcesar = () => {
    setProcesando(true)
    // Simulamos un proceso de aprobación
    setTimeout(() => {
      setProcesando(false)
      setCompletado(true)
    }, 1500)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Integración con Portafolio</CardTitle>
          <CardDescription>El financiamiento se acreditará en su portafolio una vez aprobado</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Tipo de Financiamiento</p>
              <p className="text-lg capitalize">{tipo}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Entidad Financiera</p>
              <p className="text-lg">{entidad}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Monto a Acreditar</p>
              <p className="text-lg font-bold">{formatCurrency(monto)}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Plazo</p>
              <p className="text-lg">{plazo} meses</p>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">Certificados en Garantía</h3>
            <p className="text-sm text-blue-700 mb-2">
              Se requieren {certificadosRequeridos} certificados como garantía para este financiamiento.
            </p>
            <p className="text-sm text-blue-700">
              Los certificados seleccionados cambiarán su estado a "En Garantía" y no estarán disponibles para
              operaciones hasta la cancelación del financiamiento.
            </p>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox id="terms" checked={aceptaTerminos} onCheckedChange={(checked) => setAceptaTerminos(!!checked)} />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Acepto los términos y condiciones del financiamiento
            </label>
          </div>
        </CardContent>
        <CardFooter>
          {!completado ? (
            <Button onClick={handleProcesar} disabled={!aceptaTerminos || procesando} className="w-full">
              {procesando ? "Procesando..." : "Procesar Financiamiento"}
            </Button>
          ) : (
            <div className="w-full text-center p-4 bg-green-50 rounded-md border border-green-200">
              <p className="text-green-800 font-medium">¡Financiamiento procesado correctamente!</p>
              <p className="text-sm text-green-700">
                El monto de {formatCurrency(monto)} ha sido acreditado en su portafolio.
              </p>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
