import { NextResponse } from "next/server"

// Importar los datos históricos de Argentina
import { argentinaMarketData } from "@/data/argentina-market-data"

// Tipos para los datos analizados
interface PuntoPrediccion {
  fecha: string
  precio: number
  prediccion: number
  intervalo: [number, number]
  confianza: number
}

interface PatronCajaPunta {
  tipo: "alcista" | "bajista" | "continuacion" | "reversa"
  inicio: string
  fin: string
  puntos: number[]
  confiabilidad: number
  expectativa: string
  objetivoPrecio: number
}

interface TendenciaIdentificada {
  tipo: "primaria" | "secundaria" | "terciaria"
  direccion: "alcista" | "bajista" | "lateral"
  fortaleza: number // 0-100
  inicio: string
  fin: string | null
  angulo: number // en grados
  soportes: number[]
  resistencias: number[]
}

interface IndicadorTecnico {
  nombre: string
  valor: number
  interpretacion: string
  señal: "compra" | "venta" | "neutral"
  fuerza: number // 0-100
}

interface FactorFundamental {
  nombre: string
  valor: number
  impacto: number // -100 a 100
  descripcion: string
}

interface Recomendacion {
  accion: "comprar" | "vender" | "mantener"
  horizonte: "corto" | "medio" | "largo"
  confianza: number // 0-100
  objetivoPrecio: number
  stopLoss: number
  razonamiento: string[]
  riesgos: string[]
}

// Agregar nuevas interfaces para los nuevos tipos de análisis después de las interfaces existentes

interface EstadisticaHistorica {
  periodo: string
  media: number
  mediana: number
  desviacionEstandar: number
  varianza: number
  maximo: number
  minimo: number
  rango: number
  skewness: number
  kurtosis: number
  percentil25: number
  percentil75: number
}

interface AnalisisEstacional {
  periodo: string
  tendenciaEstacional: number
  confianza: number
  descripcion: string
}

interface PatronEmergente {
  nombre: string
  descripcion: string
  fechaDeteccion: string
  confianza: number
  impactoEstimado: number // -100 a 100
  duracionEstimada: string
  frecuenciaHistorica: number
  ultimaOcurrencia: string | null
}

interface Anomalia {
  tipo: "precio" | "volumen" | "volatilidad" | "correlacion" | "liquidez"
  fechaInicio: string
  fechaFin: string | null
  descripcion: string
  magnitud: number // 0-100
  causaProbable: string[]
  impactoMercado: number // -100 a 100
  duracionEstimada: string | null
  estado: "activa" | "finalizada" | "en desarrollo"
}

interface PatronCajaPuntaDetallado extends PatronCajaPunta {
  subPatrones: {
    nombre: string
    posicion: "inicio" | "medio" | "fin"
    significado: string
  }[]
  volumenConfirmacion: boolean
  divergencias: {
    tipo: string
    descripcion: string
    significado: string
  }[]
  nivelFibonacci: number[]
  zonasSoporte: number[]
  zonasResistencia: number[]
  probabilidadExito: number
}

interface AnalisisHistorico {
  periodos: {
    diario: EstadisticaHistorica
    semanal: EstadisticaHistorica
    mensual: EstadisticaHistorica
    trimestral: EstadisticaHistorica
    anual: EstadisticaHistorica
  }
  estacionalidad: AnalisisEstacional[]
  ciclicidad: {
    ciclosIdentificados: {
      duracion: string
      descripcion: string
      confianza: number
    }[]
    faseCicloActual: string
    proximaFase: string
    tiempoEstimadoProximaFase: string
  }
  correlaciones: {
    mercados: {
      mercado: string
      correlacion: number // -1 a 1
      descripcion: string
    }[]
    commodities: {
      commodity: string
      correlacion: number // -1 a 1
      descripcion: string
    }[]
    factoresEconomicos: {
      factor: string
      correlacion: number // -1 a 1
      descripcion: string
    }[]
  }
}

// Modificar la interfaz ModeloAnalisis para incluir los nuevos campos
interface ModeloAnalisis {
  fechaAnalisis: string
  mercado: string
  precioActual: number
  predicciones: PuntoPrediccion[]
  patronesCajaPunta: PatronCajaPunta[]
  tendencias: TendenciaIdentificada[]
  indicadoresTecnicos: IndicadorTecnico[]
  factoresFundamentales: FactorFundamental[]
  recomendaciones: {
    cortoPlazo: Recomendacion
    medioPlazo: Recomendacion
    largoPlazo: Recomendacion
  }
  confianzaGeneral: number
  // Nuevos campos
  analisisHistorico: AnalisisHistorico
  patronesEmergentes: PatronEmergente[]
  anomalias: Anomalia[]
  patronesCajaPuntaDetallados: PatronCajaPuntaDetallado[]
}

// Función para generar un número aleatorio dentro de un rango
function randomNumber(min: number, max: number, decimals = 0): number {
  const rand = Math.random() * (max - min) + min
  const factor = Math.pow(10, decimals)
  return Math.round(rand * factor) / factor
}

// Función para generar fechas secuenciales
function generarFechasSecuenciales(inicio: Date, cantidad: number, intervaloDias = 1): string[] {
  const fechas: string[] = []
  const fechaActual = new Date(inicio)

  for (let i = 0; i < cantidad; i++) {
    fechas.push(fechaActual.toISOString().split("T")[0])
    fechaActual.setDate(fechaActual.getDate() + intervaloDias)
  }

  return fechas
}

