import time
import random
import requests
import logging
from decimal import Decimal
from sqlalchemy.orm import Session
from database import SessionLocal
import models
import security

# Configuración
API_URL = "http://localhost:8000"
NUM_BOTS = 10 # Aumentado de 5 a 10
PRODUCTO_ID = 2  # Asumimos ID 2 para Azúcar (verificar en DB si es necesario)
PASSWORD_DEFAULT = "BotPassword123!"

# Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def setup_bots(db: Session):
    """Crea usuarios bots y les asigna saldo inicial directamente en BD."""
    bots = []
    for i in range(1, NUM_BOTS + 1):
        email = f"bot_{i}@simulation.com"
        
        # 1. Crear/Obtener Usuario
        user = db.query(models.Usuario).filter(models.Usuario.email == email).first()
        if not user:
            hashed_pw = security.get_password_hash(PASSWORD_DEFAULT)
            user = models.Usuario(email=email, hashed_password=hashed_pw, roles="viewer")
            db.add(user)
            db.commit()
            db.refresh(user)
            logger.info(f"Usuario creado: {email}")
        
        # 2. Configurar Billetera Fiat (ARS)
        wallet_fiat = db.query(models.BilleteraFiat).filter(
            models.BilleteraFiat.usuario_id == user.id,
            models.BilleteraFiat.moneda == "ARS"
        ).first()
        
        if not wallet_fiat:
            wallet_fiat = models.BilleteraFiat(
                usuario_id=user.id,
                moneda="ARS",
                saldo=10_000_000, # 10 Millones ARS
                cvu=f"00000000000000000000{i:02d}"
            )
            db.add(wallet_fiat)
            db.commit()
            logger.info(f"Billetera Fiat creada para {email} con $10M")
        else:
            # Recargar si está bajo
            if wallet_fiat.saldo < 1_000_000:
                wallet_fiat.saldo = 10_000_000
                db.commit()
                logger.info(f"Billetera Fiat recargada para {email}")

        # 3. Configurar Billetera Activo (Azúcar)
        wallet_asset = db.query(models.BilleteraActivo).filter(
            models.BilleteraActivo.usuario_id == user.id,
            models.BilleteraActivo.producto_id == PRODUCTO_ID
        ).first()
        
        if not wallet_asset:
            wallet_asset = models.BilleteraActivo(
                usuario_id=user.id,
                producto_id=PRODUCTO_ID,
                cantidad=5000 # 5000 Toneladas
            )
            db.add(wallet_asset)
            db.commit()
            logger.info(f"Billetera Activo creada para {email} con 5000 Ton")
        else:
             if wallet_asset.cantidad < 500:
                wallet_asset.cantidad = 5000
                db.commit()
                logger.info(f"Billetera Activo recargada para {email}")

        bots.append({"email": email, "password": PASSWORD_DEFAULT, "id": user.id})
    
    return bots

