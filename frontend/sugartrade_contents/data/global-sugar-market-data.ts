// Datos del mercado azucarero mundial
export const globalSugarMarketData = {
  // Datos de producción, consumo y comercio global
  globalProduction: {
    title: "Producción Mundial de Azúcar",
    source: "USDA (Departamento de Agricultura de los Estados Unidos)",
    yearlyData: {
      "2019/20": {
        production: 166.5, // millones de toneladas métricas (valor bruto)
        notes: "Año base para comparación",
      },
      "2020/21": {
        production: 182.0, // millones de toneladas métricas (valor bruto)
        increase: 15.5, // millones de toneladas métricas (valor bruto)
        percentageChange: 9.3, // porcentaje
        mainContributors: ["Brasil (representó tres cuartas partes del aumento)", "Estados Unidos", "India"],
        notes: "Fuerte recuperación de la producción global",
      },
      "2021/22": {
        production: 174.5, // millones de toneladas métricas (valor bruto)
        decrease: 7.5, // millones de toneladas métricas (valor bruto)
        percentageChange: -4.1, // porcentaje
        mainReasons: ["Menor producción en Brasil debido a condiciones climáticas adversas"],
        notes: "Disminución principalmente por factores climáticos en Brasil",
      },
    },
  },
  globalConsumption: {
    title: "Consumo Mundial de Azúcar",
    source: "USDA (Departamento de Agricultura de los Estados Unidos)",
    yearlyData: {
      "2019/20": {
        consumption: 169.5, // millones de toneladas métricas (valor bruto)
        notes: "Año base para comparación",
      },
      "2020/21": {
        consumption: 171.0, // millones de toneladas métricas (valor bruto)
        increase: 1.5, // millones de toneladas métricas (valor bruto)
        percentageChange: 0.9, // porcentaje
        growthMarkets: ["India", "China", "Indonesia", "Irán"],
        notes: "Crecimiento moderado a pesar de la pandemia COVID-19",
      },
      "2021/22": {
        consumption: 172.4, // millones de toneladas métricas (valor bruto)
        increase: 1.4, // millones de toneladas métricas (valor bruto)
        percentageChange: 0.8, // porcentaje
        growthMarkets: ["India", "Indonesia", "China"],
        notes: "Continuación del crecimiento moderado",
      },
    },
  },
  globalExports: {
    title: "Exportaciones Mundiales de Azúcar",
    source: "USDA (Departamento de Agricultura de los Estados Unidos)",
    yearlyData: {
      "2019/20": {
        exports: 54.5, // millones de toneladas métricas (valor bruto)
        notes: "Año base para comparación",
      },
      "2020/21": {
        exports: 61.4, // millones de toneladas métricas (valor bruto)
        increase: 6.9, // millones de toneladas métricas (valor bruto)
        percentageChange: 12.7, // porcentaje
        mainContributors: ["Brasil"],
        notes: "Fuerte aumento debido al incremento de los suministros en Brasil",
      },
      "2021/22": {
        exports: 57.7, // millones de toneladas métricas (valor bruto)
        decrease: 3.7, // millones de toneladas métricas (valor bruto)
        percentageChange: -6.0, // porcentaje
        mainReasons: ["Menor disponibilidad en Brasil"],
        notes: "Disminución debido a menor producción en Brasil",
      },
    },
  },
  // Datos por país
  countryData: {
    title: "Datos por País - Año Comercial 2021/22",
    source: "USDA (Departamento de Agricultura de los Estados Unidos)",
    production: {
      unit: "millones de toneladas métricas (valor bruto)",
      countries: [
        { name: "India", value: 35.0, trend: "aumento", percentageChange: 4.5 },
        { name: "Brasil", value: 32.5, trend: "disminución", percentageChange: -17.7 },
        { name: "Unión Europea", value: 15.9, trend: "disminución", percentageChange: -2.5 },
        { name: "Tailandia", value: 11.5, trend: "aumento", percentageChange: 15.0 },
        { name: "China", value: 10.6, trend: "disminución", percentageChange: -1.9 },
        { name: "Estados Unidos", value: 7.8, trend: "aumento", percentageChange: 1.3 },
        { name: "México", value: 6.3, trend: "estable", percentageChange: 0.0 },
      ],
    },
    imports: {
      unit: "millones de toneladas métricas (valor bruto)",
      countries: [
        { name: "China", value: 5.7, trend: "aumento", percentageChange: 67.6 },
        { name: "Indonesia", value: 3.7, trend: "disminución", percentageChange: -9.8 },
        { name: "Estados Unidos", value: 3.3, trend: "aumento", percentageChange: 10.0 },
        { name: "Bangladesh", value: 2.4, trend: "estable", percentageChange: 0.0 },
      ],
    },
    exports: {
      unit: "millones de toneladas métricas (valor bruto)",
      countries: [
        { name: "Brasil", value: 23.0, trend: "disminución", percentageChange: -22.8 },
        { name: "India", value: 6.0, trend: "aumento", percentageChange: 5.3 },
        { name: "Tailandia", value: 5.5, trend: "disminución", percentageChange: -15.4 },
        { name: "Australia", value: 4.4, trend: "disminución", percentageChange: -2.2 },
      ],
    },
    endingStocks: {
      unit: "millones de toneladas métricas (valor bruto)",
      countries: [
        { name: "India", value: 8.2, trend: "disminución", percentageChange: -22.6 },
        { name: "China", value: 8.7, trend: "aumento", percentageChange: 35.9 },
        { name: "Brasil", value: 6.0, trend: "disminución", percentageChange: -27.7 },
        { name: "Tailandia", value: 1.4, trend: "disminución", percentageChange: -41.7 },
        { name: "Estados Unidos", value: 1.6, trend: "estable", percentageChange: 0.0 },
        { name: "Unión Europea", value: 1.5, trend: "disminución", percentageChange: -6.3 },
        { name: "México", value: 0.7, trend: "estable", percentageChange: 0.0 },
      ],
    },
  },
  // Precios minoristas
  retailPrices: {
    title: "Precios Minoristas del Azúcar - Noviembre 2021",
    source: "USDA (Departamento de Agricultura de los Estados Unidos)",
    countries: [
      { name: "India", price: "37.00 Rupias/kg", usdEquivalent: 0.5 },
      { name: "Tailandia", price: "21.00 Baht/kg", usdEquivalent: 0.63 },
      { name: "Estados Unidos", price: "0.73 $/lb", usdEquivalent: 1.61 },
      { name: "Brasil", price: "3.10 Reales/kg", usdEquivalent: 0.56 },
      { name: "Indonesia", price: "13,000 Rupias/kg", usdEquivalent: 0.91 },
      { name: "Pakistán", price: "90 Rupias/kg", usdEquivalent: 0.52 },
      { name: "Filipinas", price: "52 Pesos/kg", usdEquivalent: 1.03 },
      { name: "México", price: "24 Pesos/kg", usdEquivalent: 1.16 },
      { name: "Unión Europea", price: "0.70 €/kg", usdEquivalent: 0.8 },
      { name: "Irán", price: "130,000 Rial/kg", usdEquivalent: 0.31 },
      { name: "Bangladesh", price: "70 Takas/kg", usdEquivalent: 0.82 },
      { name: "Japón", price: "145 Yen/kg", usdEquivalent: 1.27 },
    ],
  },
  // Datos históricos de precios
  historicalPrices: {
    title: "Precios Históricos del Azúcar",
    source: "USDA y Mercados Internacionales",
    worldRawSugar: {
      unit: "Centavos de dólar por libra",
      yearlyData: {
        "1960": 3.19,
        "1970": 3.67,
        "1980": 29.2,
        "1990": 13.9,
        "2000": 8.5,
        "2010": 21.6,
        "2011": 30.03,
        "2012": 26.51,
        "2013": 26.37,
        "2014": 29.99,
        "2015": 30.53,
        "2016": 32.12,
        "2017": 38.54,
      },
    },
    worldRefinedSugar: {
      unit: "$/tonelada métrica",
      yearlyData: {
        "2010": 487.86,
        "2011": 679.89,
        "2012": 675.79,
        "2013": 501.89,
        "2014": 479.49,
        "2015": 413.94,
        "2016": 453.18,
        "2017": 447.12,
      },
    },
    usRawSugar: {
      unit: "Centavos de dólar por libra",
      yearlyData: {
        "1960": 9.2,
        "1970": 12.8,
        "1980": 29.4,
        "1990": 21.4,
        "2000": 22.7,
        "2010": 30.4,
        "2011": 34.7,
        "2012": 36.5,
        "2013": 35.2,
        "2014": 37.8,
        "2015": 38.4,
        "2016": 39.9,
        "2017": 41.2,
      },
    },
  },
  // Análisis cualitativo
  qualitativeAnalysis: {
    globalTrends: [
      "La producción mundial de azúcar está altamente concentrada en unos pocos países clave, con Brasil e India representando una parte significativa del total.",
      "El consumo mundial de azúcar continúa creciendo, impulsado principalmente por economías en desarrollo como India, China e Indonesia.",
      "Las condiciones climáticas son un factor determinante en la producción de azúcar, como se evidencia en las fluctuaciones de la producción brasileña.",
      "Existe una clara correlación entre los precios mundiales del azúcar y los niveles de producción y exportación de Brasil, el mayor exportador mundial.",
      "Los precios minoristas del azúcar muestran una gran variabilidad entre las diferentes regiones del mundo, reflejando las condiciones específicas de cada mercado.",
    ],
    marketOutlook: [
      "Se espera que India supere a Brasil como el mayor productor mundial de azúcar en el año comercial 2021/22.",
      "China está emergiendo como un importador clave, con un aumento significativo en las importaciones proyectadas.",
      "La disminución en las exportaciones brasileñas podría crear oportunidades para otros exportadores como India y Tailandia.",
      "Las existencias mundiales de azúcar están disminuyendo, lo que podría ejercer presión alcista sobre los precios si la producción no se recupera.",
      "La volatilidad en los precios del azúcar podría aumentar debido a factores climáticos y cambios en las políticas comerciales de los principales países productores y consumidores.",
    ],
    impactFactors: [
      "Políticas gubernamentales: Subsidios, aranceles y cuotas de importación/exportación en países clave.",
      "Condiciones climáticas: Sequías, inundaciones y otros eventos climáticos extremos que afectan la producción.",
      "Precios del petróleo: Influyen en la decisión de utilizar caña de azúcar para producir etanol en lugar de azúcar, especialmente en Brasil.",
      "Crecimiento económico: El aumento de los ingresos en economías emergentes impulsa el consumo de productos que contienen azúcar.",
      "Tendencias de salud: Preocupaciones sobre la obesidad y la diabetes pueden afectar el consumo en algunos mercados desarrollados.",
    ],
  },
}
