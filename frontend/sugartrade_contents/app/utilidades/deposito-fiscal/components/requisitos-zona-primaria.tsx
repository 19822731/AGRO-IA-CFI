"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function RequisitosZonaPrimaria() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Requisitos para Zona Primaria y Consolidación</CardTitle>
        <CardDescription>
          Información detallada sobre los requisitos establecidos en el Código Aduanero y la normativa de la AFIP
          (ARCA).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="requisitos-generales">
            <AccordionTrigger>Requisitos Generales de la Zona Primaria</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <p>
                  Según el Código Aduanero y la normativa complementaria, una zona primaria habilitada debe cumplir con
                  los siguientes requisitos generales:
                </p>

                <div className="space-y-2">
                  <h4 className="font-medium">Delimitación</h4>
                  <p className="text-sm text-muted-foreground">
                    El área debe estar claramente delimitada con muros, cercas u otras barreras físicas que permitan
                    controlar el acceso y salida de mercancías y personas.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Señalización</h4>
                  <p className="text-sm text-muted-foreground">
                    Debe contar con señalización adecuada que identifique claramente los límites de la zona primaria,
                    las áreas de circulación, y las zonas restringidas.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Iluminación</h4>
                  <p className="text-sm text-muted-foreground">
                    Debe tener iluminación suficiente para las operaciones, incluso durante la noche, que permita la
                    correcta visualización de las mercancías y actividades.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Pisos</h4>
                  <p className="text-sm text-muted-foreground">
                    Los pisos deben ser resistentes y adecuados para el tránsito de vehículos de carga y el
                    almacenamiento de las mercancías, preferentemente de hormigón o material similar.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Seguridad</h4>
                  <p className="text-sm text-muted-foreground">
                    Implementación de medidas de seguridad para prevenir robos, pérdidas y accesos no autorizados, como
                    cámaras de vigilancia, personal de seguridad, y sistemas de control de acceso.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Oficinas</h4>
                  <p className="text-sm text-muted-foreground">
                    Debe contar con oficinas adecuadas para el personal de la Aduana y del depósito fiscal, con el
                    equipamiento necesario para realizar sus funciones.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Servicios</h4>
                  <p className="text-sm text-muted-foreground">
                    Disponer de servicios básicos como energía eléctrica, agua potable y sanitarios para el personal y
                    usuarios de la zona primaria.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Equipamiento</h4>
                  <p className="text-sm text-muted-foreground">
                    Contar con el equipamiento necesario para la manipulación de carga, como montacargas, balanzas
                    calibradas, y equipos de escaneo si son requeridos.
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="requisitos-consolidacion">
            <AccordionTrigger>Requisitos Adicionales para la Consolidación</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <p>
                  Para realizar operaciones de consolidación en la zona primaria, se deben cumplir los siguientes
                  requisitos adicionales:
                </p>

                <div className="space-y-2">
                  <h4 className="font-medium">Espacio Suficiente</h4>
                  <p className="text-sm text-muted-foreground">
                    Debe haber espacio adecuado para realizar las operaciones de consolidación de manera segura y
                    eficiente, considerando el volumen de mercancías a manejar.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Área de Inspección</h4>
                  <p className="text-sm text-muted-foreground">
                    Un área designada para la inspección de las mercancías por parte de la Aduana, con iluminación
                    adecuada y espacio suficiente para abrir y revisar los bultos.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Procedimientos Documentados</h4>
                  <p className="text-sm text-muted-foreground">
                    Tener procedimientos operativos estándar (POE) documentados para el proceso de consolidación,
                    incluyendo los controles de seguridad y verificación de mercancías.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Registro de Operaciones</h4>
                  <p className="text-sm text-muted-foreground">
                    Mantener un registro detallado de todas las operaciones de consolidación realizadas, incluyendo
                    fechas, mercancías, pesos, y documentación asociada.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Personal Capacitado</h4>
                  <p className="text-sm text-muted-foreground">
                    Contar con personal capacitado en las normativas aduaneras y los procedimientos específicos de
                    consolidación, que pueda garantizar el cumplimiento de las regulaciones.
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="normativa">
            <AccordionTrigger>Normativa Aplicable</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <p>Las operaciones de consolidación en zona primaria están reguladas por las siguientes normativas:</p>

                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <span className="font-medium">Código Aduanero (Ley 22.415)</span>
                    <p className="text-sm text-muted-foreground">
                      Establece el marco legal general para las operaciones aduaneras, incluyendo las realizadas en
                      zonas primarias.
                    </p>
                  </li>

                  <li>
                    <span className="font-medium">Resolución General AFIP 4352/2018</span>
                    <p className="text-sm text-muted-foreground">
                      Regula los procedimientos para la habilitación de depósitos fiscales y zonas primarias.
                    </p>
                  </li>

                  <li>
                    <span className="font-medium">Resolución General AFIP 3343/2012</span>
                    <p className="text-sm text-muted-foreground">
                      Establece los requisitos para la consolidación y desconsolidación de mercaderías.
                    </p>
                  </li>

                  <li>
                    <span className="font-medium">Resolución General AFIP 2573/2009</span>
                    <p className="text-sm text-muted-foreground">
                      Regula el uso de precintos aduaneros y medidas de seguridad para el transporte de mercancías.
                    </p>
                  </li>
                </ul>

                <p className="text-sm text-muted-foreground">
                  Nota: La normativa puede estar sujeta a actualizaciones. Se recomienda consultar siempre la
                  legislación vigente en el sitio oficial de la AFIP.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="proceso">
            <AccordionTrigger>Proceso de Habilitación</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <p>
                  Para obtener la habilitación de una zona primaria para realizar consolidaciones, se debe seguir el
                  siguiente proceso:
                </p>

                <ol className="list-decimal pl-5 space-y-2">
                  <li>
                    <span className="font-medium">Presentación de solicitud</span>
                    <p className="text-sm text-muted-foreground">
                      Presentar ante la Aduana local una solicitud formal de habilitación, acompañada de la
                      documentación requerida.
                    </p>
                  </li>

                  <li>
                    <span className="font-medium">Documentación técnica</span>
                    <p className="text-sm text-muted-foreground">
                      Planos del predio, descripción de las instalaciones, medidas de seguridad, y equipamiento
                      disponible.
                    </p>
                  </li>

                  <li>
                    <span className="font-medium">Inspección</span>
                    <p className="text-sm text-muted-foreground">
                      La Aduana realizará una inspección física del lugar para verificar el cumplimiento de los
                      requisitos.
                    </p>
                  </li>

                  <li>
                    <span className="font-medium">Subsanación de observaciones</span>
                    <p className="text-sm text-muted-foreground">
                      Si la Aduana realiza observaciones, se deberán subsanar dentro del plazo establecido.
                    </p>
                  </li>

                  <li>
                    <span className="font-medium">Resolución</span>
                    <p className="text-sm text-muted-foreground">
                      La Aduana emitirá una resolución aprobando o rechazando la solicitud de habilitación.
                    </p>
                  </li>

                  <li>
                    <span className="font-medium">Garantía</span>
                    <p className="text-sm text-muted-foreground">
                      En caso de aprobación, se deberá constituir una garantía a favor de la AFIP para cubrir eventuales
                      incumplimientos.
                    </p>
                  </li>
                </ol>

                <p className="text-sm text-muted-foreground">
                  El proceso puede tomar entre 30 y 90 días, dependiendo de la complejidad de la solicitud y la carga de
                  trabajo de la Aduana.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}
