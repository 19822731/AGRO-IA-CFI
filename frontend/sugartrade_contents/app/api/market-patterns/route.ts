import { NextResponse } from "next/server"

// Función para generar datos históricos de precios del azúcar (reutilizada de market-data)
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

// Función para calcular promedios mensuales de precios
function calculateMonthlyPriceAverages(priceData) {
  const markets = Object.keys(priceData)
  const monthlyAverages = {}

  markets.forEach((marketId) => {
    const marketData = priceData[marketId]
    monthlyAverages[marketId] = {
      marketInfo: marketData.marketInfo,
      monthlyData: Array(12)
        .fill(0)
        .map(() => ({
          price: 0,
          volume: 0,
          volatility: 0,
          sampleYears: 0,
        })),
    }

    // Acumular datos por mes
    Object.keys(marketData.prices).forEach((year) => {
      marketData.prices[year].forEach((monthData) => {
        const monthIndex = monthData.monthIndex
        const monthlyAvg = monthlyAverages[marketId].monthlyData[monthIndex]

        monthlyAvg.price += monthData.price
        monthlyAvg.volume += monthData.volume
        monthlyAvg.volatility += (monthData.maxPrice - monthData.minPrice) / monthData.price
        monthlyAvg.sampleYears += 1
      })
    })

    // Calcular promedios
    monthlyAverages[marketId].monthlyData.forEach((monthlyAvg) => {
      if (monthlyAvg.sampleYears > 0) {
        monthlyAvg.price = Math.round((monthlyAvg.price / monthlyAvg.sampleYears) * 100) / 100
        monthlyAvg.volume = Math.round(monthlyAvg.volume / monthlyAvg.sampleYears)
        monthlyAvg.volatility = Math.round((monthlyAvg.volatility / monthlyAvg.sampleYears) * 1000) / 1000
      }
    })
  })

  return monthlyAverages
}

// Función para calcular correlaciones entre mercados
function calculateMarketCorrelations(priceData) {
  const markets = Object.keys(priceData)
  const correlations = {}

  // Para cada par de mercados
  for (let i = 0; i < markets.length; i++) {
    const marketId1 = markets[i]
    correlations[marketId1] = {}

    for (let j = 0; j < markets.length; j++) {
      const marketId2 = markets[j]

      if (i === j) {
        correlations[marketId1][marketId2] = 1 // Autocorrelación = 1
        continue
      }

      // Recopilar pares de precios para los mismos meses
      const pricePairs = []

      Object.keys(priceData[marketId1].prices).forEach((year) => {
        if (priceData[marketId2].prices[year]) {
          priceData[marketId1].prices[year].forEach((monthData1, monthIndex) => {
            const monthData2 = priceData[marketId2].prices[year][monthIndex]
            if (monthData2) {
              // Normalizar precios si las monedas son diferentes
              let price1 = monthData1.price
              let price2 = monthData2.price

              // Si el mercado es Argentina (ARS), convertir a USD para comparar
              if (marketId1 === "argentina") {
                // Usar un tipo de cambio aproximado (simplificado)
                const exchangeRate = 15 * Math.pow(1.3, Number.parseInt(year) - 2014)
                price1 = price1 / exchangeRate
              }

              if (marketId2 === "argentina") {
                // Usar un tipo de cambio aproximado (simplificado)
                const exchangeRate = 15 * Math.pow(1.3, Number.parseInt(year) - 2014)
                price2 = price2 / exchangeRate
              }

              pricePairs.push([price1, price2])
            }
          })
        }
      })

      // Calcular correlación si hay suficientes datos
      if (pricePairs.length > 5) {
        // Calcular medias
        const mean1 = pricePairs.reduce((sum, pair) => sum + pair[0], 0) / pricePairs.length
        const mean2 = pricePairs.reduce((sum, pair) => sum + pair[1], 0) / pricePairs.length

        // Calcular covarianza y varianzas
        let covariance = 0
        let variance1 = 0
        let variance2 = 0

        pricePairs.forEach((pair) => {
          const diff1 = pair[0] - mean1
          const diff2 = pair[1] - mean2

          covariance += diff1 * diff2
          variance1 += diff1 * diff1
          variance2 += diff2 * diff2
        })

        // Calcular coeficiente de correlación
        const correlation = covariance / (Math.sqrt(variance1) * Math.sqrt(variance2))

        correlations[marketId1][marketId2] = Math.round(correlation * 1000) / 1000
      } else {
        correlations[marketId1][marketId2] = null
      }
    }
  }

  return correlations
}

