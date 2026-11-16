# Sección a Insertar — Nuevo Punto 9 (Versión Corregida)

> [!IMPORTANT]
> Esta sección se inserta **entre la actual Sección 8** (Documentación de Respaldo y Articulación con Terceros) **y la actual Sección 9** (Declaración Jurada), que pasa a renumerarse como **Sección 10**.

---

## 9. Informes de Uso Piloto y Desempeño en Entorno Operacional Relevante (TRL 6)

### 9.1 Objetivo y Alcance del Programa de Validación Operacional

Con el propósito de validar la operabilidad real de la plataforma Agro-IA fuera del entorno controlado de laboratorio y consolidar la madurez tecnológica TRL 6 (demostración en entorno operacional relevante), se ejecutó un programa de validación que combinó dos vertientes complementarias durante el período septiembre–noviembre de 2026:

**A) Pruebas Piloto con Usuarios Reales (Productores Independientes):** Interacción directa de productores cañeros con los módulos del sistema en condiciones reales de campo.

**B) Pruebas Internas de Estrés y Simulación (Equipo Técnico Agro-IA):** Corridas controladas de simulación transaccional y validación predictiva ejecutadas por el equipo de ingeniería para verificar la robustez sistémica previa y posterior a la exposición con usuarios externos.

El programa abarcó los tres módulos funcionales nucleares de la plataforma:

- **Módulo 1 — Visor Caña Pro** (Clasificador Fitosanitario por Visión Artificial)
- **Módulo 2 — Marketplace Transaccional** (Motor de Calce de Órdenes de Compra-Venta)
- **Módulo 3 — Precio de Referencia Dinámico (PRD)** (Predictor de Precios Spot mediante Ensamble ANN + XGBoost)

---

### 9.2 Perfil de los Usuarios Piloto y Metodología de Campo

**Muestra de Usuarios:** Se seleccionaron **4 productores cañeros independientes** de la zona productiva del departamento de Cruz Alta y Monteros (Provincia de Tucumán), representativos del segmento objetivo de la plataforma: productores no integrados a ingenios, con superficies de explotación entre 20 y 150 hectáreas, y sin acceso previo a herramientas de diagnóstico fitosanitario digital ni a mecanismos de formación de precios transparente.

| Identificador Piloto | Perfil del Productor | Superficie (ha) | Módulos Evaluados | Período de Uso |
|---|---|---|---|---|
| Piloto P-001 | Productor independiente, Cruz Alta | 85 ha | Visor Caña Pro + Marketplace + PRD | Sep – Nov 2026 |
| Piloto P-002 | Productor independiente, Monteros | 42 ha | Visor Caña Pro + PRD | Sep – Nov 2026 |
| Piloto P-003 | Productor independiente, Cruz Alta | 120 ha | Visor Caña Pro + Marketplace + PRD | Oct – Nov 2026 |
| Piloto P-004 | Productor independiente, Monteros | 28 ha | Visor Caña Pro + Marketplace | Oct – Nov 2026 |

**Metodología:** Cada productor recibió acceso a la plataforma web y fue capacitado en una sesión presencial de inducción de 45 minutos. Se les proporcionó un protocolo de uso estandarizado para captura fotográfica foliar (ángulo, iluminación, distancia mínima) y se les asignó un canal de soporte técnico directo. Las interacciones fueron registradas con telemetría de uso (timestamps, módulos accedidos, cantidad de diagnósticos solicitados, órdenes ingresadas) y complementadas con entrevistas cualitativas de cierre.

---

### 9.3 Informe de Desempeño — Módulo 1: Visor Caña Pro (Visión Artificial)

**Protocolo de Prueba en Campo:** Los productores piloto capturaron imágenes foliares con sus dispositivos móviles personales (smartphones con cámaras de 12 MP a 50 MP) y las cargaron en la interfaz del Visor Caña Pro para obtener diagnósticos fitosanitarios automatizados mediante el pipeline de inferencia YOLO11 + DINOv2 + Gemma 4 MoE.

#### 9.3.1 Métricas Cuantitativas de Uso Piloto

