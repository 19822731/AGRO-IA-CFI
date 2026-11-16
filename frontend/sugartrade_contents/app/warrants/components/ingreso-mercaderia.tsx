"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Truck, Factory, Warehouse, Package, QrCode } from "lucide-react"
import { useWarrants } from "../hooks/use-warrants"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface IngresoMercaderiaProps {
  onClose: () => void
}

export function IngresoMercaderia({ onClose }: IngresoMercaderiaProps) {
  const { depositos, ingenios, crearIngresoMercaderia, cargando } = useWarrants()

  const [paso, setPaso] = useState(1)
  const [tipoIngreso, setTipoIngreso] = useState<"maquila" | "entrega_directa">("maquila")
  const [ingenioId, setIngenioId] = useState("")
  const [depositoId, setDepositoId] = useState("")
  const [cantidadBolsas, setCantidadBolsas] = useState("")
  const [ingresoCreado, setIngresoCreado] = useState<any>(null)

  const handleSubmit = async () => {
    if (!ingenioId || !depositoId || !cantidadBolsas) return

    const resultado = await crearIngresoMercaderia({
      tipoIngreso,
      ingenioId,
      depositoId,
      cantidadBolsas: Number.parseInt(cantidadBolsas),
    })

    if (resultado) {
      setIngresoCreado(resultado)
      setPaso(2)
    }
  }

  return (
    <Card className="bg-[#111936] border-[#1a2040]">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl text-white">Nuevo Ingreso de Mercadería</CardTitle>
            <CardDescription className="text-gray-400">
              Complete el formulario para iniciar el proceso de ingreso de azúcar
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="border-[#1a2040] text-gray-300 hover:bg-[#1a2040] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {paso === 1 ? (
          <div className="space-y-6">
            <div className="p-4 bg-[#0a0f29] rounded-md border border-[#1a2040]">
              <div className="flex items-center space-x-2 mb-3">
                <Truck className="h-5 w-5 text-[#00a8ff]" />
                <h3 className="text-sm font-medium text-white">Tipo de Ingreso</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`p-4 rounded-md border cursor-pointer ${
                    tipoIngreso === "maquila"
                      ? "bg-[#1a2040] border-[#00a8ff]"
                      : "bg-[#111936] border-[#1a2040] hover:bg-[#1a2040]/50"
                  }`}
                  onClick={() => setTipoIngreso("maquila")}
                >
                  <h4 className="font-medium text-white mb-1">Orden de Maquila</h4>
                  <p className="text-sm text-gray-400">
                    El ingenio procesa la caña y entrega el azúcar en el depósito designado.
                  </p>
                </div>
                <div
                  className={`p-4 rounded-md border cursor-pointer ${
                    tipoIngreso === "entrega_directa"
                      ? "bg-[#1a2040] border-[#00a8ff]"
                      : "bg-[#111936] border-[#1a2040] hover:bg-[#1a2040]/50"
                  }`}
                  onClick={() => setTipoIngreso("entrega_directa")}
                >
                  <h4 className="font-medium text-white mb-1">Entrega Directa</h4>
                  <p className="text-sm text-gray-400">Entrega directa de azúcar ya procesada en el depósito.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 bg-[#0a0f29] rounded-md border border-[#1a2040]">
                <div className="flex items-center space-x-2 mb-3">
                  <Factory className="h-5 w-5 text-[#00a8ff]" />
                  <h3 className="text-sm font-medium text-white">Ingenio</h3>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="ingenio" className="text-gray-400">
                    Seleccione el ingenio
                  </Label>
                  <Select value={ingenioId} onValueChange={setIngenioId}>
                    <SelectTrigger id="ingenio" className="bg-[#111936] border-[#1a2040] text-white">
                      <SelectValue placeholder="Seleccionar ingenio" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111936] border-[#1a2040] text-white">
                      {ingenios.map((ingenio) => (
                        <SelectItem key={ingenio.id} value={ingenio.id}>
                          {ingenio.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-4 bg-[#0a0f29] rounded-md border border-[#1a2040]">
                <div className="flex items-center space-x-2 mb-3">
                  <Warehouse className="h-5 w-5 text-[#00a8ff]" />
                  <h3 className="text-sm font-medium text-white">Depósito</h3>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="deposito" className="text-gray-400">
                    Seleccione el depósito
                  </Label>
                  <Select value={depositoId} onValueChange={setDepositoId}>
                    <SelectTrigger id="deposito" className="bg-[#111936] border-[#1a2040] text-white">
                      <SelectValue placeholder="Seleccionar depósito" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111936] border-[#1a2040] text-white">
                      {depositos.map((deposito) => (
                        <SelectItem key={deposito.id} value={deposito.id}>
                          {deposito.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#0a0f29] rounded-md border border-[#1a2040]">
              <div className="flex items-center space-x-2 mb-3">
                <Package className="h-5 w-5 text-[#00a8ff]" />
                <h3 className="text-sm font-medium text-white">Cantidad</h3>
              </div>
              <div className="space-y-3">
                <Label htmlFor="cantidad" className="text-gray-400">
                  Número de bolsas (BLS)
                </Label>
                <Input
                  id="cantidad"
                  type="number"
                  min="1"
                  placeholder="Ej: 500"
                  value={cantidadBolsas}
                  onChange={(e) => setCantidadBolsas(e.target.value)}
                  className="bg-[#111936] border-[#1a2040] text-white"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-6 bg-[#0a0f29] rounded-md border border-[#1a2040] text-center">
              <div className="flex justify-center mb-4">
                <div className="w-32 h-32 bg-[#1a2040] rounded-full flex items-center justify-center">
                  <QrCode className="h-16 w-16 text-[#00a8ff]" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Ingreso Creado Exitosamente</h3>
              <p className="text-gray-400 mb-4">
                Se ha generado un código QR y un número de autorización para la descarga en el depósito.
              </p>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-4 bg-[#111936] rounded-md border border-[#1a2040]">
                  <p className="text-sm text-gray-400 mb-1">Número de Autorización:</p>
                  <p className="text-lg font-bold text-white">{ingresoCreado?.numeroAutorizacion}</p>
                </div>
                <div className="p-4 bg-[#111936] rounded-md border border-[#1a2040]">
                  <p className="text-sm text-gray-400 mb-1">Código QR:</p>
                  <p className="text-lg font-bold text-white">{ingresoCreado?.codigoQR}</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-[#111936] rounded-md border border-[#1a2040]">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div>
                  <p className="text-sm text-amber-500">Esperando recepción en depósito...</p>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  El depósito escaneará el código QR para confirmar la recepción de la mercadería. Una vez recibida, se
                  generará automáticamente el warrant y el certificado de depósito.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t border-[#1a2040] pt-4 flex justify-between">
        {paso === 1 ? (
          <>
            <Button
              variant="outline"
              onClick={onClose}
              className="border-[#1a2040] text-gray-300 hover:bg-[#1a2040] hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!ingenioId || !depositoId || !cantidadBolsas || cargando}
              className="bg-[#00a8ff] hover:bg-[#00a8ff]/90 text-white"
            >
              {cargando ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  Procesando...
                </>
              ) : (
                "Crear Ingreso"
              )}
            </Button>
          </>
        ) : (
          <Button onClick={onClose} className="bg-[#00a8ff] hover:bg-[#00a8ff]/90 text-white ml-auto">
            Finalizar
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
