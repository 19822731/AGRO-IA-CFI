# Proyecto Agro-IA: Marketplace de Azúcar con Precios Dinámicos

Este proyecto tiene como objetivo desarrollar e implementar un modelo predictivo y un sistema de precios dinámicos para un marketplace de azúcar. El propósito final no es solo predecir la oferta y la demanda, sino utilizar estas predicciones para moderar activamente la volatilidad de los precios a lo largo del año.

El sistema transformará el marketplace de una plataforma pasiva de transacciones a un agente inteligente de estabilización de mercado, creando un entorno más predecible y eficiente para todos los participantes (productores, industriales y distribuidores).

---

## Arquitectura General

El proyecto Agro-IA se compone de dos sistemas principales que trabajan en conjunto:

1.  **Entorno de Simulación y Modelado (`Algoritmo v.2/`):**
    *   **Propósito:** Actúa como el "cerebro" analítico del sistema. Es un entorno de ciencia de datos basado en Python, Pandas y modelos de Machine Learning.
    *   **Función Clave:** Aquí reside la lógica de negocio más compleja para el cálculo del Precio de Referencia Dinámico (PRD). El script `motor_prd_diario.py` es el responsable de ejecutar la simulación, pronosticar el consumo y calcular el PRD usando la fórmula documentada (`PRD = P_base * (1 - K * ΔS)`), que considera la desviación del stock respecto a los objetivos.
    *   **Resultado:** Genera el valor del PRD diario, que es consumido por la plataforma operacional.

2.  **Plataforma Operacional (Aplicación Principal):**
    *   **Propósito:** Es la aplicación en tiempo real (API FastAPI) con la que interactúan los usuarios y que opera el mercado.
    *   **Función Clave:**
        *   **Ingesta del PRD:** Consume el valor del PRD calculado por el entorno de modelado y lo persiste en su base de datos para uso en tiempo real.
        *   **Gestión del Marketplace:** Se encarga del motor de calce de órdenes, la lógica de comisiones, la gestión de usuarios, billeteras y la exposición de endpoints de API.
        *   **Aplicación de Lógica de Mercado:** Utiliza el PRD ingerido para aplicar el sofisticado modelo de **comisiones dinámicas y auto-ajustables**, que es el principal mecanismo de influencia sobre el mercado.

Esta arquitectura separa claramente el análisis pesado y la modelización de la operación transaccional en tiempo real, garantizando robustez y escalabilidad.

---

## Notas de Auditoría de Código (Noviembre 2025)

Una auditoría reciente del código ha verificado la correspondencia entre la documentación y la implementación, con los siguientes hallazgos clave:

*   **Cálculo del PRD:** La lógica compleja y documentada (`PRD = P_base * (1 - K * ΔS)`) está **correctamente implementada** en el script `Algoritmo v.2/motor_prd_diario.py`. La aplicación principal (en `app/prd/prd_service.py`) solo se encarga de ingerir y persistir este valor, no de calcularlo.
*   **Lógica de Mercado:** Los mecanismos más sofisticados descritos en la documentación están **plenamente implementados y funcionales** en la aplicación principal:
    *   El **motor de calce asíncrono** con bloqueo pesimista (`SELECT ... FOR UPDATE SKIP LOCKED`) funciona como se describe en `marketplace_service.py`. **Además, ahora prioriza explícitamente las órdenes por su menor desviación respecto al PRD, reforzando la estabilización del mercado.**
    *   El **modelo de comisiones dinámicas y asimétricas** que reacciona al PRD está implementado correctamente en `marketplace_service.py`.
    *   El sistema de **auto-ajuste de comisiones** (`agresividad_global`) es gestionado por una tarea Celery diaria (`system.update_commission_aggressiveness`) como se documenta.

En resumen, la funcionalidad descrita en este documento está presente y operativa en el código, respetando la arquitectura de separación de responsabilidades.

---

## Registro de Cambios (Changelog)

### 26 de noviembre de 2025 (Fase 2: Restauración y Evolución del Modelo de Comisiones)

Esta actualización representa una restauración completa de la funcionalidad del marketplace y una evolución significativa del motor de precios y comisiones.

*   **Restauración Completa del Marketplace:** Se ha reimplementado desde cero toda la lógica de negocio en `marketplace_service.py`, que se encontraba en un estado inconsistente. Esto incluye la creación de órdenes, cancelaciones, consulta del libro de órdenes e historiales de usuario.
*   **Implementación de Motor de Calce Asíncrono:** El motor de calce de órdenes ahora opera como una tarea Celery periódica, supervisada por un planificador que asegura el procesamiento continuo y concurrente de todos los productos activos.
*   **Modelo de Comisiones Híbrido y Auto-Ajustable:** Se ha implementado un sofisticado modelo de comisiones asimétricas que incluye:
    *   **Lógica de Estabilización:** Las comisiones incentivan activamente que las transacciones ocurran cerca del Precio de Referencia Dinámico (PRD).
    *   **Reglas de Negocio Avanzadas:** Se protege al vendedor de aumentos de comisión en mercados a la baja y se permite a la plataforma participar del "ahorro extra" del comprador.
    *   **Modelo Auto-Ajustable:** Un nuevo sistema de "agresividad global" se calibra diariamente para que la comisión promedio de la plataforma tienda a un objetivo de rentabilidad configurable (actualmente 4.5%).
*   **Preparación para Machine Learning:**
    *   **Análisis Zonal:** Se ha extendido el modelo de datos para incluir `provincia` y `pais` por usuario, sentando las bases para análisis geográficos de la demanda.
    *   **Nuevas Tareas de Recolección de Datos:** Se han creado tareas automáticas para registrar el historial de demanda por provincia y para calcular estadísticas diarias del mercado (VWAP, volatilidad), generando data-sets para futuros modelos de ML.
    *   **Integración de Esqueleto de ML:** El cálculo de comisiones ya está integrado con un placeholder para un futuro modelo de ML (`predecir_factor_estacionalidad`), haciendo que el sistema esté listo para incorporar predicciones avanzadas.

**Impacto:** El sistema no solo ha sido restaurado a un estado completamente funcional, sino que ha evolucionado a una plataforma de mercado inteligente de segunda generación. El nuevo motor de comisiones es proactivo, se auto-regula y está preparado para ser potenciado por machine learning, llevando la estabilización del mercado y los objetivos de negocio a un nuevo nivel de sofisticación.

### 26 de noviembre de 2025 (Arquitectura Multi-Producto y Estabilización del Entorno)