// Modificar la función generarModeloAnalisis para incorporar los datos de Argentina
function generarModeloAnalisis(mercado: string): ModeloAnalisis {
  // Fecha actual para el análisis
  const fechaAnalisis = new Date().toISOString().split("T")[0]

  // Precio actual simulado según el mercado
  let precioActual = 0
  switch (mercado) {
    case "contract5":
      precioActual = 450.25
      break
    case "contract11":
      precioActual = 380.75
      break
    case "argentina":
      precioActual = 42500
      break
    case "chile":
      precioActual = 462.3
      break
    case "peru":
      precioActual = 475.5
      break
    default:
      precioActual = 400.0
  }

  // Generar predicciones para los próximos 30 días
  const fechasPrediccion = generarFechasSecuenciales(new Date(), 30)
  const predicciones: PuntoPrediccion[] = fechasPrediccion.map((fecha, index) => {
    // Simular una tendencia con ruido
    const tendencia = ((index / 30) * randomNumber(-5, 8, 1)) / 100
    const ruido = randomNumber(-2, 2, 2) / 100
    const prediccion = precioActual * (1 + tendencia + ruido)

    // El intervalo aumenta con el tiempo para reflejar mayor incertidumbre
    const incertidumbre = Math.sqrt(index + 1) * 0.01
    const intervaloInferior = prediccion * (1 - incertidumbre)
    const intervaloSuperior = prediccion * (1 + incertidumbre)

    // La confianza disminuye con el tiempo
    const confianza = Math.max(30, 100 - index * 2)

    return {
      fecha,
      precio: index === 0 ? precioActual : 0, // Solo conocemos el precio actual
      prediccion: Math.round(prediccion * 100) / 100,
      intervalo: [Math.round(intervaloInferior * 100) / 100, Math.round(intervaloSuperior * 100) / 100],
      confianza,
    }
  })

  // Generar patrones de caja y punta identificados
  const patronesCajaPunta: PatronCajaPunta[] = []

  // Simular 1-3 patrones detectados
  const numPatrones = randomNumber(1, 3)
  for (let i = 0; i < numPatrones; i++) {
    const tiposPatron = ["alcista", "bajista", "continuacion", "reversa"]
    const tipo = tiposPatron[randomNumber(0, tiposPatron.length - 1)] as
      | "alcista"
      | "bajista"
      | "continuacion"
      | "reversa"

    // Fechas aleatorias dentro del último mes
    const fechaInicio = new Date()
    fechaInicio.setDate(fechaInicio.getDate() - randomNumber(5, 30))
    const fechaFin = new Date(fechaInicio)
    fechaFin.setDate(fechaInicio.getDate() + randomNumber(3, 15))

    // Generar puntos del patrón (precios históricos relevantes)
    const numPuntos = randomNumber(3, 5)
    const puntos: number[] = []
    for (let j = 0; j < numPuntos; j++) {
      puntos.push(precioActual * (1 + randomNumber(-10, 10, 2) / 100))
    }

    // Confiabilidad del patrón detectado
    const confiabilidad = randomNumber(60, 95)

    // Expectativa basada en el tipo de patrón
    let expectativa = ""
    if (tipo === "alcista") {
      expectativa = "Se espera un movimiento alcista significativo tras la formación."
    } else if (tipo === "bajista") {
      expectativa = "Patrón indica probable continuación de la tendencia bajista."
    } else if (tipo === "continuacion") {
      expectativa = "El patrón sugiere continuación de la tendencia actual."
    } else {
      expectativa = "Posible reversión de tendencia indicada por este patrón."
    }

    // Objetivo de precio basado en el tipo de patrón
    let objetivoPrecio = precioActual
    if (tipo === "alcista" || tipo === "reversa") {
      objetivoPrecio = precioActual * (1 + randomNumber(3, 15, 2) / 100)
    } else {
      objetivoPrecio = precioActual * (1 - randomNumber(3, 15, 2) / 100)
    }

    patronesCajaPunta.push({
      tipo,
      inicio: fechaInicio.toISOString().split("T")[0],
      fin: fechaFin.toISOString().split("T")[0],
      puntos,
      confiabilidad,
      expectativa,
      objetivoPrecio: Math.round(objetivoPrecio * 100) / 100,
    })
  }

  // Identificar tendencias en diferentes escalas de tiempo
  const tendencias: TendenciaIdentificada[] = []

  // Tendencia primaria (largo plazo)
  const direccionesTendencia = ["alcista", "bajista", "lateral"]
  const direccionPrimaria = direccionesTendencia[randomNumber(0, 2)] as "alcista" | "bajista" | "lateral"

  const fechaInicioPrimaria = new Date()
  fechaInicioPrimaria.setMonth(fechaInicioPrimaria.getMonth() - randomNumber(6, 24))

  tendencias.push({
    tipo: "primaria",
    direccion: direccionPrimaria,
    fortaleza: randomNumber(70, 90),
    inicio: fechaInicioPrimaria.toISOString().split("T")[0],
    fin: null,
    angulo: randomNumber(20, 45, 1),
    soportes: [precioActual * (1 - randomNumber(5, 15, 2) / 100), precioActual * (1 - randomNumber(15, 25, 2) / 100)],
    resistencias: [
      precioActual * (1 + randomNumber(5, 15, 2) / 100),
      precioActual * (1 + randomNumber(15, 25, 2) / 100),
    ],
  })

  // Tendencia secundaria (medio plazo)
  const direccionSecundaria = direccionesTendencia[randomNumber(0, 2)] as "alcista" | "bajista" | "lateral"

  const fechaInicioSecundaria = new Date()
  fechaInicioSecundaria.setMonth(fechaInicioSecundaria.getMonth() - randomNumber(1, 6))

  tendencias.push({
    tipo: "secundaria",
    direccion: direccionSecundaria,
    fortaleza: randomNumber(50, 80),
    inicio: fechaInicioSecundaria.toISOString().split("T")[0],
    fin: null,
    angulo: randomNumber(30, 60, 1),
    soportes: [precioActual * (1 - randomNumber(3, 8, 2) / 100), precioActual * (1 - randomNumber(8, 15, 2) / 100)],
    resistencias: [precioActual * (1 + randomNumber(3, 8, 2) / 100), precioActual * (1 + randomNumber(8, 15, 2) / 100)],
  })

  // Tendencia terciaria (corto plazo)
  const direccionTerciaria = direccionesTendencia[randomNumber(0, 2)] as "alcista" | "bajista" | "lateral"

  const fechaInicioTerciaria = new Date()
  fechaInicioTerciaria.setDate(fechaInicioTerciaria.getDate() - randomNumber(1, 30))

  tendencias.push({
    tipo: "terciaria",
    direccion: direccionTerciaria,
    fortaleza: randomNumber(40, 70),
    inicio: fechaInicioTerciaria.toISOString().split("T")[0],
    fin: null,
    angulo: randomNumber(40, 80, 1),
    soportes: [precioActual * (1 - randomNumber(1, 5, 2) / 100), precioActual * (1 - randomNumber(5, 10, 2) / 100)],
    resistencias: [precioActual * (1 + randomNumber(1, 5, 2) / 100), precioActual * (1 + randomNumber(5, 10, 2) / 100)],
  })

  // Generar indicadores técnicos
  const indicadoresTecnicos: IndicadorTecnico[] = [
    {
      nombre: "Media Móvil (50 días)",
      valor: precioActual * (1 + randomNumber(-5, 5, 2) / 100),
      interpretacion:
        precioActual > precioActual * (1 + randomNumber(-5, 5, 2) / 100)
          ? "Precio por encima de la media móvil, tendencia alcista."
          : "Precio por debajo de la media móvil, tendencia bajista.",
      señal: ["compra", "venta", "neutral"][randomNumber(0, 2)] as "compra" | "venta" | "neutral",
      fuerza: randomNumber(60, 90),
    },
    {
      nombre: "RSI (14)",
      valor: randomNumber(20, 80, 1),
      interpretacion:
        randomNumber(20, 80, 1) > 70
          ? "Mercado sobrecomprado, posible corrección a la baja."
          : randomNumber(20, 80, 1) < 30
            ? "Mercado sobrevendido, posible rebote al alza."
            : "Mercado en zona neutral.",
      señal: ["compra", "venta", "neutral"][randomNumber(0, 2)] as "compra" | "venta" | "neutral",
      fuerza: randomNumber(60, 90),
    },
    {
      nombre: "MACD",
      valor: randomNumber(-5, 5, 2),
      interpretacion:
        randomNumber(-5, 5, 2) > 0 ? "MACD positivo, tendencia alcista." : "MACD negativo, tendencia bajista.",
      señal: ["compra", "venta", "neutral"][randomNumber(0, 2)] as "compra" | "venta" | "neutral",
      fuerza: randomNumber(60, 90),
    },
    {
      nombre: "Bandas de Bollinger",
      valor: randomNumber(0, 2, 2),
      interpretacion:
        randomNumber(0, 2, 2) > 1.5
          ? "Precio cerca de la banda superior, posible sobrecompra."
          : randomNumber(0, 2, 2) < 0.5
            ? "Precio cerca de la banda inferior, posible sobreventa."
            : "Precio dentro de las bandas, volatilidad normal.",
      señal: ["compra", "venta", "neutral"][randomNumber(0, 2)] as "compra" | "venta" | "neutral",
      fuerza: randomNumber(60, 90),
    },
    {
      nombre: "Volumen Promedio (20 días)",
      valor: randomNumber(5000, 20000),
      interpretacion: "Volumen " + (randomNumber(5000, 20000) > 10000 ? "por encima" : "por debajo") + " del promedio.",
      señal: ["compra", "venta", "neutral"][randomNumber(0, 2)] as "compra" | "venta" | "neutral",
      fuerza: randomNumber(50, 80),
    },
  ]

  // Generar factores fundamentales
  const factoresFundamentales: FactorFundamental[] = [
    {
      nombre: "Producción Mundial",
      valor: randomNumber(170, 190, 1),
      impacto: randomNumber(-60, 60),
      descripcion: "Millones de toneladas estimadas para la temporada actual",
    },
    {
      nombre: "Relación Stocks/Consumo",
      valor: randomNumber(35, 45, 1),
      impacto: randomNumber(-70, 70),
      descripcion: "Porcentaje de inventarios respecto al consumo anual",
    },
    {
      nombre: "Crecimiento Demanda",
      valor: randomNumber(1, 3, 1),
      impacto: randomNumber(20, 80),
      descripcion: "Crecimiento porcentual anual de la demanda global",
    },
    {
      nombre: "Precio del Petróleo",
      valor: randomNumber(60, 100, 1),
      impacto: randomNumber(-40, 40),
      descripcion: "USD por barril, afecta costos de producción y etanol",
    },
    {
      nombre: "Condiciones Climáticas",
      valor: randomNumber(0, 10, 1),
      impacto: randomNumber(-80, 80),
      descripcion: "Índice de 0-10 (óptimo). Impacto en regiones productoras clave",
    },
  ]

  // Añadir factores fundamentales específicos para Argentina si el mercado es "argentina"
  if (mercado === "argentina") {
    // Añadir factores fundamentales específicos de Argentina
    factoresFundamentales.push(
      {
        nombre: "Producción Nacional",
        valor: argentinaMarketData.production.sugarProduction["2022-2023"],
        impacto: 40,
        descripcion: "Variación porcentual en la producción de azúcar (2022-2023)",
      },
      {
        nombre: "Exportaciones",
        valor: argentinaMarketData.exports["2022-2023_Q1-Q3"].sugar,
        impacto: -70,
        descripcion: "Caída en exportaciones de azúcar respecto al año anterior",
      },
      {
        nombre: "Exceso de Oferta",
        valor:
          (argentinaMarketData.domesticMarket["2023"].excessSupply.min +
            argentinaMarketData.domesticMarket["2023"].excessSupply.max) /
          2000, // Convertir a miles de toneladas
        impacto: -60,
        descripcion: "Miles de toneladas de exceso de oferta en el mercado interno",
      },
      {
        nombre: "Pérdida de Mercado",
        valor: argentinaMarketData.domesticMarket["last-12-years"].marketShareLoss,
        impacto: -45,
        descripcion: "Pérdida de participación en el mercado de edulcorantes en los últimos 12 años",
      },
      {
        nombre: "Producción de Bioetanol",
        valor: argentinaMarketData.production.bioethanol["2022-2023_Q1-Q3"].production,
        impacto: -30,
        descripcion: "Variación en la producción de bioetanol respecto al año anterior",
      },
    )

    // Añadir tendencias específicas para Argentina
    tendencias.push({
      tipo: "primaria",
      direccion: "bajista",
      fortaleza: 75,
      inicio: new Date(new Date().setFullYear(new Date().getFullYear() - 12)).toISOString().split("T")[0],
      fin: null,
      angulo: 35,
      soportes: [precioActual * 0.85, precioActual * 0.75],
      resistencias: [precioActual * 1.1, precioActual * 1.2],
    })

    // Añadir patrones específicos para Argentina
    patronesCajaPunta.push({
      tipo: "bajista",
      inicio: new Date(new Date().setMonth(new Date().getMonth() - 9)).toISOString().split("T")[0],
      fin: new Date().toISOString().split("T")[0],
      puntos: [precioActual * 1.2, precioActual * 1.1, precioActual * 0.95, precioActual],
      confiabilidad: 85,
      expectativa: "Exceso de oferta interna y caída en exportaciones presionan los precios a la baja",
      objetivoPrecio: precioActual * 0.9,
    })

    // Generar recomendaciones

    // Corto plazo
    const accionCorto = ["comprar", "vender", "mantener"][randomNumber(0, 2)] as "comprar" | "vender" | "mantener"
    const confianzaCorto = randomNumber(60, 90)
    let objetivoPrecioCorto = precioActual
    let stopLossCorto = precioActual

    if (accionCorto === "comprar") {
      objetivoPrecioCorto = precioActual * (1 + randomNumber(3, 10, 2) / 100)
      stopLossCorto = precioActual * (1 - randomNumber(2, 5, 2) / 100)
    } else if (accionCorto === "vender") {
      objetivoPrecioCorto = precioActual * (1 - randomNumber(3, 10, 2) / 100)
      stopLossCorto = precioActual * (1 + randomNumber(2, 5, 2) / 100)
    } else {
      objetivoPrecioCorto = precioActual * (1 + randomNumber(-2, 2, 2) / 100)
      stopLossCorto = precioActual * (1 - randomNumber(3, 6, 2) / 100)
    }

    const razonamientoCorto: string[] = [
      `Tendencia ${tendencias[2].direccion} de corto plazo con fortaleza ${tendencias[2].fortaleza}%.`,
      `Indicador ${indicadoresTecnicos[1].nombre} en ${indicadoresTecnicos[1].valor} sugiere ${indicadoresTecnicos[1].señal}.`,
      `Patrón "${patronesCajaPunta.length > 0 ? patronesCajaPunta[0].tipo : "neutral"}" identificado con ${patronesCajaPunta.length > 0 ? patronesCajaPunta[0].confiabilidad : 0}% de confiabilidad.`,
    ]

    const riesgosCorto: string[] = [
      "Volatilidad de corto plazo por encima del promedio histórico.",
      `Resistencia significativa en ${tendencias[2].resistencias[0]}.`,
      "Posibles noticias de mercado que afecten la tendencia actual.",
    ]

    // Medio plazo
    const accionMedio = ["comprar", "vender", "mantener"][randomNumber(0, 2)] as "comprar" | "vender" | "mantener"
    const confianzaMedio = randomNumber(50, 80)
    let objetivoPrecioMedio = precioActual
    let stopLossMedio = precioActual

    if (accionMedio === "comprar") {
      objetivoPrecioMedio = precioActual * (1 + randomNumber(8, 20, 2) / 100)
      stopLossMedio = precioActual * (1 - randomNumber(5, 12, 2) / 100)
    } else if (accionMedio === "vender") {
      objetivoPrecioMedio = precioActual * (1 - randomNumber(8, 20, 2) / 100)
      stopLossMedio = precioActual * (1 + randomNumber(5, 12, 2) / 100)
    } else {
      objetivoPrecioMedio = precioActual * (1 + randomNumber(-5, 5, 2) / 100)
      stopLossMedio = precioActual * (1 - randomNumber(8, 15, 2) / 100)
    }

    const razonamientoMedio: string[] = [
      `Tendencia ${tendencias[1].direccion} de medio plazo con fortaleza ${tendencias[1].fortaleza}%.`,
      `Factor fundamental "${factoresFundamentales[0].nombre}" con impacto ${factoresFundamentales[0].impacto > 0 ? "positivo" : "negativo"}.`,
      `Análisis estacional sugiere ${randomNumber(0, 1) === 0 ? "fortaleza" : "debilidad"} para el próximo trimestre.`,
    ]

    const riesgosMedio: string[] = [
      `Posible cambio en tendencia ${tendencias[1].direccion} si se rompe soporte en ${tendencias[1].soportes[0]}.`,
      "Incertidumbre en condiciones de producción para próxima cosecha.",
      "Cambios regulatorios potenciales en mercados clave.",
    ]

    // Largo plazo
    const accionLargo = ["comprar", "vender", "mantener"][randomNumber(0, 2)] as "comprar" | "vender" | "mantener"
    const confianzaLargo = randomNumber(40, 70)
    let objetivoPrecioLargo = precioActual
    let stopLossLargo = precioActual

    if (accionLargo === "comprar") {
      objetivoPrecioLargo = precioActual * (1 + randomNumber(15, 40, 2) / 100)
      stopLossLargo = precioActual * (1 - randomNumber(12, 25, 2) / 100)
    } else if (accionLargo === "vender") {
      objetivoPrecioLargo = precioActual * (1 - randomNumber(15, 40, 2) / 100)
      stopLossLargo = precioActual * (1 + randomNumber(12, 25, 2) / 100)
    } else {
      objetivoPrecioLargo = precioActual * (1 + randomNumber(-10, 10, 2) / 100)
      stopLossLargo = precioActual * (1 - randomNumber(15, 30, 2) / 100)
    }

    const razonamientoLargo: string[] = [
      `Tendencia ${tendencias[0].direccion} de largo plazo con fortaleza ${tendencias[0].fortaleza}%.`,
      `Relación oferta/demanda proyectada ${randomNumber(0, 1) === 0 ? "favorable" : "desfavorable"} para los próximos años.`,
      `Factores macroeconómicos sugieren ${randomNumber(0, 1) === 0 ? "crecimiento" : "contracción"} del consumo global.`,
    ]

    const riesgosLargo: string[] = [
      "Cambios estructurales en el mercado azucarero global.",
      "Impacto de políticas comerciales y arancelarias entre países productores.",
      "Desarrollo de sustitutos y cambios en patrones de consumo.",
    ]

    const recomendaciones = {
      cortoPlazo: {
        accion: accionCorto,
        horizonte: "corto" as const,
        confianza: confianzaCorto,
        objetivoPrecio: Math.round(objetivoPrecioCorto * 100) / 100,
        stopLoss: Math.round(stopLossCorto * 100) / 100,
        razonamiento: razonamientoCorto,
        riesgos: riesgosCorto,
      },
      medioPlazo: {
        accion: accionMedio,
        horizonte: "medio" as const,
        confianza: confianzaMedio,
        objetivoPrecio: Math.round(objetivoPrecioMedio * 100) / 100,
        stopLoss: Math.round(stopLossMedio * 100) / 100,
        razonamiento: razonamientoMedio,
        riesgos: riesgosMedio,
      },
      largoPlazo: {
        accion: accionLargo,
        horizonte: "largo" as const,
        confianza: confianzaLargo,
        objetivoPrecio: Math.round(objetivoPrecioLargo * 100) / 100,
        stopLoss: Math.round(stopLossLargo * 100) / 100,
        razonamiento: razonamientoLargo,
        riesgos: riesgosLargo,
      },
    }

    if (recomendaciones.cortoPlazo.accion === "comprar") {
      recomendaciones.cortoPlazo.accion = "mantener"
      recomendaciones.cortoPlazo.razonamiento.push(
        "Exceso de oferta interna de 250-300 mil toneladas limita potencial alcista",
      )
    }

    // Añadir riesgos específicos para Argentina
    recomendaciones.medioPlazo.riesgos.push(
      "Políticas gubernamentales que mantienen precios domésticos por debajo de los internacionales",
      "Pérdida continua de participación en el mercado de edulcorantes (-25% en 12 años)",
    )

    // Añadir oportunidades específicas para Argentina
    recomendaciones.largoPlazo.razonamiento.push(
      "Potencial de crecimiento en biocombustibles y derivados de la caña si se modifican políticas restrictivas",
      "Argentina fue top 4 en exportaciones de azúcar orgánica (2017-2021), mercado con potencial de recuperación",
    )
  } else {
    // Generar recomendaciones

    // Corto plazo
    const accionCorto = ["comprar", "vender", "mantener"][randomNumber(0, 2)] as "comprar" | "vender" | "mantener"
    const confianzaCorto = randomNumber(60, 90)
    let objetivoPrecioCorto = precioActual
    let stopLossCorto = precioActual

    if (accionCorto === "comprar") {
      objetivoPrecioCorto = precioActual * (1 + randomNumber(3, 10, 2) / 100)
      stopLossCorto = precioActual * (1 - randomNumber(2, 5, 2) / 100)
    } else if (accionCorto === "vender") {
      objetivoPrecioCorto = precioActual * (1 - randomNumber(3, 10, 2) / 100)
      stopLossCorto = precioActual * (1 + randomNumber(2, 5, 2) / 100)
    } else {
      objetivoPrecioCorto = precioActual * (1 + randomNumber(-2, 2, 2) / 100)
      stopLossCorto = precioActual * (1 - randomNumber(3, 6, 2) / 100)
    }

    const razonamientoCorto: string[] = [
      `Tendencia ${tendencias[2].direccion} de corto plazo con fortaleza ${tendencias[2].fortaleza}%.`,
      `Indicador ${indicadoresTecnicos[1].nombre} en ${indicadoresTecnicos[1].valor} sugiere ${indicadoresTecnicos[1].señal}.`,
      `Patrón "${patronesCajaPunta.length > 0 ? patronesCajaPunta[0].tipo : "neutral"}" identificado con ${patronesCajaPunta.length > 0 ? patronesCajaPunta[0].confiabilidad : 0}% de confiabilidad.`,
    ]

    const riesgosCorto: string[] = [
      "Volatilidad de corto plazo por encima del promedio histórico.",
      `Resistencia significativa en ${tendencias[2].resistencias[0]}.`,
      "Posibles noticias de mercado que afecten la tendencia actual.",
    ]

    // Medio plazo
    const accionMedio = ["comprar", "vender", "mantener"][randomNumber(0, 2)] as "comprar" | "vender" | "mantener"
    const confianzaMedio = randomNumber(50, 80)
    let objetivoPrecioMedio = precioActual
    let stopLossMedio = precioActual

    if (accionMedio === "comprar") {
      objetivoPrecioMedio = precioActual * (1 + randomNumber(8, 20, 2) / 100)
      stopLossMedio = precioActual * (1 - randomNumber(5, 12, 2) / 100)
    } else if (accionMedio === "vender") {
      objetivoPrecioMedio = precioActual * (1 - randomNumber(8, 20, 2) / 100)
      stopLossMedio = precioActual * (1 + randomNumber(5, 12, 2) / 100)
    } else {
      objetivoPrecioMedio = precioActual * (1 + randomNumber(-5, 5, 2) / 100)
      stopLossMedio = precioActual * (1 - randomNumber(8, 15, 2) / 100)
    }

    const razonamientoMedio: string[] = [
      `Tendencia ${tendencias[1].direccion} de medio plazo con fortaleza ${tendencias[1].fortaleza}%.`,
      `Factor fundamental "${factoresFundamentales[0].nombre}" con impacto ${factoresFundamentales[0].impacto > 0 ? "positivo" : "negativo"}.`,
      `Análisis estacional sugiere ${randomNumber(0, 1) === 0 ? "fortaleza" : "debilidad"} para el próximo trimestre.`,
    ]

    const riesgosMedio: string[] = [
      `Posible cambio en tendencia ${tendencias[1].direccion} si se rompe soporte en ${tendencias[1].soportes[0]}.`,
      "Incertidumbre en condiciones de producción para próxima cosecha.",
      "Cambios regulatorios potenciales en mercados clave.",
    ]

    // Largo plazo
    const accionLargo = ["comprar", "vender", "mantener"][randomNumber(0, 2)] as "comprar" | "vender" | "mantener"
    const confianzaLargo = randomNumber(40, 70)
    let objetivoPrecioLargo = precioActual
    let stopLossLargo = precioActual

    if (accionLargo === "comprar") {
      objetivoPrecioLargo = precioActual * (1 + randomNumber(15, 40, 2) / 100)
      stopLossLargo = precioActual * (1 - randomNumber(12, 25, 2) / 100)
    } else if (accionLargo === "vender") {
      objetivoPrecioLargo = precioActual * (1 - randomNumber(15, 40, 2) / 100)
      stopLossLargo = precioActual * (1 + randomNumber(12, 25, 2) / 100)
    } else {
      objetivoPrecioLargo = precioActual * (1 + randomNumber(-10, 10, 2) / 100)
      stopLossLargo = precioActual * (1 - randomNumber(15, 30, 2) / 100)
    }

    const razonamientoLargo: string[] = [
      `Tendencia ${tendencias[0].direccion} de largo plazo con fortaleza ${tendencias[0].fortaleza}%.`,
      `Relación oferta/demanda proyectada ${randomNumber(0, 1) === 0 ? "favorable" : "desfavorable"} para los próximos años.`,
      `Factores macroeconómicos sugieren ${randomNumber(0, 1) === 0 ? "crecimiento" : "contracción"} del consumo global.`,
    ]

    const riesgosLargo: string[] = [
      "Cambios estructurales en el mercado azucarero global.",
      "Impacto de políticas comerciales y arancelarias entre países productores.",
      "Desarrollo de sustitutos y cambios en patrones de consumo.",
    ]

    const recomendaciones = {
      cortoPlazo: {
        accion: accionCorto,
        horizonte: "corto" as const,
        confianza: confianzaCorto,
        objetivoPrecio: Math.round(objetivoPrecioCorto * 100) / 100,
        stopLoss: Math.round(stopLossCorto * 100) / 100,
        razonamiento: razonamientoCorto,
        riesgos: riesgosCorto,
      },
      medioPlazo: {
        accion: accionMedio,
        horizonte: "medio" as const,
        confianza: confianzaMedio,
        objetivoPrecio: Math.round(objetivoPrecioMedio * 100) / 100,
        stopLoss: Math.round(stopLossMedio * 100) / 100,
        razonamiento: razonamientoMedio,
        riesgos: riesgosMedio,
      },
      largoPlazo: {
        accion: accionLargo,
        horizonte: "largo" as const,
        confianza: confianzaLargo,
        objetivoPrecio: Math.round(objetivoPrecioLargo * 100) / 100,
        stopLoss: Math.round(stopLossLargo * 100) / 100,
        razonamiento: razonamientoLargo,
        riesgos: riesgosLargo,
      },
    }
  }

  // Calcular confianza general del modelo
  const confianzaGeneral = Math.round(
    confianzaCorto * 0.2 +
      confianzaMedio * 0.3 +
      confianzaLargo * 0.2 +
      (patronesCajaPunta.reduce((sum, p) => sum + p.confiabilidad, 0) / (patronesCajaPunta.length || 1)) * 0.3,
  )

  // Antes del return, agregar la generación de los nuevos campos

  // Generar análisis histórico
  const analisisHistorico = generarAnalisisHistorico(precioActual)

  // Generar patrones emergentes
  const patronesEmergentes = generarPatronesEmergentes()

  // Generar anomalías
  const anomalias = generarAnomalias()

  // Generar patrones de caja y punta detallados
  const patronesCajaPuntaDetallados = generarPatronesCajaPuntaDetallados(patronesCajaPunta)

  return {
    // Propiedades existentes...
    fechaAnalisis,
    mercado,
    precioActual,
    predicciones,
    patronesCajaPunta,
    tendencias,
    indicadoresTecnicos,
    factoresFundamentales,
    recomendaciones,
    confianzaGeneral,
    analisisHistorico,
    patronesEmergentes,
    anomalias,
    patronesCajaPuntaDetallados,
  }
}

