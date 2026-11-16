import { NextResponse } from "next/server"

// Función para generar datos históricos de precios del azúcar
function generateSugarPriceData() {
  // Mercados a simular
  const markets = {
    contract5: { name: "Contrato #5 (Londres)", currency: "USD", unit: "ton" },
    contract11: { name: "Contrato #11 (Nueva York)", currency: "USD", unit: "ton" },
    argentina: { name: "Mercado Interno Argentina", currency: "ARS", unit: "ton" },
    chile: { name: "Mercado Chile", currency: "USD", unit: "ton" },
    peru: { name: "Mercado Perú", currency: "USD", unit: "ton" },
  }

  // Países productores principales
  const producers = {
    brazil: { name: "Brasil", share: 0.22 },
    india: { name: "India", share: 0.15 },
    eu: { name: "Unión Europea", share: 0.1 },
    thailand: { name: "Tailandia", share: 0.08 },
    china: { name: "China", share: 0.07 },
    usa: { name: "Estados Unidos", share: 0.05 },
    mexico: { name: "México", share: 0.04 },
    russia: { name: "Rusia", share: 0.04 },
    pakistan: { name: "Pakistán", share: 0.03 },
    argentina: { name: "Argentina", share: 0.02 },
    others: { name: "Otros", share: 0.2 },
  }

  // Años para los que generaremos datos
  const years = Array.from({ length: 10 }, (_, i) => 2014 + i)

  // Meses del año
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  // Datos de precios por mercado, año y mes
  const priceData = {}

  // Datos de producción por país, año y mes
  const productionData = {}

  // Datos macroeconómicos
  const macroData = {}

  // Generar precios base para cada mercado
  const basePrice = {
    contract5: 400, // USD por tonelada
    contract11: 350, // USD por tonelada
    argentina: 35000, // ARS por tonelada
    chile: 420, // USD por tonelada
    peru: 430, // USD por tonelada
  }

  // Generar datos de precios
  Object.keys(markets).forEach((marketId) => {
    priceData[marketId] = {
      marketInfo: markets[marketId],
      prices: {},
    }

    // Tendencia a largo plazo (ligero aumento)
    const longTermTrend = 0.02 // 2% anual

    // Ciclo de 3 años (36 meses)
    const cyclePeriod = 36
    const cycleAmplitude = 0.15 // 15% de variación

    // Estacionalidad anual
    const seasonalAmplitude = 0.08 // 8% de variación estacional

    years.forEach((year) => {
      priceData[marketId].prices[year] = []

      months.forEach((month, monthIndex) => {
        // Calcular el índice global del mes (para ciclos y tendencias)
        const globalMonthIndex = (year - 2014) * 12 + monthIndex

        // Componente de tendencia
        const trendComponent = Math.pow(1 + longTermTrend, globalMonthIndex / 12)

        // Componente cíclico
        const cycleComponent = 1 + cycleAmplitude * Math.sin((2 * Math.PI * globalMonthIndex) / cyclePeriod)

        // Componente estacional
        const seasonalComponent = 1 + seasonalAmplitude * Math.sin((2 * Math.PI * monthIndex) / 12)

        // Componente aleatorio (ruido)
        const randomComponent = 1 + (Math.random() - 0.5) * 0.05

        // Precio base para este mercado
        const marketBasePrice = basePrice[marketId]

        // Calcular precio final
        let price = marketBasePrice * trendComponent * cycleComponent * seasonalComponent * randomComponent

        // Añadir efectos específicos por mercado
        if (marketId === "argentina") {
          // Inflación argentina (simulada)
          const inflationEffect = Math.pow(1.25, year - 2014) // 25% inflación anual
          price *= inflationEffect

          // Efecto de devaluación en picos
          if (Math.random() < 0.05) {
            // 5% de probabilidad de devaluación fuerte
            price *= 1.2
          }
        }

        // Eventos de mercado aleatorios (shocks)
        if (Math.random() < 0.03) {
          // 3% de probabilidad de evento de mercado
          const eventMagnitude = 1 + Math.random() * 0.2 // Hasta 20% de impacto
          price *= Math.random() < 0.5 ? eventMagnitude : 1 / eventMagnitude // Positivo o negativo
        }

        // Redondear precio
        price = Math.round(price * 100) / 100

        // Volumen de transacciones (simulado)
        const volume = Math.round(10000 + Math.random() * 5000)

        // Variación diaria promedio (simulada)
        const dailyVariation = (Math.random() * 2 - 1) * 0.5 // Entre -0.5% y +0.5%

        // Precio de apertura y cierre (simulados)
        const openPrice = price * (1 - dailyVariation / 100)
        const closePrice = price * (1 + dailyVariation / 100)

        // Precio máximo y mínimo (simulados)
        const maxPrice = price * (1 + Math.random() * 0.02)
        const minPrice = price * (1 - Math.random() * 0.02)

        priceData[marketId].prices[year].push({
          month,
          monthIndex,
          price,
          openPrice: Math.round(openPrice * 100) / 100,
          closePrice: Math.round(closePrice * 100) / 100,
          maxPrice: Math.round(maxPrice * 100) / 100,
          minPrice: Math.round(minPrice * 100) / 100,
          volume,
          events: [],
        })
      })
    })
  })

  // Generar datos de producción
  Object.keys(producers).forEach((producerId) => {
    productionData[producerId] = {
      producerInfo: producers[producerId],
      production: {},
    }

    // Producción mundial base (millones de toneladas)
    const worldBaseProduction = 170

    // Participación de mercado de este productor
    const marketShare = producers[producerId].share

    years.forEach((year) => {
      productionData[producerId].production[year] = []

      // Tendencia de producción (aumento gradual)
      const productionTrend = 1 + (year - 2014) * 0.01

      // Producción anual base para este productor
      const annualBaseProduction = worldBaseProduction * marketShare * productionTrend

      // Variación anual aleatoria
      const annualRandomFactor = 1 + (Math.random() - 0.5) * 0.1

      // Producción anual final
      const annualProduction = annualBaseProduction * annualRandomFactor

      months.forEach((month, monthIndex) => {
        // La producción varía según la temporada de cosecha (diferente para cada país)
        let seasonalFactor = 1

        // Simular temporadas de cosecha diferentes por país
        if (producerId === "brazil") {
          // Brasil: cosecha de abril a noviembre
          seasonalFactor = monthIndex >= 3 && monthIndex <= 10 ? 1.5 : 0.5
        } else if (producerId === "india") {
          // India: cosecha de octubre a abril
          seasonalFactor = monthIndex >= 9 || monthIndex <= 3 ? 1.5 : 0.5
        } else if (producerId === "argentina") {
          // Argentina: cosecha de mayo a octubre
          seasonalFactor = monthIndex >= 4 && monthIndex <= 9 ? 1.5 : 0.5
        } else {
          // Otros países: patrón genérico
          seasonalFactor = 1 + 0.5 * Math.sin((2 * Math.PI * (monthIndex + 3)) / 12)
        }

        // Producción mensual
        const monthlyProduction = (annualProduction / 12) * seasonalFactor

        // Eventos climáticos aleatorios que afectan la producción
        let climateEvent = null
        if (Math.random() < 0.05) {
          // 5% de probabilidad de evento climático
          const eventTypes = ["drought", "flood", "frost", "optimal"]
          const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
          let impact = 1

          if (eventType === "drought") {
            impact = 1 - Math.random() * 0.2 // Reducción de hasta 20%
          } else if (eventType === "flood") {
            impact = 1 - Math.random() * 0.15 // Reducción de hasta 15%
          } else if (eventType === "frost") {
            impact = 1 - Math.random() * 0.1 // Reducción de hasta 10%
          } else if (eventType === "optimal") {
            impact = 1 + Math.random() * 0.1 // Aumento de hasta 10%
          }

          climateEvent = {
            type: eventType,
            impact: impact,
          }
        }

        // Aplicar impacto del evento climático si existe
        const finalMonthlyProduction = climateEvent ? monthlyProduction * climateEvent.impact : monthlyProduction

        productionData[producerId].production[year].push({
          month,
          monthIndex,
          production: Math.round(finalMonthlyProduction * 100) / 100,
          climateEvent,
        })
      })
    })
  })

  // Generar datos macroeconómicos
  const countries = ["global", "argentina", "brazil", "chile", "peru", "usa", "eu", "china", "india"]

  countries.forEach((country) => {
    macroData[country] = {
      gdp: {},
      inflation: {},
      interestRate: {},
      exchangeRate: {},
    }

    years.forEach((year) => {
      // PIB base (en miles de millones de USD)
      let baseGDP = 0
      switch (country) {
        case "global":
          baseGDP = 80000
          break
        case "usa":
          baseGDP = 20000
          break
        case "china":
          baseGDP = 14000
          break
        case "eu":
          baseGDP = 18000
          break
        case "india":
          baseGDP = 2800
          break
        case "brazil":
          baseGDP = 1800
          break
        case "argentina":
          baseGDP = 450
          break
        case "chile":
          baseGDP = 280
          break
        case "peru":
          baseGDP = 220
          break
        default:
          baseGDP = 1000
      }

      // Crecimiento anual del PIB
      let gdpGrowth = 0
      switch (country) {
        case "global":
          gdpGrowth = 0.03
          break
        case "china":
          gdpGrowth = 0.06
          break
        case "india":
          gdpGrowth = 0.07
          break
        case "usa":
          gdpGrowth = 0.025
          break
        case "eu":
          gdpGrowth = 0.015
          break
        case "brazil":
          gdpGrowth = 0.02
          break
        case "chile":
          gdpGrowth = 0.03
          break
        case "peru":
          gdpGrowth = 0.035
          break
        case "argentina":
          gdpGrowth = 0.01
          break
        default:
          gdpGrowth = 0.025
      }

      // Inflación base
      let baseInflation = 0
      switch (country) {
        case "global":
          baseInflation = 0.03
          break
        case "argentina":
          baseInflation = 0.25
          break
        case "brazil":
          baseInflation = 0.06
          break
        case "chile":
          baseInflation = 0.04
          break
        case "peru":
          baseInflation = 0.035
          break
        case "usa":
          baseInflation = 0.02
          break
        case "eu":
          baseInflation = 0.015
          break
        case "china":
          baseInflation = 0.025
          break
        case "india":
          baseInflation = 0.05
          break
        default:
          baseInflation = 0.03
      }

      // Tasa de interés base
      let baseInterestRate = 0
      switch (country) {
        case "global":
          baseInterestRate = 0.03
          break
        case "argentina":
          baseInterestRate = 0.35
          break
        case "brazil":
          baseInterestRate = 0.08
          break
        case "chile":
          baseInterestRate = 0.05
          break
        case "peru":
          baseInterestRate = 0.045
          break
        case "usa":
          baseInterestRate = 0.025
          break
        case "eu":
          baseInterestRate = 0.01
          break
        case "china":
          baseInterestRate = 0.035
          break
        case "india":
          baseInterestRate = 0.06
          break
        default:
          baseInterestRate = 0.04
      }

      // Tipo de cambio base (respecto al USD)
      let baseExchangeRate = 0
      switch (country) {
        case "global":
          baseExchangeRate = 1
          break
        case "argentina":
          baseExchangeRate = 15
          break // ARS/USD en 2014
        case "brazil":
          baseExchangeRate = 2.3
          break // BRL/USD en 2014
        case "chile":
          baseExchangeRate = 550
          break // CLP/USD en 2014
        case "peru":
          baseExchangeRate = 2.8
          break // PEN/USD en 2014
        case "usa":
          baseExchangeRate = 1
          break
        case "eu":
          baseExchangeRate = 0.75
          break // EUR/USD en 2014
        case "china":
          baseExchangeRate = 6.2
          break // CNY/USD en 2014
        case "india":
          baseExchangeRate = 60
          break // INR/USD en 2014
        default:
          baseExchangeRate = 1
      }

      // Calcular valores para este año
      const yearsSince2014 = year - 2014

      // PIB con crecimiento compuesto
      const gdp = baseGDP * Math.pow(1 + gdpGrowth, yearsSince2014)

      // Inflación con variación aleatoria
      const inflation = baseInflation * (1 + (Math.random() - 0.5) * 0.2)

      // Tasa de interés (correlacionada con inflación)
      const interestRate = baseInterestRate * (1 + (inflation - baseInflation))

      // Tipo de cambio con tendencia y eventos aleatorios
      let exchangeRate = baseExchangeRate

      // Aplicar tendencia de devaluación/apreciación
      if (country === "argentina") {
        // Argentina: fuerte devaluación
        exchangeRate = baseExchangeRate * Math.pow(1.3, yearsSince2014)

        // Eventos de devaluación brusca
        if (year >= 2018 && year <= 2019) {
          exchangeRate *= 2 // Simular crisis cambiaria 2018-2019
        }
        if (year >= 2023) {
          exchangeRate *= 1.5 // Simular devaluación reciente
        }
      } else if (country === "brazil") {
        // Brasil: devaluación moderada
        exchangeRate = baseExchangeRate * Math.pow(1.1, yearsSince2014)
      } else if (country === "eu") {
        // Euro: ligera apreciación
        exchangeRate = baseExchangeRate * Math.pow(0.99, yearsSince2014)
      } else if (country !== "usa" && country !== "global") {
        // Otros países: devaluación leve
        exchangeRate = baseExchangeRate * Math.pow(1.05, yearsSince2014)
      }

      // Añadir variación aleatoria al tipo de cambio
      exchangeRate *= 1 + (Math.random() - 0.5) * 0.05

      // Guardar datos macroeconómicos para este país y año
      macroData[country].gdp[year] = Math.round(gdp * 10) / 10
      macroData[country].inflation[year] = Math.round(inflation * 1000) / 1000
      macroData[country].interestRate[year] = Math.round(interestRate * 1000) / 1000
      macroData[country].exchangeRate[year] = Math.round(exchangeRate * 100) / 100
    })
  })

  // Añadir eventos importantes de mercado
  const marketEvents = [
    {
      year: 2015,
      month: 7, // Agosto
      description: "Fin de cuotas de producción en la UE",
      impact: "Aumento de producción europea",
      markets: ["contract5", "contract11"],
      priceEffect: -0.08, // -8%
    },
    {
      year: 2016,
      month: 5, // Junio
      description: "Sequía severa en Brasil",
      impact: "Reducción de producción brasileña",
      markets: ["contract5", "contract11"],
      priceEffect: 0.12, // +12%
    },
    {
      year: 2017,
      month: 2, // Marzo
      description: "Aumento de aranceles en China",
      impact: "Reducción de importaciones chinas",
      markets: ["contract5", "contract11"],
      priceEffect: -0.05, // -5%
    },
    {
      year: 2018,
      month: 9, // Octubre
      description: "Crisis cambiaria en Argentina",
      impact: "Aumento de exportaciones argentinas",
      markets: ["argentina", "chile", "peru"],
      priceEffect: -0.15, // -15%
    },
    {
      year: 2020,
      month: 2, // Marzo
      description: "Inicio pandemia COVID-19",
      impact: "Disrupción de cadenas de suministro",
      markets: ["contract5", "contract11", "argentina", "chile", "peru"],
      priceEffect: -0.1, // -10%
    },
    {
      year: 2021,
      month: 5, // Junio
      description: "Recuperación post-pandemia",
      impact: "Aumento de demanda global",
      markets: ["contract5", "contract11", "argentina", "chile", "peru"],
      priceEffect: 0.15, // +15%
    },
    {
      year: 2022,
      month: 1, // Febrero
      description: "Conflicto Rusia-Ucrania",
      impact: "Aumento de costos energéticos",
      markets: ["contract5", "contract11"],
      priceEffect: 0.08, // +8%
    },
    {
      year: 2023,
      month: 7, // Agosto
      description: "Devaluación del peso argentino",
      impact: "Aumento de competitividad exportadora",
      markets: ["argentina"],
      priceEffect: -0.2, // -20% en moneda local
    },
  ]

  // Aplicar eventos de mercado a los precios
  marketEvents.forEach((event) => {
    event.markets.forEach((marketId) => {
      if (
        priceData[marketId] &&
        priceData[marketId].prices[event.year] &&
        priceData[marketId].prices[event.year][event.month]
      ) {
        const monthData = priceData[marketId].prices[event.year][event.month]

        // Aplicar efecto al precio
        monthData.price = monthData.price * (1 + event.priceEffect)
        monthData.openPrice = monthData.openPrice * (1 + event.priceEffect)
        monthData.closePrice = monthData.closePrice * (1 + event.priceEffect)
        monthData.maxPrice = monthData.maxPrice * (1 + event.priceEffect)
        monthData.minPrice = monthData.minPrice * (1 + event.priceEffect)

        // Registrar el evento
        monthData.events.push({
          description: event.description,
          impact: event.impact,
          priceEffect: event.priceEffect,
        })
      }
    })
  })

  return {
    priceData,
    productionData,
    macroData,
    marketEvents,
  }
}

