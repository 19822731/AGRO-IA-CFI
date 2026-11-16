"use client"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // Si es un error de redirección, no mostramos nada
  if (error.message === "NEXT_REDIRECT" || error.message === "Redirect") {
    return null
  }

  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
      <h2 className="text-xl font-bold text-red-700 mb-2">Error en el Dashboard</h2>
      <p className="text-red-600 mb-4">Ha ocurrido un error al cargar el dashboard.</p>
      <button onClick={reset} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">
        Intentar de nuevo
      </button>
    </div>
  )
}