// Agregar nuevas funciones para generar los nuevos tipos de análisis después de las funciones existentes

// Función para generar estadísticas históricas
function generarEstadisticaHistorica(periodo: string, precioBase: number): EstadisticaHistorica {
  const variabilidad =
    periodo === "diario"
      ? 0.05
      : periodo === "semanal"
        ? 0.08
        : periodo === "mensual"
          ? 0.12
          : periodo === "trimestral"
            ? 0.18
            : 0.25

  const media = precioBase * (1 + randomNumber(-variabilidad / 2, variabilidad / 2, 4))
  const desviacionEstandar = media * randomNumber(0.05, variabilidad, 4)
  const varianza = desviacionEstandar * desviacionEstandar
  const maximo = media + desviacionEstandar * randomNumber(2, 3, 2)
  const minimo = media - desviacionEstandar * randomNumber(2, 3, 2)
  const rango = maximo - minimo
  const skewness = randomNumber(-1, 1, 2)
  const kurtosis = randomNumber(2, 5, 2)
  const percentil25 = media - desviacionEstandar * randomNumber(0.5, 0.8, 2)
  const percentil75 = media + desviacionEstandar * randomNumber(0.5, 0.8, 2)
  const mediana = media + (skewness < 0 ? 1 : -1) * desviacionEstandar * randomNumber(0, 0.3, 2)

  return {
    periodo,
    media: Math.round(media * 100) / 100,
    mediana: Math.round(mediana * 100) / 100,
    desviacionEstandar: Math.round(desviacionEstandar * 100) / 100,
    varianza: Math.round(varianza * 100) / 100,
    maximo: Math.round(maximo * 100) / 100,
    minimo: Math.round(minimo * 100) / 100,
    rango: Math.round(rango * 100) / 100,
    skewness: Math.round(skewness * 100) / 100,
    kurtosis: Math.round(kurtosis * 100) / 100,
    percentil25: Math.round(percentil25 * 100) / 100,
    percentil75: Math.round(percentil75 * 100) / 100,
  }
}

