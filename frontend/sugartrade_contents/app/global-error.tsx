"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="flex items-center justify-center h-screen">
          <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg border border-red-100">
            <h2 className="text-2xl font-bold text-red-700 mb-4">Error global</h2>
            <p className="text-gray-700 mb-6">
              Ha ocurrido un error inesperado. Por favor, intente recargar la página.
            </p>
            <div className="flex justify-center">
              <button onClick={reset} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">
                Intentar de nuevo
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
