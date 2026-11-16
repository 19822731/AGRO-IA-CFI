export type EstadoMercancia = "ingresada" | "en-proceso" | "retirada" | "en-inspección"

export interface Mercancia {
  id: string
  descripcion: string
  cantidad: number
  unidad: string
  peso: number
  volumen: number
  valor: number
  fechaIngreso: Date
  fechaEstimadaSalida: Date | null
  fechaSalida: Date | null
  estado: EstadoMercancia
  cliente: string
  numeroWarrant: string | null
  ubicacion: string
}

export interface Warrant {
  id: string
  numero: string
  fechaEmision: Date
  fechaVencimiento: Date
  estado: "vigente" | "vencido" | "ejecutado" | "cancelado"
  mercanciaId: string
  valorGarantia: number
  beneficiario: string
}

export interface Certificado {
  id: string
  numero: string
  fechaEmision: Date
  mercanciaId: string
  descripcion: string
  valor: number
}

export interface Almacenaje {
  mercancias: Mercancia[]
  warrants: Warrant[]
  certificados: Certificado[]
}

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
