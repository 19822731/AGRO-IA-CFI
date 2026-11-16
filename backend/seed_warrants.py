from database import SessionLocal
from models import Orden, Usuario, Producto, TipoOrdenEnum, EstadoOrdenEnum, TipoEjecucionEnum
from datetime import datetime
import pytz

db = SessionLocal()

# Get user
user = db.query(Usuario).filter(Usuario.email == "producer@test.com").first()
if not user:
    print("User not found")
    exit()

# Get product (Providencia)
product = db.query(Producto).filter(Producto.nombre.like("%Providencia%")).first()
if not product:
    print("Product not found")
    exit()

# Create a SELL order to lock assets (Warrant simulation)
# 1800 bags = 90 tons
quantity_tons = 90.0
price_per_ton = 474600.0 # Market price

order = Orden(
    usuario_id=user.id,
    producto_id=product.id,
    tipo_orden=TipoOrdenEnum.venta,
    cantidad_original=quantity_tons,
    cantidad_ejecutada=0,
    tipo_ejecucion=TipoEjecucionEnum.limite,
    precio_limite=price_per_ton,
    estado=EstadoOrdenEnum.abierta,
    timestamp=datetime.now(pytz.utc)
)

db.add(order)
db.commit()
print(f"Created warrant (sell order) for {quantity_tons} tons ({quantity_tons * 20} bags).")
db.close()