def get_auth_token(email, password):
    try:
        response = requests.post(f"{API_URL}/auth/token", data={
            "username": email,
            "password": password
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        else:
            logger.error(f"Error login {email}: {response.text}")
            return None
    except Exception as e:
        logger.error(f"Excepción login {email}: {e}")
        return None

def get_market_price():
    """Obtiene el PRD (Precio de Referencia Dinámico) como precio base.
    Prioriza PRD sobre current_price ya que es más estable y representa el valor real."""
    try:
        # Primero intentar obtener PRD directamente desde el endpoint dedicado
        resp_prd = requests.get(f"{API_URL}/api/prd", timeout=5)
        if resp_prd.status_code == 200:
            prd_data = resp_prd.json()
            prd_value = prd_data.get("prd_value", 0)
            if prd_value > 0:
                logger.info(f"Usando PRD: {prd_value}")
                return float(prd_value)
    except Exception as e:
        logger.warning(f"No se pudo obtener PRD directo: {e}")
    
    try:
        # Fallback: obtener desde /api/market/prices
        resp = requests.get(f"{API_URL}/api/market/prices/{PRODUCTO_ID}", timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            # Priorizar PRD sobre current_price
            prd = data.get("prd", 0)
            if prd > 0:
                logger.info(f"Usando PRD desde market/prices: {prd}")
                return float(prd)
            current = data.get("current_price", 0)
            if current > 0:
                logger.info(f"Usando current_price: {current}")
                return float(current)
    except Exception as e:
        logger.warning(f"Error obteniendo precios: {e}")
    
    # NUNCA usar un fallback bajo - esto causa el problema de drift
    # En su lugar, lanzar excepción para que el bot espere
    logger.error("No se pudo obtener precio válido. Reintentando...")
    return None  # Retornar None indica que no hay precio válido

def run_simulation(bots):
    logger.info("🚀 Iniciando simulación de mercado...")
    
    # Login inicial para todos
    sessions = []
    for bot in bots:
        token = get_auth_token(bot["email"], bot["password"])
        if token:
            sessions.append({"token": token, "email": bot["email"]})
    
    if not sessions:
        logger.error("No se pudo loguear ningún bot.")
        return

    logger.info(f"✅ {len(sessions)} bots listos para operar.")

    while True:
        try:
            bot = random.choice(sessions)
            
            # Obtener PRD real como precio base
            prd_val = get_market_price()
            
            if prd_val is None:
                logger.warning("Esperando precio válido...")
                time.sleep(5)
                continue
            
            market_price = prd_val  # Usar PRD como precio de referencia

            # Decidir acción (Compra o Venta)
            action = random.choices(["compra", "venta"], weights=[0.5, 0.5])[0]
            
            # Obtener Order Book para ver puntas
            try:
                resp_ob = requests.get(f"{API_URL}/mercado/productos/{PRODUCTO_ID}/orderbook")
                ob_data = resp_ob.json()
                bids = ob_data.get("bids", [])
                asks = ob_data.get("asks", [])
                
                best_bid = float(bids[0]["precio"]) if bids else market_price
                best_ask = float(asks[0]["precio"]) if asks else market_price
            except:
                best_bid = market_price
                best_ask = market_price

            # Probabilidad de ser "Taker" (agresivo) vs "Maker" (pasivo)
            # AUMENTADO TEMPORALMENTE A 0.7 PARA GENERAR MATCHES VISUALES
            es_taker = random.random() < 0.7
            
            # Calcular rango de precios válido basado en PRD (±2%)
            precio_min = prd_val * 0.98
            precio_max = prd_val * 1.02
            
            if action == "compra":
                if es_taker and asks:
                    # TAKER COMPRADOR: Come la mejor oferta de venta si existe
                    # Para asegurar match, pagamos el precio del vendedor
                    limit_price = best_ask
                    logger.info(f"🔥 TAKER COMPRA: Cruzando spread para comer oferta a {limit_price}")
                else:
                    # MAKER COMPRADOR: Pone orden abajo
                    limit_price = prd_val * random.uniform(0.985, 0.999) # Más cerca del precio
                    
                quantity = round(random.uniform(1, 10), 2)
                
            else: # Venta
                if es_taker and bids:
                    # TAKER VENDEDOR: Vende a la mejor oferta de compra si existe
                    # Para asegurar match, vendemos al precio del comprador
                    limit_price = best_bid
                    logger.info(f"🔥 TAKER VENTA: Cruzando spread para vender a {limit_price}")
                else:
                    # MAKER VENDEDOR: Pone orden arriba
                    limit_price = prd_val * random.uniform(1.001, 1.015) # Más cerca del precio
                
                quantity = round(random.uniform(1, 10), 2)

            order_data = {
                "producto_id": PRODUCTO_ID,
                "tipo_orden": action,
                "tipo_ejecucion": "limite",
                "cantidad_original": quantity,
                "precio_limite": round(limit_price, 2)
            }
            
            headers = {"Authorization": f"Bearer {bot['token']}"}
            
            logger.info(f"🤖 {bot['email']} enviando {action.upper()} {quantity} @ {limit_price:.2f} (Taker: {es_taker})")
            
            resp = requests.post(f"{API_URL}/mercado/ordenes/", json=order_data, headers=headers)
            
            if resp.status_code == 200:
                logger.info(f"   ✅ Orden creada: ID {resp.json()['id']}")
            else:
                logger.warning(f"   ❌ Falló orden: {resp.text}")
            
            # Pausa aleatoria para realismo (Acelerada)
            time.sleep(random.uniform(0.5, 1.5))
            
        except KeyboardInterrupt:
            logger.info("🛑 Simulación detenida por usuario.")
            break
        except Exception as e:
            logger.error(f"Error en ciclo de simulación: {e}")
            time.sleep(5)

if __name__ == "__main__":
    # 1. Setup DB
    db = SessionLocal()
    try:
        bots_config = setup_bots(db)
    finally:
        db.close()
    
    # 2. Run Loop
    run_simulation(bots_config)
