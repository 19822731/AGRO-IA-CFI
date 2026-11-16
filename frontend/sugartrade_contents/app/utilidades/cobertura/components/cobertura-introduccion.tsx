"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, RefreshCw } from "lucide-react"
import { CoberturaPrecio } from "./cobertura-precio"
import { CoberturaCambio } from "./cobertura-cambio"

type TipoCobertura = "precio" | "cambio" | null

export function CoberturaIntroduccion() {
  const [tipoCobertura, setTipoCobertura] = useState<TipoCobertura>(null)

  if (tipoCobertura === "precio") {
    return <CoberturaPrecio onVolver={() => setTipoCobertura(null)} />
  }

  if (tipoCobertura === "cambio") {
    return <CoberturaCambio onVolver={() => setTipoCobertura(null)} />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="flex flex-col h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Cobertura de Precio
          </CardTitle>
          <CardDescription>
            Protege el valor de tu azúcar ante posibles cambios en el precio del mercado
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground">
            Ideal para productores que quieren asegurar un precio de venta futuro o inversores que buscan proteger su
            inversión.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => setTipoCobertura("precio")} className="w-full">
            Comenzar
          </Button>
        </CardFooter>
      </Card>

      <Card className="flex flex-col h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Cobertura de Cambio
          </CardTitle>
          <CardDescription>
            Protege tus operaciones internacionales de azúcar ante variaciones en el tipo de cambio
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground">
            Ideal para exportadores e importadores que operan con dólares estadounidenses (USD) y pesos argentinos
            (ARS).
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => setTipoCobertura("cambio")} className="w-full">
            Comenzar
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
