# AGRO-IA SAS — Infraestructura Digital 4.0 para el Comercio Agroindustrial
## Repositorio Principal Monorepo (CFI — Fondo de Inversión en Innovación)

![Nivel TRL](https://img.shields.io/badge/TRL-6%20Consolidado-success?style=flat-square)
![Licencia](https://img.shields.io/badge/Licencia-Propiedad%20Exclusiva%20Agro--IA%20SAS-blue?style=flat-square)
![Python](https://img.shields.io/badge/Python-3.11.9-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.116.1-009688?style=flat-square&logo=fastapi&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15.2.4-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![PyTorch](https://img.shields.io/badge/PyTorch-2.7.1%20MPS-EE4C2C?style=flat-square&logo=pytorch&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.3-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose%202.27-2496ED?style=flat-square&logo=docker&logoColor=white)

---

### Datos de la Entidad Postulante
- **Razón Social:** AGRO-IA S.A.S.
- **CUIT:** 30-71931274-4
- **Sede Operativa y Fiscal:** Calle Zavalía N° 240, Yerba Buena / San Miguel de Tucumán, Provincia de Tucumán, Argentina.
- **Convocatoria Oficial:** Fondo de Inversión en Innovación — Consejo Federal de Inversiones (CFI).
- **Responsables Técnicos:** Lic. Arquímedes Ramón Carrizo (CEO) | Ing. Adolfo Andrés Rodríguez Robles Terán (CTO/COO).

---

## 1. Descripción de la Plataforma
Agro-IA es la primera infraestructura digital de Mercado 4.0 diseñada de forma nativa para la cadena de valor azucarera y de soft commodities en Latinoamérica. Integra en un monorepo distribuido:

1. **Marketplace Transaccional Inteligente:** Motor de calce atómico con bloqueos pesimistas (`SELECT FOR UPDATE SKIP LOCKED`), precisión financiera `DECIMAL(18,4)` y una **Caja de Punta interactiva** (`frontend/sugartrade_contents/app/operar/components/caja-de-punta.tsx`) con **1.680 líneas de código**.
2. **Algoritmo de Precio de Referencia Dinámico (PRD):** Modelo predictivo híbrido (Red Neuronal Artificial + Regresor XGBoost) que calcula $PRD = P_{base} \times (1 - K \times \Delta S)$ alcanzando un **MAE de 4,80 USD/TN** sobre 18 años de series temporales (2007–2025).
3. **Visor Caña Pro (Visión Computacional & LLM RAG):** Pipeline de inferencia en cascada de tres fases (YOLO11 $\rightarrow$ DINOv2 ViT-Small $\rightarrow$ Gemma 4 26B MoE local) que clasifica 21 fitopatologías foliares con **93,15% de exactitud de validación** sobre un Master Dataset de **47.628 imágenes**.
4. **Motor FinTech de Warrants Digitales:** Tokenización inmutable de partidas físicas con sellado criptográfico SHA-256 (Ley N° 9.643).

---

## 2. Resumen de Métricas Clave Auditables (TRL 6)

| Indicador Técnico | Valor Obtenido | Verificación en Código |
|---|---|---|
| **Exactitud Clasificador Fitosanitario** | **93,15%** (Validation Accuracy) | `ml_engine/auditoria_dino.py`, `train_dinov2.py` |
| **Volumen Master Dataset de Visión** | **47.628 imágenes / 21 clases** | `ml_engine/MASTER_DATASET_LOG.md` |
| **Líneas de Código Caja de Punta** | **1.680 líneas** | `frontend/sugartrade_contents/app/operar/components/caja-de-punta.tsx` |
| **Error Predictivo PRD (Precios Spot)** | **MAE = 4,80 USD/TN \| R² = 0,89** | `backend/Algoritmo v.2/analisis_campeon_v2.py` |
| **Concurrencia Transaccional (Locust)** | **100 usuarios / 0% inconsistencia** | `frontend/tests_perf/locustfile.py`, `app/utils/db_retry.py` |
| **Latencia Mediana Transaccional** | **38 milisegundos (P50)** | Logs de telemetría de estrés |
| **Operaciones Reales en Piloto** | **3 operaciones / USD 36.000 GMV** | `docs/PUNTO_9_INFORMES_USO_PILOTO.md` |

---

## 3. Estructura del Repositorio (Monorepo)

```
AGRO-IA-CFI/
├── backend/                          # Backend Transaccional y API REST
│   ├── app/                          # Código fuente FastAPI (rutas, servicios, prd, mlops, audit)
│   ├── alembic/                      # 31 migraciones versionadas de base de datos
│   ├── Algoritmo v.2/               # Motor de series temporales y PRD (ANN + XGBoost + SARIMAX)
│   ├── tests/                        # Suite de pruebas automatizadas (invariantes, contratos MLOps)
│   ├── Dockerfile                    # Contenedor del backend
│   └── requirements.txt              # Dependencias Python (FastAPI, SQLAlchemy, Celery, etc.)
│
├── frontend/                         # Aplicación Web y Plataforma Operacional
│   ├── sugartrade_contents/          # Proyecto Next.js 15.2.4 (React 19, TypeScript 5)
│   │   ├── app/                      # 43 rutas funcionales con App Router
│   │   ├── components/               # 69 componentes UI (Tailwind CSS, Radix UI)
│   │   ├── hooks/                    # 20 custom hooks (operaciones, warrants, clima)
│   │   └── store/                    # Manejo de estado global con Zustand
│   ├── infra/                        # Dashboards Grafana (core_health.json), Prometheus, Loki
│   └── tests_perf/                   # Test de concurrencia y carga con Locust (locustfile.py)
│
├── ml_engine/                        # Motor de Inteligencia Artificial y Visión
│   ├── train_dinov2.py               # Entrenamiento del clasificador DINOv2 ViT-Small
│   ├── pangea_inference_bridge.py    # Pipeline en cascada YOLO11 + DINOv2 + LLM
│   ├── pangea_bridge_gemma4.py       # Cerebro agronómico RAG local con Gemma 4
│   ├── MASTER_DATASET_LOG.md         # Registro de trazabilidad de las 47.628 imágenes
│   └── auditoria_dino.py             # Auditoría de exactitud y matriz de confusión
│
├── docs/                             # Documentación Técnica Oficial CFI
│   ├── PUNTO_9_INFORMES_USO_PILOTO.md # Informe de pilotos con 4 productores y desempeño
│   └── PUNTO_18_SBOM_Y_ARQUITECTURA.md# Lista de Materiales de Software (55+ componentes) y Diagrama
│
├── scripts/
│   └── run_audit_tests.sh            # Script de un solo comando para auditar la suite de tests
│
├── docker-compose.yml                # Orquestación de Postgres, Redis, API, Worker y Observabilidad
├── LICENSE                           # Declaración de Propiedad Intelectual AGRO-IA S.A.S.
└── .github/workflows/ci.yml          # Pipeline de Integración Continua (CI/CD)
```

---

## 4. Guía de Ejecución y Reproducibilidad

### Prerrequisitos
- Docker & Docker Compose 2.20+
- Python 3.11.9 (opcional para desarrollo local)
- Node.js 20+ / npm 10+ (opcional para desarrollo local)

### Levantar la Pila Completa en Contenedores
```bash
# 1. Clonar el repositorio
git clone https://github.com/19822731/AGRO-IA-CFI.git
cd AGRO-IA-CFI

# 2. Configurar variables de entorno iniciales
cp backend/.env.example backend/.env

# 3. Iniciar todos los servicios
docker-compose up -d
```

Servicios levantados:
- **FastAPI Backend:** `http://localhost:8000` (Docs Swagger: `http://localhost:8000/docs`)
- **Next.js Frontend:** `http://localhost:3000`
- **PostgreSQL 16:** `localhost:5433` (interno 5432)
- **Redis 7:** `localhost:6379`
- **Prometheus:** `http://localhost:9090`
- **Grafana:** `http://localhost:3000` (Dashboard `core_health`)

---

## 5. Ejecución de la Suite de Auditoría Técnica

Para que el auditor técnico del CFI verifique la integridad del código en un solo paso:

```bash
chmod +x scripts/run_audit_tests.sh
./scripts/run_audit_tests.sh
```

Este script ejecuta:
1. `backend/tests/test_db_invariants.py`: Invariantes ACID y bloqueos de saldo.
2. `backend/tests/tests_p22/test_data_ingesta_idempotency.py`: Idempotencia de transacciones.
3. `backend/tests/tests_p23/test_drift_contract_sqlite.py`: Contratos de detección de drift en modelos predictivos.
4. `backend/tests/tests_p24/test_prd_idempotency.py`: Integridad y no duplicación del cálculo diario PRD.
5. `ml_engine/test_arquitectura.py`: Verificación del pipeline de visión computacional.

---

## 6. Documentación Adicional para el CFI

Para acceder al detalle exhaustivo de la documentación técnica requerida por las bases de la convocatoria:
- 📄 **[Informe de Uso Piloto y Desempeño (Punto 9)](docs/PUNTO_9_INFORMES_USO_PILOTO.md):** 4 productores independientes, 347 imágenes procesadas, 3 operaciones comerciales reales cerradas (USD 36.000 GMV) y 150 simulaciones en modo espejo.
- 📋 **[Lista de Materiales de Software — SBOM (Punto 18)](docs/PUNTO_18_SBOM_Y_ARQUITECTURA.md):** 55+ dependencias detalladas con versión, licencia, enlace y funcionalidad, acompañado del esquema completo de arquitectura del sistema.

---

## 7. Propiedad Intelectual
El código fuente, arquitecturas neuronales, algoritmos predictivos y documentación técnica contenida en este repositorio son propiedad exclusiva de **AGRO-IA S.A.S.** (CUIT 30-71931274-4). Prohibida su reproducción sin autorización escrita. Consulte el archivo [LICENSE](LICENSE) para más detalles.