// Función para analizar la influencia de los productores en los precios
function analyzeProducerInfluence(priceData, productionData) {
  const markets = Object.keys(priceData)
  const producers = Object.keys(productionData)
  const influence = {}

  markets.forEach((marketId) => {
    influence[marketId] = {}

    producers.forEach((producerId) => {
      // Recopilar datos de precio y producción para los mismos meses
      const dataPairs = []

      Object.keys(priceData[marketId].prices).forEach((year) => {
        if (productionData[producerId].production[year]) {
          priceData[marketId].prices[year].forEach((priceDataPoint, monthIndex) => {
            const productionDataPoint = productionData[producerId].production[year][monthIndex]
            if (productionDataPoint) {
              dataPairs.push({
                price: priceDataPoint.price,
                production: productionDataPoint.production,
                year: Number.parseInt(year),
                month: monthIndex,
              })
            }
          })
        }
      })

      // Calcular correlación si hay suficientes datos
      if (dataPairs.length > 5) {
        // Calcular medias
        const meanPrice = dataPairs.reduce((sum, pair) => sum + pair.price, 0) / dataPairs.length
        const meanProduction = dataPairs.reduce((sum, pair) => sum + pair.production, 0) / dataPairs.length

        // Calcular covarianza y varianzas
        let covariance = 0
        let variancePrice = 0
        let varianceProduction = 0

        dataPairs.forEach((pair) => {
          const diffPrice = pair.price - meanPrice
          const diffProduction = pair.production - meanProduction

          covariance += diffPrice * diffProduction
          variancePrice += diffPrice * diffPrice
          varianceProduction += diffProduction * diffProduction
        })

        // Calcular coeficiente de correlación
        const correlation = covariance / (Math.sqrt(variancePrice) * Math.sqrt(varianceProduction))

        // Calcular impacto estimado (simplificado)
        // Cuánto cambia el precio (%) cuando la producción cambia un 1%
        const priceImpact = (covariance / varianceProduction) * (meanProduction / meanPrice)

        influence[marketId][producerId] = {
          correlation: Math.round(correlation * 1000) / 1000,
          priceImpact: Math.round(priceImpact * 1000) / 1000,
          significance: Math.abs(correlation) > 0.5 ? "high" : Math.abs(correlation) > 0.3 ? "medium" : "low",
        }
      } else {
        influence[marketId][producerId] = {
          correlation: null,
          priceImpact: null,
          significance: "unknown",
        }
      }
    })
  })

  return influence
}

