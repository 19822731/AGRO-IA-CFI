import { aseguradoras } from "../data/aseguradoras"
import type { Cotizacion, DatosFinca, DatosProductor, Cobertura } from "../types/seguro"

// Simula una llamada a la API para obtener cotizaciones
export async function obtenerCotizaciones(
  datosProductor: DatosProductor,
  datosFinca: DatosFinca,
  coberturas: Cobertura[],
): Promise<Cotizacion[]> {
  // Simulamos un retraso para imitar una llamada a API real
  await new Promise((resolve) => setTimeout(resolve, 1500))

  const coberturasSeleccionadas = coberturas.filter((c) => c.seleccionada)

  if (coberturasSeleccionadas.length === 0) {
    return []
  }

  // Calculamos un valor base para la suma asegurada basado en los datos de la finca
  const valorBase = datosFinca.superficie * datosFinca.rendimientoPromedio * 50 // 50 es un valor arbitrario por tonelada

  return aseguradoras
    .map((aseguradora) => {
      // Filtramos las coberturas disponibles para esta aseguradora
      const coberturasDisponibles = coberturasSeleccionadas
        .filter((c) => aseguradora.coberturas[c.id]?.disponible)
        .map((c) => ({
          id: c.id,
          nombre: c.nombre,
          prima: aseguradora.coberturas[c.id].prima,
        }))

      // Calculamos la prima total
      const primaTotal = coberturasDisponibles.reduce((total, c) => total + (c.prima * valorBase) / 100, 0)

      // Generamos algunos beneficios aleatorios
      const beneficiosAdicionales = [
        "Asesoramiento técnico gratuito",
        "Descuento por buen historial",
        "Inspección sin costo",
        "Pago en cuotas sin interés",
      ].filter(() => Math.random() > 0.5)

      return {
        aseguradoraId: aseguradora.id,
        aseguradoraNombre: aseguradora.nombre,
        aseguradoraLogo: aseguradora.logo,
        primaTotal,
        coberturas: coberturasDisponibles,
        deducible: Math.round(primaTotal * 0.1 * 100) / 100, // 10% de la prima total
        sumaAsegurada: valorBase,
        plazo: "Anual",
        beneficiosAdicionales,
      }
    })
    .sort((a, b) => a.primaTotal - b.primaTotal) // Ordenamos por prima más baja
}

// Simula el envío de una solicitud de seguro
export async function enviarSolicitud(
  datosProductor: DatosProductor,
  datosFinca: DatosFinca,
  cotizacionId: string,
): Promise<{ exito: boolean; mensaje: string; numeroSolicitud?: string }> {
  // Simulamos un retraso para imitar una llamada a API real
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Simulamos un 90% de éxito
  if (Math.random() < 0.9) {
    return {
      exito: true,
      mensaje: "Su solicitud ha sido enviada con éxito.",
      numeroSolicitud: `SOL-${Math.floor(Math.random() * 1000000)}`,
    }
  } else {
    return {
      exito: false,
      mensaje: "Ha ocurrido un error al procesar su solicitud. Por favor, inténtelo nuevamente.",
    }
  }
}
