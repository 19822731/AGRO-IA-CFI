"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, AlertTriangle } from "lucide-react"

interface ValidationChecklistProps {
    data: any
    onApprove: () => void
    onCancel: () => void
}

export function ValidationChecklist({ data, onApprove, onCancel }: ValidationChecklistProps) {
    const [checks, setChecks] = useState({
        productor: false,
        producto: false,
        cantidad: false,
        maquila: false,
        calidad: false,
    })

    const allChecked = Object.values(checks).every(Boolean)

    const handleCheck = (key: keyof typeof checks) => {
        setChecks((prev) => ({ ...prev, [key]: !prev[key] }))
    }

    // Parse details safely
    const details = data.productDetails || data

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    Verificación de Ingreso
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Product Details View */}
                <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-lg">
                    <div>
                        <span className="font-semibold block">Productor ID:</span>
                        <span className="text-muted-foreground">{data.producerId || "N/A"}</span>
                    </div>
                    <div>
                        <span className="font-semibold block">ID Operación:</span>
                        <span className="text-muted-foreground">{data.id || "N/A"}</span>
                    </div>
                    <div>
                        <span className="font-semibold block">Producto:</span>
                        <span className="capitalize">{details.categoria} - {details.tipoProducto}</span>
                    </div>
                    <div>
                        <span className="font-semibold block">Cantidad:</span>
                        <span>{details.cantidad} Ton</span>
                    </div>
                    <div>
                        <span className="font-semibold block">Ingenio/Marca:</span>
                        <span className="capitalize">{details.marca}</span>
                    </div>
                    <div>
                        <span className="font-semibold block">Presentación:</span>
                        <span className="capitalize">{details.presentacion}</span>
                    </div>
                </div>

                <Separator />

                {/* Checklist */}
                <div className="space-y-4">
                    <h3 className="font-medium">Checklist de Control Físico</h3>

                    <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent">
                        <Checkbox
                            id="productor"
                            checked={checks.productor}
                            onCheckedChange={() => handleCheck("productor")}
                        />
                        <Label htmlFor="productor" className="cursor-pointer flex-1">
                            Identidad del Productor verificada
                        </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent">
                        <Checkbox
                            id="maquila"
                            checked={checks.maquila}
                            onCheckedChange={() => handleCheck("maquila")}
                        />
                        <Label htmlFor="maquila" className="cursor-pointer flex-1">
                            Orden de Maquila física presentada y válida
                        </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent">
                        <Checkbox
                            id="producto"
                            checked={checks.producto}
                            onCheckedChange={() => handleCheck("producto")}
                        />
                        <Label htmlFor="producto" className="cursor-pointer flex-1">
                            Tipo de Producto coincide con documentación
                        </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent">
                        <Checkbox
                            id="cantidad"
                            checked={checks.cantidad}
                            onCheckedChange={() => handleCheck("cantidad")}
                        />
                        <Label htmlFor="cantidad" className="cursor-pointer flex-1">
                            Cantidad declarada coincide con documentación
                        </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent">
                        <Checkbox
                            id="calidad"
                            checked={checks.calidad}
                            onCheckedChange={() => handleCheck("calidad")}
                        />
                        <Label htmlFor="calidad" className="cursor-pointer flex-1">
                            Calidad/Certificado verificado
                        </Label>
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <Button variant="outline" onClick={onCancel} className="w-full">
                        Cancelar
                    </Button>
                    <Button
                        onClick={onApprove}
                        disabled={!allChecked}
                        className="w-full bg-green-600 hover:bg-green-700"
                    >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Aprobar y Dar de Alta
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
