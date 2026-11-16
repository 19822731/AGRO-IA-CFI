// Datos históricos y proyecciones del mercado azucarero mundial
export const sugarMarketProjections = {
  // Datos de producción global por año
  globalProduction: {
    title: "Producción Mundial de Azúcar",
    source: "USDA (Departamento de Agricultura de los Estados Unidos)",
    unit: "millones de toneladas métricas (valor bruto)",
    yearlyData: {
      "2021/22": {
        value: 174.5,
        notes: "Disminución principalmente por factores climáticos en Brasil",
      },
      "2022/23": {
        value: 178.4,
        change: 3.9,
        percentageChange: 2.2,
        notes: "Recuperación parcial de la producción global",
      },
      "2023/24": {
        value: 185.4,
        change: 7.0,
        percentageChange: 3.9,
        notes: "Aumento significativo impulsado por Brasil, India y Pakistán",
      },
      "2024/25": {
        value: 182.3,
        change: -3.1,
        percentageChange: -1.7,
        notes: "Ligera disminución debido a menor producción en Brasil e India",
      },
    },
  },

  // Datos de consumo global por año
  globalConsumption: {
    title: "Consumo Mundial de Azúcar",
    source: "USDA (Departamento de Agricultura de los Estados Unidos)",
    unit: "millones de toneladas métricas (valor bruto)",
    yearlyData: {
      "2021/22": {
        value: 172.4,
        notes: "Crecimiento moderado a pesar de la pandemia",
      },
      "2022/23": {
        value: 175.4,
        change: 3.0,
        percentageChange: 1.7,
        notes: "Continuación del crecimiento moderado",
      },
      "2023/24": {
        value: 177.4,
        change: 2.0,
        percentageChange: 1.1,
        notes: "Crecimiento impulsado principalmente por mercados asiáticos",
      },
      "2024/25": {
        value: 180.6,
        change: 3.2,
        percentageChange: 1.8,
        notes: "Tendencia de crecimiento sostenido",
      },
    },
  },

  // Datos de exportaciones globales por año
  globalExports: {
    title: "Exportaciones Mundiales de Azúcar",
    source: "USDA (Departamento de Agricultura de los Estados Unidos)",
    unit: "millones de toneladas métricas (valor bruto)",
    yearlyData: {
      "2021/22": {
        value: 57.7,
        notes: "Disminución debido a menor producción en Brasil",
      },
      "2022/23": {
        value: 61.8,
        change: 4.1,
        percentageChange: 7.1,
        notes: "Recuperación de las exportaciones globales",
      },
      "2023/24": {
        value: 64.4,
        change: 2.6,
        percentageChange: 4.2,
        notes: "Aumento debido a mayor disponibilidad en Brasil e India",
      },
      "2024/25": {
        value: 62.8,
        change: -1.6,
        percentageChange: -2.5,
        notes: "Ligera disminución debido a menor disponibilidad en países clave",
      },
    },
  },

  // Datos de producción por país y año
  countryProduction: {
    title: "Producción de Azúcar por País",
    source: "USDA (Departamento de Agricultura de los Estados Unidos)",
    unit: "millones de toneladas métricas (valor bruto)",
    countries: {
      Brasil: {
        "2021/22": 32.5,
        "2022/23": 36.0,
        "2023/24": 40.7,
        "2024/25": 38.7,
      },
      India: {
        "2021/22": 35.0,
        "2022/23": 34.0,
        "2023/24": 37.0,
        "2024/25": 32.8,
      },
      Tailandia: {
        "2021/22": 11.5,
        "2022/23": 11.3,
        "2023/24": 8.2,
        "2024/25": 10.5,
      },
      "Unión Europea": {
        "2021/22": 15.9,
        "2022/23": 15.3,
        "2023/24": 15.5,
        "2024/25": 14.6,
      },
      China: {
        "2021/22": 10.6,
        "2022/23": 10.0,
        "2023/24": 10.2,
        "2024/25": 10.5,
      },
      "Estados Unidos": {
        "2021/22": 7.8,
        "2022/23": 7.8,
        "2023/24": 7.7,
        "2024/25": 7.6,
      },
      México: {
        "2021/22": 6.3,
        "2022/23": 6.0,
        "2023/24": 5.9,
        "2024/25": 5.8,
      },
      Pakistán: {
        "2021/22": 6.8,
        "2022/23": 6.8,
        "2023/24": 6.8,
        "2024/25": 6.8,
      },
      Australia: {
        "2021/22": 4.4,
        "2022/23": 4.4,
        "2023/24": 4.5,
        "2024/25": 4.5,
      },
      Sudáfrica: {
        "2021/22": 2.1,
        "2022/23": 2.1,
        "2023/24": 2.1,
        "2024/25": 2.0,
      },
    },
  },

  // Datos de exportaciones por país y año
  countryExports: {
    title: "Exportaciones de Azúcar por País",
    source: "USDA (Departamento de Agricultura de los Estados Unidos)",
    unit: "millones de toneladas métricas (valor bruto)",
    countries: {
      Brasil: {
        "2021/22": 23.0,
        "2022/23": 26.3,
        "2023/24": 29.8,
        "2024/25": 27.3,
      },
      India: {
        "2021/22": 6.0,
        "2022/23": 6.2,
        "2023/24": 7.5,
        "2024/25": 5.3,
      },
      Tailandia: {
        "2021/22": 5.5,
        "2022/23": 10.8,
        "2023/24": 6.0,
        "2024/25": 8.0,
      },
      Australia: {
        "2021/22": 4.4,
        "2022/23": 3.6,
        "2023/24": 4.3,
        "2024/25": 4.5,
      },
      Pakistán: {
        "2021/22": 0.0,
        "2022/23": 0.5,
        "2023/24": 0.5,
        "2024/25": 0.5,
      },
      Sudáfrica: {
        "2021/22": 0.81,
        "2022/23": 0.81,
        "2023/24": 0.81,
        "2024/25": 0.77,
      },
    },
  },

  // Datos de importaciones por país y año
  countryImports: {
    title: "Importaciones de Azúcar por País",
    source: "USDA (Departamento de Agricultura de los Estados Unidos)",
    unit: "millones de toneladas métricas (valor bruto)",
    countries: {
      China: {
        "2021/22": 5.7,
        "2022/23": 5.3,
        "2023/24": 5.5,
        "2024/25": 5.6,
      },
      Indonesia: {
        "2021/22": 3.7,
        "2022/23": 3.7,
        "2023/24": 3.7,
        "2024/25": 3.7,
      },
      "Estados Unidos": {
        "2021/22": 3.3,
        "2022/23": 3.4,
        "2023/24": 3.3,
        "2024/25": 3.3,
      },
      Bangladesh: {
        "2021/22": 2.4,
        "2022/23": 2.5,
        "2023/24": 2.5,
        "2024/25": 2.6,
      },
    },
  },

  // Análisis cualitativo y tendencias
  qualitativeAnalysis: {
    globalTrends: [
      "Brasil e India se mantienen como los principales productores mundiales, con fluctuaciones significativas en su producción.",
      "El consumo mundial de azúcar muestra un crecimiento constante, impulsado principalmente por mercados asiáticos.",
      "Las condiciones climáticas siguen siendo un factor determinante en la producción global, afectando especialmente a Brasil y Pakistán.",
      "Tailandia muestra una recuperación significativa en sus exportaciones después de períodos de sequía.",
      "China se consolida como el principal importador mundial, con un aumento sostenido en sus importaciones.",
    ],
    marketOutlook: [
      "Se espera una ligera contracción en la producción mundial para 2024/25 después de alcanzar un pico en 2023/24.",
      "El consumo mundial continuará creciendo a un ritmo moderado pero constante.",
      "Las exportaciones globales mostrarán una ligera disminución en 2024/25 debido a menor disponibilidad en países clave.",
      "La producción de India podría experimentar una disminución significativa en 2024/25.",
      "Brasil mantendrá su posición como el mayor exportador mundial, aunque con fluctuaciones en su volumen de exportación.",
    ],
    regionalInsights: {
      Brasil:
        "Mantiene su posición como el mayor exportador mundial, con fluctuaciones en su producción debido a factores climáticos y decisiones sobre la asignación de caña entre azúcar y etanol.",
      India:
        "Muestra variabilidad en su producción y exportaciones, con políticas gubernamentales que juegan un papel importante en sus decisiones comerciales.",
      Tailandia:
        "Continúa recuperándose de períodos de sequía, con una volatilidad significativa en sus exportaciones.",
      "Unión Europea":
        "Muestra resiliencia en su producción a pesar de desafíos regulatorios, como la prohibición de neonicotinoides en Francia.",
      Pakistán: "Se recupera de las inundaciones, con un aumento en su producción y exportaciones.",
      Sudáfrica:
        "Enfrenta desafíos debido a condiciones climáticas adversas y ha implementado medidas proteccionistas para su industria local.",
    },
    impactFactors: [
      "Condiciones climáticas: Sequías, inundaciones y otros eventos extremos afectan significativamente la producción global.",
      "Políticas gubernamentales: Subsidios, aranceles y cuotas de exportación/importación influyen en los flujos comerciales.",
      "Precios del petróleo: Afectan las decisiones sobre el uso de caña de azúcar para producir etanol, especialmente en Brasil.",
      "Crecimiento económico: El aumento de ingresos en economías emergentes impulsa el consumo de productos que contienen azúcar.",
      "Tendencias de salud: Preocupaciones sobre la obesidad y la diabetes pueden moderar el crecimiento del consumo en algunos mercados.",
    ],
  },
}
