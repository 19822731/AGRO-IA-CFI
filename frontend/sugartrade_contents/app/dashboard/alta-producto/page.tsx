"use client"

import { useAltaProductoStore } from "@/lib/store/alta-producto-store"
import { Step1Details } from "@/components/alta-producto/step-1-details"
import { Step2Summary } from "@/components/alta-producto/step-2-summary"
import { Step3Delivery } from "@/components/alta-producto/step-3-delivery"
import { Step4Success } from "@/components/alta-producto/step-4-success"
import { Progress } from "@/components/ui/progress"

export default function AltaProductoPage() {
    const { step } = useAltaProductoStore()

    const progress = (step / 4) * 100

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="mb-8 space-y-4">
                <h1 className="text-3xl font-bold tracking-tight text-center">Alta de Producto</h1>
                <div className="max-w-md mx-auto">
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span className={step >= 1 ? "text-primary font-medium" : ""}>Detalles</span>
                        <span className={step >= 2 ? "text-primary font-medium" : ""}>Resumen</span>
                        <span className={step >= 3 ? "text-primary font-medium" : ""}>Entrega</span>
                        <span className={step >= 4 ? "text-primary font-medium" : ""}>Confirmación</span>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                {step === 1 && <Step1Details />}
                {step === 2 && <Step2Summary />}
                {step === 3 && <Step3Delivery />}
                {step === 4 && <Step4Success />}
            </div>
        </div>
    )
}
