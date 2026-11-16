"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, CheckCircle, AlertCircle, DollarSign } from "lucide-react"
import { apiClient } from "@/lib/api-client"

export default function AdminDepositos() {
    const [depositId, setDepositId] = useState("")
    const [loading, setLoading] = useState(false)
    const [details, setDetails] = useState<any>(null)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const handleSearch = async () => {
        if (!depositId) return
        setLoading(true)
        setMessage(null)
        setDetails(null)
        try {
            const response = await apiClient.get(`/admin/depositos/${depositId}`)
            setDetails(response)
        } catch (error) {
            console.error("Error fetching deposit", error)
            setMessage({ type: 'error', text: "Depósito no encontrado." })
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async () => {
        if (!depositId) return

        setLoading(true)
        setMessage(null)

        try {
            await apiClient.post(`/admin/approve-deposit/${depositId}`, {})
            setMessage({ type: 'success', text: `Depósito #${depositId} aprobado correctamente.` })
            setDetails(null)
            setDepositId("")
        } catch (error) {
            console.error("Error approving deposit", error)
            setMessage({ type: 'error', text: "Error al aprobar el depósito." })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold text-white mb-6">Administración de Depósitos</h1>

            <Card className="bg-[#111936] border-[#1a2040] max-w-md mx-auto">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-500" />
                        Validar Depósito
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                        Ingrese el ID para verificar y aprobar.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="ID de Operación"
                                value={depositId}
                                onChange={(e) => setDepositId(e.target.value)}
                                className="pl-8 bg-[#0a0f29] border-[#1a2040] text-white"
                            />
                        </div>
                        <Button
                            onClick={handleSearch}
                            disabled={loading || !depositId}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {loading ? "..." : "Buscar"}
                        </Button>
                    </div>

                    {details && (
                        <div className="bg-[#0a0f29] p-4 rounded-lg border border-[#1a2040] space-y-3 text-sm">
                            <div className="grid grid-cols-2 gap-2 text-gray-300">
                                <span className="text-gray-500">Usuario:</span>
                                <span className="font-medium text-white truncate">{details.usuario_email}</span>

                                <span className="text-gray-500">Monto:</span>
                                <span className="font-bold text-green-400 text-lg">
                                    {details.moneda} {details.monto}
                                </span>

                                <span className="text-gray-500">Estado:</span>
                                <span className="capitalize text-white">{details.estado}</span>
                            </div>

                            {details.has_file && (
                                <a
                                    href={`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/admin/depositos/${details.id}/file`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full text-center py-2 bg-[#1a2040] hover:bg-[#252d4d] text-blue-400 rounded transition-colors"
                                >
                                    Ver Comprobante Adjunto
                                </a>
                            )}

                            <Button
                                onClick={handleApprove}
                                disabled={loading || details.estado === 'aprobado'}
                                className="w-full bg-green-600 hover:bg-green-700 mt-2"
                            >
                                {details.estado === 'aprobado' ? "Ya Aprobado" : "Aprobar Depósito"}
                            </Button>
                        </div>
                    )}

                    {message && (
                        <div className={`p-3 rounded-md flex items-center gap-2 text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                            }`}>
                            {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                            {message.text}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
