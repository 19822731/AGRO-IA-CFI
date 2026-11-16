import {
  warrants as mockWarrants,
  certificados as mockCertificados,
  depositos as mockDepositos,
  ingenios as mockIngenios,
} from "../data/mock-data"
import type {
  Warrant,
  CertificadoDeposito,
  Deposito,
  Ingenio,
  CertificadoEstado,
  FiltrosAlmacenaje,
  HistorialCertificado,
} from "../types"

class AlmacenajeService {
  private warrants: Warrant[] = [...mockWarrants]
  private certificados: CertificadoDeposito[] = [...mockCertificados]
  private depositos: Deposito[] = [...mockDepositos]
  private ingenios: Ingenio[] = [...mockIngenios]

  // Método para obtener todos los warrants (con posibilidad de filtrar)
  getWarrants(): Warrant[] {
    return this.warrants
  }

  // Método para obtener un warrant por su ID
  getWarrantById(id: string): Warrant | undefined {
    return this.warrants.find((w) => w.id === id)
  }

  // Método para obtener los certificados asociados a un warrant
  getCertificadosByWarrantId(warrantId: string): CertificadoDeposito[] {
    return this.certificados.filter((c) => c.warrantId === warrantId)
  }

  // Método para obtener todos los certificados (con posibilidad de filtrar)
  getCertificados(filtros?: FiltrosAlmacenaje): CertificadoDeposito[] {
    if (!filtros) return this.certificados

    return this.certificados.filter((c) => {
      // Aplicar cada filtro si está definido
      if (filtros.numero && !c.numero.includes(filtros.numero)) return false
      if (filtros.deposito && c.deposito !== filtros.deposito) return false
      if (filtros.ingenio && c.ingenio !== filtros.ingenio) return false
      if (filtros.estado && c.estado !== filtros.estado) return false
      if (filtros.tipo && c.tipo !== filtros.tipo) return false

      // Filtrar por fecha si se especifica
      if (filtros.fechaDesde || filtros.fechaHasta) {
        const fechaMod = new Date(c.fechaModificacion)
        if (filtros.fechaDesde && new Date(filtros.fechaDesde) > fechaMod) return false
        if (filtros.fechaHasta && new Date(filtros.fechaHasta) < fechaMod) return false
      }

      return true
    })
  }

  // Método para obtener un certificado por su ID
  getCertificadoById(id: string): CertificadoDeposito | undefined {
    return this.certificados.find((c) => c.id === id)
  }

  // Método para cambiar el estado de un certificado
  cambiarEstadoCertificado(
    certificadoId: string,
    nuevoEstado: CertificadoEstado,
    usuario: string,
    accion: string,
    notas?: string,
  ): CertificadoDeposito | undefined {
    const index = this.certificados.findIndex((c) => c.id === certificadoId)
    if (index === -1) return undefined

    const certificado = this.certificados[index]
    const estadoAnterior = certificado.estado

    // Crear nuevo registro de historial
    const nuevoHistorial: HistorialCertificado = {
      id: `hist-${certificadoId}-${certificado.historial.length + 1}`,
      fecha: new Date().toISOString(),
      estadoAnterior,
      estadoNuevo: nuevoEstado,
      accion,
      usuario,
      notas,
    }

    // Actualizar el certificado
    const certificadoActualizado: CertificadoDeposito = {
      ...certificado,
      estado: nuevoEstado,
      fechaModificacion: new Date().toISOString(),
      historial: [...certificado.historial, nuevoHistorial],
    }

    this.certificados[index] = certificadoActualizado
    return certificadoActualizado
  }

  // Método para obtener todos los depósitos
  getDepositos(): Deposito[] {
    return this.depositos
  }

  // Método para obtener un depósito por su ID
  getDepositoById(id: string): Deposito | undefined {
    return this.depositos.find((d) => d.id === id)
  }

  // Método para obtener todos los ingenios
  getIngenios(): Ingenio[] {
    return this.ingenios
  }

  // Método para obtener un ingenio por su ID
  getIngenioById(id: string): Ingenio | undefined {
    return this.ingenios.find((i) => i.id === id)
  }

