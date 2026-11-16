import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg border">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Página no encontrada</h2>
        <p className="text-gray-600 mb-6">Lo sentimos, la página que estás buscando no existe o ha sido movida.</p>
        <div className="flex justify-center">
          <Link href="/dashboard" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Volver al Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
