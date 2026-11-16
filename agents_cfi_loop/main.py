import os
import sys
import json
from datetime import datetime
from google import genai
from google.genai import types
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------
# VERIFICACIÓN DE CLAVE API
# ---------------------------------------------------------------------
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("❌ ERROR: La variable de entorno GEMINI_API_KEY no está configurada en la terminal.")
    print("👉 Ejecuta primero: export GEMINI_API_KEY='tu_api_key_de_google'")
    sys.exit(1)

client = genai.Client(api_key=api_key)
MODEL_NAME = "gemini-2.5-flash"

# =====================================================================
# ESTRUCTURAS DE DATOS ESTRUCTURADOS (PYDANTIC)
# =====================================================================

class ChecklistAnalista(BaseModel):
    criterios: list[str] = Field(description="Lista de criterios específicos a cumplir según la observación del CFI.")
    archivos_afectados: list[str] = Field(description="Rutas de archivos que deben ser creados o modificados.")
    prioridad: str = Field(description="Nivel de prioridad: ALTA, MEDIA o BAJA.")

class RevisionQA(BaseModel):
    aprobado: bool = Field(description="True si la solución cumple las pruebas de calidad; False en caso contrario.")
    observaciones_qa: list[str] = Field(description="Detalle de errores de sintaxis, tipos, concurrencia o lógica encontrados.")
    sugerencias: list[str] = Field(description="Sugerencias concretas de corrección para el Coder.")

class EvaluacionAuditor(BaseModel):
    score: int = Field(description="Puntaje global de conformidad con requerimientos CFI (1 al 10).")
    aprobado_definitivo: bool = Field(description="True si alcanza cumplimiento total y se autoriza el commit/log.")
    resumen_cambio: str = Field(description="Resumen ejecutivo del cambio para la bitácora CFI_AUDIT_LOG.md.")
    feedback_reintento: str = Field(description="Indicaciones de corrección para el Coder si no fue aprobado.", default="")

# =====================================================================
# GESTOR DE REGISTRO EN BITÁCORA DE AUDITORÍA (CFI_AUDIT_LOG.md)
# =====================================================================

def append_to_audit_log(observation: str, iteration: int, role_summary: str, files: list[str], approved: bool):
    log_file = "CFI_AUDIT_LOG.md"
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    status_symbol = "✅ APROBADO POR AUDITORÍA" if approved else "🔄 RECHAZADO / EN REITERACIÓN"
    
    log_entry = f"""
## [{timestamp}] - Iteración {iteration} | {status_symbol}

- **Observación CFI Evaluada:** {observation}
- **Archivos Afectados:**
"""
    for file in files:
        log_entry += f"  - `{file}`\n"
        
    log_entry += f"""- **Resumen Ejecutivo del Cambio:**
  {role_summary}

---
"""
    with open(log_file, "a", encoding="utf-8") as f:
        f.write(log_entry)
    print(f"\n📝 Registrado en `{log_file}`.")

# =====================================================================
# BUCLE MULTI-AGENTE AUTÓNOMO (4 ROLES)
# =====================================================================

