# app/prd/prd_service.py
import hashlib
import json
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import select, and_, func
from sqlalchemy.exc import IntegrityError, OperationalError, DBAPIError

# Asegurarse de que el path permita importar desde la raíz del proyecto
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from models import MarketCommissionPolicy, PrdSeries, MlModel
from app.utils.db_retry import with_db_retry

# --- PRD metrics ---
try:
    from prometheus_client import Gauge, Counter
    PRD_LAST_VALUE = Gauge("prd_last_value", "Last PRD value", ["segment"])
    PRD_EXPORTABLE_BALANCE = Gauge("prd_exportable_balance", "Exportable balance", ["segment"])
    PRD_LAST_DECISION_TS = Gauge("prd_last_decision_ts", "Last PRD decision Unix ts", ["segment"])
    PRD_DECISION_WRITE_TOTAL = Counter("prd_decision_write_total", "Count of PRD decisions written", ["status"])
    PRD_OPTIMIZE_FAIL_TOTAL = Counter("prd_optimize_fail_total", "PRD optimize failures total")
    MCP_ACTIVE_FLAG = Gauge("mcp_active_flag", "Active policy flag", ["name"])
except Exception:
    PRD_LAST_VALUE = PRD_EXPORTABLE_BALANCE = PRD_LAST_DECISION_TS = None
    PRD_DECISION_WRITE_TOTAL = PRD_OPTIMIZE_FAIL_TOTAL = None
    MCP_ACTIVE_FLAG = None

def _now():
    return datetime.now(timezone.utc)

def _active_window(qts, col_from, col_to):
    return and_(col_from <= qts, (col_to.is_(None) | (col_to >= qts)))

def get_active_policy(s: Session, name: str = "default", at: Optional[datetime] = None) -> Optional[MarketCommissionPolicy]:
    qts = at or _now()
    pol = (s.query(MarketCommissionPolicy)
              .filter(MarketCommissionPolicy.name == name)
              .filter(_active_window(qts, MarketCommissionPolicy.valid_from, MarketCommissionPolicy.valid_to))
              .order_by(MarketCommissionPolicy.valid_from.desc())
              .first())
    if MCP_ACTIVE_FLAG:
        MCP_ACTIVE_FLAG.labels(name=name).set(1.0 if pol else 0.0)
    return pol

def get_current_prd(s: Session, segment: Optional[str] = None, at: Optional[datetime] = None) -> Optional[PrdSeries]:
    qts = at or _now()
    q = s.query(PrdSeries).filter(_active_window(qts, PrdSeries.valid_from, PrdSeries.valid_to))
    if segment:
        q = q.filter((PrdSeries.segment == segment) | (PrdSeries.segment.is_(None)))
    return q.order_by(PrdSeries.valid_from.desc()).first()

def compute_exportable(stock_open: float, domestic_demand: float) -> float:
    return max(stock_open - domestic_demand, 0.0)

def inputs_fingerprint(payload: Dict[str, Any]) -> str:
    b = json.dumps(payload, sort_keys=True).encode("utf-8")
    return hashlib.sha256(b).hexdigest()

def _commit_and_refresh(s: Session, obj: PrdSeries):
    s.commit()
    s.refresh(obj)
    return obj

def optimize_and_persist(
    s: Session,
    *,
    segment: Optional[str],
    stock_open: float,
    domestic_demand: float,
    forecast_meta: Dict[str, Any],
    policy_name: str = "default",
    valid_from: Optional[datetime] = None,
    valid_to: Optional[datetime] = None,
    justification: Optional[str] = None,
    correlation_id: Optional[str] = None,
) -> PrdSeries:
    qts = valid_from or _now()
    try:
        pol = get_active_policy(s, name=policy_name, at=qts)
        if not pol:
            raise RuntimeError(f"Sin policy activa '{policy_name}' para {qts.isoformat()}")

        exp = compute_exportable(stock_open, domestic_demand)
        prd_value = pol.pbase_azucar * pol.k_factor

        mix = {
            "domestic": {"qty": min(stock_open, domestic_demand), "price": prd_value},
            "export":   {"qty": exp, "commission_policy": policy_name},
            "inputs": {"stock_open": stock_open, "domestic_demand": domestic_demand, **forecast_meta}
        }

        fpr = inputs_fingerprint({
            "segment": segment, "qts": qts.isoformat(),
            "stock_open": stock_open, "domestic_demand": domestic_demand,
            "policy": policy_name, "forecast_meta": forecast_meta
        })

        model = (s.query(MlModel)
                   .filter(MlModel.active == True)
                   .order_by(MlModel.created_at.desc())
                   .first())

        obj = PrdSeries(
            segment=segment,
            valid_from=qts, valid_to=valid_to,
            prd_value=prd_value,
            stock_open=stock_open,
            domestic_demand=domestic_demand,
            exportable_balance=exp,
            policy_id=pol.id,
            model_id=model.id if model else None,
            inputs_hash=fpr,
            mix=mix,
            justification=justification,
            correlation_id=correlation_id
        )
        
        try:
            s.add(obj)
            obj = with_db_retry(
                lambda: _commit_and_refresh(s, obj),
                retry_on=(OperationalError, DBAPIError),
                non_retryable=(IntegrityError,)
            )
            if PRD_DECISION_WRITE_TOTAL:
                PRD_DECISION_WRITE_TOTAL.labels("created").inc()
        except IntegrityError:
            s.rollback()
            obj = (s.query(PrdSeries)
                    .filter(PrdSeries.inputs_hash == fpr)
                    .order_by(PrdSeries.id.desc())
                    .first())
            if PRD_DECISION_WRITE_TOTAL:
                PRD_DECISION_WRITE_TOTAL.labels("duplicate").inc()

        seg = segment or "__all__"
        if PRD_LAST_VALUE:
            PRD_LAST_VALUE.labels(seg).set(prd_value)
        if PRD_EXPORTABLE_BALANCE:
            PRD_EXPORTABLE_BALANCE.labels(seg).set(exp)
        if PRD_LAST_DECISION_TS:
            PRD_LAST_DECISION_TS.labels(seg).set(datetime.now(timezone.utc).timestamp())

        return obj
    except Exception as e:
        if PRD_OPTIMIZE_FAIL_TOTAL:
            PRD_OPTIMIZE_FAIL_TOTAL.inc()
        raise e