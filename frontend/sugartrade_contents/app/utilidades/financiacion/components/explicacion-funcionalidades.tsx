"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ExplicacionFuncionalidades() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Funcionalidades del Módulo de Financiación</CardTitle>
        <CardDescription>
          Explicación clara y simple de las herramientas disponibles para gestionar su financiamiento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="grid grid-cols-3 md:grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="agroinsumos">Agroinsumos</TabsTrigger>
            <TabsTrigger value="simulador">Simulador</TabsTrigger>
            <TabsTrigger value="calendario">Calendario</TabsTrigger>
            <TabsTrigger value="notificaciones">Notificaciones</TabsTrigger>
            <TabsTrigger value="certificados">Certificados</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold mb-2">¿Qué es el Dashboard de Financiación?</h3>
                <p className="text-muted-foreground">
                  El Dashboard de Financiación es su centro de control financiero. Le permite visualizar de un vistazo
                  toda su posición financiera actual, incluyendo montos financiados, disponibles y pendientes.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">¿Para qué sirve?</h3>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Monitorear el total de financiamiento utilizado y disponible</li>
                  <li>Visualizar la distribución de su financiamiento por tipo</li>
                  <li>Seguir la evolución histórica de su financiamiento</li>
                  <li>Identificar próximos vencimientos de pagos</li>
                </ul>
              </div>
            </div>
            <div className="bg-muted p-4 rounded-md">
              <p className="font-medium">Ejemplo de uso:</p>
              <p className="text-sm text-muted-foreground mt-1">
                Un productor puede verificar rápidamente que tiene $45 millones en financiamiento activo, con $12
                millones en pagos pendientes próximos, y aún dispone de $30 millones de capacidad adicional para nuevos
                financiamientos.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="agroinsumos" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold mb-2">¿Qué es el Financiamiento para Agroinsumos?</h3>
                <p className="text-muted-foreground">
                  Esta función le permite adquirir insumos agrícolas (fertilizantes, semillas, herbicidas, etc.) con
                  financiamiento propio, utilizando sus certificados de depósito o warrants como garantía.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">¿Para qué sirve?</h3>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Comprar insumos sin desembolsar efectivo inmediatamente</li>
                  <li>Utilizar el valor de su azúcar almacenada como respaldo</li>
                  <li>Acceder a mejores condiciones de financiamiento</li>
                  <li>Gestionar el ciclo completo desde la compra hasta el pago</li>
                </ul>
              </div>
            </div>
            <div className="bg-muted p-4 rounded-md">
              <p className="font-medium">Ejemplo de uso:</p>
              <p className="text-sm text-muted-foreground mt-1">
                Un productor necesita fertilizantes para la próxima temporada pero no quiere utilizar su capital de
                trabajo. Puede seleccionar los productos en el catálogo, financiarlos a 6 meses utilizando como garantía
                un certificado de depósito de azúcar, y recibir los insumos inmediatamente.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="simulador" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold mb-2">¿Qué es el Simulador de Financiamiento?</h3>
                <p className="text-muted-foreground">
                  El Simulador de Financiamiento es una herramienta que le permite calcular cuotas, intereses y costos
                  totales antes de comprometerse con un financiamiento.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">¿Para qué sirve?</h3>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Calcular el valor de las cuotas mensuales</li>
                  <li>Visualizar el costo total del financiamiento</li>
                  <li>Comparar diferentes plazos y tasas</li>
                  <li>Planificar su flujo de caja futuro</li>
                </ul>
              </div>
            </div>
            <div className="bg-muted p-4 rounded-md">
              <p className="font-medium">Ejemplo de uso:</p>
              <p className="text-sm text-muted-foreground mt-1">
                Antes de financiar la compra de un tractor por $15 millones, un productor puede simular diferentes
                escenarios: pagarlo en 12, 24 o 36 meses, y ver cómo afecta esto a sus cuotas mensuales y al costo total
                del financiamiento.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="calendario" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold mb-2">¿Qué es el Calendario de Pagos?</h3>
                <p className="text-muted-foreground">
                  El Calendario de Pagos organiza todos sus vencimientos financieros en un formato visual y fácil de
                  entender, permitiéndole planificar sus obligaciones futuras.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">¿Para qué sirve?</h3>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Visualizar todos los pagos programados en un calendario</li>
                  <li>Filtrar pagos por mes o tipo de financiamiento</li>
                  <li>Recibir alertas de vencimientos próximos</li>
                  <li>Registrar pagos realizados</li>
                </ul>
              </div>
            </div>
            <div className="bg-muted p-4 rounded-md">
              <p className="font-medium">Ejemplo de uso:</p>
              <p className="text-sm text-muted-foreground mt-1">
                Un productor puede ver que tiene tres pagos programados para julio: una cuota de SGR el día 15, una
                cuota de agroinsumos el día 20, y otra cuota de SGR el día 25. Esto le permite organizar su flujo de
                caja para asegurar que tendrá fondos disponibles en esas fechas.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="notificaciones" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold mb-2">¿Qué son las Notificaciones de Financiamiento?</h3>
                <p className="text-muted-foreground">
                  Las Notificaciones de Financiamiento son alertas y mensajes relacionados con su actividad financiera,
                  que le mantienen informado sobre eventos importantes.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">¿Para qué sirven?</h3>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Recibir alertas de vencimientos próximos</li>
                  <li>Ser informado sobre aprobaciones de financiamiento</li>
                  <li>Conocer nuevas oportunidades o tasas promocionales</li>
                  <li>Confirmar pagos procesados correctamente</li>
                </ul>
              </div>
            </div>
            <div className="bg-muted p-4 rounded-md">
              <p className="font-medium">Ejemplo de uso:</p>
              <p className="text-sm text-muted-foreground mt-1">
                Un productor recibe una notificación de alerta indicando que tiene un vencimiento de cuota en 5 días, lo
                que le permite tomar medidas para asegurar el pago a tiempo y evitar recargos por mora.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="certificados" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold mb-2">¿Qué es la Gestión de Certificados en Garantía?</h3>
                <p className="text-muted-foreground">
                  Esta función le permite utilizar sus certificados de depósito y warrants como garantía para obtener
                  financiamiento, maximizando el valor de su azúcar almacenada.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">¿Para qué sirve?</h3>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Convertir su azúcar almacenada en un activo financiero</li>
                  <li>Obtener liquidez sin vender su producción</li>
                  <li>Gestionar qué certificados están disponibles o en garantía</li>
                  <li>Visualizar el valor total de sus garantías</li>
                </ul>
              </div>
            </div>
            <div className="bg-muted p-4 rounded-md">
              <p className="font-medium">Ejemplo de uso:</p>
              <p className="text-sm text-muted-foreground mt-1">
                Un productor tiene 500 toneladas de azúcar almacenadas respaldadas por un certificado de depósito. En
                lugar de vender el azúcar a precios actuales, puede utilizar este certificado como garantía para obtener
                financiamiento y esperar a que los precios mejoren antes de vender.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
