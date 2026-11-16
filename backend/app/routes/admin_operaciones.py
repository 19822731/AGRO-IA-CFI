from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from datetime import datetime
import time

import models
from database import SessionLocal
from app.services import wallet_service

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/admin/depositos/{id}", tags=["Admin"])
def get_deposit_details(id: int, db: Session = Depends(get_db)):
    deposito = db.query(models.Deposito).filter(models.Deposito.id == id).first()
    if not deposito:
        raise HTTPException(status_code=404, detail="Depósito no encontrado")
    
    user = db.query(models.Usuario).filter(models.Usuario.id == deposito.usuario_id).first()
    
    return {
        "id": deposito.id,
        "monto": deposito.monto,
        "moneda": deposito.moneda,
        "estado": deposito.estado,
        "usuario_email": user.email if user else "Desconocido",
        "fecha_solicitud": deposito.fecha_solicitud.isoformat() if deposito.fecha_solicitud else None,
        "has_file": bool(deposito.comprobante_path)
    }

@router.get("/admin/depositos/{id}/file", tags=["Admin"])
def get_deposit_file(id: int, db: Session = Depends(get_db)):
    deposito = db.query(models.Deposito).filter(models.Deposito.id == id).first()
    if not deposito or not deposito.comprobante_path:
        raise HTTPException(status_code=404, detail="Comprobante no encontrado")
        
    return FileResponse(deposito.comprobante_path)

@router.post("/admin/approve-deposit/{id}", tags=["Admin"])
def approve_deposit(id: int, db: Session = Depends(get_db)):
    try:
        return wallet_service.process_approve_deposit(id, db)
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error approving deposit: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/admin/approve-product/{id}", tags=["Admin"])
def approve_product(id: str, db: Session = Depends(get_db)):
    try:
        return wallet_service.approve_product_pre_registration(id, db)
    except HTTPException as e:
        raise e
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.post("/pre-registros", tags=["Pre-Registro"])
def create_pre_registro(data: dict):
    try:
        short_id = f"PROD-{int(time.time()) % 10000:04d}"
        data["id"] = short_id
        data["timestamp"] = datetime.now().isoformat()
        wallet_service.save_pre_registro(short_id, data)
        return {"id": short_id, "message": "Pre-registro guardado"}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.get("/pre-registros/{id}", tags=["Pre-Registro"])
def get_pre_registro(id: str):
    regs = wallet_service.load_pre_registros()
    if id in regs:
        return regs[id]
    raise HTTPException(status_code=404, detail="Pre-registro no encontrado")
