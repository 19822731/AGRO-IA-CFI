"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"

interface CalificacionComentariosProps {
  fleteId: string
  calificacionActual: number | null
  comentarioActual: string | null
}

export default function CalificacionComentarios({
  fleteId,
  calificacionActual,
  comentarioActual,
}: CalificacionComentariosProps) {
  const [calificacion, setCalificacion] = useState<number>(calificacionActual || 0)
  const [comentario, setComentario] = useState<string>(comentarioActual || "")
  const [enviando, setEnviando] = useState<boolean>(false)
  const [enviado, setEnviado] = useState<boolean>(!!calificacionActual)

  const handleCalificar = (valor: number) => {
    setCalificacion(valor)
  }

  const handleEnviar = () => {
    setEnviando(true)

    // Simulación de envío a API
    setTimeout(() => {
      console.log("Calificación enviada:", {
        fleteId,
        calificacion,
        comentario,
      })
      setEnviando(false)
      setEnviado(true)
    }, 1000)
  }

  return (
    <div className="space-y-4">
      {enviado ? (
        <div className="text-center py-2">
          <div className="flex justify-center mb-2">
            {[1, 2, 3, 4, 5].map((valor) => (
              <Star
                key={valor}
                className={`h-6 w-6 ${
                  valor <= calificacion ? "text-amber-500 fill-amber-500" : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground mb-2">{comentario || "Sin comentarios adicionales."}</p>
          <Button variant="outline" size="sm" onClick={() => setEnviado(false)}>
            Editar calificación
          </Button>
        </div>
      ) : (
        <>
          <div>
            <p className="text-sm font-medium mb-2">¿Cómo calificaría el servicio?</p>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((valor) => (
                <button key={valor} type="button" onClick={() => handleCalificar(valor)} className="p-1">
                  <Star
                    className={`h-6 w-6 ${
                      valor <= calificacion ? "text-amber-500 fill-amber-500" : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Comentarios adicionales (opcional)</p>
            <Textarea
              placeholder="Comparta su experiencia con este servicio de flete..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={3}
            />
          </div>

          <Button onClick={handleEnviar} disabled={calificacion === 0 || enviando} className="w-full">
            {enviando ? "Enviando..." : "Enviar calificación"}
          </Button>
        </>
      )}
    </div>
  )
}
