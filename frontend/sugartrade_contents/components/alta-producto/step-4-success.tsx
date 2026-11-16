"use client"

import { useEffect, useState } from "react"
import { useAltaProductoStore } from "@/lib/store/alta-producto-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Download } from "lucide-react"
import QRCode from "react-qr-code"

import { useAuth } from "@/hooks/use-auth"

export function Step4Success() {
    const { details, deliveryMethod, reset } = useAltaProductoStore()
    const { user } = useAuth()
    const [qrValue, setQrValue] = useState("")
    const [displayId, setDisplayId] = useState("")

    const downloadQR = () => {
        const svg = document.getElementById("qr-code-svg")
        if (svg) {
            const svgData = new XMLSerializer().serializeToString(svg)
            const canvas = document.createElement("canvas")
            const ctx = canvas.getContext("2d")
            const img = new Image()
            img.onload = () => {
                // Add extra height for text
                const padding = 40
                canvas.width = img.width
                canvas.height = img.height + padding

                // Fill white background
                if (ctx) {
                    ctx.fillStyle = "white"
                    ctx.fillRect(0, 0, canvas.width, canvas.height)

                    // Draw QR
                    ctx.drawImage(img, 0, 0)

                    // Draw Text
                    ctx.font = "bold 16px Arial"
                    ctx.fillStyle = "black"
                    ctx.textAlign = "center"
                    ctx.fillText(displayId, canvas.width / 2, img.height + 25)
                }

                const pngFile = canvas.toDataURL("image/png")
                const downloadLink = document.createElement("a")
                downloadLink.download = `QR_${displayId}.png`
                downloadLink.href = pngFile
                downloadLink.click()
            }
            img.src = "data:image/svg+xml;base64," + btoa(svgData)
        }
    }

    useEffect(() => {
        if (details && deliveryMethod && !qrValue) {
            const createPreRegistro = async () => {
                const producerId = user?.sub || user?.email || "producer@test.com"

                const payload = {
                    type: "PRE_REGISTRO_PRODUCTO",
                    producerId: producerId,
                    productDetails: details,
                    deliveryMethod,
                    status: "PENDIENTE_VALIDACION_FISICA"
                }

                try {
                    // Call backend to save and get ID
                    // Using fetch directly for speed, ideal to use api-client
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/pre-registros`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(payload)
                    })

                    if (response.ok) {
                        const resData = await response.json()
                        setDisplayId(resData.id)
                        // QR now only contains the ID
                        setQrValue(resData.id)
                    } else {
                        console.error("Error saving pre-registry")
                        // Fallback to local generation if backend fails
                        const fallbackId = `PROD-${Math.floor(Math.random() * 10000)}`
                        setDisplayId(fallbackId)
                        setQrValue(fallbackId)
                    }
                } catch (error) {
                    console.error("Error connecting to backend", error)
                }
            }

            createPreRegistro()
        }
    }, [details, deliveryMethod, user, qrValue])

    if (!details) return null

    return (
        <Card className="w-full max-w-md mx-auto text-center">
            <CardHeader>
                <div className="flex justify-center mb-4">
                    <CheckCircle2 className="h-16 w-16 text-yellow-500" />
                </div>
                <CardTitle className="text-2xl text-yellow-600">¡Pre-carga Exitosa!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <p className="text-muted-foreground">
                    Has generado la solicitud de alta.
                </p>

                <div className="bg-muted/50 p-4 rounded-lg text-left text-sm space-y-2">
                    <p><strong>1.</strong> Dirígete a las oficinas de <strong>Agro-IA</strong>.</p>
                    <p><strong>2.</strong> Presenta tu <strong>Orden de Maquila</strong>.</p>
                    <p><strong>3.</strong> Muestra este <strong>QR</strong> o dicta el código.</p>
                </div>

                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border w-fit mx-auto">
                    {qrValue ? (
                        <>
                            <QRCode
                                id="qr-code-svg"
                                value={qrValue}
                                size={200}
                                level="L" // Lower error correction for less density
                            />
                            <p className="mt-2 text-lg font-bold tracking-wider text-black">
                                {displayId}
                            </p>
                        </>
                    ) : (
                        <div className="h-[200px] w-[200px] flex items-center justify-center text-muted-foreground">
                            Generando...
                        </div>
                    )}
                </div>

                <p className="text-xs text-muted-foreground">
                    Una vez validado, se generará un nuevo QR de trazabilidad y el producto aparecerá en tu inventario.
                </p>

                <div className="flex flex-col gap-3 pt-4">
                    <Button variant="outline" className="w-full" onClick={downloadQR}>
                        <Download className="mr-2 h-4 w-4" />
                        Descargar Comprobante
                    </Button>
                    <Button onClick={reset} className="w-full">
                        Volver al Portafolio
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