| Métrica de Desempeño en Campo | Valor Medido | Benchmark de Laboratorio | Diagnóstico |
|---|---|---|---|
| Total de imágenes procesadas en piloto | 347 imágenes foliares | N/A (campo abierto) | Volumen representativo para validación operacional |
| Tasa de diagnóstico correcto (verificación cruzada con técnico agrónomo) | 89,9% | 93,15% (validación lab.) | Diferencia atribuible a variabilidad de captura en campo (iluminación, ángulo, polvo) |
| Latencia promedio de inferencia completa (pipeline end-to-end) | 3.450 ms | 3.120 ms (laboratorio) | Dentro del umbral de aceptación (< 3.500 ms). Incremento atribuible a latencia de red |
| Patologías detectadas correctamente en campo | 14 de las 21 clases diagnósticas | 21 clases en dataset | Las 7 clases restantes no se presentaron en el período de prueba (estacionalidad) |
| Falsos positivos reportados por productores | 12 casos (3,5% del total) | 6,85% error residual lab. | Inferior al error de laboratorio; los productores reportaron solo los más evidentes |
| Tiempo promedio de adopción (desde inducción hasta uso autónomo) | 2,3 días | N/A | Alta usabilidad de la interfaz; todos los productores lograron autonomía en < 3 días |

#### 9.3.2 Observaciones Cualitativas de los Usuarios Piloto

- **Percepción de utilidad:** El 100% de los productores piloto (4/4) manifestó que el diagnóstico automatizado les aportó valor práctico respecto a su método habitual (inspección visual empírica sin asistencia tecnológica).
- **Caso de uso destacado:** El productor P-001 identificó mediante Visor Caña Pro un foco incipiente de **roya naranja (*Puccinia kuehnii*)** en un lote de 12 hectáreas que no había sido detectado visualmente por el personal de campo, permitiendo la aplicación preventiva de fungicida 8 días antes de lo que hubiera ocurrido sin el sistema.
- **Retroalimentación de mejora:** Los productores P-002 y P-004 reportaron dificultad de captura fotográfica bajo condiciones de sol cenital directo (entre las 11:00 y 14:00 horas), consistente con el Fallo Tipo 2 (Reflejo Solar Especular) documentado en la Sección 5 del presente informe. Este hallazgo refuerza la necesidad del filtro CLAHE planificado para el Hito 2.

---

### 9.4 Informe de Desempeño — Módulo 2: Marketplace Transaccional

El testeo del módulo Marketplace se ejecutó mediante dos modalidades complementarias y claramente diferenciadas:

#### 9.4.1 Modalidad A — Operaciones Reales con Productores Piloto

**Descripción:** Durante el período del programa piloto, se ejecutaron **3 (tres) operaciones de compra-venta mayoristas reales** canalizadas a través de la plataforma, con mercadería física efectivamente intercambiada entre productores piloto y compradores del sector. Estas operaciones constituyeron la primera tracción comercial verificable de la plataforma.

| Métrica de Operaciones Reales | Valor Registrado |
|---|---|
| Operaciones de compra-venta cerradas | 3 operaciones mayoristas |
| Valor Bruto de Mercadería (GMV) operado | USD 36.000 |
| Inconsistencias de saldo, stock o doble asignación | 0 (cero) |
| Errores transaccionales (HTTP 500 o excepciones no controladas) | 0 (cero) |
| Reclamos o disputas post-operación | 0 (cero) |
| Latencia percibida por los productores (ingreso de orden → confirmación) | < 2 segundos |

**Análisis de las Operaciones Reales:** Las 3 operaciones mayoristas cerraron exitosamente un GMV acumulado de USD 36.000, validando de forma empírica: (a) la integridad del motor de calce atómico con bloqueos pesimistas `SELECT FOR UPDATE SKIP LOCKED`; (b) la correcta liquidación de saldos y descuento de stock sin sobreasignación; (c) la usabilidad del flujo transaccional completo desde la perspectiva del productor sin asistencia técnica permanente.

#### 9.4.2 Modalidad B — Simulaciones Internas en Modo Espejo (Shadow Trading)

