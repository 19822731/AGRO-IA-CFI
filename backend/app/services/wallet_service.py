import logging
from decimal import Decimal
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException
import models
import marketplace_service
import random
import string
import json
import os

PRE_REG_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "pre_registros.json")

def load_pre_registros():
    if not os.path.exists(PRE_REG_FILE):
        return {}
    try:
        with open(PRE_REG_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return {}

def save_pre_registro(id, data):
    regs = load_pre_registros()
    regs[id] = data
    with open(PRE_REG_FILE, "w") as f:
        json.dump(regs, f)

def calculate_wallet_summary(user: models.Usuario, db: Session):
    fiat_wallet = db.query(models.BilleteraFiat).filter(
        models.BilleteraFiat.usuario_id == user.id,
        models.BilleteraFiat.moneda == "ARS"
    ).first()
    
    if not fiat_wallet:
        fiat_wallet = models.BilleteraFiat(usuario_id=user.id, moneda="ARS", saldo=0)
        db.add(fiat_wallet)
        db.commit()
        db.refresh(fiat_wallet)

    if not fiat_wallet.cvu:
        fiat_wallet.cvu = "000000" + "".join(random.choices(string.digits, k=16))
        db.add(fiat_wallet)
        db.commit()
        db.refresh(fiat_wallet)
    
    fiat_balance = float(fiat_wallet.saldo) if fiat_wallet else 0.0
    
    open_buy_orders = db.query(models.Orden).filter(
        models.Orden.usuario_id == user.id,
        models.Orden.tipo_orden == models.TipoOrdenEnum.compra,
        models.Orden.estado.in_([models.EstadoOrdenEnum.abierta, models.EstadoOrdenEnum.parcialmente_ejecutada])
    ).all()
    
    locked_fiat = sum(
        (float(o.cantidad_original) - float(o.cantidad_ejecutada)) * float(o.precio_limite) 
        for o in open_buy_orders if o.precio_limite
    )
    
    assets_summary = {}
    asset_wallets = db.query(models.BilleteraActivo).filter(models.BilleteraActivo.usuario_id == user.id).all()
    
    total_asset_value = 0.0
    locked_asset_value = 0.0
    
    for wallet in asset_wallets:
        total_tons = float(wallet.cantidad)
        total_bags = total_tons * 20
        
        current_price_ton = marketplace_service.get_precio_actual(db, wallet.producto_id)
        if not current_price_ton:
             current_price_ton = marketplace_service.get_precio_referencia_dinamico(db, wallet.producto_id)
        
        price_per_ton = float(current_price_ton) if current_price_ton else 0.0
        price_per_bag = price_per_ton / 20
        
        open_sell_orders = db.query(models.Orden).filter(
            models.Orden.usuario_id == user.id,
            models.Orden.producto_id == wallet.producto_id,
            models.Orden.tipo_orden == models.TipoOrdenEnum.venta,
            models.Orden.estado.in_([models.EstadoOrdenEnum.abierta, models.EstadoOrdenEnum.parcialmente_ejecutada])
        ).all()
        
        locked_tons_orders = sum(
            (float(o.cantidad_original) - float(o.cantidad_ejecutada))
            for o in open_sell_orders
        )
        
        active_warrants = db.query(models.Warrant).filter(
            models.Warrant.usuario_id == user.id,
            models.Warrant.producto_id == wallet.producto_id,
            models.Warrant.estado == "activo"
        ).all()
        
        locked_tons_warrants = sum(float(w.cantidad) for w in active_warrants)
        
        locked_tons = locked_tons_orders + locked_tons_warrants
        locked_bags = locked_tons * 20
        
        assets_summary[wallet.producto_id] = {
            "total": total_bags,
            "total_tons": total_tons,
            "total_bags": total_bags,
            "locked": locked_tons,
            "locked_bags": locked_bags,
            "available": total_bags - locked_bags,
            "current_price": price_per_bag,
            "valuation": total_bags * price_per_bag
        }
        
        total_asset_value += total_bags * price_per_bag
        locked_asset_value += locked_bags * price_per_bag

    available_asset_value = total_asset_value - locked_asset_value
    fiat_available = fiat_balance - locked_fiat
    
    equity = fiat_available + available_asset_value
    margin_used = locked_asset_value 
    margin_available = fiat_available
    
    cost_basis = total_asset_value * 0.9 if total_asset_value > 0 else 0
    pnl_open = total_asset_value - cost_basis
    
    deposits = 5000000.0 
    withdrawals = 0.0
    pnl_closed = 125000.0
    
    margin_level = (equity / margin_used * 100) if margin_used > 0 else 0
    if margin_used == 0 and equity > 0:
        margin_level = 999.0

    return {
        "user_id": user.id,
        "fiat": {
            "total": fiat_balance,
            "locked": locked_fiat,
            "available": margin_available,
            "cvu": fiat_wallet.cvu
        },
        "assets": assets_summary,
        "financials": {
            "balance": fiat_balance,
            "equity": equity,
            "marginUsed": margin_used,
            "marginAvailable": margin_available,
            "marginLevel": margin_level,
            "pnlOpen": pnl_open,
            "pnlClosed": pnl_closed,
            "deposits": deposits,
            "withdrawals": withdrawals
        }
    }

def process_approve_deposit(deposit_id: int, db: Session):
    deposito = db.query(models.Deposito).filter(models.Deposito.id == deposit_id).first()
    if not deposito:
        raise HTTPException(status_code=404, detail="Depósito no encontrado")
        
    if deposito.estado == "aprobado":
        return {"message": "El depósito ya fue aprobado"}
        
    deposito.estado = "aprobado"
    deposito.fecha_aprobacion = datetime.now()
    
    billetera = db.query(models.BilleteraFiat).filter(
        models.BilleteraFiat.usuario_id == deposito.usuario_id,
        models.BilleteraFiat.moneda == deposito.moneda
    ).first()
    
    if billetera:
        billetera.saldo += deposito.monto
    else:
        billetera = models.BilleteraFiat(
            usuario_id=deposito.usuario_id,
            moneda=deposito.moneda,
            saldo=deposito.monto
        )
        db.add(billetera)
        
    db.commit()
    return {"message": "Depósito aprobado y saldo acreditado"}

def simulate_deposit_credit(cvu: str, amount: float, db: Session):
    if not cvu or amount <= 0:
        raise HTTPException(status_code=400, detail="Datos inválidos")
    
    wallet = db.query(models.BilleteraFiat).filter(models.BilleteraFiat.cvu == cvu).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="CVU no encontrado")
        
    deposito = models.Deposito(
        usuario_id=wallet.usuario_id,
        monto=Decimal(amount),
        moneda=wallet.moneda,
        estado="aprobado",
        fecha_aprobacion=datetime.now()
    )
    db.add(deposito)
    
    wallet.saldo += Decimal(amount)
    db.commit()
    
    return {"message": "Depósito simulado exitosamente", "new_balance": float(wallet.saldo), "user_id": wallet.usuario_id}