*   **Modelo de Datos Genérico:** Se refactorizó el modelo de datos para soportar múltiples commodities (azúcar, arroz, etc.) y mercados (interno, exportación). Se creó una nueva tabla `productos` que actúa como un mapa centralizado entre un instrumento negociable y su correspondiente segmento de algoritmo (`segmento_prd`).
*   **Estabilización de Base de Datos y Migraciones:** Se diagnosticó y resolvió una serie de problemas complejos relacionados con el entorno de Docker y el historial de migraciones de Alembic. Esto incluyó la corrección de scripts de migración autogenerados y la resincronización completa de la base de datos para asegurar un estado limpio y consistente.
*   **Implementación de Nuevos Endpoints y Esquemas:** Se añadieron los endpoints y esquemas para el `Libro de Órdenes` (`GET /mercado/productos/{producto_id}/orderbook`) y el `Historial de Usuario` (`/mercado/historial/...`).

**Impacto:** La arquitectura del sistema ahora es robusta, escalable y está preparada para el futuro crecimiento a múltiples productos y mercados. El entorno de desarrollo es estable y la base de datos está sincronizada, desbloqueando el desarrollo de futuras funcionalidades.

### 25 de noviembre de 2025 (Mejoras Fundamentales del Marketplace y Comisiones Inteligentes)

*   **Configuración Externalizada:** Se han movido las constantes de negocio (comisiones, tamaños de tick, etc.) desde `marketplace_service.py` a `config.py` para una mayor mantenibilidad. Se añadieron nuevas configuraciones para la comisión base del comprador y límites mínimo/máximo de comisión.
*   **Precio de Referencia Robusto:** La función `get_precio_referencia_dinamico` ahora incluye un mecanismo de fallback, utilizando el último PRD registrado si no se encuentra uno actualmente válido.
*   **Comisiones Inteligentes y Orientadas a Objetivos:**
    *   Se ha implementado un sofisticado algoritmo de comisiones asimétricas (comprador/vendedor) que **actúa como un agente estabilizador del mercado**.
    *   Este algoritmo ajusta dinámicamente las comisiones basándose en el `exportable_balance` (para establecer tasas base de escasez/superávit) y en la **desviación del precio de mercado respecto al PRD objetivo**.
    *   La intensidad de este ajuste es configurable mediante `K_FACTOR` y las comisiones finales se ciñen a los rangos `MIN_COMISION` y `MAX_COMISION`.
*   **Manejo Robustecido de Órdenes a Mercado:** El motor de calce ahora rechaza explícitamente los cruces de "orden a mercado contra orden a mercado" y determina el precio de ejecución de manera estándar (la orden pasiva fija el precio) para mejorar la previsibilidad y la justicia del mercado.

**Impacto:** El marketplace ha evolucionado de una plataforma transaccional a un sistema inteligente y proactivo. La gestión de precios y comisiones ahora no solo reacciona, sino que activamente guía el comportamiento del mercado hacia los objetivos estratégicos definidos por los algoritmos, mejorando la estabilidad y la eficiencia. El código es más modular, robusto y fácil de configurar y mantener.

### 21 de agosto de 2025 (Estabilización del Entorno y Pruebas de Conexión)
*   **Diagnóstico y Reparación del Entorno Docker:** Se diagnosticaron y resolvieron una serie de problemas que impedían el arranque de los servicios `api` y `worker`.
    *   **Conflicto de Migraciones (Alembic):** Se identificó y solucionó un conflicto de "múltiples cabezas" en el historial de Alembic que causaba un error de "columna duplicada".
    *   **Error de Sintaxis del Worker:** Se corrigió un error de sintaxis en `celery_worker.py` que impedía el arranque del worker.
    *   **Error de Importación:** Se solucionó un `NameError` en `main.py` al importar el `marketplace_service`.
*   **Prueba de Conexión con Frontend (Vercel):**
    *   Se expuso la API local a internet de forma segura utilizando un túnel de `ngrok`.
    *   Se verificó con éxito una prueba de login de extremo a extremo, confirmando que la comunicación entre el frontend en Vercel y el backend local es completamente funcional.

**Impacto:** El entorno de desarrollo local ahora es estable y funciona de manera fiable. Se ha validado la integración con un frontend externo, desbloqueando el desarrollo y las pruebas de la aplicación completa.

### 20 de agosto de 2025 (Mantenimiento y Reactivación de API)
*   **Reactivación Completa de Endpoints del Marketplace:** Se ha restaurado la funcionalidad completa de la API del marketplace, que había quedado deshabilitada tras una refactorización mayor.
    *   **Implementación de Lógica de Órdenes:** Se implementó y conectó la lógica de negocio para `crear_orden` y `cancelar_orden` en `marketplace_service.py`.
    *   **Reactivación de Endpoints de Órdenes:** Se reactivaron los endpoints `POST /mercado/ordenes/` y `DELETE /mercado/ordenes/{orden_id}` en `main.py`.
    *   **Implementación de Lógica de Precios:** Se implementó la lógica para consultar el precio de la última transacción (`get_precio_actual`) y el Precio de Referencia Dinámico (`get_precio_referencia_dinamico`).
    *   **Reactivación de Endpoints de Precios:** Se reactivaron los endpoints `GET /mercado/precio-actual/{producto_id}` y `GET /mercado/precio-referencia-dinamico/{producto_id}`.
*   **Verificación con Pruebas:** Se ejecutó la suite completa de pruebas (`pytest`) para asegurar que las nuevas implementaciones no introdujeron regresiones. Todas las pruebas pasaron exitosamente.

**Impacto:** La API del marketplace vuelve a ser completamente funcional, permitiendo la creación, cancelación y consulta de órdenes y precios. El sistema ha sido restaurado a un estado operativo y verificado, cerrando la brecha entre la robusta lógica de backend y la interfaz de la aplicación.

### 19 de agosto de 2025 (P3 - Finalización y Validación Total)
*   **Validación Completa del Sistema:** Se ha completado un ciclo exhaustivo de correcciones y validación, dejando el proyecto en un estado estable y listo para producción.
    *   **Configuración de Pruebas Unificada:** Se refactorizó y consolidó toda la configuración de pruebas en un único `tests/conftest.py` robusto. Esta nueva configuración utiliza una base de datos de prueba SQLite aislada para todas las pruebas, eliminando conflictos de conexión y asegurando la consistencia.
    *   **Suite de Pruebas Completa:** Se corrigieron y refactorizaron todas las suites de pruebas (unitarias, de integración y E2E) para funcionar de manera fiable bajo el nuevo esquema. Las pruebas específicas de PostgreSQL ahora se omiten automáticamente si no se está en el entorno adecuado.
    *   **Superación de Pruebas:** La suite de pruebas completa ahora se ejecuta exitosamente, validando formalmente la funcionalidad end-to-end, la seguridad (RBAC), la idempotencia y la resiliencia de todos los componentes críticos.

