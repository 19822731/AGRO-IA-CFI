"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function RequisitosZonaPrimaria() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Requisitos para Zona Primaria y Consolidación</CardTitle>
        <CardDescription>
          Información sobre los requisitos necesarios para habilitar una Zona Primaria y realizar consolidaciones según
          el Código Aduanero y normativa complementaria.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="requisitos-generales">
            <AccordionTrigger>Requisitos Generales de la Zona Primaria</AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <span className="font-semibold">Delimitación:</span> El área debe estar claramente delimitada con
                  muros, cercas u otras barreras físicas.
                </li>
                <li>
                  <span className="font-semibold">Señalización:</span> Debe contar con señalización adecuada que
                  identifique claramente los límites y las áreas de circulación.
                </li>
                <li>
                  <span className="font-semibold">Iluminación:</span> Debe tener iluminación suficiente para las
                  operaciones, incluso durante la noche.
                </li>
                <li>
                  <span className="font-semibold">Pisos:</span> Los pisos deben ser resistentes y adecuados para el
                  tránsito y almacenamiento de las mercancías.
                </li>
                <li>
                  <span className="font-semibold">Seguridad:</span> Implementación de medidas de seguridad para prevenir
                  robos, pérdidas y accesos no autorizados (cámaras de vigilancia, personal de seguridad).
                </li>
                <li>
                  <span className="font-semibold">Oficinas:</span> Debe contar con oficinas adecuadas para el personal
                  de la Aduana y del depósito fiscal.
                </li>
                <li>
                  <span className="font-semibold">Servicios:</span> Disponer de servicios básicos como energía
                  eléctrica, agua potable y sanitarios.
                </li>
                <li>
                  <span className="font-semibold">Equipamiento:</span> Contar con el equipamiento necesario para la
                  manipulación de carga (montacargas, balanzas, etc.).
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="requisitos-consolidacion">
            <AccordionTrigger>Requisitos Adicionales para la Consolidación</AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <span className="font-semibold">Espacio Suficiente:</span> Debe haber espacio adecuado para realizar
                  las operaciones de consolidación de manera segura y eficiente.
                </li>
                <li>
                  <span className="font-semibold">Área de Inspección:</span> Un área designada para la inspección de las
                  mercancías por parte de la Aduana.
                </li>
                <li>
                  <span className="font-semibold">Procedimientos Documentados:</span> Tener procedimientos operativos
                  estándar (POE) documentados para el proceso de consolidación, incluyendo los controles de seguridad.
                </li>
                <li>
                  <span className="font-semibold">Registro de Operaciones:</span> Mantener un registro detallado de
                  todas las operaciones de consolidación realizadas.
                </li>
                <li>
                  <span className="font-semibold">Personal Capacitado:</span> Contar con personal capacitado en las
                  normativas aduaneras y los procedimientos específicos de consolidación.
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="normativa">
            <AccordionTrigger>Normativa Aplicable</AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <span className="font-semibold">Código Aduanero Argentino:</span> Establece el marco legal general
                  para las operaciones aduaneras, incluyendo las realizadas en zonas primarias.
                </li>
                <li>
                  <span className="font-semibold">Resoluciones de la AFIP (ARCA):</span> Regulan aspectos específicos de
                  la habilitación y operación de zonas primarias y procesos de consolidación.
                </li>
                <li>
                  <span className="font-semibold">Disposiciones de la Dirección General de Aduanas:</span> Establecen
                  procedimientos operativos y requisitos técnicos para las zonas primarias.
                </li>
                <li>
                  <span className="font-semibold">Normativa de Seguridad:</span> Incluye regulaciones sobre seguridad
                  física, control de accesos y prevención de ilícitos en zonas aduaneras.
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="proceso-habilitacion">
            <AccordionTrigger>Proceso de Habilitación</AccordionTrigger>
            <AccordionContent>
              <ol className="space-y-2 list-decimal pl-5">
                <li>
                  <span className="font-semibold">Presentación de Solicitud:</span> Presentar la solicitud de
                  habilitación ante la Aduana correspondiente, incluyendo la documentación requerida.
                </li>
                <li>
                  <span className="font-semibold">Inspección Técnica:</span> La Aduana realizará una inspección para
                  verificar que se cumplen los requisitos físicos y de infraestructura.
                </li>
                <li>
                  <span className="font-semibold">Evaluación de Seguridad:</span> Se evaluarán las medidas de seguridad
                  implementadas para prevenir ilícitos aduaneros.
                </li>
                <li>
                  <span className="font-semibold">Verificación de Procedimientos:</span> Se revisarán los procedimientos
                  operativos para asegurar el cumplimiento de la normativa.
                </li>
                <li>
                  <span className="font-semibold">Resolución de Habilitación:</span> Si se cumplen todos los requisitos,
                  la Aduana emitirá la resolución de habilitación de la Zona Primaria.
                </li>
                <li>
                  <span className="font-semibold">Inspecciones Periódicas:</span> La Aduana realizará inspecciones
                  periódicas para verificar el mantenimiento de las condiciones de habilitación.
                </li>
              </ol>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}