// Función para detectar tendencias a largo plazo
function detectPriceTrends(priceData) {
  const markets = Object.keys(priceData)
  const trends = {}

  markets.forEach((marketId) => {
    trends[marketId] = {
      marketInfo: priceData[marketId].marketInfo,
      longTerm: { slope: 0, significance: "none" },
      seasonal: {},
      volatility: { trend: 0, significance: "none" },
    }

    // Recopilar precios mensuales en orden cronológico
    const priceTimeSeries = []

    const years = Object.keys(priceData[marketId].prices)
      .map(Number)
      .sort((a, b) => a - b)

    years.forEach((year) => {
      priceData[marketId].prices[year].forEach((monthData) => {
        priceTimeSeries.push({
          price: monthData.price,
          year,
          month: monthData.monthIndex,
          globalMonth: (year - years[0]) * 12 + monthData.monthIndex,
          volatility: (monthData.maxPrice - monthData.minPrice) / monthData.price,
        })
      })
    })

    // Ordenar por fecha
    priceTimeSeries.sort((a, b) => a.globalMonth - b.globalMonth)

    if (priceTimeSeries.length > 12) {
      // Calcular tendencia a largo plazo (regresión lineal simple)
      const n = priceTimeSeries.length

      // Normalizar precios para mercados con inflación alta (como Argentina)
      if (marketId === "argentina") {
        // Convertir precios a USD usando un tipo de cambio aproximado
        priceTimeSeries.forEach((data) => {
          const exchangeRate = 15 * Math.pow(1.3, data.year - years[0])
          data.normalizedPrice = data.price / exchangeRate
        })
      } else {
        priceTimeSeries.forEach((data) => {
          data.normalizedPrice = data.price
        })
      }

      // Calcular sumas para regresión lineal
      let sumX = 0
      let sumY = 0
      let sumXY = 0
      let sumX2 = 0

      priceTimeSeries.forEach((data) => {
        sumX += data.globalMonth
        sumY += data.normalizedPrice
        sumXY += data.globalMonth * data.normalizedPrice
        sumX2 += data.globalMonth * data.globalMonth
      })

      // Calcular pendiente (cambio mensual promedio)
      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)

      // Calcular precio promedio para expresar la pendiente como porcentaje
      const avgPrice = sumY / n

      // Pendiente como porcentaje mensual
      const slopePercent = (slope / avgPrice) * 100

      // Pendiente anualizada
      const annualSlopePercent = slopePercent * 12

      trends[marketId].longTerm.slope = Math.round(annualSlopePercent * 100) / 100

      // Determinar significancia
      if (Math.abs(annualSlopePercent) > 10) {
        trends[marketId].longTerm.significance = "high"
      } else if (Math.abs(annualSlopePercent) > 5) {
        trends[marketId].longTerm.significance = "medium"
      } else if (Math.abs(annualSlopePercent) > 2) {
        trends[marketId].longTerm.significance = "low"
      } else {
        trends[marketId].longTerm.significance = "none"
      }

      // Analizar estacionalidad (patrones mensuales)
      const monthlyPrices = Array(12)
        .fill(0)
        .map(() => [])

      priceTimeSeries.forEach((data) => {
        monthlyPrices[data.month].push(data.normalizedPrice)
      })

      // Calcular promedios mensuales
      const monthlyAvgs = monthlyPrices.map((prices) => {
        if (prices.length > 0) {
          return prices.reduce((sum, price) => sum + price, 0) / prices.length
        }
        return null
      })

      // Calcular promedio anual
      const validAvgs = monthlyAvgs.filter((avg) => avg !== null)
      const yearlyAvg = validAvgs.reduce((sum, avg) => sum + avg, 0) / validAvgs.length

      // Calcular índices estacionales
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

      months.forEach((month, index) => {
        if (monthlyAvgs[index] !== null) {
          const seasonalIndex = monthlyAvgs[index] / yearlyAvg - 1
          trends[marketId].seasonal[month] = {
            index: Math.round(seasonalIndex * 1000) / 1000,
            significance:
              Math.abs(seasonalIndex) > 0.1
                ? "high"
                : Math.abs(seasonalIndex) > 0.05
                  ? "medium"
                  : Math.abs(seasonalIndex) > 0.02
                    ? "low"
                    : "none",
          }
        }
      })

      // Analizar tendencia de volatilidad
      const volatilityTimeSeries = priceTimeSeries.map((data) => data.volatility)

      if (volatilityTimeSeries.length > 12) {
        // Calcular sumas para regresión lineal de volatilidad
        let sumX = 0
        let sumY = 0
        let sumXY = 0
        let sumX2 = 0

        priceTimeSeries.forEach((data, index) => {
          sumX += index
          sumY += data.volatility
          sumXY += index * data.volatility
          sumX2 += index * index
        })

        // Calcular pendiente (cambio mensual promedio en volatilidad)
        const volatilitySlope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)

        // Calcular volatilidad promedio
        const avgVolatility = sumY / n

        // Pendiente como porcentaje mensual
        const volatilitySlopePercent = (volatilitySlope / avgVolatility) * 100

        // Pendiente anualizada
        const annualVolatilitySlopePercent = volatilitySlopePercent * 12

        trends[marketId].volatility.trend = Math.round(annualVolatilitySlopePercent * 100) / 100

        // Determinar significancia
        if (Math.abs(annualVolatilitySlopePercent) > 15) {
          trends[marketId].volatility.significance = "high"
        } else if (Math.abs(annualVolatilitySlopePercent) > 8) {
          trends[marketId].volatility.significance = "medium"
        } else if (Math.abs(annualVolatilitySlopePercent) > 3) {
          trends[marketId].volatility.significance = "low"
        } else {
          trends[marketId].volatility.significance = "none"
        }
      }
    }
  })

  return trends
}