**Impacto:** El proyecto ha alcanzado el máximo nivel de madurez técnica planificado. La base de código es estable, la funcionalidad está validada por una suite de pruebas completa y la configuración del proyecto es robusta y consistente. El sistema está listo para ser desplegado (Go-Live).

### 19 de agosto de 2025 (P3.2 - Seguridad y Auditoría)
*   **Implementación de Controles de Seguridad y Trazabilidad:** Se han añadido capas fundamentales de seguridad y auditoría para preparar el sistema para un entorno de producción.
    *   **Control de Acceso Basado en Roles (RBAC):** Se implementó un sistema de roles en el modelo de `Usuario`. Los roles ahora se incluyen en el token JWT durante el login, permitiendo una autorización granular.
    *   **Protección de Endpoints Críticos:** El endpoint para ejecutar el cálculo de PRD (`POST /api/prd/run`) ahora está protegido y solo es accesible para usuarios con el rol `operator`.
    *   **Log de Auditoría de API:** Se creó una nueva tabla `api_audit_log` y un middleware en FastAPI para registrar todas las peticiones a la API. Esto captura quién hizo qué, cuándo, desde dónde y con qué resultado, proveyendo una trazabilidad completa de todas las acciones.

**Impacto:** La seguridad del sistema se ha incrementado significativamente. El control de acceso granular previene operaciones no autorizadas, y el log de auditoría proporciona una herramienta indispensable para la monitorización de seguridad, la depuración de incidentes y el cumplimiento de normativas.

### 19 de agosto de 2025 (P2.5 - QA y Hardening de Resiliencia)
*   **Robustecimiento del Sistema:** Se han implementado mejoras de resiliencia y se han añadido pruebas de QA para asegurar la estabilidad del sistema bajo condiciones de producción.
    *   **Helper de Reintentos de BD:** Se creó y aplicó un helper de reintentos (`with_db_retry`) en las operaciones de base de datos más críticas (motor de calce y servicio PRD) para manejar de forma automática y consistente los errores transitorios como `deadlocks`.
    *   **Idempotencia Fuerte:** Se robusteció la idempotencia del servicio PRD para que las peticiones duplicadas no generen errores, sino que devuelvan el recurso existente, validado con pruebas E2E.
    *   **Pruebas de Carga:** Se añadió un `locustfile.py` base en `tests_perf/` para facilitar la ejecución de pruebas de carga sobre los endpoints críticos.
    *   **Seguridad de API (RBAC):** Se implementó un sistema de roles (ej. `viewer`, `operator`). El endpoint para ejecutar el cálculo de PRD (`POST /api/prd/run`) ahora está protegido y solo es accesible para roles autorizados.
    *   **Dockerfile Multi-stage:** Se optimizó el `Dockerfile` para producción, resultando en una imagen final más ligera y segura.

**Impacto:** El proyecto ha sido sometido a un proceso de endurecimiento final, mejorando su resiliencia, seguridad y observabilidad. Con la adición de una base para pruebas de carga y un sistema de roles, el proyecto alcanza un alto grado de madurez, completando la fase P2 y quedando listo para su despliegue (Go-Live).

### 18 de agosto de 2025 (P2.3 - MLOps Liviano)
*   **Infraestructura para Gobernanza de Modelos:** Se implementó la base del framework de MLOps para el versionado, monitoreo y auditoría de modelos de Machine Learning.
    *   **Esquema de MLOps:** Se añadieron a la base de datos las tablas `ml_models` (para versionado), `ml_metrics` (para registro de rendimiento) y `predictions_prod` (para almacenar predicciones de producción) mediante migraciones de Alembic.
    *   **Servicio de Detección de Drift:** Se creó un nuevo servicio en `app/mlops/drift_service.py` capaz de calcular el MAPE sobre las predicciones en producción y detectar si el rendimiento del modelo se ha degradado por debajo de un umbral configurable.
    *   **Tarea Programada de Monitoreo:** Se añadió una tarea periódica de Celery (`mlops.check_drift`) que se ejecuta cada 15 minutos para monitorear el drift del modelo activo y persistir las métricas de MAPE.
    *   **Endpoint de Auditoría:** Se expuso un nuevo endpoint `GET /ml/auditoria` que permite consultar en tiempo real el modelo activo, sus últimas métricas de rendimiento y el estado actual de drift.
    *   **Configuración de Entorno:** Se añadió un servicio `worker` a `docker-compose.yml` para ejecutar las tareas de Celery y se configuraron las variables de entorno necesarias para el sistema de MLOps.
    *   **Pruebas de Contrato y E2E:** Se añadieron suites de pruebas (`tests_p23/`) para validar la lógica del servicio de drift y el comportamiento del endpoint de auditoría, asegurando la correctitud de la implementación.

**Impacto:** El proyecto ahora cuenta con un sistema automatizado para monitorear la salud de sus modelos de ML en producción. Esto permite una gobernanza proactiva, alertando sobre la degradación del modelo y proporcionando la visibilidad necesaria para decidir cuándo es necesario un reentrenamiento, cerrando así el ciclo de vida de MLOps.

### 18 de agosto de 2025 (P2.2 - Validación y Pruebas)
*   **Suite de Pruebas para Ingesta de Datos:** Se añadió una nueva suite de pruebas (`tests_p22/`) para validar formalmente la capa de ingesta y trazabilidad de datos.
    *   **Prueba de Idempotencia:** Se verifica que el registro de un mismo archivo (mismo contenido y fuente) no crea registros duplicados en la base de datos.
    *   **Prueba de Integridad Referencial:** Se valida que las relaciones de clave foránea (ej. `ON DELETE CASCADE`) entre `DataIngesta` y `DataProvenance` funcionan correctamente.
    *   **Prueba de Unicidad:** Se confirma que la `UNIQUE constraint` a nivel de base de datos previene la duplicidad de datos de forma efectiva.
    *   **Robustez de Pruebas:** La suite se ha hecho robusta para omitir pruebas de Postgres en entornos donde la base de datos no es accesible, evitando fallos innecesarios en pipelines de CI/CD.

