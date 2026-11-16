"use client"

import { useState } from "react"
import { QRScanner } from "@/components/admin/qr-scanner"
import { ValidationChecklist } from "@/components/admin/validation-checklist"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminValidationPage() {
    const [step, setStep] = useState<"scan" | "validate" | "success">("scan")
    const [scannedData, setScannedData] = useState<any>(null)

    const handleScan = async (scannedContent: string) => {
        try {
            let data = null

            // Check if it's a JSON (legacy/fallback) or just an ID
            if (scannedContent.startsWith("{")) {
                const rawData = JSON.parse(scannedContent)
                // ... (legacy expansion logic if needed) ...
                data = rawData // Simplify for now, assuming backend usage mostly
            } else {
                // It's an ID (PROD-XXXX)
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/pre-registros/${scannedContent}`)
                    if (response.ok) {
                        data = await response.json()
                    } else {
                        alert("ID no encontrado en el sistema.")
                        return
                    }
                } catch (err) {
                    console.error("Error fetching data", err)
                    alert("Error de conexión al validar ID.")
                    return
                }
            }

            if (data && (data.type === "PRE_REGISTRO_PRODUCTO" || data.productDetails)) {
                setScannedData(data)
                setStep("validate")
            } else {
                alert("Datos inválidos.")
            }
        } catch (e) {
            console.error("Error processing scan", e)
            alert("Error al procesar el código.")
        }
    }

    const handleApprove = async () => {
        if (!scannedData || !scannedData.id) return

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/admin/approve-product/${scannedData.id}`, {
                method: 'POST',
            })

            if (response.ok) {
                setStep("success")
            } else {
                const err = await response.json()
                alert(`Error al aprobar: ${err.detail || "Error desconocido"}`)
            }
        } catch (e) {
            console.error("Error approving product", e)
            alert("Error de conexión al aprobar.")
        }
    }

    const handleReset = () => {
        setScannedData(null)
        setStep("scan")
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-8 text-center">Mesa de Entrada - Validación</h1>

            {step === "scan" && (
                <div className="space-y-4">
                    <p className="text-center text-muted-foreground">
                        Escanea el código QR presentado por el productor.
                    </p>
                    <QRScanner onScan={handleScan} />
                </div>
            )}

            {step === "validate" && scannedData && (
                <ValidationChecklist
                    data={scannedData}
                    onApprove={handleApprove}
                    onCancel={handleReset}
                />
            )}

            {step === "success" && (
                <Card className="w-full max-w-md mx-auto text-center">
                    <CardContent className="pt-6 space-y-6">
                        <div className="flex justify-center">
                            <CheckCircle2 className="h-20 w-20 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-green-600">¡Producto Dado de Alta!</h2>
                        <p className="text-muted-foreground">
                            El inventario ha sido actualizado correctamente. El productor ya puede ver el stock disponible.
                        </p>
                        <Button onClick={handleReset} size="lg" className="w-full">
                            Validar Siguiente Ingreso
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