export async function GET(request: Request) {
  try {
    // Obtener parámetros de la solicitud
    const { searchParams } = new URL(request.url)
    const market = searchParams.get("market") || "all"
    const year = searchParams.get("year") || "all"
    const dataType = searchParams.get("dataType") || "all"

    // Generar datos de mercado
    const marketData = generateSugarPriceData()

    // Filtrar datos según los parámetros
    let responseData = { ...marketData }

    // Filtrar por tipo de datos
    if (dataType !== "all") {
      const filteredData = {}
      filteredData[dataType] = marketData[dataType]
      responseData = filteredData
    }

    // Filtrar por mercado si es aplicable y estamos solicitando datos de precios
    if (market !== "all" && responseData.priceData) {
      responseData.priceData = { [market]: responseData.priceData[market] }
    }

    // Filtrar por año si es aplicable
    if (year !== "all" && !isNaN(Number.parseInt(year))) {
      const yearInt = Number.parseInt(year)

      // Filtrar precios por año
      if (responseData.priceData) {
        Object.keys(responseData.priceData).forEach((marketId) => {
          if (responseData.priceData[marketId].prices[yearInt]) {
            responseData.priceData[marketId].prices = { [yearInt]: responseData.priceData[marketId].prices[yearInt] }
          } else {
            responseData.priceData[marketId].prices = {}
          }
        })
      }

      // Filtrar producción por año
      if (responseData.productionData) {
        Object.keys(responseData.productionData).forEach((producerId) => {
          if (responseData.productionData[producerId].production[yearInt]) {
            responseData.productionData[producerId].production = {
              [yearInt]: responseData.productionData[producerId].production[yearInt],
            }
          } else {
            responseData.productionData[producerId].production = {}
          }
        })
      }

      // Filtrar datos macroeconómicos por año
      if (responseData.macroData) {
        Object.keys(responseData.macroData).forEach((countryId) => {
          Object.keys(responseData.macroData[countryId]).forEach((indicatorId) => {
            if (responseData.macroData[countryId][indicatorId][yearInt]) {
              responseData.macroData[countryId][indicatorId] = {
                [yearInt]: responseData.macroData[countryId][indicatorId][yearInt],
              }
            } else {
              responseData.macroData[countryId][indicatorId] = {}
            }
          })
        })
      }
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Error al generar datos de mercado:", error)
    return NextResponse.json({ error: "Error al generar datos de mercado" }, { status: 500 })
  }
}
