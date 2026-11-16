"use client"

import { useState } from "react"
import { useZonaPrimaria } from "../hooks/use-zona-primaria"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export default function HabilitacionZonaPrimaria() {
  const { zonaPrimaria, actualizarEstadoHabilitacion } = useZonaPrimaria()
  const [respuesta, setRespuesta] = useState<string | null>(null)
  const [mostrarRequisitos, setMostrarRequisitos] = useState(false)

  const handleRespuesta = (valor: string) => {
    setRespuesta(valor)

    if (valor === "si") {
      actualizarEstadoHabilitacion("habilitada")
    } else {
      setMostrarRequisitos(true)
    }
  }

  const handleIniciarProceso = () => {
    actualizarEstadoHabilitacion("en_proceso")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Habilitación de Zona Primaria para Consolidación</CardTitle>
          <CardDescription>
            Para realizar consolidaciones en la Zona Primaria de tu depósito fiscal, esta debe estar habilitada por la
            Aduana.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {zonaPrimaria.estado === "habilitada" ? (
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-green-800 font-medium">
                Tu Zona Primaria ya está habilitada para realizar consolidaciones.
              </p>
              {zonaPrimaria.fechaHabilitacion && (
                <p className="text-green-700 mt-2">
                  Fecha de habilitación: {zonaPrimaria.fechaHabilitacion.toLocaleDateString()}
                </p>
              )}
            </div>
          ) : zonaPrimaria.estado === "en_proceso" ? (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-yellow-800 font-medium">
                Tu Zona Primaria está en proceso de habilitación para realizar consolidaciones.
              </p>
              <p className="text-yellow-700 mt-2">Sigue los pasos indicados por la Aduana para completar el proceso.</p>
            </div>
          ) : (
            <>
              <p className="mb-4">¿Tu Zona Primaria ya cuenta con la habilitación para realizar consolidaciones?</p>

              <RadioGroup value={respuesta || ""} onValueChange={handleRespuesta}>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="si" id="si" />
                  <Label htmlFor="si">Sí</Label>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="no" id="no" />
                  <Label htmlFor="no">No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no_seguro" id="no_seguro" />
                  <Label htmlFor="no_seguro">No estoy seguro</Label>
                </div>
              </RadioGroup>
            </>
          )}
        </CardContent>
        {mostrarRequisitos && (
          <CardFooter className="flex-col items-start">
            <div className="bg-blue-50 p-4 rounded-lg w-full mb-4">
              <p className="text-blue-800 font-medium mb-2">
                Para habilitar tu Zona Primaria para consolidación, deberás cumplir con los requisitos establecidos en
                el Código Aduanero y la normativa de la AFIP (ARCA). Algunos requisitos generales incluyen:
              </p>
              <ul className="list-disc pl-5 text-blue-700 space-y-1">
                <li>Delimitación y señalización clara del área.</li>
                <li>
                  Infraestructura adecuada para el movimiento y almacenamiento de mercancías (pisos, iluminación,
                  seguridad).
                </li>
                <li>Equipamiento de manipulación de carga (montacargas, etc.).</li>
                <li>Sistemas de control de acceso y seguridad (cámaras, registros).</li>
                <li>Personal capacitado en normativa aduanera y procedimientos de consolidación.</li>
                <li>Presentación de la solicitud de habilitación ante la Aduana.</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Button onClick={() => setMostrarRequisitos(false)}>Volver</Button>
              <Button onClick={handleIniciarProceso} variant="default">
                Iniciar proceso de habilitación
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      {(respuesta === "no" || respuesta === "no_seguro") && !mostrarRequisitos && (
        <Card>
          <CardHeader>
            <CardTitle>¿Deseas ver más detalles sobre los requisitos específicos de habilitación?</CardTitle>
          </CardHeader>
          <CardFooter>
            <div className="flex gap-4">
              <Button onClick={() => setMostrarRequisitos(true)} variant="default">
                Sí, mostrar requisitos
              </Button>
              <Button onClick={() => setRespuesta(null)} variant="outline">
                No, volver
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
