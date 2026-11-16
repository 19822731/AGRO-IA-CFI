"use client"

import { useAltaProductoStore } from "@/lib/store/alta-producto-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export function Step2Summary() {
    const { details, nextStep, prevStep } = useAltaProductoStore()

    if (!details) return null

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Resumen Alta Producto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        A continuación te presentamos los detalles de tu carga:
                    </p>

                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="font-medium">Tipo de producto:</span>
                            <span className="capitalize">{details.tipoProducto.replace(/_/g, " ")}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Presentación:</span>
                            <span className="capitalize">{details.presentacion.replace(/_/g, " ")}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Cantidad:</span>
                            <span>{details.cantidad} Ton</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Calidad:</span>
                            <span className="capitalize">{details.calidad.replace(/_/g, " ")}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Marca:</span>
                            <span className="capitalize">{details.marca.replace(/_/g, " ")}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Lugar de entrega:</span>
                            <span className="capitalize">{details.lugarEntrega.replace(/_/g, " ")}</span>
                        </div>
                    </div>
                </div>

                <Separator />

                <div className="flex justify-between gap-4">
                    <Button variant="outline" onClick={prevStep} className="w-full">
                        Atrás
                    </Button>
                    <Button onClick={nextStep} className="w-full">
                        Siguiente
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