def approve_product_pre_registration(id: str, db: Session):
    regs = load_pre_registros()
    if id not in regs:
        raise HTTPException(status_code=404, detail="Pre-registro no encontrado")
    
    data = regs[id]
    if data.get("status") == "APPROVED":
        return {"message": "Ya aprobado"}

    producer_id = data.get("producerId")
    user = db.query(models.Usuario).filter(models.Usuario.email == producer_id).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"Usuario productor no encontrado: {producer_id}")

    details = data.get("productDetails", {})
    product_name = f"{details.get('categoria')} {details.get('tipoProducto')} {details.get('marca')}".strip()
    
    product = db.query(models.Producto).filter(models.Producto.nombre == product_name).first()
    if not product:
        product = models.Producto(
            nombre=product_name,
            commodity=details.get("categoria", "Unknown"),
            mercado="ROS",
            segmento_prd="Standard",
            activo=True
        )
        db.add(product)
        db.commit()
        db.refresh(product)

    cantidad = Decimal(str(details.get("cantidad", 0)))
    
    wallet = db.query(models.BilleteraActivo).filter(
        models.BilleteraActivo.usuario_id == user.id,
        models.BilleteraActivo.producto_id == product.id
    ).first()

    if not wallet:
        wallet = models.BilleteraActivo(
            usuario_id=user.id,
            producto_id=product.id,
            cantidad=Decimal("0")
        )
        db.add(wallet)
    
    wallet.cantidad += cantidad
    db.commit()

    data["status"] = "APPROVED"
    save_pre_registro(id, data)

    return {"message": "Producto aprobado y stock cargado", "new_stock": float(wallet.cantidad)}