// Función para generar análisis estacional
function generarAnalisisEstacional(precioBase: number): AnalisisEstacional[] {
  const periodos = ["Enero-Marzo", "Abril-Junio", "Julio-Septiembre", "Octubre-Diciembre"]

  return periodos.map((periodo) => {
    const tendencia = randomNumber(-15, 15, 1)
    const confianza = randomNumber(60, 90)

    let descripcion = ""
    if (tendencia > 5) {
      descripcion = `Históricamente, el periodo ${periodo} muestra una tendencia alcista significativa.`
    } else if (tendencia < -5) {
      descripcion = `El periodo ${periodo} suele mostrar debilidad en los precios históricamente.`
    } else {
      descripcion = `El periodo ${periodo} no muestra una tendencia estacional clara.`
    }

    return {
      periodo,
      tendenciaEstacional: tendencia,
      confianza,
      descripcion,
    }
  })
}

// Función para generar patrones emergentes
function generarPatronesEmergentes(): PatronEmergente[] {
  const nombresPatrones = [
    "Divergencia volumen-precio",
    "Acumulación institucional",
    "Compresión de volatilidad pre-movimiento",
    "Patrón de agotamiento alcista",
    "Formación de base múltiple",
    "Ruptura fallida con retorno",
    "Aceleración parabólica",
  ]

  const numPatrones = randomNumber(1, 4)
  const patrones: PatronEmergente[] = []

  for (let i = 0; i < numPatrones; i++) {
    const nombreIndice = randomNumber(0, nombresPatrones.length - 1)
    const nombre = nombresPatrones[nombreIndice]

    // Evitar duplicados
    nombresPatrones.splice(nombreIndice, 1)

    const fechaDeteccion = new Date()
    fechaDeteccion.setDate(fechaDeteccion.getDate() - randomNumber(1, 14))

    const ultimaOcurrencia =
      randomNumber(0, 10) > 2
        ? (() => {
            const fecha = new Date()
            fecha.setMonth(fecha.getMonth() - randomNumber(1, 24))
            return fecha.toISOString().split("T")[0]
          })()
        : null

    let descripcion = ""
    switch (nombre) {
      case "Divergencia volumen-precio":
        descripcion =
          "El precio continúa subiendo mientras el volumen disminuye, indicando posible debilitamiento de la tendencia."
        break
      case "Acumulación institucional":
        descripcion =
          "Aumento gradual del volumen sin cambios significativos en el precio, sugiriendo acumulación por grandes actores."
        break
      case "Compresión de volatilidad pre-movimiento":
        descripcion =
          "Reducción significativa en la volatilidad que suele preceder a movimientos importantes de precio."
        break
      case "Patrón de agotamiento alcista":
        descripcion = "Series de máximos con volumen decreciente, sugiriendo agotamiento de compradores."
        break
      case "Formación de base múltiple":
        descripcion =
          "Múltiples pruebas de soporte en un rango estrecho, formando una base sólida para posible movimiento alcista."
        break
      case "Ruptura fallida con retorno":
        descripcion = "Ruptura de resistencia seguida de retorno rápido, atrapando a operadores en posición incorrecta."
        break
      case "Aceleración parabólica":
        descripcion =
          "Aumento exponencial en la pendiente de precio, indicando posible fase final de un movimiento alcista."
        break
      default:
        descripcion = "Patrón emergente detectado en análisis reciente."
    }

    patrones.push({
      nombre,
      descripcion,
      fechaDeteccion: fechaDeteccion.toISOString().split("T")[0],
      confianza: randomNumber(60, 90),
      impactoEstimado: randomNumber(-80, 80),
      duracionEstimada: `${randomNumber(1, 12)} ${randomNumber(0, 1) === 0 ? "semanas" : "meses"}`,
      frecuenciaHistorica: randomNumber(1, 10),
      ultimaOcurrencia,
    })
  }

  return patrones
}

