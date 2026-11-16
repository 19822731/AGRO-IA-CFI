export interface EstadisticasAlmacenaje {
  warrants: {
    total: number
    activos: number
    vencidos: number
  }
  certificados: {
    total: number
    porEstado: {
      disponibles: number
      reservados: number
      disponiblesCarga: number
      operacionCargada: number
    }
    porTipo: {
      normales: number
      canje: number
    }
  }
  bolsas: {
    total: number
  }
}
