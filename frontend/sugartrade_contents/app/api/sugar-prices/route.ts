import { NextResponse } from "next/server"

// Logging function
function logRequest(req, res, startTime, error = null) {
  const duration = Date.now() - startTime
  const log = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    status: res.status,
    duration: `${duration}ms`,
    error: error ? error.message : null,
  }
  console.log(JSON.stringify(log))
}

export async function GET() {
  const startTime = Date.now()
  let res
  try {
    const precios = await obtenerPreciosSimulados()
    res = NextResponse.json(precios)
    logRequest({ method: "GET", url: "/api/sugar-prices" }, { status: 200 }, startTime)
    return res
  } catch (error) {
    console.error("Error al obtener los precios del azúcar:", error)

    // Crear un mensaje de error más informativo
    const errorMessage = error instanceof Error ? error.message : "Error desconocido al obtener los precios del azúcar."

    // Devolver una respuesta de error con más información
    res = NextResponse.json(
      {
        error: errorMessage,
        timestamp: new Date().toISOString(),
        path: "/api/sugar-prices",
      },
      { status: 500 },
    )
    logRequest({ method: "GET", url: "/api/sugar-prices" }, { status: 500 }, startTime, error)
    return res
  }
}

async function obtenerPreciosSimulados() {
  // Simulación de datos usando precios de 2025
  const fechaActual = new Date()

  try {
    // Obtener el precio más reciente de 2025 para el mercado interno
    const precioMercadoInterno = obtenerPrecioMercadoInterno2025()

    // Precios de contratos internacionales
    const precioContrato5 = generarPrecioSimulado(18, 20)
    const precioContrato11 = generarPrecioSimulado(15, 17)

    // Precios históricos (últimos 30 días) - Usamos datos de 2025
    const historicos = generarDatosHistoricos(30)

    // Precios históricos del mercado interno (últimos 30 días) - Usamos datos de 2025
    const historicosMercadoInterno = obtenerHistoricosMercadoInterno2025(30)

    // Precios futuros (próximos 3 meses)
    const futuros = [
      {
        mes: "Marzo",
        precio: generarPrecioSimulado(18.5, 20.5),
        cambio: generarCambioSimulado(),
      },
      {
        mes: "Mayo",
        precio: generarPrecioSimulado(19, 21),
        cambio: generarCambioSimulado(),
      },
      {
        mes: "Julio",
        precio: generarPrecioSimulado(19.5, 21.5),
        cambio: generarCambioSimulado(),
      },
    ]

    // Calcular el cambio porcentual basado en los datos históricos de 2025
    const cambioMercadoInterno = calcularCambioPorcentual2025()

    return {
      actualizado: fechaActual.toISOString(),
      currentPrice: {
        value: precioMercadoInterno,
        change: cambioMercadoInterno,
        timestamp: fechaActual.toISOString(),
        currency: "ARS",
        unit: "bolsa 50kg",
      },
      mercadoInterno: {
        precio: precioMercadoInterno,
        cambio: cambioMercadoInterno,
        unidad: "ARS/bolsa 50kg",
      },
      contrato5: {
        precio: precioContrato5,
        cambio: generarCambioSimulado(),
        unidad: "centavos/libra",
      },
      contrato11: {
        precio: precioContrato11,
        cambio: generarCambioSimulado(),
        unidad: "centavos/libra",
      },
      historicos,
      historicosMercadoInterno,
      futuros,
    }
  } catch (error) {
    console.error("Error en obtenerPreciosSimulados:", error)
    throw error instanceof Error ? error : new Error("Error al generar datos de precios simulados")
  }
}