**Impacto:** La funcionalidad de ingesta de datos ahora está respaldada por una suite de pruebas automatizadas que garantiza su correctitud, idempotencia y la integridad de los datos. Esto aumenta la confianza en el pipeline de datos antes de construir capas de ML sobre él.

### 18 de agosto de 2025 (P2.2 - Ingesta y Trazabilidad de Datos)
*   **Fundación para Datos Auditables:** Se ha implementado la base para un pipeline de datos robusto y auditable.
    *   **Esquema de Trazabilidad:** Se añadieron los modelos `DataIngesta` y `DataProvenance` a la base de datos mediante una migración de Alembic. Esto permite registrar el origen de cada dataset (fuente, hash) y trazar cómo se utiliza en transformaciones posteriores.
    *   **Servicio de ETL Integrado:** Se creó un nuevo paquete `app/etl` con un `etl_service.py` que maneja la lógica de registro de datasets de forma idempotente. El servicio se integra con el ORM y la gestión de sesiones del proyecto.
    *   **Interfaz de Línea de Comandos (CLI):** Se añadió un `etl_cli.py` para interactuar con el servicio de ETL, permitiendo registrar nuevos archivos y su procedencia desde la línea de comandos.

**Impacto:** El proyecto ahora tiene un mecanismo centralizado y versionado para la ingesta de datos. Cada dataset que entre al sistema puede ser rastreado, y su integridad verificada por hash, sentando las bases para la reproducibilidad de los modelos de ML y la gobernanza de datos (MLOps).

### 18 de agosto de 2025 (P2 - Operabilidad Avanzada)
*   **Implementación de Observabilidad de Producción:**
    *   **Logging Estructurado y Correlación:** Se implementó un sistema de logging estructurado (JSON) en toda la aplicación (API y workers Celery). Se añadió un `X-Correlation-ID` a cada petición, que se propaga automáticamente a las tareas asíncronas, permitiendo el seguimiento distribuido completo de cualquier operación.
    *   **Stack de Monitoreo Provisionado:** Se añadió una configuración completa para un stack de observabilidad en `docker-compose.yml` (Prometheus, Grafana, Loki, Promtail). La configuración se encuentra en el nuevo directorio `infra/`.
    *   **Aprovisionamiento Automático:** Grafana ahora se aprovisiona automáticamente con las fuentes de datos (Prometheus, Loki) y un dashboard de salud básico, eliminando la configuración manual.
    *   **Robustez y Correcciones:** Se aplicaron mejoras críticas, como la prevención de fugas de `correlation-id` entre tareas de Celery, la corrección de las métricas en los dashboards y la configuración de Promtail para parsear logs JSON.

**Impacto:** El proyecto ha alcanzado un nivel de operabilidad listo para producción. Ahora es posible monitorear, depurar y seguir operaciones de manera eficiente y centralizada. El stack de observabilidad se levanta y configura de forma automática, garantizando consistencia y facilitando enormemente el despliegue y la gestión.

### 17 de agosto de 2025 (P2 - Operabilidad)
*   **Inicio de la Fase de Operabilidad:**
    *   **Métricas y Health Checks:** Se instrumentó la aplicación para exponer un endpoint `/metrics` compatible con Prometheus. Se añadieron métricas personalizadas para el motor de calce (éxitos, rechazos, latencia, reintentos por deadlock).
    *   **Endpoints de Salud:** Se implementaron los endpoints `/healthz` (liveness) y `/readyz` (readiness) para verificar la salud de la aplicación y sus dependencias (Base de Datos y Redis).
    *   **Orquestación de Monitoreo:** Se añadió un servicio de Prometheus a la configuración de `docker-compose.yml` para recolectar y almacenar las métricas expuestas por la API.

**Impacto:** El sistema ahora cuenta con una base de observabilidad que permite monitorear su estado, rendimiento y comportamiento en tiempo real. Esto es un pilar fundamental para la operación y el mantenimiento de la plataforma en un entorno de producción.

### 17 de agosto de 2025 (Endurecimiento P1)
*   **Endurecimiento Adicional del Sistema:**
    *   **Contabilidad de Comisiones:** Se añadió una tabla `ledger_comisiones` para registrar y contabilizar todas las comisiones generadas por la plataforma, asegurando que no haya fugas de valor.
    *   **Idempotencia Basada en Estado:** Se mejoró la generación de la clave de idempotencia para que dependa del estado de las órdenes, haciéndola más robusta que la versión anterior basada en tiempo.
    *   **Sincronización Modelo-DB:** Se declararon todos los índices (incluidos los parciales) y constraints directamente en los modelos de SQLAlchemy, asegurando que `alembic check` pase y que el modelo sea la única fuente de verdad para el esquema.
    *   **Prevención de Race Conditions:** Se añadió una constraint `UNIQUE` a las billeteras de activos y se implementó una lógica `UPSERT` para prevenir condiciones de carrera durante la creación de billeteras para nuevos activos.

**Impacto:** Se han cerrado varios vectores de ataque sutiles y condiciones de carrera. La contabilidad de la plataforma es ahora explícita y la correspondencia entre los modelos de la aplicación y el esquema de la base de datos es total, lo que aumenta la fiabilidad y facilita el mantenimiento.

### 17 de agosto de 2025 (Finalización P1)
*   **Validación y Limpieza de Pruebas:**
    *   Se implementó una suite de pruebas (`tests/test_matching.py`) para validar la robustez del motor de calce, cubriendo casos de sobregiro, idempotencia y concurrencia básica.
    *   Se añadieron pruebas de invariantes de la base de datos (`tests/test_db_invariants.py`) para verificar la correcta creación de índices y constraints de unicidad.
    *   Se eliminaron suites de pruebas obsoletas (`tests/test_marketplace_service.py`) que correspondían a una implementación anterior.
    *   Todas las pruebas del motor de calce y de la base de datos pasan exitosamente, confirmando que la refactorización de robustez (P1) fue exitosa.

**Impacto:** Se ha verificado formalmente que el núcleo del marketplace es robusto y se comporta como se espera bajo condiciones de estrés, previniendo errores de datos y condiciones de carrera. La base de código de pruebas está limpia y alineada con la funcionalidad actual. El proyecto está listo para avanzar a las tareas de operabilidad (P2).