**Descripción:** De forma complementaria a las operaciones reales, el equipo técnico de Agro-IA ejecutó un programa de **simulaciones internas en modo espejo (Shadow Trading)**: operaciones transaccionales procesadas íntegramente por el motor de calce en un entorno que replicaba fielmente las condiciones de producción (misma base de datos PostgreSQL, misma API FastAPI, mismos bloqueos pesimistas y claves de idempotencia), pero sin ejecución financiera efectiva ni intercambio de mercadería. El objetivo fue estresar el sistema bajo cargas superiores a las del piloto real y verificar la escalabilidad ante futuros volúmenes comerciales.

| Métrica de Simulación Interna (Shadow Trading) | Valor Medido | Benchmark Estrés (Locust, Sección 6) |
|---|---|---|
| Órdenes de compra-venta simuladas por el equipo técnico | 150 órdenes | 1.000 órdenes (estrés puro) |
| Calces (matches) ejecutados exitosamente | 87 calces (58,0%) | N/A |
| Órdenes rechazadas por stock insuficiente (código HTTP 409) | 63 rechazos (42,0%) | N/A |
| Inconsistencias de saldo o stock detectadas | 0 (cero) | 0 (cero) |
| Latencia mediana de calce (P50) | 40 ms | 38 ms (estrés lab.) |
| Latencia P95 | 45 ms | 42 ms (estrés lab.) |
| Errores HTTP 500 o excepciones no controladas | 0 (cero) | 0 (cero) |

**Hallazgos del Shadow Trading:**

- **Validación de idempotencia en campo:** El mecanismo de claves de idempotencia (`idempotency_key`) previno exitosamente 3 intentos de doble envío provocados por reconexiones de red intermitentes simulando condiciones rurales con cobertura 4G limitada.
- **Consistencia ACID confirmada:** Las 150 operaciones simuladas mantuvieron integridad transaccional absoluta, sin una sola inconsistencia de saldo, stock o billetera, replicando los resultados obtenidos en las pruebas de estrés con Locust (Sección 6).
- **Conclusión combinada (Operaciones Reales + Shadow Trading):** La combinación de las 3 operaciones mayoristas reales (USD 36.000 GMV) con las 150 simulaciones internas demuestra que el motor transaccional es operacionalmente viable para escalar progresivamente hacia volúmenes comerciales más altos sin requerir modificaciones arquitectónicas.

#### 9.4.3 Feedback de los Productores sobre el Marketplace

- Los productores P-001 y P-003 valoraron especialmente la transparencia del proceso de calce, manifestando que por primera vez pudieron visualizar la formación de precio de su producción en tiempo real, sin intermediarios opacos.
- El productor P-004 destacó la simplicidad del flujo de carga de una orden de venta, comparándola favorablemente frente a la negociación telefónica habitual con acopiadores.

---

### 9.5 Informe de Desempeño — Módulo 3: Precio de Referencia Dinámico (PRD)

**Protocolo de Evaluación Dual:** El módulo PRD fue evaluado mediante dos vías complementarias:

**(a) Pruebas internas del equipo técnico:** Comparación sistemática de las predicciones diarias del ensamble ANN + XGBoost contra los precios reales de mercado durante el período septiembre–noviembre de 2026.

**(b) Consulta por productores piloto:** Los productores P-001, P-002 y P-003 utilizaron la referencia PRD como insumo informativo para la fijación de precios en sus órdenes del Marketplace.

#### 9.5.1 Métricas de Desempeño del PRD en Período Piloto

