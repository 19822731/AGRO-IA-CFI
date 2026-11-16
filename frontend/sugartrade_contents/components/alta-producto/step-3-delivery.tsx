"use client"

import { useAltaProductoStore, type DeliveryMethod } from "@/lib/store/alta-producto-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Truck, Package, FileText } from "lucide-react"

export function Step3Delivery() {
    const { deliveryMethod, setDeliveryMethod, nextStep, prevStep } = useAltaProductoStore()

    const handleNext = () => {
        if (deliveryMethod) {
            nextStep()
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Método de Entrega</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <RadioGroup
                    value={deliveryMethod || ""}
                    onValueChange={(value) => setDeliveryMethod(value as DeliveryMethod)}
                    className="grid gap-4"
                >
                    <Label
                        htmlFor="yo_entrego"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                    >
                        <RadioGroupItem value="yo_entrego" id="yo_entrego" className="sr-only" />
                        <Truck className="mb-3 h-6 w-6" />
                        <div className="text-center">
                            <div className="font-semibold">Yo lo entrego</div>
                            <div className="text-xs text-muted-foreground">Gestiono mi propio transporte</div>
                        </div>
                    </Label>

                    <Label
                        htmlFor="retiren"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                    >
                        <RadioGroupItem value="retiren" id="retiren" className="sr-only" />
                        <Package className="mb-3 h-6 w-6" />
                        <div className="text-center">
                            <div className="font-semibold">Necesito que lo retiren</div>
                            <div className="text-xs text-muted-foreground">Solicitar servicio de logística</div>
                        </div>
                    </Label>

                    <Label
                        htmlFor="maquila"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                    >
                        <RadioGroupItem value="maquila" id="maquila" className="sr-only" />
                        <FileText className="mb-3 h-6 w-6" />
                        <div className="text-center">
                            <div className="font-semibold">Orden de Maquila</div>
                            <div className="text-xs text-muted-foreground">Documentación de terceros</div>
                        </div>
                    </Label>
                </RadioGroup>

                <div className="flex justify-between gap-4 pt-4">
                    <Button variant="outline" onClick={prevStep} className="w-full">
                        Atrás
                    </Button>
                    <Button onClick={handleNext} disabled={!deliveryMethod} className="w-full">
                        Siguiente
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
