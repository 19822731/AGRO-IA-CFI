import type React from "react"
import { FinanciacionProvider } from "./context/financiacion-context"

export default function FinanciacionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <FinanciacionProvider>{children}</FinanciacionProvider>
}