### 17 de agosto de 2025
*   **Refactorización de Robustez y Preparación para Producción:**
    *   **Configuración Centralizada:** Se eliminaron todos los secretos hardcodeados (clave de JWT, URL de la base de datos). La configuración ahora se gestiona de forma centralizada a través de `config.py` y un archivo `.env`, utilizando `pydantic-settings`.
    *   **Precisión Monetaria:** Se reemplazaron todos los tipos `Float` por `DECIMAL(18, 4)` en los modelos de la base de datos (`models.py`) y `Decimal` en los esquemas Pydantic (`schemas.py`) y la lógica de negocio. Esto previene errores de redondeo en cálculos financieros.
    *   **Consistencia de la Base de Datos:** Se unificó la declaración de la `Base` de SQLAlchemy en `database.py` para eliminar inconsistencias de metadatos entre la aplicación y Alembic.
    *   **Entorno de Ejecución (Docker):** Se corrigió y robusteció el `Dockerfile` y `docker-compose.yml` para asegurar la correcta instalación de dependencias (Alembic, Uvicorn, Psycopg2, python-multipart) y el arranque fiable de los servicios.
    *   **Seguridad de Endpoints:** Se implementó la dependencia `get_current_user` que faltaba en el módulo `security.py` para proteger adecuadamente las rutas que requieren autenticación.
    *   **Migración de Datos:** Se generó y aplicó una migración de base de datos robusta para actualizar los tipos de datos a `NUMERIC`, incluyendo casts explícitos para garantizar la compatibilidad.

**Impacto:** El proyecto ha sido elevado de un prototipo funcional a una base de código significativamente más segura, robusta y preparada para un entorno de producción. Se han eliminado riesgos críticos de seguridad, inconsistencia de datos y configuración.

### 17 de agosto de 2025 (Continuación)
*   **P1 - Robustez del Mercado:**
    *   **Motor de Calce Concurrente y Atómico:** Se refactorizó completamente el motor de calce (`ejecutar_calce`) para ser seguro en entornos de alta concurrencia.
        *   **Bloqueo Pesimista:** Se implementó `SELECT ... FOR UPDATE SKIP LOCKED` para bloquear las filas de órdenes y billeteras durante una transacción, evitando que dos workers procesen los mismos datos.
        *   **Atomicidad:** Todas las operaciones de un calce (débitos, créditos, actualización de órdenes) ahora ocurren dentro de una única transacción de base de datos, garantizando la consistencia de los datos.
        *   **Idempotencia:** Se añadió una `idempotency_key` a la tabla de transacciones para prevenir la duplicación de operaciones en caso de reintentos de tareas.
        *   **Manejo de Deadlocks:** La tarea Celery ahora detecta y maneja `deadlocks` de base de datos con una estrategia de reintentos y backoff exponencial.
    *   **Optimización de Consultas:** Se añadieron índices parciales a la tabla `ordenes` para acelerar drásticamente la búsqueda de las mejores órdenes de compra y venta.

**Impacto:** El corazón del marketplace ahora es robusto y escalable. Se han eliminado las condiciones de carrera, se previene la corrupción de datos (saldos incorrectos, órdenes duplicadas) y el sistema está preparado para un volumen transaccional real.

### 28 de julio de 2025
*   Creación inicial del archivo `README.md` con la estructura del proyecto y las instrucciones para colaboradores.
*   Instalación de librerías Python: `PyMuPDF`, `openpyxl`, `tabulate`.
*   Análisis y normalización del archivo `mercado_interno.xlsx`, excluyendo los datos incompletos del año 2007.
*   Extracción de datos estructurados del PDF `balance azucarero-ac.pdf` y generación de `balance_azucarero_processed.csv`.

**Impacto:** Establece la base para la colaboración y el seguimiento de cambios. Los datos históricos y de balance azucarero están ahora en un formato más utilizable.

### 8 de agosto de 2025
*   **Fase 1 - Componente Predictivo:**
    *   **Configuración del Entorno y Dependencias:** Se actualizaron `requirements.txt` con librerías de ML (`scikit-learn`, `xgboost`, `statsmodels`, `prophet`) y se instalaron.
    *   **Desarrollo de Modelos de Predicción:** Se creó el directorio `src/` y el archivo `src/prediction_models.py` con la estructura base para los modelos de producción y consumo.
    *   **Integración de Predicciones:** Se añadieron esquemas Pydantic (`ProduccionMensualBase`, `ConsumoMensualBase`, `PrecioHistoricoBase`) a `schemas.py`. Se modificó `marketplace_service.py` para importar `PredictionModels`, instanciarla globalmente y se añadió la tarea Celery `run_predictions` para entrenar/cargar modelos, realizar predicciones y guardarlas en la base de datos (con datos ficticios por ahora).

**Impacto:** Se ha establecido la infraestructura inicial para la integración de los modelos de Machine Learning y la gestión de predicciones en el sistema.

### 8 de agosto de 2025 (Continuación)
*   **Fase 2 - Componente Optimizador y Mecanismos Dinámicos:**
    *   **Desarrollo del Motor de Optimización:** Se creó el archivo `src/optimization_engine.py` con una estructura básica para el cálculo del saldo exportable dinámico y la optimización de la estrategia de ventas.
    *   **Implementación del Precio de Referencia Dinámico (PRD):** Se añadieron las constantes `PBASE_AZUCAR` y `K_FACTOR` en `marketplace_service.py`. Se implementó la función `calculate_dynamic_reference_price` en `marketplace_service.py` y se expuso un nuevo endpoint `/mercado/precio-referencia-dinamico/{producto_id}` en `main.py` para consultar el PRD.

**Impacto:** Se ha iniciado la implementación de la lógica de optimización y el mecanismo de precios dinámicos, sentando las bases para la regulación del mercado.

    *   **Implementación de Comisiones Variables de Mercado:** Se añadieron las constantes `COMISION_ESCASEZ` y `COMISION_SUPERAVIT` en `marketplace_service.py`. Se modificó la función `ejecutar_calce` en `marketplace_service.py` para calcular dinámicamente la comisión de la plataforma basándose en el `ΔS` (desviación del stock), aplicando una comisión mayor en escasez y menor en superávit.

**Impacto:** El sistema ahora puede ajustar las comisiones de forma dinámica para influir en el comportamiento del mercado, reforzando las señales de precios y promoviendo la estabilidad.

### 8 de agosto de 2025 (Finalización de Pruebas)
*   **Fase 3 - Pruebas y Refinamiento:**
    *   **Pruebas Unitarias e Integración:**
        *   Se creó el directorio `tests/`.
        *   Se añadió `pytest` a `requirements.txt` y se instaló.
        *   Se crearon `tests/test_prediction_models.py`, `tests/test_optimization_engine.py` y `tests/test_marketplace_service.py` con pruebas unitarias para los componentes desarrollados.
        *   Se creó `tests/conftest.py` para configurar la ruta de importación.
        *   Se corrigieron errores de sintaxis e indentación en los archivos de prueba.
        *   Se ajustaron las expectativas de las pruebas de comisión en `test_marketplace_service.py` para reflejar el cálculo correcto del `valor_total`.
        *   Todas las pruebas unitarias pasaron exitosamente.

