from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
from decimal import Decimal
from datetime import datetime

import models
import schemas
from database import SessionLocal
from security import get_current_user
from app.services import wallet_service

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/api/portfolio", tags=["Portfolio"])
def get_portfolio(current_user: models.Usuario = Depends(get_current_user), db: Session = Depends(get_db)):
    activos = db.query(models.BilleteraActivo).filter(models.BilleteraActivo.usuario_id == current_user.id).all()
    
    portfolio = []
    for activo in activos:
        producto = db.query(models.Producto).filter(models.Producto.id == activo.producto_id).first()
        if producto:
            portfolio.append({
                "id": producto.id,
                "nombre": producto.nombre,
                "commodity": producto.commodity,
                "cantidad": float(activo.cantidad),
                "mercado": producto.mercado,
                "segmento": producto.segmento_prd
            })
            
    return portfolio

@router.post("/api/wallet/deposit", tags=["Wallet"])
async def create_deposit(
    monto: float = Form(...),
    moneda: str = Form(...),
    file: UploadFile = File(...),
    current_user: models.Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        upload_dir = f"uploads/deposits/{current_user.id}"
        os.makedirs(upload_dir, exist_ok=True)
        
        file_path = f"{upload_dir}/{file.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        deposito = models.Deposito(
            usuario_id=current_user.id,
            monto=monto,
            moneda=moneda,
            comprobante_path=file_path,
            estado="pendiente"
        )
        db.add(deposito)
        db.commit()
        db.refresh(deposito)
        
        return {"message": "Depósito solicitado correctamente", "id": deposito.id}
    except Exception as e:
        print(f"Error creating deposit: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/webhooks/simulate-deposit", tags=["Webhooks"])
def simulate_deposit(data: dict, db: Session = Depends(get_db)):
    cvu = data.get("cvu")
    amount = float(data.get("amount", 0))
    
    return wallet_service.simulate_deposit_credit(cvu, amount, db)

@router.get("/api/wallet/balance")
def get_balance(current_user: models.Usuario = Depends(get_current_user), db: Session = Depends(get_db)):
    billeteras = db.query(models.BilleteraFiat).filter(models.BilleteraFiat.usuario_id == current_user.id).all()
    balances = {b.moneda: float(b.saldo) for b in billeteras}
    return balances

@router.get("/api/wallet/summary", tags=["Wallet"])
def get_wallet_summary(current_user: models.Usuario = Depends(get_current_user), db: Session = Depends(get_db)):
    return wallet_service.calculate_wallet_summary(current_user, db)

@router.get("/api/wallet/activity", tags=["Wallet"])
def get_wallet_activity(current_user: models.Usuario = Depends(get_current_user), db: Session = Depends(get_db)):
    deposits = db.query(models.Deposito).filter(
        models.Deposito.usuario_id == current_user.id,
        models.Deposito.estado == "aprobado"
    ).order_by(models.Deposito.fecha_aprobacion.desc()).limit(10).all()
    
    activity = []
    for d in deposits:
        activity.append({
            "id": f"DEP-{d.id}",
            "type": "deposit",
            "title": "Depósito Acreditado",
            "amount": float(d.monto),
            "date": d.fecha_aprobacion.isoformat() if d.fecha_aprobacion else None,
            "status": "completed"
        })
        
    return sorted(activity, key=lambda x: x['date'] or "", reverse=True)

@router.get("/api/warrants", tags=["Portfolio"])
def get_warrants(current_user: models.Usuario = Depends(get_current_user), db: Session = Depends(get_db)):
    warrants = db.query(models.Warrant).filter(models.Warrant.usuario_id == current_user.id).all()
    
    return [
        {
            "id": f"W-{w.id}",
            "totalBags": float(w.cantidad) * 20,
            "deposito": w.deposito,
            "ingenio": w.ingenio,
            "fechaEmision": w.fecha_emision.isoformat(),
            "fechaVencimiento": w.fecha_vencimiento.isoformat(),
            "estado": w.estado
        }
        for w in warrants
    ]
