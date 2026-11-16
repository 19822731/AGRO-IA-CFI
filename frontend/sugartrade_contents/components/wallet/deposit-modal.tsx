import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, CheckCircle, AlertCircle, ArrowRight } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"

interface DepositModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    cvu: string
}

export default function DepositModal({ isOpen, onClose, onSuccess, cvu }: DepositModalProps) {
    const [simulationAmount, setSimulationAmount] = useState("")
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)

    const copyToClipboard = () => {
        navigator.clipboard.writeText(cvu)
        setCopied(true)
        toast.success("CVU copiado al portapapeles")
        setTimeout(() => setCopied(false), 2000)
    }

    const handleSimulateDeposit = async () => {
        if (!simulationAmount || parseFloat(simulationAmount) <= 0) {
            toast.error("Ingrese un monto válido")
            return
        }

        setLoading(true)
        try {
            await apiClient.post("/api/webhooks/simulate-deposit", {
                cvu: cvu,
                amount: parseFloat(simulationAmount)
            })

            toast.success("¡Dinero acreditado exitosamente!", {
                description: "Ya puedes comenzar a operar en la plataforma.",
                duration: 5000,
                style: {
                    background: "#10B981", // Green-500
                    color: "white",
                    border: "none",
                    fontSize: "16px",
                    fontWeight: "bold"
                },
                icon: <CheckCircle className="h-6 w-6 text-white" />
            })
            onSuccess()
            onClose()
            setSimulationAmount("")
        } catch (error) {
            console.error(error)
            toast.error("Error al simular depósito")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#111936] text-white border-[#1a2040] sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Ingresar Dinero</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Transfiere a tu CVU único para acreditar fondos instantáneamente.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* CVU Display Section */}
                    <div className="space-y-2">
                        <Label className="text-gray-400">Tu CVU Virtual</Label>
                        <div className="flex items-center gap-2">
                            <div className="bg-[#1a2040] border border-[#2a3050] text-white font-mono text-lg p-3 rounded-md flex-1 text-center tracking-wider">
                                {cvu || "Generando..."}
                            </div>
                            <Button
                                size="icon"
                                variant="outline"
                                className="border-[#2a3050] bg-[#1a2040] hover:bg-[#2a3050] text-[#00a8ff]"
                                onClick={copyToClipboard}
                            >
                                {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                        <p className="text-xs text-gray-500">
                            Lemon • Cuenta Corriente en Pesos
                        </p>
                    </div>

                    <div className="border-t border-[#1a2040] my-4"></div>

                    {/* Simulation Section */}
                    <div className="bg-[#1a2040]/50 p-4 rounded-lg border border-[#00a8ff]/20 space-y-3">
                        <div className="flex items-center gap-2 text-[#00a8ff]">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Simulador de Transferencia</span>
                        </div>
                        <p className="text-xs text-gray-400">
                            Utiliza esta herramienta para simular una transferencia entrante desde tu banco.
                        </p>

                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                <Input
                                    type="number"
                                    placeholder="50000"
                                    className="pl-6 bg-[#0a0f29] border-[#2a3050] text-white"
                                    value={simulationAmount}
                                    onChange={(e) => setSimulationAmount(e.target.value)}
                                />
                            </div>
                            <Button
                                onClick={handleSimulateDeposit}
                                disabled={loading || !cvu}
                                className="bg-[#00a8ff] hover:bg-[#0090db] text-white"
                            >
                                {loading ? "Enviando..." : "Simular"}
                                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