// Función para generar predicciones de precios
function generatePricePredictions(priceData, trends) {
  const markets = Object.keys(priceData)
  const predictions = {}

  markets.forEach((marketId) => {
    predictions[marketId] = {
      marketInfo: priceData[marketId].marketInfo,
      shortTerm: [], // Próximos 6 meses
      longTerm: [], // Próximos 24 meses
    }

    // Obtener datos históricos recientes
    const years = Object.keys(priceData[marketId].prices)
      .map(Number)
      .sort((a, b) => a - b)
    const lastYear = years[years.length - 1]
    const lastYearData = priceData[marketId].prices[lastYear]

    // Obtener último precio conocido
    const lastMonthData = lastYearData[lastYearData.length - 1]
    const lastPrice = lastMonthData.price
    const lastMonth = lastMonthData.monthIndex

    // Obtener tendencia a largo plazo
    const longTermTrend = trends[marketId].longTerm.slope / 100 / 12 // Convertir a cambio mensual decimal

    // Generar predicciones
    for (let i = 1; i <= 24; i++) {
      // Calcular mes y año de la predicción
      const predictionMonth = (lastMonth + i) % 12
      const predictionYear = lastYear + Math.floor((lastMonth + i) / 12)

      // Obtener factor estacional para este mes
      const monthName = [
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
      ][predictionMonth]

      const seasonalFactor = trends[marketId].seasonal[monthName] ? trends[marketId].seasonal[monthName].index : 0

      // Calcular precio predicho
      let predictedPrice = lastPrice * Math.pow(1 + longTermTrend, i) * (1 + seasonalFactor)

      // Añadir componente cíclico (simplificado)
      const cyclicalFactor = 0.05 * Math.sin((2 * Math.PI * i) / 36) // Ciclo de 3 años
      predictedPrice *= 1 + cyclicalFactor

      // Añadir incertidumbre (aumenta con el horizonte de predicción)
      const uncertaintyRange = 0.02 * Math.sqrt(i) // Aumenta con la raíz cuadrada del tiempo

      // Redondear precio
      predictedPrice = Math.round(predictedPrice * 100) / 100

      // Crear objeto de predicción
      const prediction = {
        month: monthName,
        monthIndex: predictionMonth,
        year: predictionYear,
        price: predictedPrice,
        lowerBound: Math.round(predictedPrice * (1 - uncertaintyRange) * 100) / 100,
        upperBound: Math.round(predictedPrice * (1 + uncertaintyRange) * 100) / 100,
        confidence: i <= 6 ? "high" : i <= 12 ? "medium" : "low",
      }

      // Añadir a la lista correspondiente
      if (i <= 6) {
        predictions[marketId].shortTerm.push(prediction)
      }

      predictions[marketId].longTerm.push(prediction)
    }
  })

  return predictions
}

