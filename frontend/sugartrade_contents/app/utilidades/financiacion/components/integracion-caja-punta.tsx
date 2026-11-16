"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency } from "@/lib/utils"
import { ArrowRight, CheckCircle2, FileText } from "lucide-react"

interface IntegracionCajaPuntaProps {
  operacionId?: string
  tipo: "compra" | "venta"
  monto: number
  cantidad: number
  contraparte: string
  metodoPago?: "echeq" | "transferencia" | "efectivo"
  numeroEcheq?: string
}

export function IntegracionCajaPunta({
  operacionId,
  tipo,
  monto,
  cantidad,
  contraparte,
  metodoPago = "echeq",
  numeroEcheq,
}: IntegracionCajaPuntaProps) {
  const { toast } = useToast()
  const [procesando, setProcesando] = useState(false)
  const [completado, setCompletado] = useState(false)
  const [metodo, setMetodo] = useState<string>(metodoPago)
  const [echeqNumero, setEcheqNumero] = useState<string>(numeroEcheq || "")
  const [mostrarDescuento, setMostrarDescuento] = useState(false)
  const [tasaDescuento, setTasaDescuento] = useState("22.5")
  const [bancoDescuento, setBancoDescuento] = useState("")

  // Función para procesar la operación
  const procesarOperacion = () => {
    setProcesando(true)

    // Simular tiempo de procesamiento
    setTimeout(() => {
      // Mostrar notificación de éxito
      toast({
        title: "Operación procesada",
        description: `Se ha registrado la ${tipo === "compra" ? "compra" : "venta"} de ${cantidad} certificados por ${formatCurrency(monto)}`,
        variant: "default",
      })

      setProcesando(false)
      setCompletado(true)

      // Si es un eCheq y es una venta, mostrar opción de descuento
      if (metodo === "echeq" && tipo === "venta") {
        setMostrarDescuento(true)
      }
    }, 2000)
  }

  // Función para procesar el descuento del eCheq
  const procesarDescuento = () => {
    setProcesando(true)

    // Simular tiempo de procesamiento
    setTimeout(() => {
      // Calcular monto con descuento
      const tasa = Number.parseFloat(tasaDescuento) / 100
      const montoDescuento = monto * (1 - tasa)

      // Mostrar notificación de éxito
      toast({
        title: "eCheq descontado",
        description: `Se ha descontado el eCheq por ${formatCurrency(montoDescuento)} (tasa: ${tasaDescuento}%)`,
        variant: "default",
      })

      setProcesando(false)
      setMostrarDescuento(false)

      // Redirigir a la página de financiación
      window.location.href = "/utilidades/financiacion"
    }, 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Integración con Caja de Punta</CardTitle>
        <CardDescription>Procese esta operación y gestione el método de pago</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted rounded-md">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary" />
              <div>
                <p className="font-medium">{tipo === "compra" ? "Compra" : "Venta"} de Certificados</p>
                <p className="text-sm text-muted-foreground">Contraparte: {contraparte}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold">{formatCurrency(monto)}</p>
              <p className="text-sm text-muted-foreground">Cantidad: {cantidad} certificados</p>
            </div>
          </div>

          {!completado ? (
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="metodo-pago">Método de Pago</Label>
                <Select value={metodo} onValueChange={setMetodo}>
                  <SelectTrigger id="metodo-pago">
                    <SelectValue placeholder="Seleccione método de pago" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="echeq">eCheq</SelectItem>
                    <SelectItem value="transferencia">Transferencia Bancaria</SelectItem>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {metodo === "echeq" && (
                <div className="space-y-2">
                  <Label htmlFor="echeq-numero">Número de eCheq</Label>
                  <Input
                    id="echeq-numero"
                    placeholder="Ingrese el número de eCheq"
                    value={echeqNumero}
                    onChange={(e) => setEcheqNumero(e.target.value)}
                  />
                </div>
              )}

              {metodo === "transferencia" && (
                <div className="p-3 bg-blue-50 text-blue-800 rounded-md border border-blue-200">
                  <p className="text-sm font-medium">Datos para transferencia:</p>
                  <p className="text-sm">Banco: Banco Nación Argentina</p>
                  <p className="text-sm">CBU: 0110012920000123456789</p>
                  <p className="text-sm">Alias: SUGAR.TRADE.CUENTA</p>
                </div>
              )}
            </div>
          ) : mostrarDescuento ? (
            <div className="space-y-4 pt-2">
              <div className="p-3 bg-green-50 text-green-800 rounded-md border border-green-200 flex items-start">
                <CheckCircle2 className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Operación completada correctamente</p>
                  <p className="text-sm">Ha recibido un eCheq por {formatCurrency(monto)}</p>
                  <p className="text-sm font-medium mt-2">¿Desea descontar este eCheq ahora?</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="banco-descuento">Banco para descuento</Label>
                <Select value={bancoDescuento} onValueChange={setBancoDescuento}>
                  <SelectTrigger id="banco-descuento">
                    <SelectValue placeholder="Seleccione banco" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="banco-nacion">Banco Nación (22.5%)</SelectItem>
                    <SelectItem value="banco-galicia">Banco Galicia (24.8%)</SelectItem>
                    <SelectItem value="banco-macro">Banco Macro (23.2%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tasa-descuento">Tasa de descuento (%)</Label>
                <Input
                  id="tasa-descuento"
                  type="number"
                  step="0.1"
                  value={tasaDescuento}
                  onChange={(e) => setTasaDescuento(e.target.value)}
                />
              </div>

              <div className="p-3 bg-yellow-50 text-yellow-800 rounded-md border border-yellow-200">
                <p className="text-sm font-medium">Información de descuento:</p>
                <div className="flex justify-between mt-1">
                  <span className="text-sm">Monto del eCheq:</span>
                  <span className="text-sm font-medium">{formatCurrency(monto)}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-sm">Tasa de descuento:</span>
                  <span className="text-sm font-medium">{tasaDescuento}%</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-sm">Monto a recibir:</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(monto * (1 - Number.parseFloat(tasaDescuento) / 100))}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-green-50 text-green-800 rounded-md border border-green-200 flex items-start">
              <CheckCircle2 className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Operación completada correctamente</p>
                <p className="text-sm">
                  La {tipo === "compra" ? "compra" : "venta"} de {cantidad} certificados ha sido procesada.
                </p>
                <div className="mt-2 flex items-center">
                  <Button
                    variant="link"
                    className="h-auto p-0 text-green-800"
                    onClick={() => (window.location.href = "/portafolio")}
                  >
                    Ver en Portafolio <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {!completado ? (
          <>
            <Button variant="outline" disabled={procesando}>
              Cancelar
            </Button>
            <Button onClick={procesarOperacion} disabled={procesando || (metodo === "echeq" && !echeqNumero)}>
              {procesando ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Procesando...
                </>
              ) : (
                "Procesar Operación"
              )}
            </Button>
          </>
        ) : mostrarDescuento ? (
          <>
            <Button variant="outline" disabled={procesando} onClick={() => setMostrarDescuento(false)}>
              No descontar
            </Button>
            <Button onClick={procesarDescuento} disabled={procesando || !bancoDescuento}>
              {procesando ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Procesando...
                </>
              ) : (
                "Descontar eCheq"
              )}
            </Button>
          </>
        ) : (
          <Button onClick={() => (window.location.href = "/portafolio")}>Ir a Portafolio</Button>
        )}
      </CardFooter>
    </Card>
  )
}