def run_cfi_agent_loop(user_observation: str, max_iterations: int = 3):
    print(f"\n🚀 INICIANDO BUCLE MULTI-AGENTE PARA: '{user_observation}'\n")
    
    # AGENTE 1: ANALISTA CFI
    print("🔹 [AGENTE 1 - Analista CFI]: Auditando observación y construyendo checklist...")
    prompt_analista = f"""
    Eres el Agente Analista CFI del proyecto Agro-IA SAS.
    Desglosa la siguiente observación/requerimiento del CFI en un checklist técnico y financiero objetivo:
    Requerimiento: {user_observation}
    """
    res_analista = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt_analista,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ChecklistAnalista,
            temperature=0.2,
        ),
    )
    checklist: ChecklistAnalista = ChecklistAnalista.model_validate_json(res_analista.text)
    print(f"   ✓ Checklist generado ({len(checklist.criterios)} criterios). Archivos a modificar: {checklist.archivos_afectados}")

    feedback_loop = ""
    approved = False

    for iteration in range(1, max_iterations + 1):
        print(f"\n🔄 --- ITERACIÓN {iteration} DE {max_iterations} ---")
        
        # AGENTE 2: CODER
        print("🔹 [AGENTE 2 - Coder]: Elaborando solución / modificaciones...")
        prompt_coder = f"""
        Eres el Agente Desarrollador / Coder de Agro-IA SAS.
        Debes resolver y cumplir los siguientes criterios del checklist:
        {json.dumps(checklist.criterios, ensure_ascii=False, indent=2)}
        
        Archivos afectados: {checklist.archivos_afectados}
        {f'Feedback de corrección iteración previa: {feedback_loop}' if feedback_loop else ''}
        
        Genera la propuesta de código o redacción técnica exacta para resolver los puntos.
        """
        res_coder = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt_coder,
            config=types.GenerateContentConfig(temperature=0.3),
        )
        propuesta_codigo = res_coder.text
        print("   ✓ Propuesta técnica generada por el Coder.")

        # AGENTE 3: QA REVIEWER
        print("🔹 [AGENTE 3 - Revisor QA]: Auditando calidad, sintaxis y consistencia...")
        prompt_qa = f"""
        Eres el Revisor QA Técnico de Agro-IA.
        Audita la propuesta del Coder contra el checklist del Analista:
        Checklist: {checklist.model_dump_json()}
        Propuesta del Coder:
        {propuesta_codigo}
        
        Revisa ausencia de hardcoding, consistencia financiera (GMV vs comisiones), sintaxis y tipado.
        """
        res_qa = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt_qa,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=RevisionQA,
                temperature=0.1,
            ),
        )
        qa_report: RevisionQA = RevisionQA.model_validate_json(res_qa.text)
        print(f"   ✓ Dictamen QA: {'APROBADO' if qa_report.aprobado else 'RECHAZADO'}")

        # AGENTE 4: AUDITOR
        print("🔹 [AGENTE 4 - Auditor Controller]: Evaluando conformidad CFI...")
        prompt_auditor = f"""
        Eres el Agente Auditor del CFI para Agro-IA SAS.
        Evalúa el dictamen de QA y la propuesta final del Coder:
        Informe QA: {qa_report.model_dump_json()}
        Propuesta Coder:
        {propuesta_codigo}
        
        Otorga un puntaje del 1 al 10 y autoriza o rechaza el registro formal.
        """
        res_auditor = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt_auditor,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=EvaluacionAuditor,
                temperature=0.1,
            ),
        )
        evaluacion: EvaluacionAuditor = EvaluacionAuditor.model_validate_json(res_auditor.text)
        print(f"   ✓ Evaluación Auditor: Puntaje {evaluacion.score}/10 | Estado: {'APROBADO' if evaluacion.aprobado_definitivo else 'REINTEGRAR'}")

        if evaluacion.aprobado_definitivo and qa_report.aprobado:
            approved = True
            append_to_audit_log(
                observation=user_observation,
                iteration=iteration,
                role_summary=evaluacion.resumen_cambio,
                files=checklist.archivos_afectados,
                approved=True
            )
            print("\n🎉 ¡ITERACIÓN APROBADA Y REGISTRADA EN CFI_AUDIT_LOG.md!")
            break
        else:
            feedback_loop = f"Puntaje: {evaluacion.score}/10. Observaciones QA: {qa_report.observaciones_qa}. Feedback Auditor: {evaluacion.feedback_reintento}"
            append_to_audit_log(
                observation=user_observation,
                iteration=iteration,
                role_summary=f"Reiteración requerida. {feedback_loop}",
                files=checklist.archivos_afectados,
                approved=False
            )

if __name__ == "__main__":
    observacion_test = "Ajuste de Cashflow mensual a 36 meses en docs_cfi/Agro-IA-CFI-v6-Cashflow-Mensual.xlsx y actualización de comisión base en backend/app/core/config.py"
    run_cfi_agent_loop(observacion_test)