// Función para generar anomalías
function generarAnomalias(): Anomalia[] {
  const tiposAnomalia = ["precio", "volumen", "volatilidad", "correlacion", "liquidez"]
  const numAnomalias = randomNumber(0, 3)
  const anomalias: Anomalia[] = []

  for (let i = 0; i < numAnomalias; i++) {
    const tipo = tiposAnomalia[randomNumber(0, tiposAnomalia.length - 1)] as
      | "precio"
      | "volumen"
      | "volatilidad"
      | "correlacion"
      | "liquidez"

    const fechaInicio = new Date()
    fechaInicio.setDate(fechaInicio.getDate() - randomNumber(1, 30))

    const estaActiva = randomNumber(0, 10) > 3

    let fechaFin = null
    if (!estaActiva) {
      const fechaFinTemp = new Date(fechaInicio)
      fechaFinTemp.setDate(fechaInicio.getDate() + randomNumber(1, 14))
      fechaFin = fechaFinTemp.toISOString().split("T")[0]
    }

    let descripcion = ""
    let causasProbables: string[] = []

    switch (tipo) {
      case "precio":
        descripcion = "Movimiento de precio anómalo sin fundamentos aparentes."
        causasProbables = [
          "Liquidación forzada de posiciones apalancadas",
          "Entrada/salida de capital institucional",
          "Reacción exagerada a noticias menores",
        ]
        break
      case "volumen":
        descripcion = "Volumen de operaciones significativamente por encima del promedio histórico."
        causasProbables = [
          "Actividad inusual de grandes operadores",
          "Vencimiento de contratos de futuros",
          "Rebalanceo de fondos indexados",
        ]
        break
      case "volatilidad":
        descripcion = "Aumento repentino de la volatilidad sin cambio proporcional en el precio."
        causasProbables = [
          "Incertidumbre en datos fundamentales próximos",
          "Posicionamiento extremo en opciones",
          "Reducción de liquidez en el mercado",
        ]
        break
      case "correlacion":
        descripcion = "Ruptura de correlación histórica con mercados relacionados."
        causasProbables = [
          "Factores específicos del mercado azucarero",
          "Cambios en flujos comerciales regionales",
          "Desacoplamiento temporal por factores técnicos",
        ]
        break
      case "liquidez":
        descripcion = "Reducción significativa en la profundidad del libro de órdenes."
        causasProbables = [
          "Retiro de creadores de mercado",
          "Aumento de incertidumbre regulatoria",
          "Concentración de posiciones en pocos participantes",
        ]
        break
    }

    anomalias.push({
      tipo,
      fechaInicio: fechaInicio.toISOString().split("T")[0],
      fechaFin,
      descripcion,
      magnitud: randomNumber(60, 95),
      causaProbable: causasProbables.slice(0, randomNumber(1, causasProbables.length)),
      impactoMercado: randomNumber(-80, 80),
      duracionEstimada: estaActiva ? `${randomNumber(1, 14)} días` : null,
      estado: estaActiva ? (randomNumber(0, 1) === 0 ? "activa" : "en desarrollo") : "finalizada",
    })
  }

  return anomalias
}