// Función para generar recomendaciones comerciales
function generateTradingRecommendations(priceData, predictions, trends) {
  const markets = Object.keys(priceData)
  const recommendations = {}

  markets.forEach((marketId) => {
    recommendations[marketId] = {
      marketInfo: priceData[marketId].marketInfo,
      shortTerm: {
        action: "hold",
        confidence: "medium",
        reasoning: [],
      },
      longTerm: {
        action: "hold",
        confidence: "low",
        reasoning: [],
      },
      seasonalOpportunities: [],
      riskFactors: [],
    }

    // Analizar predicciones a corto plazo
    if (predictions[marketId].shortTerm.length > 0) {
      const lastKnownPrice =
        predictions[marketId].shortTerm[0].price /
        (1 + trends[marketId].seasonal[predictions[marketId].shortTerm[0].month].index)
      const shortTermPredictions = predictions[marketId].shortTerm
      const lastPrediction = shortTermPredictions[shortTermPredictions.length - 1]

      // Calcular cambio porcentual esperado
      const expectedChange = (lastPrediction.price / lastKnownPrice - 1) * 100

      // Determinar acción recomendada a corto plazo
      if (expectedChange > 5) {
        recommendations[marketId].shortTerm.action = "buy"
        recommendations[marketId].shortTerm.reasoning.push(
          `Se espera un aumento de precio del ${Math.round(expectedChange)}% en los próximos 6 meses.`,
        )
      } else if (expectedChange < -5) {
        recommendations[marketId].shortTerm.action = "sell"
        recommendations[marketId].shortTerm.reasoning.push(
          `Se espera una caída de precio del ${Math.round(Math.abs(expectedChange))}% en los próximos 6 meses.`,
        )
      } else {
        recommendations[marketId].shortTerm.reasoning.push(
          `Se espera estabilidad de precios (${Math.round(expectedChange)}%) en los próximos 6 meses.`,
        )
      }

      // Añadir razonamiento basado en tendencias
      if (trends[marketId].longTerm.significance !== "none") {
        const trendDirection = trends[marketId].longTerm.slope > 0 ? "alcista" : "bajista"
        const trendStrength =
          trends[marketId].longTerm.significance === "high"
            ? "fuerte"
            : trends[marketId].longTerm.significance === "medium"
              ? "moderada"
              : "leve"

        recommendations[marketId].shortTerm.reasoning.push(
          `Tendencia a largo plazo ${trendDirection} ${trendStrength} (${trends[marketId].longTerm.slope}% anual).`,
        )
      }
    }

    // Analizar predicciones a largo plazo
    if (predictions[marketId].longTerm.length > 0) {
      const lastKnownPrice =
        predictions[marketId].longTerm[0].price /
        (1 + trends[marketId].seasonal[predictions[marketId].longTerm[0].month].index)
      const longTermPredictions = predictions[marketId].longTerm
      const lastPrediction = longTermPredictions[longTermPredictions.length - 1]

      // Calcular cambio porcentual esperado
      const expectedChange = (lastPrediction.price / lastKnownPrice - 1) * 100

      // Determinar acción recomendada a largo plazo
      if (expectedChange > 15) {
        recommendations[marketId].longTerm.action = "buy"
        recommendations[marketId].longTerm.reasoning.push(
          `Se espera un aumento de precio del ${Math.round(expectedChange)}% en los próximos 2 años.`,
        )
      } else if (expectedChange < -15) {
        recommendations[marketId].longTerm.action = "sell"
        recommendations[marketId].longTerm.reasoning.push(
          `Se espera una caída de precio del ${Math.round(Math.abs(expectedChange))}% en los próximos 2 años.`,
        )
      } else {
        recommendations[marketId].longTerm.reasoning.push(
          `Se espera relativa estabilidad de precios (${Math.round(expectedChange)}%) en los próximos 2 años.`,
        )
      }

      // Añadir razonamiento basado en volatilidad
      if (trends[marketId].volatility.significance !== "none") {
        const volatilityDirection = trends[marketId].volatility.trend > 0 ? "aumento" : "disminución"
        const volatilityStrength =
          trends[marketId].volatility.significance === "high"
            ? "significativo"
            : trends[marketId].volatility.significance === "medium"
              ? "moderado"
              : "leve"

        recommendations[marketId].longTerm.reasoning.push(
          `${volatilityDirection} ${volatilityStrength} de la volatilidad (${trends[marketId].volatility.trend}% anual).`,
        )
      }
    }

    // Identificar oportunidades estacionales
    Object.entries(trends[marketId].seasonal).forEach(([month, data]) => {
      if (data.significance === "high" || data.significance === "medium") {
        const opportunity = {
          month,
          effect: data.index > 0 ? "alza" : "baja",
          magnitude: `${Math.round(Math.abs(data.index) * 100)}%`,
          action: data.index > 0 ? "vender" : "comprar",
          confidence: data.significance === "high" ? "alta" : "media",
        }

        recommendations[marketId].seasonalOpportunities.push(opportunity)
      }
    })

    // Ordenar oportunidades estacionales por magnitud
    recommendations[marketId].seasonalOpportunities.sort((a, b) => {
      return Number.parseFloat(b.magnitude) - Number.parseFloat(a.magnitude)
    })

    // Identificar factores de riesgo
    if (trends[marketId].volatility.significance === "high" && trends[marketId].volatility.trend > 0) {
      recommendations[marketId].riskFactors.push({
        factor: "Aumento de volatilidad",
        impact: "Mayor riesgo de movimientos bruscos de precios",
        mitigation: "Considerar estrategias de cobertura o reducir exposición",
      })
    }

    if (Math.abs(trends[marketId].longTerm.slope) > 10 && trends[marketId].longTerm.significance === "high") {
      const direction = trends[marketId].longTerm.slope > 0 ? "alcista" : "bajista"
      recommendations[marketId].riskFactors.push({
        factor: `Tendencia ${direction} pronunciada`,
        impact: `Riesgo de corrección o reversión de tendencia`,
        mitigation: "Implementar stops de protección y toma de beneficios parciales",
      })
    }

    // Añadir riesgo específico para Argentina
    if (marketId === "argentina") {
      recommendations[marketId].riskFactors.push({
        factor: "Inestabilidad macroeconómica",
        impact: "Riesgo de devaluaciones bruscas y cambios regulatorios",
        mitigation: "Diversificar exposición a diferentes mercados y monedas",
      })
    }
  })

  return recommendations
}