**Impacto:** Se ha establecido un marco de pruebas robusto, asegurando la calidad y el correcto funcionamiento de los nuevos componentes de predicción, optimización y mecanismos dinámicos.

### 8 de agosto de 2025 (Documentación Técnica)
*   **Fase 3 - Pruebas y Refinamiento:**
    *   **Documentación Adicional:** Se añadieron y mejoraron los docstrings en los siguientes módulos y funciones para proporcionar documentación técnica detallada:
        *   `src/prediction_models.py` (módulo, clase `PredictionModels` y todos sus métodos).
        *   `src/optimization_engine.py` (módulo, clase `OptimizationEngine` y todos sus métodos).
        *   `marketplace_service.py` (módulo y funciones `es_horario_de_mercado`, `crear_orden`, `ejecutar_calce`, `run_predictions`, `calculate_dynamic_reference_price`, `cancelar_orden`, `get_precio_apertura_referencia`, `get_ultimo_precio_operado`).

**Impacto:** La base de código ahora cuenta con una documentación interna más completa, facilitando la comprensión y el mantenimiento futuro.

### 8 de agosto de 2025 (Monitoreo Básico)
*   **Fase 3 - Pruebas y Refinamiento:**
    *   **Monitoreo y Ajuste:** Se configuró un sistema de logging básico utilizando el módulo `logging` de Python en `marketplace_service.py`, `src/prediction_models.py` y `src/optimization_engine.py`. Todas las sentencias `print` relevantes fueron reemplazadas por llamadas a `logger.info`, `logger.warning` o `logger.error` para un mejor seguimiento de la ejecución y depuración.

**Impacto:** Se ha implementado un sistema de monitoreo básico que permitirá un mejor seguimiento del comportamiento del sistema y facilitará futuras tareas de ajuste y depuración.

### 8 de agosto de 2025 (Orquestación de Motores)
*   **Ejecución Paralela y Auto-Optimización de Motores:**
    *   Se configuró Celery Beat en `celery_worker.py` para programar:
        *   `marketplace_service.run_predictions` (mensualmente).
        *   `marketplace_service.run_optimization_cycle` (diariamente).
    *   Se creó la tarea `run_optimization_cycle` en `marketplace_service.py` para orquestar el ciclo de optimización.

**Impacto:** Se ha establecido la infraestructura para la ejecución paralela y la auto-optimización de los motores de predicción y optimización, permitiendo un ciclo continuo de mejora y adaptación del sistema.

### 8 de agosto de 2025 (Documentación Técnica)
*   **Fase 3 - Pruebas y Refinamiento:**
    *   **Documentación Adicional:** Se añadieron y mejoraron los docstrings en los siguientes módulos y funciones para proporcionar documentación técnica detallada:
        *   `src/prediction_models.py` (módulo, clase `PredictionModels` y todos sus métodos).
        *   `src/optimization_engine.py` (módulo, clase `OptimizationEngine` y todos sus métodos).
        *   `marketplace_service.py` (módulo y funciones `es_horario_de_mercado`, `crear_orden`, `ejecutar_calce`, `run_predictions`, `calculate_dynamic_reference_price`, `cancelar_orden`, `get_precio_apertura_referencia`, `get_ultimo_precio_operado`).

**Impacto:** La base de código ahora cuenta con una documentación interna más completa, facilitando la comprensión y el mantenimiento futuro.

### 8 de agosto de 2025 (Monitoreo Básico)
*   **Fase 3 - Pruebas y Refinamiento:**
    *   **Monitoreo y Ajuste:** Se configuró un sistema de logging básico utilizando el módulo `logging` de Python en `marketplace_service.py`, `src/prediction_models.py` y `src/optimization_engine.py`. Todas las sentencias `print` relevantes fueron reemplazadas por llamadas a `logger.info`, `logger.warning` o `logger.error` para un mejor seguimiento de la ejecución y depuración.

**Impacto:** Se ha implementado un sistema de monitoreo básico que permitirá un mejor seguimiento del comportamiento del sistema y facilitará futuras tareas de ajuste y depuración.

### 8 de agosto de 2025 (Documentación Técnica)
*   **Fase 3 - Pruebas y Refinamiento:**
    *   **Documentación Adicional:** Se añadieron y mejoraron los docstrings en los siguientes módulos y funciones para proporcionar documentación técnica detallada:
        *   `src/prediction_models.py` (módulo, clase `PredictionModels` y todos sus métodos).
        *   `src/optimization_engine.py` (módulo, clase `OptimizationEngine` y todos sus métodos).
        *   `marketplace_service.py` (módulo y funciones `es_horario_de_mercado`, `crear_orden`, `ejecutar_calce`, `run_predictions`, `calculate_dynamic_reference_price`, `cancelar_orden`, `get_precio_apertura_referencia`, `get_ultimo_precio_operado`).

**Impacto:** La base de código ahora cuenta con una documentación interna más completa, facilitando la comprensión y el mantenimiento futuro.

---

### **Instrucciones para Colaboradores (Humanos o IA)**

**Antes de realizar cualquier modificación en el código:**

1.  **Leer este `README.md` completamente:** Prestar especial atención a la sección "Registro de Cambios" para entender el historial del proyecto y las decisiones previas.
2.  **Verificar el contexto actual:** Si se trata de una tarea de modificación de código, analizar los archivos relevantes para comprender las convenciones existentes, las dependencias y la lógica actual.
3.  **Evitar soluciones redundantes:** Si una funcionalidad o un problema ya ha sido abordado (como la normalización de datos o la lectura de formatos específicos), no se debe reimplementar. En su lugar, se debe reutilizar o mejorar la solución existente.
4.  **Documentar cada cambio:** Después de cada modificación significativa, actualizar este "Registro de Cambios" con una nueva entrada. La descripción debe ser clara, concisa y explicar *qué* se cambió y *por qué*.

---

## Estructura del Proyecto