// Función para generar patrones de caja y punta detallados
function generarPatronesCajaPuntaDetallados(patronesSimples: PatronCajaPunta[]): PatronCajaPuntaDetallado[] {
  return patronesSimples.map((patron) => {
    const subPatrones = []
    const numSubPatrones = randomNumber(1, 3)

    const nombresSubPatrones = [
      "Hombro-Cabeza-Hombro invertido",
      "Doble suelo",
      "Bandera alcista",
      "Triángulo ascendente",
      "Cuña descendente",
      "Isla de reversión",
      "Patrón 1-2-3",
    ]

    const posiciones = ["inicio", "medio", "fin"]

    for (let i = 0; i < numSubPatrones; i++) {
      subPatrones.push({
        nombre: nombresSubPatrones[randomNumber(0, nombresSubPatrones.length - 1)],
        posicion: posiciones[randomNumber(0, posiciones.length - 1)] as "inicio" | "medio" | "fin",
        significado: "Confirma la dirección principal del patrón mayor.",
      })
    }

    const divergencias = []
    if (randomNumber(0, 10) > 5) {
      divergencias.push({
        tipo: "RSI",
        descripcion: "Divergencia entre precio y RSI",
        significado: "Sugiere posible debilitamiento de la tendencia actual.",
      })
    }

    if (randomNumber(0, 10) > 7) {
      divergencias.push({
        tipo: "MACD",
        descripcion: "Divergencia entre precio y MACD",
        significado: "Indica pérdida de momentum en la dirección actual.",
      })
    }

    // Niveles de Fibonacci comunes
    const nivelesFibonacci = [0.236, 0.382, 0.5, 0.618, 0.786].slice(0, randomNumber(2, 5))

    // Generar zonas de soporte y resistencia basadas en el precio objetivo
    const zonasSoporte = []
    const zonasResistencia = []

    for (let i = 0; i < randomNumber(2, 4); i++) {
      zonasSoporte.push(patron.objetivoPrecio * (1 - randomNumber(0.05, 0.3, 2)))
    }

    for (let i = 0; i < randomNumber(2, 4); i++) {
      zonasResistencia.push(patron.objetivoPrecio * (1 + randomNumber(0.05, 0.3, 2)))
    }

    return {
      ...patron,
      subPatrones,
      volumenConfirmacion: randomNumber(0, 10) > 3,
      divergencias,
      nivelFibonacci: nivelesFibonacci,
      zonasSoporte: zonasSoporte.sort((a, b) => a - b).map((n) => Math.round(n * 100) / 100),
      zonasResistencia: zonasResistencia.sort((a, b) => a - b).map((n) => Math.round(n * 100) / 100),
      probabilidadExito: randomNumber(50, 85),
    }
  })
}

