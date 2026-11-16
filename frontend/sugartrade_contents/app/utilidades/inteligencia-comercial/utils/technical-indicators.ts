// Función para calcular la Media Móvil Simple (SMA)
export function calculateSMA(data: any[], field: string, period: number): any[] {
  const result = [...data]
  const fieldKey = `sma${period}`

  for (let i = 0; i < result.length; i++) {
    if (i < period - 1) {
      result[i][fieldKey] = null
      continue
    }

    let sum = 0
    for (let j = 0; j < period; j++) {
      sum += data[i - j][field]
    }

    result[i][fieldKey] = Number.parseFloat((sum / period).toFixed(2))
  }

  return result
}

// Función para calcular la Media Móvil Exponencial (EMA)
export function calculateEMA(data: any[], field: string, period: number): any[] {
  const result = [...data]
  const fieldKey = `ema${period}`
  const multiplier = 2 / (period + 1)

  // Calcular el primer EMA (igual que SMA para el primer punto)
  let sum = 0
  for (let i = 0; i < period; i++) {
    sum += data[i][field]
  }
  const firstEMA = sum / period

  // Asignar valores nulos para los primeros puntos
  for (let i = 0; i < period - 1; i++) {
    result[i][fieldKey] = null
  }

  // Asignar el primer EMA
  result[period - 1][fieldKey] = firstEMA

  // Calcular el resto de EMAs
  for (let i = period; i < result.length; i++) {
    const currentPrice = data[i][field]
    const previousEMA = result[i - 1][fieldKey]

    result[i][fieldKey] = Number.parseFloat((currentPrice * multiplier + previousEMA * (1 - multiplier)).toFixed(2))
  }

  return result
}

// Función para calcular el RSI (Relative Strength Index)
export function calculateRSI(data: any[], field: string, period: number): any[] {
  const result = [...data]
  const fieldKey = "rsi"

  // Calcular ganancias y pérdidas
  for (let i = 1; i < result.length; i++) {
    const change = data[i][field] - data[i - 1][field]
    result[i].gain = change > 0 ? change : 0
    result[i].loss = change < 0 ? Math.abs(change) : 0
  }

  // Calcular RS y RSI
  for (let i = 0; i < result.length; i++) {
    if (i < period) {
      result[i][fieldKey] = null
      continue
    }

    let avgGain = 0
    let avgLoss = 0

    // Primer cálculo (promedio simple)
    if (i === period) {
      for (let j = 1; j <= period; j++) {
        avgGain += result[i - period + j].gain
        avgLoss += result[i - period + j].loss
      }

      avgGain /= period
      avgLoss /= period
    }
    // Cálculos subsiguientes (suavizado)
    else {
      avgGain = (result[i - 1].avgGain * (period - 1) + result[i].gain) / period
      avgLoss = (result[i - 1].avgLoss * (period - 1) + result[i].loss) / period
    }

    result[i].avgGain = avgGain
    result[i].avgLoss = avgLoss

    // Evitar división por cero
    if (avgLoss === 0) {
      result[i][fieldKey] = 100
    } else {
      const rs = avgGain / avgLoss
      result[i][fieldKey] = Number.parseFloat((100 - 100 / (1 + rs)).toFixed(2))
    }
  }

  return result
}

// Función para calcular MACD (Moving Average Convergence Divergence)
export function calculateMACD(data: any[], field: string, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9): any[] {
  // Calcular EMA rápida y lenta
  let result = calculateEMA(data, field, fastPeriod)
  result = calculateEMA(result, field, slowPeriod)

  // Calcular línea MACD (diferencia entre EMA rápida y lenta)
  for (let i = 0; i < result.length; i++) {
    const fastEMA = result[i][`ema${fastPeriod}`]
    const slowEMA = result[i][`ema${slowPeriod}`]

    if (fastEMA !== null && slowEMA !== null) {
      result[i].macdLine = Number.parseFloat((fastEMA - slowEMA).toFixed(2))
    } else {
      result[i].macdLine = null
    }
  }

  // Calcular línea de señal (EMA de la línea MACD)
  let signalLineData = []
  for (let i = 0; i < result.length; i++) {
    if (result[i].macdLine !== null) {
      signalLineData.push({
        ...result[i],
        price: result[i].macdLine,
      })
    }
  }

  signalLineData = calculateEMA(signalLineData, "price", signalPeriod)

  // Combinar datos
  let signalIndex = 0
  for (let i = 0; i < result.length; i++) {
    if (result[i].macdLine !== null) {
      result[i].signalLine = signalLineData[signalIndex][`ema${signalPeriod}`]
      result[i].histogram = Number.parseFloat((result[i].macdLine - result[i].signalLine).toFixed(2))
      signalIndex++
    } else {
      result[i].signalLine = null
      result[i].histogram = null
    }
  }

  return result
}

// Función para calcular Bandas de Bollinger
export function calculateBollingerBands(data: any[], field: string, period = 20, stdDev = 2): any[] {
  // Calcular SMA
  const result = calculateSMA(data, field, period)

  // Calcular bandas
  for (let i = 0; i < result.length; i++) {
    if (i < period - 1) {
      result[i].upperBand = null
      result[i].lowerBand = null
      continue
    }

    // Calcular desviación estándar
    let sum = 0
    for (let j = 0; j < period; j++) {
      sum += Math.pow(data[i - j][field] - result[i][`sma${period}`], 2)
    }

    const stdDeviation = Math.sqrt(sum / period)

    // Calcular bandas
    result[i].upperBand = Number.parseFloat((result[i][`sma${period}`] + stdDev * stdDeviation).toFixed(2))
    result[i].lowerBand = Number.parseFloat((result[i][`sma${period}`] - stdDev * stdDeviation).toFixed(2))
  }

  return result
}

// Función para calcular el Oscilador Estocástico
export function calculateStochastic(data: any[], field: string, kPeriod = 14, dPeriod = 3): any[] {
  const result = [...data]

  // Calcular %K
  for (let i = 0; i < result.length; i++) {
    if (i < kPeriod - 1) {
      result[i].k = null
      continue
    }

    // Encontrar máximo y mínimo en el período
    let highestHigh = Number.NEGATIVE_INFINITY
    let lowestLow = Number.POSITIVE_INFINITY

    for (let j = 0; j < kPeriod; j++) {
      const price = data[i - j][field]
      if (price > highestHigh) highestHigh = price
      if (price < lowestLow) lowestLow = price
    }

    // Calcular %K
    const currentPrice = data[i][field]
    result[i].k = Number.parseFloat((((currentPrice - lowestLow) / (highestHigh - lowestLow)) * 100).toFixed(2))
  }

  // Calcular %D (SMA de %K)
  for (let i = 0; i < result.length; i++) {
    if (i < kPeriod - 1 + dPeriod - 1) {
      result[i].d = null
      continue
    }

    let sum = 0
    for (let j = 0; j < dPeriod; j++) {
      sum += result[i - j].k
    }

    result[i].d = Number.parseFloat((sum / dPeriod).toFixed(2))
  }

  return result
}