  // Método para obtener estadísticas de almacenaje
  getEstadisticas() {
    const totalWarrants = this.warrants.length
    const warrantsActivos = this.warrants.filter((w) => w.estado === "activo").length
    const warrantsVencidos = this.warrants.filter((w) => w.estado === "vencido").length

    const totalCertificados = this.certificados.length
    const certificadosDisponibles = this.certificados.filter((c) => c.estado === "disponible").length
    const certificadosReservados = this.certificados.filter((c) => c.estado === "reservado").length
    const certificadosDisponiblesCarga = this.certificados.filter((c) => c.estado === "disponible-carga").length
    const certificadosOperacionCargada = this.certificados.filter((c) => c.estado === "operacion-cargada").length

    const certificadosNormales = this.certificados.filter((c) => c.tipo === "normal").length
    const certificadosCanje = this.certificados.filter((c) => c.tipo === "canje").length

    const totalBolsas = this.certificados.reduce((total, cert) => total + cert.bolsas, 0)

    return {
      warrants: {
        total: totalWarrants,
        activos: warrantsActivos,
        vencidos: warrantsVencidos,
      },
      certificados: {
        total: totalCertificados,
        porEstado: {
          disponibles: certificadosDisponibles,
          reservados: certificadosReservados,
          disponiblesCarga: certificadosDisponiblesCarga,
          operacionCargada: certificadosOperacionCargada,
        },
        porTipo: {
          normales: certificadosNormales,
          canje: certificadosCanje,
        },
      },
      bolsas: {
        total: totalBolsas,
      },
    }
  }

  // ====== Métodos para preparar la integración con la futura API ======

  // Método para reservar un certificado
  reservarCertificado(
    certificadoId: string,
    usuario: string,
    notas?: string,
  ): Promise<CertificadoDeposito | undefined> {
    // En el futuro, este método enviará una solicitud a la API
    return new Promise((resolve) => {
      setTimeout(() => {
        const certificadoActualizado = this.cambiarEstadoCertificado(
          certificadoId,
          "reservado",
          usuario,
          "Certificado reservado",
          notas,
        )
        resolve(certificadoActualizado)
      }, 1000) // Simular latencia de red
    })
  }

  // Método para marcar un certificado como disponible para carga
  marcarDisponibleCarga(
    certificadoId: string,
    usuario: string,
    notas?: string,
  ): Promise<CertificadoDeposito | undefined> {
    // En el futuro, este método enviará una solicitud a la API
    return new Promise((resolve) => {
      setTimeout(() => {
        const certificadoActualizado = this.cambiarEstadoCertificado(
          certificadoId,
          "disponible-carga",
          usuario,
          "Marcado como disponible para carga",
          notas,
        )
        resolve(certificadoActualizado)
      }, 1000) // Simular latencia de red
    })
  }

  // Método para marcar un certificado como operación cargada
  marcarOperacionCargada(
    certificadoId: string,
    usuario: string,
    notas?: string,
  ): Promise<CertificadoDeposito | undefined> {
    // En el futuro, este método enviará una solicitud a la API
    return new Promise((resolve) => {
      setTimeout(() => {
        const certificadoActualizado = this.cambiarEstadoCertificado(
          certificadoId,
          "operacion-cargada",
          usuario,
          "Operación cargada completada",
          notas,
        )
        resolve(certificadoActualizado)
      }, 1000) // Simular latencia de red
    })
  }

  // Método para liberar un certificado (volver a disponible)
  liberarCertificado(certificadoId: string, usuario: string, notas?: string): Promise<CertificadoDeposito | undefined> {
    // En el futuro, este método enviará una solicitud a la API
    return new Promise((resolve) => {
      setTimeout(() => {
        const certificadoActualizado = this.cambiarEstadoCertificado(
          certificadoId,
          "disponible",
          usuario,
          "Certificado liberado",
          notas,
        )
        resolve(certificadoActualizado)
      }, 1000) // Simular latencia de red
    })
  }

  // Método para verificar un código QR
  verificarCodigoQR(codigoQR: string): Promise<CertificadoDeposito | undefined> {
    // En el futuro, este método enviará una solicitud a la API
    return new Promise((resolve) => {
      setTimeout(() => {
        const certificado = this.certificados.find((c) => c.codigoQR === codigoQR)
        resolve(certificado)
      }, 1000) // Simular latencia de red
    })
  }
}

// Exportar una instancia única del servicio
export const almacenajeService = new AlmacenajeService()
