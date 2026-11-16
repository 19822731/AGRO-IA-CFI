"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { QrCode, Search } from "lucide-react"
import { useAlmacenaje } from "../hooks/use-almacenaje"

export function EscanerQR() {
  const { verificarCodigoQR } = useAlmacenaje()
  const [codigoQR, setCodigoQR] = useState("")
  const [cargando, setCargando] = useState(false)

  const handleVerificar = async () => {
    if (!codigoQR) return

    setCargando(true)
    await verificarCodigoQR(codigoQR)
    setCargando(false)
    setCodigoQR("")
  }

  return (
    <Card className="bg-[#111936] border-[#1a2040]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-white">Verificación de Códigos QR</CardTitle>
        <CardDescription className="text-gray-400">
          Escanee o ingrese manualmente un código QR para verificar un certificado
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-4 bg-[#0a0f29] rounded-md border border-[#1a2040]">
          <div className="flex items-center space-x-2 mb-2">
            <QrCode className="h-5 w-5 text-[#00a8ff]" />
            <h3 className="text-sm font-medium text-white">Buscar por Código QR</h3>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-gray-400">
              Ingrese el código QR del certificado para verificar su autenticidad y consultar su información.
            </p>

            <div className="relative">
              <Input
                placeholder="Ingrese el código QR..."
                value={codigoQR}
                onChange={(e) => setCodigoQR(e.target.value)}
                className="bg-[#0a0f29] border-[#1a2040] text-white pr-10"
              />
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
            </div>

            <div className="text-xs text-gray-400 text-center">
              <p>Para probar, puede usar los siguientes códigos:</p>
              <p className="mt-1 font-mono">QR-CD-24-0001, QR-CD-24-0002, QR-CD-24-0003</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center border-t border-[#1a2040] pt-4">
        <Button
          className="bg-[#00a8ff] hover:bg-[#00a8ff]/90 text-white"
          onClick={handleVerificar}
          disabled={!codigoQR || cargando}
        >
          {cargando ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Verificando...
            </>
          ) : (
            <>
              <QrCode className="h-4 w-4 mr-2" />
              Verificar Certificado
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
