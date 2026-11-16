// Datos del mercado azucarero brasileño
export const brazilMarketData = {
  // Datos de la previsión de cosecha 2024/25
  harvestForecast: {
    title: "Previsión de Cosecha - Caña de Azúcar - Abril 2024",
    source: "Conab (Compañía Nacional de Abastecimiento - Brasil)",
    areaPlantedAndHarvested: {
      unit: "miles de hectáreas",
      cropYear2023_24: {
        northRegion: 76.458,
        northeastRegion: 883.0,
        midwestRegion: 1778.8,
        southeastRegion: 5098.8,
        southRegion: 524.4,
        northNortheastRegion: 931.9,
        midSouthRegion: 7402.0,
        brazilTotal: 8333.9,
      },
      cropYear2024_25Estimate: {
        northRegion: 80.608,
        northeastRegion: 887.0,
        midwestRegion: 1815.7,
        southeastRegion: 5398.3,
        southRegion: 522.6,
        northNortheastRegion: 936.5,
        midSouthRegion: 7736.6,
        brazilTotal: 8673.1,
        variationPercentage: 4.1,
      },
    },
    productivity: {
      unit: "kg/ha",
      cropYear2023_24: {
        northRegion: 48900,
        northeastRegion: 63959,
        midwestRegion: 81537,
        southeastRegion: 91987,
        southRegion: 73860,
        northNortheastRegion: 64833,
        midSouthRegion: 88192,
        brazilTotal: 85580,
      },
      cropYear2024_25Estimate: {
        northRegion: 49500,
        northeastRegion: 71402,
        midwestRegion: 87676,
        southeastRegion: 82858,
        southRegion: 70805,
        northNortheastRegion: 64532,
        midSouthRegion: 80840,
        brazilTotal: 82014,
        variationPercentage: -4.1,
      },
    },
    production: {
      unit: "miles de toneladas",
      cropYear2023_24: {
        northRegion: 3943.0,
        northeastRegion: 56477.8,
        midwestRegion: 145035.7,
        southeastRegion: 469026.8,
        southRegion: 38730.9,
        northNortheastRegion: 60420.8,
        midSouthRegion: 652793.3,
        brazilTotal: 713214.1,
      },
      cropYear2024_25Estimate: {
        northRegion: 3781.5,
        northeastRegion: 56650.3,
        midwestRegion: 145686.1,
        southeastRegion: 442738.8,
        southRegion: 37000.1,
        northNortheastRegion: 60431.9,
        midSouthRegion: 625425.0,
        brazilTotal: 685856.8,
        variationPercentage: -3.8,
      },
    },
    sugarProduction: {
      unit: "miles de toneladas",
      cropYear2023_24: {
        northRegion: 99.3,
        northeastRegion: 3293.1,
        midwestRegion: 5468.0,
        southeastRegion: 33927.7,
        southRegion: 2890.6,
        northNortheastRegion: 3392.4,
        midSouthRegion: 42286.3,
        brazilTotal: 45678.7,
      },
      cropYear2024_25Estimate: {
        northRegion: 94.6,
        northeastRegion: 3521.1,
        midwestRegion: 5682.6,
        southeastRegion: 34031.6,
        southRegion: 2962.3,
        northNortheastRegion: 3615.7,
        midSouthRegion: 42676.4,
        brazilTotal: 46292.2,
        absoluteVariation: 613.5,
        percentageVariation: 1.3,
      },
    },
    atrProduction: {
      unit: "kg/tonelada (promedio)",
      cropYear2023_24: {
        northRegion: 127.6,
        northeastRegion: 126.9,
        midwestRegion: 135.8,
        southeastRegion: 135.6,
        southRegion: 128.9,
        northNortheastRegion: 127.0,
        midSouthRegion: 135.3,
        brazilTotal: 134.6,
      },
      cropYear2024_25Estimate: {
        northRegion: 128.6,
        northeastRegion: 128.1,
        midwestRegion: 136.4,
        southeastRegion: 137.3,
        southRegion: 132.1,
        northNortheastRegion: 128.1,
        midSouthRegion: 136.7,
        brazilTotal: 136.0,
        variationPercentage: 1.1,
      },
      atrTotalProduction: {
        unit: "toneladas",
        cropYear2023_24: {
          northRegion: 503236,
          northeastRegion: 7169541,
          midwestRegion: 19695271,
          southeastRegion: 63607241,
          southRegion: 4992413,
          northNortheastRegion: 7672777,
          midSouthRegion: 88294926,
          brazilTotal: 95967702,
        },
        cropYear2024_25Estimate: {
          northRegion: 486341,
          northeastRegion: 7257186,
          midwestRegion: 19868423,
          southeastRegion: 60767013,
          southRegion: 4889450,
          northNortheastRegion: 7743528,
          midSouthRegion: 85524886,
          brazilTotal: 93268413,
          variationPercentage: -2.8,
        },
      },
    },
  },
  // Datos adicionales para análisis
  keyInsights: [
    "Brasil es el mayor productor mundial de caña de azúcar, representando aproximadamente el 20% de la producción global",
    "Se estima un aumento del 4.1% en el área plantada para la cosecha 2024/25",
    "La productividad se proyecta con una disminución del 4.1% para la cosecha 2024/25",
    "La producción total de azúcar se estima con un aumento del 1.3% para la cosecha 2024/25",
    "La región Sudeste representa aproximadamente el 65% de la producción total de caña de azúcar en Brasil",
  ],
  marketImpact: [
    "El aumento en la producción de azúcar en Brasil podría ejercer presión a la baja en los precios internacionales",
    "La disminución en la productividad podría indicar desafíos climáticos o agronómicos que afectan al sector",
    "El ligero aumento en la producción de ATR sugiere una mejora en la calidad de la caña cosechada",
    "La estabilidad relativa en la producción de azúcar indica un equilibrio entre la producción de azúcar y etanol",
  ],
  // Nuevos datos detallados de las zafras
  detailedHarvestData: {
    title: "Análisis Detallado de Zafras Brasileñas",
    source: "Conab - Tercer Levantamiento",
    sugarProduction: {
      historicalData: {
        cropYear2022_23: 38775.3, // miles de toneladas
        cropYear2023_24: 43498.1, // miles de toneladas
        cropYear2024_25: 46292.2, // miles de toneladas (estimada)
        variation2022To2023: 12.2, // porcentaje
        variation2023To2024: 6.4, // porcentaje
      },
      regionalData: [
        {
          region: "Norte",
          cropYear2022_23: 3823.0, // valores ajustados según los datos proporcionados
          cropYear2023_24: 99.3,
          cropYear2024_25: 94.6,
          variation2023To2024: -4.7,
        },
        {
          region: "Nordeste",
          cropYear2022_23: 56866.5, // valores ajustados según los datos proporcionados
          cropYear2023_24: 3293.1,
          cropYear2024_25: 3521.1,
          variation2023To2024: 6.9,
        },
        {
          region: "Centro-Oeste",
          cropYear2022_23: 131406.8, // valores ajustados según los datos proporcionados
          cropYear2023_24: 5468.0,
          cropYear2024_25: 5682.6,
          variation2023To2024: 3.9,
        },
        {
          region: "Sudeste",
          cropYear2022_23: 387755.3, // valores ajustados según los datos proporcionados
          cropYear2023_24: 33927.7,
          cropYear2024_25: 34031.6,
          variation2023To2024: 0.3,
        },
        {
          region: "Sur",
          cropYear2022_23: 30953.1, // valores ajustados según los datos proporcionados
          cropYear2023_24: 2890.6,
          cropYear2024_25: 2962.3,
          variation2023To2024: 2.5,
        },
        {
          region: "Norte/Nordeste",
          cropYear2022_23: 60689.5,
          cropYear2023_24: 3392.4,
          cropYear2024_25: 3615.7,
          variation2023To2024: 6.6,
        },
        {
          region: "Centro-Sur",
          cropYear2022_23: 550115.3,
          cropYear2023_24: 42286.3,
          cropYear2024_25: 42676.4,
          variation2023To2024: 0.9,
        },
        {
          region: "Brasil",
          cropYear2022_23: 610804.8,
          cropYear2023_24: 45678.7,
          cropYear2024_25: 46292.2,
          variation2023To2024: 1.3,
        },
      ],
    },
    atrData: {
      totalProduction: {
        cropYear2022_23: 610804.8, // miles de toneladas
        cropYear2023_24: 677602.1, // miles de toneladas
        cropYear2024_25: 679308.3, // miles de toneladas (estimada)
        variation2022To2023: 10.9, // porcentaje
        variation2023To2024: 0.3, // porcentaje
      },
      averageATR: [
        {
          region: "Norte",
          cropYear2022_23: 129.3, // kg/t
          cropYear2023_24: 128.1, // kg/t
          cropYear2024_25: 128.6, // kg/t (estimada)
          variation2023To2024: 0.4, // porcentaje
        },
        {
          region: "Nordeste",
          cropYear2022_23: 127.4, // kg/t
          cropYear2023_24: 127.2, // kg/t
          cropYear2024_25: 128.1, // kg/t (estimada)
          variation2023To2024: 0.7, // porcentaje
        },
        {
          region: "Centro-Oeste",
          cropYear2022_23: 134.2, // kg/t
          cropYear2023_24: 135.2, // kg/t
          cropYear2024_25: 136.4, // kg/t (estimada)
          variation2023To2024: 0.9, // porcentaje
        },
        {
          region: "Sudeste",
          cropYear2022_23: 133.9, // kg/t
          cropYear2023_24: 135.3, // kg/t
          cropYear2024_25: 137.3, // kg/t (estimada)
          variation2023To2024: 1.5, // porcentaje
        },
        {
          region: "Sur",
          cropYear2022_23: 124.7, // kg/t
          cropYear2023_24: 121.6, // kg/t
          cropYear2024_25: 132.1, // kg/t (estimada)
          variation2023To2024: 8.6, // porcentaje
        },
        {
          region: "Norte/Nordeste",
          cropYear2022_23: 127.9, // kg/t
          cropYear2023_24: 127.4, // kg/t
          cropYear2024_25: 128.1, // kg/t (estimada)
          variation2023To2024: 0.6, // porcentaje
        },
        {
          region: "Centro-Sur",
          cropYear2022_23: 133.6, // kg/t
          cropYear2023_24: 134.8, // kg/t
          cropYear2024_25: 136.7, // kg/t (estimada)
          variation2023To2024: 1.4, // porcentaje
        },
        {
          region: "Brasil",
          cropYear2022_23: 133.0, // kg/t
          cropYear2023_24: 134.3, // kg/t
          cropYear2024_25: 136.0, // kg/t (estimada)
          variation2023To2024: 1.3, // porcentaje
        },
      ],
    },
    qualitativeAnalysis: {
      cropYear2023_24: {
        productionIncrease:
          "Se estima un aumento del 12.2% en la producción de azúcar en Brasil para la zafra 2023/24 en comparación con la zafra anterior.",
        regionalPerformance:
          "Todas las regiones presentan un aumento en la producción de azúcar, destacándose la región Sur con un incremento del 14.1% y la región Sudeste con un aumento del 12.2%.",
        atrQuality:
          "El Azúcar Total Recuperable (ATR) promedio en Brasil también muestra un ligero aumento del 1.0%, lo que indica una mejor calidad de la caña para la producción de azúcar y etanol.",
      },
      cropYear2024_25: {
        productionIncrease:
          "Se estima un aumento del 1.3% en la producción de azúcar en Brasil para la zafra 2024/25 en comparación con la estimación de la zafra anterior (noviembre de 2023).",
        regionalPerformance:
          "La región Nordeste presenta el mayor aumento estimado en la producción de azúcar (6.9%), mientras que la región Norte experimenta una ligera disminución (-4.7%). Las regiones Centro-Oeste, Sudeste y Sur también muestran aumentos.",
        atrQuality:
          "Se proyecta un aumento del 1.3% en el Azúcar Total Recuperable (ATR) promedio para Brasil, lo que sugiere una mejora en la calidad de la materia prima para la producción de azúcar.",
        generalContext:
          "El informe presenta el tercer levantamiento de la cosecha, lo que indica una actualización de las previsiones iniciales a medida que avanza la temporada de cosecha.",
      },
    },
  },
}
