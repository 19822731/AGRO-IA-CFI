#!/usr/bin/env bash
# ==============================================================================
# AGRO-IA SAS — SUITE DE AUDITORÍA TÉCNICA CFI (TRL 6)
# Ejecuta la batería de pruebas automatizadas que sustentan la madurez técnica
# ==============================================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}==================================================================${NC}"
echo -e "${BLUE}   AGRO-IA SAS — AUDITORÍA TÉCNICA DE CÓDIGO (FONDO CFI)          ${NC}"
echo -e "${BLUE}   Repositorio: github.com/19822731/AGRO-IA-CFI                    ${NC}"
echo -e "${BLUE}==================================================================${NC}"

# 1. Verificación de Entorno
echo -e "\n${YELLOW}[Paso 1/4] Verificando entorno de ejecución local...${NC}"
python3 --version || { echo "Python 3 no encontrado"; exit 1; }

# 2. Invariantes de Base de Datos y Bloqueos Pesimistas
echo -e "\n${YELLOW}[Paso 2/4] Ejecutando pruebas de invariantes de base de datos y ACID...${NC}"
pytest backend/tests/test_db_invariants.py -v --disable-warnings

# 3. Pruebas de Idempotencia y Contratos MLOps
echo -e "\n${YELLOW}[Paso 3/4] Ejecutando pruebas de idempotencia, drift contracts y PRD...${NC}"
pytest backend/tests/tests_p22/test_data_ingesta_idempotency.py \
       backend/tests/tests_p22/test_provenance_fk.py \
       backend/tests/tests_p23/test_drift_contract_sqlite.py \
       backend/tests/tests_p24/test_prd_idempotency.py -v --disable-warnings

# 4. Verificación de Pipeline de Visión Computacional
echo -e "\n${YELLOW}[Paso 4/4] Verificando tests de arquitectura del módulo de visión...${NC}"
pytest ml_engine/test_arquitectura.py -v --disable-warnings

echo -e "\n${GREEN}==================================================================${NC}"
echo -e "${GREEN}   ✓ TODAS LAS PRUEBAS DE AUDITORÍA SUPERADAS EXITOSAMENTE        ${NC}"
echo -e "${GREEN}   Nivel de Madurez Tecnológica TRL 6 Consolidado y Verificado.  ${NC}"
echo -e "${GREEN}==================================================================${NC}"