// Función para generar análisis histórico completo
function generarAnalisisHistorico(precioBase: number): AnalisisHistorico {
  // Generar estadísticas para diferentes períodos
  const periodos = {
    diario: generarEstadisticaHistorica("diario", precioBase),
    semanal: generarEstadisticaHistorica("semanal", precioBase),
    mensual: generarEstadisticaHistorica("mensual", precioBase),
    trimestral: generarEstadisticaHistorica("trimestral", precioBase),
    anual: generarEstadisticaHistorica("anual", precioBase),
  }

  // Generar análisis estacional
  const estacionalidad = generarAnalisisEstacional(precioBase)

  // Generar análisis de ciclicidad
  const ciclosIdentificados = [
    {
      duracion: "4-5 años",
      descripcion: "Ciclo principal de oferta/demanda global",
      confianza: randomNumber(70, 90),
    },
    {
      duracion: "12-18 meses",
      descripcion: "Ciclo intermedio relacionado con cosechas regionales",
      confianza: randomNumber(65, 85),
    },
    {
      duracion: "3-4 meses",
      descripcion: "Ciclo corto de ajuste de inventarios",
      confianza: randomNumber(60, 80),
    },
  ]

  const fasesCiclo = ["Acumulación", "Expansión", "Distribución", "Contracción"]
  const faseCicloActual = fasesCiclo[randomNumber(0, fasesCiclo.length - 1)]
  const proximaFase = fasesCiclo[(fasesCiclo.indexOf(faseCicloActual) + 1) % fasesCiclo.length]

  // Generar correlaciones
  const mercadosCorrelacionados = [
    {
      mercado: "Café",
      correlacion: randomNumber(-0.8, 0.8, 2),
      descripcion: "Correlación histórica con mercado de café.",
    },
    {
      mercado: "Cacao",
      correlacion: randomNumber(-0.8, 0.8, 2),
      descripcion: "Correlación histórica con mercado de cacao.",
    },
    {
      mercado: "Maíz",
      correlacion: randomNumber(-0.8, 0.8, 2),
      descripcion: "Correlación histórica con mercado de maíz.",
    },
    {
      mercado: "Etanol",
      correlacion: randomNumber(0.3, 0.9, 2),
      descripcion: "Correlación histórica con mercado de etanol.",
    },
  ]

  const commoditiesCorrelacionados = [
    {
      commodity: "Petróleo",
      correlacion: randomNumber(0.3, 0.7, 2),
      descripcion: "Correlación con precios del petróleo por costos de producción y transporte.",
    },
    {
      commodity: "Dólar USD",
      correlacion: randomNumber(-0.7, -0.2, 2),
      descripcion: "Correlación inversa con índice del dólar.",
    },
    {
      commodity: "Índice CRB",
      correlacion: randomNumber(0.4, 0.8, 2),
      descripcion: "Correlación con índice general de commodities.",
    },
  ]

  const factoresEconomicos = [
    {
      factor: "Tasas de interés",
      correlacion: randomNumber(-0.6, -0.1, 2),
      descripcion: "Correlación inversa con tasas de interés globales.",
    },
    {
      factor: "PIB global",
      correlacion: randomNumber(0.2, 0.6, 2),
      descripcion: "Correlación con crecimiento económico global.",
    },
    {
      factor: "Inflación",
      correlacion: randomNumber(0.3, 0.7, 2),
      descripcion: "Correlación con tasas de inflación.",
    },
  ]

  return {
    periodos,
    estacionalidad,
    ciclicidad: {
      ciclosIdentificados,
      faseCicloActual,
      proximaFase,
      tiempoEstimadoProximaFase: `${randomNumber(2, 12)} meses`,
    },
    correlaciones: {
      mercados: mercadosCorrelacionados,
      commodities: commoditiesCorrelacionados,
      factoresEconomicos,
    },
  }
}

// Handler de la API
export async function GET(request: Request) {
  try {
    // Obtener parámetros de la solicitud
    const { searchParams } = new URL(request.url)
    const mercado = searchParams.get("mercado") || "contract11"

    // Generar análisis para el mercado solicitado
    const analisis = generarModeloAnalisis(mercado)

    return NextResponse.json(analisis)
  } catch (error) {
    console.error("Error al generar el análisis:", error)
    return NextResponse.json({ error: "Error al generar el análisis" }, { status: 500 })
  }
}
