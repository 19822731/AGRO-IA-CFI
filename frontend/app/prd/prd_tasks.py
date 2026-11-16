# app/prd/prd_tasks.py
import os
from celery import Celery
import sqlalchemy as sa
from sqlalchemy.orm import sessionmaker

# Asegurarse de que el path permita importar desde la raíz del proyecto
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from database import SessionLocal
from app.prd.prd_service import optimize_and_persist
from celery_worker import celery_app

@celery_app.task(name="prd.optimize_daily")
def optimize_daily():
    # ejemplo: obtener stock/pronósticos de donde corresponda
    stock = float(os.getenv("PRD_STOCK_OPEN", "100000"))
    demand = float(os.getenv("PRD_DOMESTIC_DEMAND", "85000"))
    meta = {"horizon_days": int(os.getenv("PRD_HORIZON_DAYS", "30"))}
    
    with SessionLocal() as s:
        obj = optimize_and_persist(
            s=s, 
            segment=None, 
            stock_open=stock, 
            domestic_demand=demand, 
            forecast_meta=meta,
            policy_name=os.getenv("PRD_POLICY_NAME","default")
        )
    return {"id": obj.id}
