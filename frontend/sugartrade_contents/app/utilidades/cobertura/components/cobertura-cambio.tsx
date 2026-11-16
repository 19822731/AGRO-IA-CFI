"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ArrowLeft, DollarSign, Calendar } from "lucide-react"
import type { TipoOperacionCambio, InstrumentoCambio } from "../types/cambio"
import { useCoberturaCambio } from "../hooks/use-cobertura-cambio"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { formatCurrency } from "@/lib/utils"

interface CoberturaCambioProps {
  onVolver: () => void
}

export function CoberturaCambio({ onVolver }: CoberturaCambioProps) {
  const { obtenerInstrumentosCambio, contratarCoberturaCambio } = useCoberturaCambio()
  const [paso, setPaso] = useState<number>(1)
  const [tipoOperacion, setTipoOperacion] = useState<TipoOperacionCambio | null>(null)
  const [montoDolares, setMontoDolares] = useState<number>(0)
  const [fechaNecesidad, setFechaNecesidad] = useState<string>("")
  const [instrumentos, setInstrumentos] = useState<InstrumentoCambio[]>([])
  const [instrumentoSeleccionado, setInstrumentoSeleccionado] = useState<InstrumentoCambio | null>(null)
  const [cargando, setCargando] = useState<boolean>(false)
  const [errorMonto, setErrorMonto] = useState<string | null>(null)
  const [errorFecha, setErrorFecha] = useState<string | null>(null)

  const handleSeleccionTipoOperacion = (tipo: TipoOperacionCambio) => {
    setTipoOperacion(tipo)
    setPaso(2)
  }

  const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = Number.parseFloat(e.target.value)
    setMontoDolares(valor)

    if (isNaN(valor) || valor <= 0) {
      setErrorMonto("El monto debe ser un número positivo")
    } else {
      setErrorMonto(null)
    }
  }

  const handleFechaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFechaNecesidad(e.target.value)

    if (!e.target.value) {
      setErrorFecha("Debe seleccionar una fecha")
    } else {
      const fechaSeleccionada = new Date(e.target.value)
      const hoy = new Date()

      if (fechaSeleccionada <= hoy) {
        setErrorFecha("La fecha debe ser posterior a hoy")
      } else {
        setErrorFecha(null)
      }
    }
  }

  const handleContinuarDetalles = async () => {
    // Validar entrada
    let hayError = false

    if (!montoDolares || montoDolares <= 0) {
      setErrorMonto("El monto debe ser un número positivo")
      hayError = true
    }

    if (!fechaNecesidad) {
      setErrorFecha("Debe seleccionar una fecha")
      hayError = true
    } else {
      const fechaSeleccionada = new Date(fechaNecesidad)
      const hoy = new Date()

      if (fechaSeleccionada <= hoy) {
        setErrorFecha("La fecha debe ser posterior a hoy")
        hayError = true
      }
    }

    if (hayError) return

    setCargando(true)

    try {
      const instrumentosDisponibles = await obtenerInstrumentosCambio(fechaNecesidad)
      setInstrumentos(instrumentosDisponibles)
      setPaso(3)
    } catch (error) {
      console.error("Error al obtener instrumentos de cobertura:", error)
    } finally {
      setCargando(false)
    }
  }

  const handleSeleccionInstrumento = (instrumento: InstrumentoCambio) => {
    setInstrumentoSeleccionado(instrumento)
    setPaso(4)
  }

  const handleConfirmar = async () => {
    if (!tipoOperacion || !instrumentoSeleccionado) return

    setCargando(true)

    try {
      await contratarCoberturaCambio(tipoOperacion, montoDolares, fechaNecesidad, instrumentoSeleccionado)
      setPaso(5)
    } catch (error) {
      console.error("Error al contratar cobertura de cambio:", error)
    } finally {
      setCargando(false)
    }
  }

  const handleVolverPaso = () => {
    if (paso > 1) {
      setPaso(paso - 1)
    } else {
      onVolver()
    }
  }

  const handleNuevaOperacion = () => {
    setPaso(1)
    setTipoOperacion(null)
    setMontoDolares(0)
    setFechaNecesidad("")
    setInstrumentos([])
    setInstrumentoSeleccionado(null)
  }

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingSpinner className="mb-4" />
        <p className="text-muted-foreground">Procesando solicitud...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={handleVolverPaso}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-bold">Cobertura de Cambio</h2>
      </div>

      {paso === 1 && (
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>¿Qué tipo de operación estás realizando?</CardTitle>
            <CardDescription>
              La cobertura de cambio te permite mitigar el riesgo asociado a las fluctuaciones del tipo de cambio
              USD/ARS
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className="flex flex-col items-center space-y-3 border rounded-md p-4 cursor-pointer hover:bg-muted/50"
                onClick={() => handleSeleccionTipoOperacion("exportacion")}
              >
                <RadioGroupItem value="exportacion" id="exportacion" className="sr-only" />
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-semibold text-primary">E</span>
                </div>
                <Label htmlFor="exportacion" className="font-medium text-center">
                  Exportación
                </Label>
                <p className="text-sm text-muted-foreground text-center">
                  Protégete contra una posible baja del dólar frente al peso argentino
                </p>
              </div>

              <div
                className="flex flex-col items-center space-y-3 border rounded-md p-4 cursor-pointer hover:bg-muted/50"
                onClick={() => handleSeleccionTipoOperacion("importacion")}
              >
                <RadioGroupItem value="importacion" id="importacion" className="sr-only" />
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-semibold text-primary">I</span>
                </div>
                <Label htmlFor="importacion" className="font-medium text-center">
                  Importación
                </Label>
                <p className="text-sm text-muted-foreground text-center">
                  Protégete contra una posible subida del dólar frente al peso argentino
                </p>
              </div>

              <div
                className="flex flex-col items-center space-y-3 border rounded-md p-4 cursor-pointer hover:bg-muted/50 md:col-span-2"
                onClick={() => handleSeleccionTipoOperacion("otro")}
              >
                <RadioGroupItem value="otro" id="otro" className="sr-only" />
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-semibold text-primary">O</span>
                </div>
                <Label htmlFor="otro" className="font-medium text-center">
                  Otro
                </Label>
                <p className="text-sm text-muted-foreground text-center">
                  Protégete ante movimientos del tipo de cambio por otros motivos relacionados con el mercado del azúcar
                </p>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {paso === 2 && tipoOperacion && (
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Detalles de la Cobertura de Cambio</CardTitle>
            <CardDescription>
              {tipoOperacion === "exportacion"
                ? "Protege tus ingresos en dólares contra una posible baja del tipo de cambio"
                : tipoOperacion === "importacion"
                  ? "Protege tus pagos en dólares contra una posible subida del tipo de cambio"
                  : "Protege tus operaciones contra movimientos adversos del tipo de cambio"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="montoDolares" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Monto en dólares (USD)
              </Label>
              <Input
                id="montoDolares"
                type="number"
                min="1"
                value={montoDolares || ""}
                onChange={handleMontoChange}
                className={errorMonto ? "border-red-500" : ""}
              />
              {errorMonto && <p className="text-sm text-red-500">{errorMonto}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaNecesidad" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Fecha para la que necesitas la cobertura
              </Label>
              <Input
                id="fechaNecesidad"
                type="date"
                value={fechaNecesidad}
                onChange={handleFechaChange}
                className={errorFecha ? "border-red-500" : ""}
              />
              {errorFecha && <p className="text-sm text-red-500">{errorFecha}</p>}
            </div>

            <div className="bg-muted p-4 rounded-md space-y-2 mt-4">
              <h3 className="font-medium">Información sobre Cobertura de Cambio</h3>
              <p className="text-sm text-muted-foreground">
                {tipoOperacion === "exportacion"
                  ? "Al recibir pagos en USD por tus exportaciones, te expones al riesgo de que el dólar baje frente al peso argentino, reduciendo tus ingresos en pesos."
                  : tipoOperacion === "importacion"
                    ? "Al realizar pagos en USD por tus importaciones, te expones al riesgo de que el dólar suba frente al peso argentino, aumentando tus costos en pesos."
                    : "Las fluctuaciones en el tipo de cambio pueden afectar la rentabilidad de tus operaciones relacionadas con el mercado del azúcar."}
              </p>
              <p className="text-sm text-muted-foreground">
                La cobertura de cambio te permite fijar un tipo de cambio futuro, protegiéndote de movimientos adversos
                en el mercado.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleVolverPaso}>
              Volver
            </Button>
            <Button onClick={handleContinuarDetalles}>Continuar</Button>
          </CardFooter>
        </Card>
      )}

      {paso === 3 && tipoOperacion && instrumentos.length > 0 && (
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Opciones de Cobertura Disponibles</CardTitle>
            <CardDescription>Selecciona la opción que mejor se adapte a tus necesidades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {instrumentos.map((instrumento) => {
                const costoTotal = montoDolares * instrumento.costoCobertura * instrumento.tipoCambioFijado

                return (
                  <div
                    key={instrumento.id}
                    className="border rounded-md p-4 hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleSeleccionInstrumento(instrumento)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h3 className="font-medium">Vencimiento: {instrumento.fechaVencimiento}</h3>
                        <p className="text-sm text-muted-foreground">
                          Tipo de Cambio Fijado: 1 USD = {formatCurrency(instrumento.tipoCambioFijado, "ARS")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">Costo: {(instrumento.costoCobertura * 100).toFixed(2)}% del monto</p>
                        <p className="font-medium">{formatCurrency(costoTotal, "ARS")}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={handleVolverPaso} className="w-full">
              Volver
            </Button>
          </CardFooter>
        </Card>
      )}

      {paso === 4 && tipoOperacion && instrumentoSeleccionado && (
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Confirmar Cobertura de Cambio</CardTitle>
            <CardDescription>Revisa los detalles antes de confirmar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted p-4 rounded-md space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo de operación:</span>
                <span className="font-medium">
                  {tipoOperacion === "exportacion"
                    ? "Exportación"
                    : tipoOperacion === "importacion"
                      ? "Importación"
                      : "Otro"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monto a cubrir:</span>
                <span className="font-medium">{formatCurrency(montoDolares, "USD")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha de necesidad:</span>
                <span className="font-medium">{new Date(fechaNecesidad).toLocaleDateString("es-AR")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha de vencimiento:</span>
                <span className="font-medium">{instrumentoSeleccionado.fechaVencimiento}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo de cambio fijado:</span>
                <span className="font-medium">
                  1 USD = {formatCurrency(instrumentoSeleccionado.tipoCambioFijado, "ARS")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Costo de la cobertura:</span>
                <span className="font-medium">
                  {(instrumentoSeleccionado.costoCobertura * 100).toFixed(2)}% (
                  {formatCurrency(
                    montoDolares * instrumentoSeleccionado.costoCobertura * instrumentoSeleccionado.tipoCambioFijado,
                    "ARS",
                  )}
                  )
                </span>
              </div>
            </div>

            <div className="border p-4 rounded-md">
              <h3 className="font-medium mb-2">¿Cómo funciona esta cobertura?</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Al contratar esta cobertura, estás fijando un tipo de cambio de
                <strong> 1 USD = {formatCurrency(instrumentoSeleccionado.tipoCambioFijado, "ARS")} </strong>
                para la fecha de vencimiento ({instrumentoSeleccionado.fechaVencimiento}).
              </p>
              <p className="text-sm text-muted-foreground">
                {tipoOperacion === "exportacion"
                  ? "Si el tipo de cambio baja, recibirás la diferencia para compensar la pérdida en tus ingresos en pesos."
                  : tipoOperacion === "importacion"
                    ? "Si el tipo de cambio sube, recibirás la diferencia para compensar el aumento en tus costos en pesos."
                    : "Recibirás la diferencia si el movimiento del tipo de cambio es adverso a tu posición."}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleVolverPaso}>
              Volver
            </Button>
            <Button onClick={handleConfirmar}>Confirmar Cobertura</Button>
          </CardFooter>
        </Card>
      )}

      {paso === 5 && (
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>¡Cobertura Contratada!</CardTitle>
            <CardDescription>Tu cobertura de cambio ha sido procesada correctamente</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Puedes ver el estado de tu cobertura y gestionarla en la sección de Portafolio.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleNuevaOperacion} className="flex-1">
                Nueva Cobertura
              </Button>
              <Button variant="outline" onClick={onVolver} className="flex-1">
                Volver al Inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
