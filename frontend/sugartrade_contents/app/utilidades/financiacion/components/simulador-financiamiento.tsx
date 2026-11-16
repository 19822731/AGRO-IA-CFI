"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IntegracionPortafolio } from "./integracion-portafolio"
import { IntegracionAlmacenaje } from "./integracion-almacenaje"
import { formatCurrency } from "@/lib/utils"

interface SimuladorFinanciamientoProps {
  isOpen: boolean
  onClose: () => void
  data: {
    tipo: string
    monto: number
    plazo: number
    tasa: number
  }
}

export function SimuladorFinanciamiento({ isOpen, onClose, data }: SimuladorFinanciamientoProps) {
  const [monto, setMonto] = useState(data.monto)
  const [plazo, setPlazo] = useState(data.plazo)
  const [tasa, setTasa] = useState(data.tasa)
  const [cuotaMensual, setCuotaMensual] = useState(0)
  const [costoTotal, setCostoTotal] = useState(0)
  const [interesTotal, setInteresTotal] = useState(0)
  const [activeTab, setActiveTab] = useState("simulador")
  const [certificadosRequeridos, setCertificadosRequeridos] = useState(0)

  // Calcular cuota y totales
  useEffect(() => {
    if (monto <= 0 || plazo <= 0 || tasa <= 0) return

    const tasaMensual = tasa / 100 / 12
    const cuota = (monto * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -plazo))
    const total = cuota * plazo
    const interes = total - monto

    setCuotaMensual(cuota)
    setCostoTotal(total)
    setInteresTotal(interes)

    // Calcular certificados requeridos basado en el monto
    // Asumimos que cada certificado vale aproximadamente 2.5 millones
    const certificadosNecesarios = Math.ceil((monto / 2500000) * 0.5) // 50% del valor en certificados
    setCertificadosRequeridos(certificadosNecesarios)
  }, [monto, plazo, tasa])

  // Reiniciar el estado cuando cambian los datos de entrada
  useEffect(() => {
    setMonto(data.monto)
    setPlazo(data.plazo)
    setTasa(data.tasa)
    setActiveTab("simulador")
  }, [data])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Financiamiento: {data.tipo}</DialogTitle>
          <DialogDescription>Simule, apruebe y gestione su financiamiento</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="simulador">Simulador</TabsTrigger>
            <TabsTrigger value="portafolio">Integración Portafolio</TabsTrigger>
            <TabsTrigger value="garantias">Certificados en Garantía</TabsTrigger>
          </TabsList>

          <TabsContent value="simulador" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="monto">Monto a Financiar</Label>
              <Input
                id="monto"
                type="number"
                value={monto}
                onChange={(e) => setMonto(Number(e.target.value))}
                min={1000}
                step={1000}
              />
              <Slider
                value={[monto]}
                min={1000}
                max={Math.max(data.monto * 2, 50000000)}
                step={1000}
                onValueChange={(value) => setMonto(value[0])}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>$1.000</span>
                <span>{formatCurrency(Math.max(data.monto * 2, 50000000))}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plazo">Plazo (meses)</Label>
                <Select value={plazo.toString()} onValueChange={(value) => setPlazo(Number(value))}>
                  <SelectTrigger id="plazo">
                    <SelectValue placeholder="Seleccione un plazo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 meses</SelectItem>
                    <SelectItem value="6">6 meses</SelectItem>
                    <SelectItem value="12">12 meses</SelectItem>
                    <SelectItem value="18">18 meses</SelectItem>
                    <SelectItem value="24">24 meses</SelectItem>
                    <SelectItem value="36">36 meses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tasa">Tasa Anual (%)</Label>
                <Input
                  id="tasa"
                  type="number"
                  value={tasa}
                  onChange={(e) => setTasa(Number(e.target.value))}
                  min={1}
                  max={100}
                  step={0.1}
                />
              </div>
            </div>
            <div className="mt-4 p-4 bg-muted rounded-md">
              <h3 className="font-semibold mb-2">Resultados de la Simulación</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Cuota Mensual:</p>
                  <p className="text-xl font-bold">{formatCurrency(cuotaMensual)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Interés Total:</p>
                  <p className="text-xl font-bold">{formatCurrency(interesTotal)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Costo Total:</p>
                  <p className="text-xl font-bold">{formatCurrency(costoTotal)}</p>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
              <h3 className="font-semibold text-yellow-800 mb-2">Requisitos para este financiamiento</h3>
              <ul className="text-sm text-yellow-700 space-y-1 ml-5 list-disc">
                <li>Certificados de depósito como garantía ({certificadosRequeridos} certificados)</li>
                <li>Documentación legal de la empresa</li>
                <li>Historial crediticio favorable</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="portafolio">
            <IntegracionPortafolio
              tipo={data.tipo.toLowerCase() as any}
              monto={monto}
              entidad="Entidad Financiera"
              plazo={plazo}
              certificadosRequeridos={certificadosRequeridos}
            />
          </TabsContent>

          <TabsContent value="garantias">
            <IntegracionAlmacenaje
              tipo={data.tipo.toLowerCase() as any}
              monto={monto}
              entidad="Entidad Financiera"
              certificadosRequeridos={certificadosRequeridos}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          {activeTab === "simulador" && (
            <>
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={() => setActiveTab("portafolio")}>Continuar</Button>
            </>
          )}
          {activeTab !== "simulador" && (
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
