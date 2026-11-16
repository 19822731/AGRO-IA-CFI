import { create, type StateCreator } from "zustand"
import { persist, createJSONStorage, type PersistOptions } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { devtools } from "zustand/middleware/devtools"

// Tipo para crear un store con persistencia e immer
export type PersistImmerStore<T> = StateCreator<
  T,
  [["zustand/immer", never], ["zustand/persist", unknown], ["zustand/devtools", never]],
  [],
  T
>

// Función para crear un store con persistencia e immer
export function createPersistentImmerStore<T extends object>(
  initializer: PersistImmerStore<T>,
  options: {
    name: string
    version?: number
    partialize?: (state: T) => Partial<T>
    skipHydration?: boolean
  },
) {
  const persistOptions: PersistOptions<T> = {
    name: options.name,
    version: options.version || 1,
    storage: createJSONStorage(() => localStorage),
    partialize: options.partialize,
    skipHydration: options.skipHydration,
  }

  // Verificar si estamos en el cliente
  const isClient = typeof window !== "undefined"

  if (!isClient) {
    // Versión simplificada para SSR
    return create<T>()(initializer)
  }

  // Versión completa con todos los middlewares para el cliente
  return create<T>()(devtools(persist(immer(initializer), persistOptions)))
}