// Función para obtener el precio más reciente de 2025
function obtenerPrecioMercadoInterno2025() {
  try {
    // Datos de precios de 2025 (de marzo, los más recientes)
    const precios2025 = [
      { date: new Date(2025, 2, 13), price: 23730.0 },
      { date: new Date(2025, 2, 12), price: 23730.0 },
      { date: new Date(2025, 2, 11), price: 23725.0 },
      { date: new Date(2025, 2, 10), price: 23720.0 },
      { date: new Date(2025, 2, 9), price: 23715.0 },
      { date: new Date(2025, 2, 8), price: 23710.0 },
      { date: new Date(2025, 2, 3), price: 23725.0 },
      { date: new Date(2025, 2, 2), price: 23474.0 },
      { date: new Date(2025, 2, 1), price: 23265.0 },
      // Febrero 2025
      { date: new Date(2025, 1, 28), price: 23755.0 },
      { date: new Date(2025, 1, 27), price: 23765.0 },
      { date: new Date(2025, 1, 26), price: 23775.0 },
      { date: new Date(2025, 1, 25), price: 23790.0 },
      { date: new Date(2025, 1, 24), price: 23795.0 },
      { date: new Date(2025, 1, 23), price: 23800.0 },
      { date: new Date(2025, 1, 22), price: 23805.0 },
      { date: new Date(2025, 1, 21), price: 23810.0 },
      { date: new Date(2025, 1, 20), price: 23815.0 },
      { date: new Date(2025, 1, 19), price: 23820.0 },
      { date: new Date(2025, 1, 18), price: 23825.0 },
      { date: new Date(2025, 1, 17), price: 23830.0 },
      { date: new Date(2025, 1, 16), price: 23835.0 },
      { date: new Date(2025, 1, 15), price: 23840.0 },
      { date: new Date(2025, 1, 14), price: 23845.0 },
      { date: new Date(2025, 1, 13), price: 23850.0 },
      { date: new Date(2025, 1, 12), price: 23840.0 },
      { date: new Date(2025, 1, 11), price: 23765.0 },
      { date: new Date(2025, 1, 10), price: 23690.0 },
      { date: new Date(2025, 1, 9), price: 23615.0 },
      { date: new Date(2025, 1, 8), price: 23540.0 },
      { date: new Date(2025, 1, 3), price: 23735.0 },
      { date: new Date(2025, 1, 2), price: 23476.0 },
      { date: new Date(2025, 1, 1), price: 23275.0 },
      // Enero 2025
      { date: new Date(2025, 0, 31), price: 23480.0 },
      { date: new Date(2025, 0, 30), price: 23475.0 },
      { date: new Date(2025, 0, 29), price: 23465.0 },
      { date: new Date(2025, 0, 28), price: 23455.0 },
      { date: new Date(2025, 0, 27), price: 23445.0 },
      { date: new Date(2025, 0, 26), price: 23435.0 },
      { date: new Date(2025, 0, 25), price: 23425.0 },
      { date: new Date(2025, 0, 24), price: 23415.0 },
      { date: new Date(2025, 0, 23), price: 23405.0 },
      { date: new Date(2025, 0, 22), price: 23395.0 },
      { date: new Date(2025, 0, 21), price: 23384.0 },
      { date: new Date(2025, 0, 20), price: 23371.0 },
      { date: new Date(2025, 0, 19), price: 23358.0 },
      { date: new Date(2025, 0, 18), price: 23345.0 },
      { date: new Date(2025, 0, 17), price: 23332.0 },
      { date: new Date(2025, 0, 16), price: 23319.0 },
      { date: new Date(2025, 0, 15), price: 23306.0 },
      { date: new Date(2025, 0, 14), price: 23293.0 },
      { date: new Date(2025, 0, 13), price: 23280.0 },
      { date: new Date(2025, 0, 12), price: 23267.0 },
      { date: new Date(2025, 0, 11), price: 23254.0 },
      { date: new Date(2025, 0, 10), price: 23241.0 },
      { date: new Date(2025, 0, 9), price: 23228.0 },
      { date: new Date(2025, 0, 8), price: 23215.0 },
      { date: new Date(2025, 0, 7), price: 23225.0 },
      { date: new Date(2025, 0, 6), price: 23235.0 },
      { date: new Date(2025, 0, 5), price: 23245.0 },
      { date: new Date(2025, 0, 4), price: 23255.0 },
      { date: new Date(2025, 0, 3), price: 23745.0 },
      { date: new Date(2025, 0, 2), price: 23478.0 },
      { date: new Date(2025, 0, 1), price: 23285.0 },
    ]

    // Ordenar por fecha descendente y tomar el primer precio (el más reciente)
    const preciosMasRecientes = [...precios2025].sort((a, b) => b.date.getTime() - a.date.getTime())

    if (preciosMasRecientes.length === 0) {
      throw new Error("No hay datos de precios disponibles")
    }

    return preciosMasRecientes[0].price
  } catch (error) {
    console.error("Error en obtenerPrecioMercadoInterno2025:", error)
    // Devolver un valor predeterminado en caso de error
    return 23730.0
  }
}

