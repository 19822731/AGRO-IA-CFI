"use client"

import { useState } from "react"
import { Scanner } from "@yudiel/react-qr-scanner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface QRScannerProps {
    onScan: (data: string) => void
}

export function QRScanner({ onScan }: QRScannerProps) {
    const [manualInput, setManualInput] = useState("")

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (manualInput) {
            onScan(manualInput)
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Escanear Código QR</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Scanner Section */}
                <div className="aspect-square bg-black rounded-lg overflow-hidden relative">
                    <Scanner
                        onScan={(result) => {
                            if (result && result.length > 0) {
                                onScan(result[0].rawValue)
                            }
                        }}
                        onError={(error) => console.error(error)}
                        components={{
                            onOff: true,
                            torch: true,
                            zoom: true,
                            finder: true,
                        }}
                        formats={['qr_code']}
                        scanDelay={500}
                        styles={{
                            container: { width: "100%", height: "100%" }
                        }}
                    />
                </div>

                {/* Manual Input Section */}
                <div className="space-y-4 pt-4 border-t">
                    <div className="text-center text-sm text-muted-foreground">
                        ¿Problemas con la cámara? Ingresa el código manual:
                    </div>
                    <form onSubmit={handleManualSubmit} className="flex gap-2">
                        <Input
                            value={manualInput}
                            onChange={(e) => setManualInput(e.target.value)}
                            placeholder="Ej: PROD-1234"
                            className="flex-1"
                        />
                        <Button type="submit">
                            Validar
                        </Button>
                    </form>
                </div>
            </CardContent>
        </Card>
    )
}
