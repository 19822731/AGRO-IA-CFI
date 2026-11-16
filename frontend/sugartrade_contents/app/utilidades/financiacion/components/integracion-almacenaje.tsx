"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { formatCurrency } from "../utils/format-utils"

// Datos de ejemplo para certificados
const certificadosDisponibles = [
  { id: 1, numero: "CD-2023-001", producto: "Azúcar Blanca", cantidad: "500 ton", valor: 2500000 },
  { id: 2, numero: "CD-2023-002", producto: "Azúcar Blanca", cantidad: "450 ton", valor: 2250000 },
  { id: 3, numero: "CD-2023-003", producto: "Azúcar Cruda", cantidad: "600 ton", valor: 2700000 },
  { id: 4, numero: "CD-2023-004", producto: "Azúcar Blanca", cantidad: "520 ton", valor: 2600000 },
  { id: 5, numero: "CD-2023-005", producto: "Azúcar Cruda", cantidad: "480 ton", valor: 2400000 },
]

interface IntegracionAlmacenajeProps {
  tipo: "sgr" | "echeq" | "agroinsumos" | "pre-venta"
  monto: number
  entidad: string
  certificadosRequeridos: number
}

export function IntegracionAlmacenaje({ tipo, monto, entidad, certificadosRequeridos }: IntegracionAlmacenajeProps) {
  const [certificadosSeleccionados, setCertificadosSeleccionados] = useState<number[]>([])
  const [procesando, setProcesando] = useState(false)
  const [completado, setCompletado] = useState(false)

  const handleToggleCertificado = (id: number) => {
    if (certificadosSeleccionados.includes(id)) {
      setCertificadosSeleccionados(certificadosSeleccionados.filter((certId) => certId !== id))
    } else {
      if (certificadosSeleccionados.length < certificadosRequeridos) {
        setCertificadosSeleccionados([...certificadosSeleccionados, id])
      }
    }
  }

  const handleProcesar = () => {
    setProcesando(true)
    // Simulamos un proceso de aprobación
    setTimeout(() => {
      setProcesando(false)
      setCompletado(true)
    }, 1500)
  }

  const valorTotalSeleccionado = certificadosSeleccionados.reduce((total, id) => {
    const certificado = certificadosDisponibles.find((cert) => cert.id === id)
    return total + (certificado?.valor || 0)
  }, 0)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Certificados en Garantía</CardTitle>
          <CardDescription>
            Seleccione los certificados que desea utilizar como garantía para este financiamiento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm font-medium">Monto a Financiar</p>
              <p className="text-lg font-bold">{formatCurrency(monto)}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Garantía Requerida</p>
              <p className="text-lg">
                {certificadosRequeridos} certificados ({formatCurrency(monto * 0.5)})
              </p>
            </div>
          </div>

          <div className="border rounded-md">
            <div className="grid grid-cols-6 gap-2 p-3 bg-muted font-medium text-sm">
              <div className="col-span-1">Seleccionar</div>
              <div className="col-span-1">Número</div>
              <div className="col-span-1">Producto</div>
              <div className="col-span-1">Cantidad</div>
              <div className="col-span-2">Valor</div>
            </div>
            <div className="divide-y">
              {certificadosDisponibles.map((certificado) => (
                <div key={certificado.id} className="grid grid-cols-6 gap-2 p-3 items-center">
                  <div className="col-span-1">
                    <Checkbox
                      checked={certificadosSeleccionados.includes(certificado.id)}
                      onCheckedChange={() => handleToggleCertificado(certificado.id)}
                      disabled={
                        !certificadosSeleccionados.includes(certificado.id) &&
                        certificadosSeleccionados.length >= certificadosRequeridos
                      }
                    />
                  </div>
                  <div className="col-span-1">{certificado.numero}</div>
                  <div className="col-span-1">{certificado.producto}</div>
                  <div className="col-span-1">{certificado.cantidad}</div>
                  <div className="col-span-2">{formatCurrency(certificado.valor)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
            <div className="flex justify-between mb-2">
              <h3 className="font-semibold text-blue-800">Resumen de Garantías</h3>
              <span className="font-semibold text-blue-800">
                {certificadosSeleccionados.length} / {certificadosRequeridos}
              </span>
            </div>
            <div className="flex justify-between text-sm text-blue-700">
              <span>Valor total seleccionado:</span>
              <span className="font-medium">{formatCurrency(valorTotalSeleccionado)}</span>
            </div>
            <div className="flex justify-between text-sm text-blue-700">
              <span>Garantía requerida (50%):</span>
              <span className="font-medium">{formatCurrency(monto * 0.5)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          {!completado ? (
            <Button
              onClick={handleProcesar}
              disabled={certificadosSeleccionados.length < certificadosRequeridos || procesando}
              className="w-full"
            >
              {procesando ? "Procesando..." : "Confirmar Certificados en Garantía"}
            </Button>
          ) : (
            <div className="w-full text-center p-4 bg-green-50 rounded-md border border-green-200">
              <p className="text-green-800 font-medium">¡Certificados en garantía registrados correctamente!</p>
              <p className="text-sm text-green-700">
                Los certificados seleccionados han sido marcados como "En Garantía" y no estarán disponibles para
                operaciones.
              </p>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