*   `main.py`: API principal de FastAPI.
*   `schemas.py`: Definiciones de esquemas de datos (Pydantic).
*   `models.py`: Modelos de base de datos (SQLAlchemy).
*   `marketplace_service.py`: Lógica de negocio del marketplace, incluyendo el motor de coincidencias.
*   `security.py`: Funciones de seguridad (hashing de contraseñas, JWT).
*   `database.py`: Configuración de la conexión a la base de datos.
*   `celery_worker.py`: Configuración de tareas asíncronas con Celery.
*   `seed.py`: Script para poblar la base de datos con datos iniciales.
*   `alembic/`: Directorio para migraciones de base de datos.
*   `data/`: Contiene archivos de datos (PDFs, Excel, CSV).
    *   `balance azucarero-ac.pdf`: Balance azucarero anual.
    *   `mercado interno-cactu.pdf`: Análisis de mercado sucro-alcoholero.
    *   `mercado_interno.xlsx`: Datos históricos del mercado interno.
    *   `balance_azucarero_processed.csv`: Datos procesados del balance azucarero.

## Operabilidad (P2)

Esta sección contiene la documentación clave para la operación y monitoreo del sistema en un entorno de producción.

### SLOs (Objetivos de Nivel de Servicio)

Estos son los objetivos que el sistema debe cumplir para ser considerado saludable.

*   **Disponibilidad:** 99.5% de uptime medido en el endpoint `/healthz`.
*   **Latencia de API:** El 95% de las peticiones a endpoints críticos (ej. crear orden) deben completarse en menos de 400ms.
*   **Tasa de Error:** Menos del 1% de las peticiones a la API deben resultar en un error 5xx.

### Runbooks (Guías de Actuación)

Pasos a seguir cuando una alerta de Prometheus se dispara.

*   **Alerta: <HighLatencyP95>**
    1.  **Identificar el endpoint:** Revisar la etiqueta `handler` en la alerta para ver qué ruta está lenta.
    2.  **Revisar Logs:** Usar el `correlation_id` en Grafana/Loki para encontrar trazas de peticiones lentas. Buscar logs con `"level":"ERROR"` o timeouts.
    3.  **Analizar Consultas DB:** Revisar si hay consultas a la base de datos que sean lentas o si hay un aumento en los `deadlocks` del motor de calce (métrica `deadlock_retries_total`).

*   **Alerta: <HighErrorRate5xx>**
    1.  **Identificar el endpoint:** Revisar la etiqueta `handler`.
    2.  **Revisar Logs:** Filtrar en Loki por `{job="agroia", level="ERROR"}` para el período de la alerta. El `correlation_id` ayudará a agrupar todos los logs de una petición fallida.
    3.  **Revisar Despliegues:** Verificar si la alerta coincidió con un despliegue reciente que pudo haber introducido un bug.

*   **Alerta: <CeleryQueueBacklog> (si se implementa)**
    1.  **Verificar Workers:** Asegurarse de que los workers de Celery estén corriendo y consumiendo tareas.
    2.  **Inspeccionar Tareas:** Revisar los logs de los workers para ver si alguna tarea está fallando repetidamente y bloqueando la cola.
    3.  **Evaluar Carga:** Determinar si el backlog se debe a un aumento legítimo de la carga o a un problema de rendimiento en el procesamiento de tareas.

## Plan de Trabajo

Este plan detalla los pasos para la implementación de los Pilares 2 y 3 del proyecto, así como la integración técnica del componente predictivo. Cada tarea se abordará de forma iterativa, asegurando la funcionalidad y la integración en cada etapa.

### Fase 1: Componente Predictivo (Cerebro Predictivo)

1.  **Configuración del Entorno y Dependencias:**
    *   Instalar librerías de Machine Learning (`scikit-learn`, `xgboost`, `statsmodels`, `prophet`).
    *   Asegurar que `celery_worker.py` esté configurado para ejecutar tareas de ML.
2.  **Desarrollo de Modelos de Predicción:**
    *   Crear el módulo `src/prediction_models.py`.
    *   Implementar funciones para preprocesamiento de datos específicos para ML.
    *   Desarrollar el modelo de pronóstico de Producción Mensual (Random Forest/XGBoost).
    *   Desarrollar el modelo de pronóstico de Consumo Mensual (SARIMA/Prophet).
    *   Implementar funciones para guardar y cargar modelos entrenados.
3.  **Integración de Predicciones:**
    *   Modificar `marketplace_service.py` para llamar a las funciones de predicción.
    *   Implementar tareas asíncronas en `celery_worker.py` para la ejecución periódica de las predicciones.
    *   Almacenar los resultados de las predicciones en la base de datos (`models.py`, `database.py`).

### Fase 2: Componente Optimizador y Mecanismos Dinámicos

1.  **Desarrollo del Motor de Optimización:**
    *   Crear el módulo `src/optimization_engine.py` (o integrar en `marketplace_service.py`).
    *   Implementar la lógica para simular escenarios y determinar el "Saldo Exportable Dinámico".
2.  **Implementación del Precio de Referencia Dinámico (PRD):**
    *   Añadir la función de cálculo del PRD a `marketplace_service.py` (o `src/pricing_engine.py`).
    *   Definir `Pbase` y `K` como parámetros configurables (posiblemente en la base de datos).
    *   Exponer un endpoint en `main.py` para consultar el PRD.
3.  **Implementación de Comisiones Variables de Mercado:**
    *   Modificar la lógica de transacciones en `marketplace_service.py` para aplicar comisiones dinámicas.
    *   Actualizar `schemas.py` y `models.py` para incluir el campo de comisión en las transacciones.

### Fase 3: Pruebas y Refinamiento

1.  **Pruebas Unitarias e Integración:**
    *   Desarrollar pruebas para los modelos de predicción, el motor de optimización y los mecanismos dinámicos.
    *   Asegurar la correcta integración entre todos los componentes.
2.  **Monitoreo y Ajuste:**
    *   Implementar mecanismos de monitoreo para las predicciones y el comportamiento del marketplace.
    *   Realizar ajustes finos a los parámetros de los modelos y las fórmulas de precios/comisiones.
3.  **Documentación Adicional:**
    *   Actualizar la documentación técnica de cada módulo implementado.
    *   Mantener el "Registro de Cambios" del `README.md` al día.

## Ejecución Paralela y Auto-Optimización de Motores

Para lograr que los motores de predicción y optimización corran en paralelo y se auto-optimicen, se seguirá un enfoque de bucle de retroalimentación continua, utilizando la base de datos como memoria compartida y Celery para la orquestación asíncrona.

### Conceptos Clave

