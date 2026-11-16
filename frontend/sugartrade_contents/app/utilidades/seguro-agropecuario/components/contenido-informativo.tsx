"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function ContenidoInformativo() {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Información sobre Seguros Agropecuarios</CardTitle>
        <CardDescription>
          Aprenda más sobre los seguros agropecuarios y cómo pueden proteger su inversión.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">Información General</TabsTrigger>
            <TabsTrigger value="coberturas">Coberturas</TabsTrigger>
            <TabsTrigger value="preguntas">Preguntas Frecuentes</TabsTrigger>
            <TabsTrigger value="glosario">Glosario</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6 space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">¿Qué es un Seguro Agropecuario?</h3>
              <p>
                El seguro agropecuario es un instrumento financiero que permite a los productores proteger sus
                inversiones contra riesgos climáticos, biológicos y de mercado que pueden afectar la producción
                agrícola.
              </p>

              <h3 className="text-lg font-medium">Beneficios del Seguro Agropecuario</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Protección contra pérdidas económicas por eventos climáticos adversos</li>
                <li>Estabilidad financiera para el productor</li>
                <li>Mayor acceso a créditos y financiamiento</li>
                <li>Tranquilidad y seguridad para planificar futuras inversiones</li>
                <li>Continuidad del negocio agrícola ante situaciones adversas</li>
              </ul>

              <h3 className="text-lg font-medium">Tipos de Seguros Agropecuarios</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Seguro de Daños</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    Cubre daños físicos directos a los cultivos causados por riesgos específicos como granizo, incendio,
                    viento, etc.
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Seguro de Rendimiento</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    Protege contra la disminución del rendimiento del cultivo por debajo de un nivel garantizado,
                    independientemente de la causa.
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Seguro de Ingresos</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    Cubre la pérdida de ingresos debido a la disminución del rendimiento, la caída de precios o ambos.
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Seguro Paramétrico</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    Basado en índices climáticos o satelitales, paga indemnizaciones cuando ciertos parámetros superan
                    umbrales predefinidos.
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="coberturas" className="mt-6 space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Coberturas Disponibles para Caña de Azúcar</h3>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="sequia">
                  <AccordionTrigger>Sequía</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">
                      Protege contra la falta de precipitaciones durante períodos críticos del cultivo que afectan su
                      desarrollo y rendimiento.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      La cobertura se activa cuando las precipitaciones están por debajo de ciertos niveles durante
                      períodos específicos del ciclo del cultivo.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="inundacion">
                  <AccordionTrigger>Inundación</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">
                      Cubre daños causados por exceso de agua debido a lluvias intensas, desbordamientos de ríos o
                      acumulación de agua en el terreno.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      La cobertura incluye daños por anegamiento, arrastre de plantas y pérdida de nutrientes por lavado
                      del suelo.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="granizo">
                  <AccordionTrigger>Granizo</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">
                      Protege contra daños físicos directos causados por la caída de granizo sobre el cultivo, que
                      pueden afectar hojas, tallos y la calidad final.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      La indemnización se calcula según el porcentaje de daño observado en el cultivo tras la evaluación
                      por un perito.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="helada">
                  <AccordionTrigger>Helada</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">
                      Cubre daños causados por temperaturas bajo cero que afectan el desarrollo del cultivo,
                      especialmente en etapas tempranas.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      La cobertura se activa cuando las temperaturas descienden por debajo de ciertos umbrales críticos
                      para el cultivo.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="incendio">
                  <AccordionTrigger>Incendio</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">
                      Protege contra pérdidas por incendios en el cultivo, ya sea por causas naturales o accidentales.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Incluye daños por fuego, humo y los gastos de extinción del incendio.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="plagas">
                  <AccordionTrigger>Plagas y Enfermedades</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">
                      Cubre daños causados por plagas o enfermedades no controlables con prácticas normales de manejo
                      del cultivo.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      La cobertura se aplica cuando se demuestra que se siguieron todas las recomendaciones técnicas de
                      prevención y control.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </TabsContent>

          <TabsContent value="preguntas" className="mt-6 space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Preguntas Frecuentes</h3>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="q1">
                  <AccordionTrigger>¿Cuándo es el mejor momento para contratar un seguro agrícola?</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      El mejor momento para contratar un seguro agrícola es antes de iniciar la temporada de siembra.
                      Idealmente, debe contratarse con suficiente anticipación para que la cobertura esté activa durante
                      todo el ciclo del cultivo, desde la siembra hasta la cosecha.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="q2">
                  <AccordionTrigger>¿Cómo se calcula la prima del seguro?</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      La prima se calcula considerando varios factores: ubicación geográfica de la finca, historial
                      climático de la zona, tipo de cultivo, superficie asegurada, rendimiento esperado, coberturas
                      seleccionadas, suma asegurada y nivel de riesgo. Cada aseguradora puede tener sus propios modelos
                      de cálculo.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="q3">
                  <AccordionTrigger>¿Qué documentación necesito para contratar un seguro?</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      Generalmente se requiere: identificación del productor, título de propiedad o contrato de
                      arrendamiento de la finca, historial de producción de los últimos 3-5 años, información técnica
                      del cultivo, plan de manejo agronómico y, en algunos casos, un informe de inspección previa
                      realizada por la aseguradora.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="q4">
                  <AccordionTrigger>¿Cómo se realiza la indemnización en caso de siniestro?</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      El proceso típico incluye: notificación del siniestro a la aseguradora (generalmente dentro de las
                      48-72 horas), visita de un perito para evaluar los daños, elaboración de un informe de peritaje,
                      cálculo de la indemnización según las condiciones de la póliza y, finalmente, el pago de la
                      indemnización al asegurado.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="q5">
                  <AccordionTrigger>¿Existen subsidios para los seguros agrícolas?</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      Sí, en muchos países existen programas gubernamentales que subsidian parte del costo de las primas
                      de seguros agrícolas para fomentar su adopción. El porcentaje de subsidio puede variar según el
                      tipo de productor, cultivo y región. Es recomendable consultar con las autoridades agrícolas
                      locales sobre los programas disponibles.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </TabsContent>

          <TabsContent value="glosario" className="mt-6 space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Glosario de Términos</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-3">
                  <h4 className="font-medium">Prima</h4>
                  <p className="text-sm text-muted-foreground">
                    Precio del seguro que paga el asegurado a la compañía aseguradora por la cobertura del riesgo.
                  </p>
                </div>

                <div className="border rounded-lg p-3">
                  <h4 className="font-medium">Suma Asegurada</h4>
                  <p className="text-sm text-muted-foreground">
                    Valor máximo que la aseguradora pagará en caso de siniestro, según lo establecido en la póliza.
                  </p>
                </div>

                <div className="border rounded-lg p-3">
                  <h4 className="font-medium">Deducible</h4>
                  <p className="text-sm text-muted-foreground">
                    Cantidad o porcentaje del daño que asume el asegurado antes de que la aseguradora comience a pagar.
                  </p>
                </div>

                <div className="border rounded-lg p-3">
                  <h4 className="font-medium">Siniestro</h4>
                  <p className="text-sm text-muted-foreground">
                    Evento cuyo riesgo está cubierto por la póliza y que desencadena la obligación de la aseguradora.
                  </p>
                </div>

                <div className="border rounded-lg p-3">
                  <h4 className="font-medium">Peritaje</h4>
                  <p className="text-sm text-muted-foreground">
                    Evaluación técnica realizada por un experto para determinar las causas y cuantificar los daños de un
                    siniestro.
                  </p>
                </div>

                <div className="border rounded-lg p-3">
                  <h4 className="font-medium">Indemnización</h4>
                  <p className="text-sm text-muted-foreground">
                    Compensación económica que recibe el asegurado tras un siniestro cubierto por la póliza.
                  </p>
                </div>

                <div className="border rounded-lg p-3">
                  <h4 className="font-medium">Rendimiento Garantizado</h4>
                  <p className="text-sm text-muted-foreground">
                    Nivel de producción mínimo que garantiza el seguro, por debajo del cual se activa la indemnización.
                  </p>
                </div>

                <div className="border rounded-lg p-3">
                  <h4 className="font-medium">Período de Carencia</h4>
                  <p className="text-sm text-muted-foreground">
                    Tiempo que debe transcurrir desde la contratación del seguro hasta que entran en vigor las
                    coberturas.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
