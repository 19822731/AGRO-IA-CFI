# app/routes/prd.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime

# Asegurarse de que el path permita importar desde la raíz del proyecto
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from database import SessionLocal
from app.prd.prd_service import get_current_prd, optimize_and_persist
from security import require_role

router = APIRouter()

def _get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class PrdResponse(BaseModel):
    id: int
    segment: str | None
    valid_from: datetime
    valid_to: datetime | None
    prd_value: float
    exportable_balance: float
    mix: dict | None

@router.get("/prd", response_model=PrdResponse)
def read_current_prd(segment: str | None = None, session: Session = Depends(_get_session)):
    obj = get_current_prd(session, segment=segment)
    if not obj:
        raise HTTPException(404, "Sin decisión PRD vigente")
    return PrdResponse(
        id=obj.id, segment=obj.segment, valid_from=obj.valid_from, valid_to=obj.valid_to,
        prd_value=obj.prd_value, exportable_balance=obj.exportable_balance, mix=obj.mix
    )

class RunBody(BaseModel):
    segment: str | None = None
    stock_open: float
    domestic_demand: float
    forecast_meta: dict = {}
    policy_name: str = "default"
    valid_from: datetime | None = None
    valid_to: datetime | None = None
    justification: str | None = None

@router.post("/prd/run", response_model=PrdResponse, status_code=201)
def run_and_persist(body: RunBody, session: Session = Depends(_get_session), _=Depends(require_role("operator"))):
    obj = optimize_and_persist(
        s=session,
        segment=body.segment,
        stock_open=body.stock_open,
        domestic_demand=body.domestic_demand,
        forecast_meta=body.forecast_meta,
        policy_name=body.policy_name,
        valid_from=body.valid_from,
        valid_to=body.valid_to,
        justification=body.justification
    )
    return PrdResponse(
        id=obj.id, segment=obj.segment, valid_from=obj.valid_from, valid_to=obj.valid_to,
        prd_value=obj.prd_value, exportable_balance=obj.exportable_balance, mix=obj.mix
    )