*   **Bucle de Retroalimentación Continua:** Los resultados de la optimización (ventas reales, precios, stock) se usarán como nuevos datos para reentrenar los modelos de predicción, permitiendo que el sistema aprenda y se adapte.
*   **Ejecución Asíncrona y Paralela:** Los procesos de predicción y optimización se ejecutarán de forma independiente, sin bloquearse entre sí, utilizando tareas programadas.
*   **Aprendizaje Adaptativo (Futuro):** Se sentarán las bases para futuras implementaciones de aprendizaje por refuerzo o control adaptativo para una auto-optimización más avanzada.

### Plan de Implementación

1.  **Base de Datos como Centro Central de Datos:**
    *   La base de datos (`models.py`) será el punto central para compartir información entre los motores.
    *   El motor de predicción escribirá sus pronósticos (`ProduccionMensual`, `ConsumoMensual`).
    *   El motor de optimización leerá los pronósticos y escribirá sus decisiones (ej. `PRD`, tasas de comisión dinámicas, estrategias de venta).
    *   Los datos de transacciones y stock reales se almacenarán para retroalimentar los modelos de predicción.

2.  **Orquestación con Celery Beat:**
    *   **Tarea de Predicción (Periódica):**
        *   La tarea `marketplace_service.run_predictions` se configurará en Celery Beat para ejecutarse periódicamente (ej. mensualmente, semanalmente).
        *   Esta tarea se encargará de:
            *   Cargar datos históricos (incluyendo datos reales del marketplace).
            *   Entrenar/reentrenar los modelos de producción y consumo.
            *   Almacenar los nuevos pronósticos en la base de datos.
            *   Registrar métricas de precisión de la predicción.
    *   **Tarea de Optimización (Periódica o Bajo Demanda):**
        *   Se creará una nueva tarea en Celery (ej. `marketplace_service.run_optimization_cycle`).
        *   Esta tarea se configurará en Celery Beat para ejecutarse después de la predicción o en su propio horario (ej. diariamente).
        *   Se encargará de:
            *   Leer los últimos pronósticos de producción y consumo de la base de datos.
            *   Obtener el stock actual (una vez implementada la integración de stock en tiempo real).
            *   Obtener los parámetros de ajuste (`PBASE_AZUCAR`, `K_FACTOR`) de la base de datos.
            *   Llamar a `optimization_engine_instance.optimize_sales_strategy()` para determinar la estrategia óptima.
            *   Calcular el `PRD` utilizando `calculate_dynamic_reference_price()`.
            *   Almacenar las decisiones de optimización (ej. `PRD`, mezcla de ventas óptima) en la base de datos.
            *   Registrar los resultados de la optimización.

3.  **Integración de Datos de Retroalimentación:**
    *   Se asegurará que los datos de transacciones reales, producción real y consumo real se capturen y almacenen de forma que puedan ser utilizados por los modelos de predicción para su reentrenamiento.

4.  **Monitoreo Continuo:**
    *   Se mantendrá un monitoreo robusto del rendimiento de ambos motores (precisión de predicción, logro de objetivos de optimización) para identificar desviaciones y permitir la intervención humana si es necesario.

## Tareas Pendientes (Backlog)

Esta sección describe las siguientes fases de desarrollo para mejorar la operabilidad y la inteligencia del sistema.

### P2: Operabilidad y Monitorización
*   **Métricas y Logging Estructurado:**
    *   Implementar un exportador de métricas (ej. `prometheus-fastapi-instrumentator`) para exponer latencias, throughput, tasa de errores de la API y tareas Celery.
    *   Configurar dashboards básicos (ej. en Grafana) para visualizar la salud del sistema.
    *   Enriquecer los logs con `correlation_id` para facilitar el seguimiento de peticiones a través de los servicios.
*   **Pipeline de Ingesta de Datos:**
    *   Crear un pipeline robusto y automatizado para la ingesta de datos históricos (precios, producción, consumo) desde los archivos en `/data`.
    *   Añadir `provenance` a los datos (origen, hash del archivo, fecha de ingesta) para garantizar la trazabilidad y reproducibilidad de los modelos.
*   **Gobernanza de Modelos de ML (MLOps):**
    *   Implementar un registro de modelos para versionar los artefactos de ML (ej. usando MLflow o una tabla en la base de datos).
    *   Guardar métricas de validación junto a cada modelo entrenado.
    *   Establecer una política de reentrenamiento y un sistema básico de monitoreo de `drift` para detectar cuándo un modelo está perdiendo precisión.

### Apéndice: Log de Depuración de Entorno Local (20 de Agosto 2025)

Durante la configuración del entorno de desarrollo local en Docker, se encontraron y resolvieron una serie de problemas de configuración complejos. Se documentan aquí para referencia futura.

*   **Diagnóstico Inicial:** La aplicación fallaba al iniciar con un error `500 Internal Server Error`. El análisis inicial apuntó a una configuración incorrecta de la URL de la base de datos en el archivo `.env` (uso de `localhost` en lugar de `db`, el nombre del servicio de Docker).

*   **Corrección de `Dockerfile`:** Se detectó un `ModuleNotFoundError` que impedía el arranque de la API. Se robusteció el `Dockerfile` para asegurar la correcta instalación de todas las dependencias listadas en `requirements.txt`.

*   **Análisis del Historial de Migraciones (Alembic):** Tras corregir las dependencias, el contenedor de la API seguía sin arrancar. Los logs revelaron que el proceso `alembic upgrade head` fallaba, deteniendo el script de inicio. El análisis del historial en `alembic/versions/` reveló múltiples problemas:
    1.  **Múltiples "Cabezas" (Heads):** Existían varias ramas de migración que entraban en conflicto, impidiendo a Alembic determinar una ruta de actualización única.
    2.  **Nombres de Archivo Excesivamente Largos:** Un archivo de migración superaba el límite de caracteres de la columna `version_num` en la tabla de Alembic, causando un error `DataError`.
    3.  **Dependencias Cruzadas Incorrectas:** Al renombrar archivos para solucionar el problema de longitud, se encontraron dependencias (`down_revision`) incorrectas en otros archivos de migración.

*   **Resolución de Migraciones:**
    *   Se ejecutó `alembic merge heads` dos veces para resolver las dos bifurcaciones detectadas en el historial.
    *   Se renombró el archivo de migración con nombre excesivamente largo.
    *   Se corrigieron manualmente las variables `revision` y `down_revision` en varios archivos para reconstruir una cadena de historial consistente.

*   **Solución Final (Pendiente de Aplicación):** A pesar de las correcciones manuales, la complejidad y el estado corrupto del historial de migraciones continuaron presentando errores. La solución definitiva propuesta es **reiniciar el historial de migraciones y la base de datos local** para asegurar un estado limpio y funcional.