import { type NextRequest, NextResponse } from "next/server"

// Datos mock para desarrollo y testing
const mockPrices = [
  {
    id: 1,
    mercado: "Interno",
    fecha: "2025-01-20",
    precio: 24500,
    unidad: "ARS/bolsa 50kg",
    datos_json: JSON.stringify({ observacion: "Precio promedio en Tucumán" }),
  },
  {
    id: 2,
    mercado: "Interno",
    fecha: "2025-01-15",
    precio: 24200,
    unidad: "ARS/bolsa 50kg",
    datos_json: JSON.stringify({ observacion: "Precio promedio en Salta" }),
  },
  {
    id: 3,
    mercado: "Interno",
    fecha: "2025-01-10",
    precio: 23800,
    unidad: "ARS/bolsa 50kg",
    datos_json: JSON.stringify({ observacion: "Precio promedio nacional" }),
  },
]

// Validación de datos de entrada
function validarDatosDeEntrada(datos: any) {
  if (!datos.fecha || !datos.precio || !datos.unidad) {
    return { valido: false, mensaje: "Los campos fecha, precio y unidad son obligatorios" }
  }

  if (isNaN(Number(datos.precio))) {
    return { valido: false, mensaje: "El precio debe ser un número válido" }
  }

  return { valido: true }
}

// Manejador para POST (insertar nuevo precio)
export async function POST(request: NextRequest) {
  try {
    const datos = await request.json()

    // Validar datos
    const validacion = validarDatosDeEntrada(datos)
    if (!validacion.valido) {
      return NextResponse.json({ error: validacion.mensaje }, { status: 400 })
    }

    const { fecha, precio, unidad, otros_datos } = datos
    const mercado = datos.mercado || "Interno"

    return NextResponse.json({
      mensaje: "Precio del azúcar guardado exitosamente",
      datos: { mercado, fecha, precio, unidad },
    })
  } catch (error) {
    console.error("Error al guardar el precio del azúcar:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}

// Manejador para GET (obtener precios)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const mercado = searchParams.get("mercado") || "Interno"
    const limite = Number.parseInt(searchParams.get("limite") || "30")

    const precios = mockPrices.filter((precio) => precio.mercado === mercado).slice(0, limite)

    return NextResponse.json({ precios })
  } catch (error) {
    console.error("Error al obtener precios del azúcar:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
