export interface EstadisticasAlmacenaje {
  totalMercancias: number
  pesoTotal: number
  valorTotal: number
  mercanciasPorEstado: Record<EstadoMercancia, number>
  warrantsVigentes: number
  warrantsPorEstado: Record<string, number>
  certificadosEmitidos: number
  tendenciaMensual: {
    mes: string
    ingresos: number
    salidas: number
  }[]
}

export type EstadoMercancia = "ingresada" | "en-proceso" | "retirada" | "en-inspección"
