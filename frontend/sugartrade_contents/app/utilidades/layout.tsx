import type React from "react"
export default function UtilidadesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Utilidades</h1>
      {children}
    </div>
  )
}
