"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { TipoUsuario, TipoContrato } from "../types"

interface SeleccionContratoProps {
  tipoUsuario: TipoUsuario
  onSeleccionContrato: (tipo: TipoContrato) => void
}

export function SeleccionContrato({ tipoUsuario, onSeleccionContrato }: SeleccionContratoProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>¿Qué contrato de futuros te interesa para tu cobertura de precio?</CardTitle>
        <CardDescription>Selecciona el contrato que mejor se adapte a tus necesidades</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className="border rounded-md p-4 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => onSeleccionContrato("contrato5")}
          >
            <h3 className="font-semibold text-lg mb-2">Contrato #5 (corto plazo)</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Contrato de futuros de azúcar blanca con vencimiento a corto plazo. Ideal para coberturas inmediatas.
            </p>
            <div className="text-sm">
              <div className="flex justify-between py-1">
                <span>Tamaño del contrato:</span>
                <span className="font-medium">50 toneladas</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Cotización:</span>
                <span className="font-medium">USD/tonelada</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Liquidez:</span>
                <span className="font-medium">Alta</span>
              </div>
            </div>
          </div>

          <div
            className="border rounded-md p-4 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => onSeleccionContrato("contrato11")}
          >
            <h3 className="font-semibold text-lg mb-2">Contrato #11 (largo plazo)</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Contrato de futuros de azúcar cruda con vencimiento a largo plazo. Ideal para planificación futura.
            </p>
            <div className="text-sm">
              <div className="flex justify-between py-1">
                <span>Tamaño del contrato:</span>
                <span className="font-medium">112,000 libras</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Cotización:</span>
                <span className="font-medium">Centavos USD/libra</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Liquidez:</span>
                <span className="font-medium">Media-Alta</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