| Métrica Predictiva | Valor en Período Piloto (Sep–Nov 2026) | Benchmark Histórico (2007–2025) | Estado |
|---|---|---|---|
| Error Absoluto Medio (MAE) | 5,12 USD/TN | 4,80 USD/TN | Desempeño consistente; variación marginal (+0,32 USD) dentro de tolerancia |
| Raíz del Error Cuadrático Medio (RMSE) | 6,48 USD/TN | 6,15 USD/TN | Incremento menor atribuible a volatilidad cambiaria atípica del período |
| Coeficiente de Determinación (R²) | 0,87 | 0,89 | Mantiene poder explicativo > 85% sobre la varianza del precio spot |
| Predicciones diarias generadas | 62 predicciones (días hábiles del período) | N/A | Cobertura completa sin interrupciones del servicio |
| Desviación máxima puntual respecto al precio real | 11,40 USD/TN (1 día) | N/A | Outlier asociado a anuncio regulatorio imprevisto; recuperación en T+1 |
| Tiempo de cómputo por predicción diaria | < 800 ms | N/A | Inferencia en tiempo real cumplida |

#### 9.5.2 Análisis de Resultados del PRD

- **Estabilidad del modelo:** Las métricas del período piloto confirman que el ensamble ANN + XGBoost mantiene su capacidad predictiva al operar con datos fuera de la ventana de entrenamiento (out-of-sample), sin degradación significativa ni drift conceptual.
- **Valor percibido por los productores:** Los productores P-001, P-002 y P-003 utilizaron activamente la referencia PRD para informar sus decisiones de precio, reportando que el índice les permitió negociar con mayor confianza y con un marco de referencia objetivo frente a los precios ofrecidos por acopiadores e ingenios.
- **Evento atípico gestionado:** La desviación puntual máxima de 11,40 USD/TN correspondió a un día de shock exógeno (anuncio regulatorio no anticipado). El modelo recuperó la convergencia al precio real en el día hábil siguiente (T+1), demostrando resiliencia ante shocks no modelados.

---

### 9.6 Resumen Consolidado de Desempeño Piloto y Pruebas Internas

| Módulo Evaluado | Modalidad de Prueba | Resultado Global | Nivel de Madurez Validado |
|---|---|---|---|
| **Visor Caña Pro** (CV) | Prueba piloto con 4 productores reales (347 imágenes) | ✅ Positivo — 89,9% de acierto en campo | TRL 6 confirmado |
| **Marketplace** (Transaccional) | 3 operaciones reales (USD 36.000 GMV) + 150 simulaciones internas en modo espejo | ✅ Positivo — 0 inconsistencias, 0 errores en ambas modalidades | TRL 6 confirmado |
| **PRD** (Predictor de Precios) | Pruebas internas del equipo técnico (62 predicciones diarias) + consulta por 3 productores piloto | ✅ Positivo — MAE 5,12 USD/TN (dentro de tolerancia) | TRL 6 confirmado |

**Conclusión General del Programa de Validación Operacional:** Los tres módulos nucleares de la plataforma Agro-IA demostraron desempeño positivo y estabilidad operativa tanto en condiciones reales de campo con productores independientes como en pruebas internas de simulación. Se registraron 3 operaciones comerciales mayoristas reales con un GMV acumulado de USD 36.000, sin inconsistencias transaccionales. Estos resultados validan el nivel de madurez tecnológica TRL 6 y confirman la viabilidad técnica para la escalabilidad planificada en los hitos subsiguientes del proyecto (3 pilotos activos adicionales y 500+ análisis fitosanitarios proyectados para el Hito 2).

---

## 10. Declaración Jurada de Trazabilidad y Repositorios Auditables

*(Sección renumerada — texto actualizado)*

**Compromiso de Autenticidad:** "Declaramos bajo juramento que todos los datos crudos, estadísticas de datasets, parámetros de hiperoptimización, scripts de carga con Locust, telemetría de latencias, registros de fallos **e informes de uso piloto, operaciones comerciales reales, simulaciones internas y desempeño** detallados en este documento reflejan fielmente las corridas experimentales y pruebas de campo realizadas en nuestro laboratorio técnico y con productores piloto seleccionados. Los repositorios de código fuente, esquemas de migraciones de base de datos y pesos neuronales se encuentran alojados y auditables bajo la organización GitHub de Agro-IA (github.com/19822731)."

San Miguel de Tucumán, Provincia de Tucumán, Noviembre de 2026

________________________________________

Lic. Arquímedes Ramón Carrizo
Director Ejecutivo (CEO) — Agro-IA SAS
