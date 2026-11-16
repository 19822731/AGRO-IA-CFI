import os
import json
from datetime import datetime

def log_event(iteration, role, summary):
    log_file = "CFI_AUDIT_LOG.md"
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    entry = f"\n### [{timestamp}] Iteración {iteration} - {role}\n- {summary}\n"
    with open(log_file, "a", encoding="utf-8") as f:
        f.write(entry)
    print(f"✅ Registrado en CFI_AUDIT_LOG.md: {role}")

if __name__ == "__main__":
    print("🚀 Bucle Multi-Agente CFI Inicializado.")
    log_event(1, "Sistema Multi-Agente", "Bucle de auditoría técnica y financiera desplegado correctamente.")
