import { create } from "zustand"

interface SugarPrice {
  value: number
  change: number
  timestamp: string
  currency: string
  unit: string
}

interface FuturePrice {
  month: string
  value: number
}

interface SugarState {
  currentPrice: SugarPrice | null
  futurePrices: FuturePrice[]
  isLoading: boolean
  error: string | null
  lastUpdated: Date | null
  fetchPrices: () => Promise<void>
  resetError: () => void
}

export const useSugarStore = create<SugarState>((set, get) => ({
  currentPrice: null,
  futurePrices: [],
  isLoading: false,
  error: null,
  lastUpdated: null,

  fetchPrices: async () => {
    try {
      // Si ya estamos cargando, no hacemos nada
      if (get().isLoading) return

      set({ isLoading: true, error: null })

      const response = await fetch("/api/sugar-prices")

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Error HTTP: ${response.status}`)
      }

      const data = await response.json()

      set({
        currentPrice: data.currentPrice,
        futurePrices: data.futurePrices,
        isLoading: false,
        lastUpdated: new Date(),
      })
    } catch (error) {
      console.error("Error fetching sugar prices:", error)

      set({
        error: error instanceof Error ? error.message : "Error desconocido al obtener precios",
        isLoading: false,
      })

      // Podríamos implementar reintentos automáticos aquí
    }
  },

  resetError: () => set({ error: null }),
}))