export async function GET(request: Request) {
  try {
    // Obtener parámetros de la solicitud
    const { searchParams } = new URL(request.url)
    const market = searchParams.get("market") || "all"

    // Generar datos de mercado
    const marketData = generateSugarPriceData()

    // Calcular patrones de mercado
    const monthlyPriceAverages = calculateMonthlyPriceAverages(marketData.priceData)
    const marketCorrelations = calculateMarketCorrelations(marketData.priceData)
    const producerInfluence = analyzeProducerInfluence(marketData.priceData, marketData.productionData)
    const priceTrends = detectPriceTrends(marketData.priceData)
    const pricePredictions = generatePricePredictions(marketData.priceData, priceTrends)
    const tradingRecommendations = generateTradingRecommendations(marketData.priceData, pricePredictions, priceTrends)

    // Preparar respuesta
    const response = {
      monthlyPriceAverages,
      marketCorrelations,
      producerInfluence,
      priceTrends,
      pricePredictions,
      tradingRecommendations,
    }

    // Filtrar por mercado si es necesario
    if (market !== "all") {
      Object.keys(response).forEach((key) => {
        if (response[key][market]) {
          response[key] = { [market]: response[key][market] }
        } else {
          response[key] = {}
        }
      })
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error al generar patrones de mercado:", error)
    return NextResponse.json({ error: "Error al generar patrones de mercado" }, { status: 500 })
  }
}
