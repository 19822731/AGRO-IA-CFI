import type React from "react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

import type { MainNavItem, SidebarNavItem } from "@/types"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

interface MainNavProps {
  items?: MainNavItem[]
  children?: React.ReactNode
}

interface SidebarNavProps {
  items: SidebarNavItem[]
}

export function MainNav({ items, children }: MainNavProps) {
  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/" className="flex items-center space-x-2">
        {/* <Icons.logo className="h-6 w-6" /> */}
        <span className="hidden font-bold sm:inline-block">Acme</span>
      </Link>
      {items?.length ? (
        <nav className="hidden gap-6 md:flex">
          {items?.map((item, index) =>
            item.href ? (
              <Link
                key={index}
                href={item.href}
                className="flex items-center text-sm font-medium transition-colors hover:text-foreground"
              >
                {item.title}
              </Link>
            ) : (
              <span key={index} className="flex items-center text-sm font-medium text-muted-foreground">
                {item.title}
              </span>
            ),
          )}
        </nav>
      ) : null}
      {children}
    </div>
  )
}

export function SidebarNav({ items }: SidebarNavProps) {
  if (!items?.length) {
    return null
  }

  const components = items.find((item) => item.title === "Componentes")
  const utilidades = items.find((item) => item.title === "Utilidades")

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center space-x-2">
        {/* <Icons.logo className="h-6 w-6" /> */}
        <span className="font-bold">
          <span style={{ color: "#4285F4" }}>A</span>
          <span style={{ color: "#EA4335" }}>gro</span>
          <span style={{ color: "#5F6368" }}>-</span>
          <span style={{ color: "#FBBC05" }}>I</span>
          <span style={{ color: "#34A853" }}>A</span>
        </span>
      </div>
      {items.map((item, i) => {
        if (item.title === "Componentes" || item.title === "Utilidades") {
          return null
        }
        return (
          <Link key={i} href={item.href} className="text-sm font-medium">
            {item.title}
          </Link>
        )
      })}
      {components?.items ? (
        <>
          <Separator />
          <p className="menu-heading">Componentes</p>
          {components.items.map((item) => (
            <Link key={item.title} href={item.href} className="text-sm">
              {item.title}
            </Link>
          ))}
        </>
      ) : null}
      {utilidades?.items ? (
        <>
          <Separator />
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Utilidades</AccordionTrigger>
              <AccordionContent>
                {utilidades.items.map((item) => (
                  <Link key={item.title} href={item.href} className="text-sm">
                    {item.title}
                  </Link>
                ))}
                {/* Buscar la sección de navegación de utilidades y agregar el enlace a Reportes de Mercado

                // Dentro del array de items, agregar un nuevo objeto para Reportes de Mercado
                // Buscar algo como:
                // { title: "Canje", href: "/utilidades/canje", icon: "repeat" },

                // Y agregar después:
                { title: "Reportes de Mercado", href: "/utilidades/reportes-mercado", icon: "bar-chart-2" }, */}
                <Link href="/utilidades/reportes-mercado" className="text-sm">
                  Reportes de Mercado
                </Link>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </>
      ) : null}
    </div>
  )
}
