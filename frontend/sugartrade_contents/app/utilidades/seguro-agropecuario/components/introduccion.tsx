"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Shield, AlertTriangle } from "lucide-react"

interface IntroduccionProps {
  onContinuar: () => void
}

export function Introduccion({ onContinuar }: IntroduccionProps) {
  const [esProductor, setEsProductor] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleContinuar = () => {
    if (esProductor === "si") {
      onContinuar()
    } else if (esProductor === "no") {
      setError("Lo sentimos, este servicio está disponible únicamente para productores de caña de azúcar.")
    } else {
      setError("Por favor, seleccione una opción para continuar.")
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Seguro Agropecuario para Caña de Azúcar</CardTitle>
        <CardDescription>
          Proteja su inversión con un seguro diseñado específicamente para productores de caña de azúcar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Beneficios de nuestro seguro:</h3>
          <ul className="grid gap-2 sm:grid-cols-2">
            <li className="flex items-start gap-2">
              <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
              <span>Protección contra sequías e inundaciones</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
              <span>Cobertura por granizo y heladas</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
              <span>Indemnización por incendios</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
              <span>Protección contra plagas y enfermedades</span>
            </li>
          </ul>
        </div>

        <div className="border rounded-lg p-4 bg-muted/30">
          <Label htmlFor="productor" className="text-base font-medium">
            ¿Es usted productor de caña de azúcar?
          </Label>
          <RadioGroup id="productor" value={esProductor || ""} onValueChange={setEsProductor} className="mt-3">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="si" id="si" />
              <Label htmlFor="si">Sí, soy productor de caña de azúcar</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="no" />
              <Label htmlFor="no">No, no soy productor de caña de azúcar</Label>
            </div>
          </RadioGroup>

          {error && (
            <div className="mt-3 flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancelar</Button>
        <Button onClick={handleContinuar}>Continuar</Button>
      </CardFooter>
    </Card>
  )
}