// Función para generar un precio simulado aleatorio dentro de un rango
function generarPrecioSimulado(min: number, max: number) {
  try {
    return Number.parseFloat((Math.random() * (max - min) + min).toFixed(2))
  } catch (error) {
    console.error("Error en generarPrecioSimulado:", error)
    // Devolver un valor predeterminado en caso de error
    return min
  }
}

// Función para generar un cambio porcentual simulado
function generarCambioSimulado() {
  try {
    return Number.parseFloat((Math.random() * 4 - 2).toFixed(2)) // Entre -2% y +2%
  } catch (error) {
    console.error("Error en generarCambioSimulado:", error)
    // Devolver un valor predeterminado en caso de error
    return 0.01
  }
}

// Función para obtener datos históricos simulados
function generarDatosHistoricos(dias: number) {
  try {
    const datos = []
    const fechaBase = new Date()
    let precioBase = 19 // Precio base inicial

    for (let i = dias - 1; i >= 0; i--) {
      const fecha = new Date(fechaBase)
      fecha.setDate(fecha.getDate() - i)

      // Añadir una variación aleatoria al precio base para simular fluctuaciones
      const variacion = Math.random() * 0.6 - 0.3 // Variación entre -0.3 y +0.3
      precioBase += variacion

      // Asegurar que el precio se mantiene en un rango razonable
      if (precioBase < 17) precioBase = 17
      if (precioBase > 22) precioBase = 22

      datos.push({
        fecha: fecha.toISOString().split("T")[0], // Formato YYYY-MM-DD
        precio: Number.parseFloat(precioBase.toFixed(2)),
      })
    }

    return datos
  } catch (error) {
    console.error("Error en generarDatosHistoricos:", error)
    // Devolver un array vacío en caso de error
    return []
  }
}

// Función para obtener datos históricos del mercado interno simulados
function obtenerHistoricosMercadoInterno2025(dias: number) {
  try {
    const datos = []
    const fechaBase = new Date()
    let precioBase = 23500 // Precio base inicial

    for (let i = dias - 1; i >= 0; i--) {
      const fecha = new Date(fechaBase)
      fecha.setDate(fecha.getDate() - i)

      // Añadir una variación aleatoria al precio base para simular fluctuaciones
      const variacion = Math.random() * 300 - 150 // Variación entre -150 y +150
      precioBase += variacion

      // Asegurar que el precio se mantiene en un rango razonable
      if (precioBase < 23000) precioBase = 23000
      if (precioBase > 24000) precioBase = 24000

      datos.push({
        fecha: fecha.toISOString().split("T")[0], // Formato YYYY-MM-DD
        precio: Number.parseFloat(precioBase.toFixed(2)),
      })
    }

    return datos
  } catch (error) {
    console.error("Error en obtenerHistoricosMercadoInterno2025:", error)
    // Devolver un array vacío en caso de error
    return []
  }
}

// Función para calcular el cambio porcentual basado en los datos históricos de 2025
function calcularCambioPorcentual2025() {
  try {
    // Obtener los datos históricos del mercado interno de 2025
    const historicos = obtenerHistoricosMercadoInterno2025(30)

    // Verificar si hay suficientes datos históricos
    if (historicos.length < 2) {
      return 0 // No se puede calcular el cambio porcentual
    }

    // Obtener el precio actual y el precio de hace 30 días
    const precioActual = historicos[historicos.length - 1].precio
    const precioAnterior = historicos[0].precio

    // Calcular el cambio porcentual
    const cambio = ((precioActual - precioAnterior) / precioAnterior) * 100

    return Number.parseFloat(cambio.toFixed(2))
  } catch (error) {
    console.error("Error en calcularCambioPorcentual2025:", error)
    return 0 // Devolver 0 en caso de error
  }
}
