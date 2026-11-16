// Datos del mercado azucarero argentino
export const argentinaMarketData = {
  // Datos existentes
  production: {
    sugarProduction: {
      "2022-2023": 6.22, // Aumento respecto al año anterior
      "2010-2023": -16.21, // Disminución respecto a 2010
    },
    bioethanol: {
      "2022-2023_Q1-Q3": {
        production: -19.08, // Caída en producción
        deliveries: -20.69, // Caída en entregas
      },
      "2017-2023": -31.13, // Caída en entregas esperadas respecto a 2017
    },
  },
  exports: {
    "2022-2023_Q1-Q3": {
      sugar: -57.19, // Caída en exportaciones de azúcar
      alcohol: -51.74, // Caída en exportaciones de alcohol
    },
    organicSugar: {
      "2017-2021": "Top 4 global", // Posición global
      "2023": 20, // Porcentaje respecto a años anteriores
    },
  },
  domesticMarket: {
    "last-12-years": {
      marketShareLoss: -25, // Pérdida de participación en mercado de edulcorantes
    },
    "2023": {
      excessSupply: {
        min: 250000, // Toneladas mínimas de exceso
        max: 300000, // Toneladas máximas de exceso
      },
    },
    "2022-2023": {
      priceStagnation: true, // Estancamiento de precios
      inflationImpact: "high", // Alto impacto de la inflación
    },
  },
  qualitativeFactors: {
    governmentPolicies: {
      impact: "negative",
      details: [
        "Políticas fiscales restrictivas",
        "Políticas cambiarias desfavorables",
        "Regulaciones gubernamentales",
        "Precios domésticos inferiores a los internacionales",
        "Precios de bioetanol por debajo de costos de producción",
      ],
    },
    marketTrends: {
      cropSubstitution: {
        impact: "negative",
        details: "Productores de limón y otros cultivos cambiando a caña (20-30 mil hectáreas)",
      },
      potentialGrowth: {
        impact: "positive",
        sectors: [
          "Biocombustibles",
          "Energía eléctrica de ingenios",
          "Derivados alco-químicos",
          "Derivados sucro-químicos",
          "Azúcar orgánica y convencional",
        ],
      },
    },
  },

  // Nuevos datos del mercado argentino (2025)
  marketAnalysis2025: {
    reportTitle: "Análisis Mercado Sucro Alcoholero",
    reportDate: "13/03/2025",
    source: "KU INDUSTRIAL",

    domesticMarket: {
      currentPriceRanges: {
        whiteSugar50kgBag: {
          vatIncluded: {
            fromMill: 22787.14,
            withDelivery: 23258.57,
            sale: 23730.0,
          },
          vatExcluded: {
            fromMill: 18832.35,
            withDelivery: 19221.96,
            sale: 19611.57,
          },
        },
      },
      priceComparison: {
        nominalPrice_13_03_2024: 21995,
        accumulatedValueInterannualIPC: 34856,
        currentNominalPrice_13_03_2025: 23730,
        currentRealPrice_13_03_2025: 14974,
        interannualDecreaseRealPrice: -31.92,
      },
      accumulatedInflation: {
        october2024: 2.7,
        november2024: 2.4,
        december2024: 2.7,
        january2025: 2.2,
      },
    },

    externalMarket: {
      internationalPriceEvolution: {
        refinedSugarTonUSD: 538.7,
        crudeSugarTonUSD: 415.79,
        averageSugarTonUSD: 477.25,
      },
      exportCalculation: {
        officialDollar: {
          refinedSugar50kgBagFOB: 28725.59,
          crudeSugar50kgBagFOB: 22171.66,
          averageSugar50kgBagFOB: 25448.63,
          externalizationCostUSD50: 2621.25,
          approximateCTAWithIVA: 27621,
          domesticPriceWithIVA: 23730,
          differenceConvenience: {
            amount: 3891.1,
            percentage: 14.095,
          },
        },
        blueDollar: {
          refinedSugar50kgBagFOB: 33835.1,
          crudeSugar50kgBagFOB: 26115.41,
          averageSugar50kgBagFOB: 29975.25,
          externalizationCostUSD50: 3087.5,
          approximateCTAWithIVA: 32534,
          domesticPriceWithIVA: 23730,
          differenceConvenience: {
            amount: 8804.2,
            percentage: 27.06,
          },
        },
      },
    },

    keyInsights: [
      "Los precios domésticos están significativamente por debajo de los precios de exportación, con una diferencia de hasta 27% considerando el dólar blue",
      "El precio real del azúcar ha disminuido un 31.92% interanual debido al impacto de la inflación",
      "Existe una oportunidad de arbitraje entre el mercado doméstico y el de exportación",
      "La inflación acumulada sigue impactando negativamente en los precios reales del azúcar",
    ],
  },
}
