from database import SessionLocal
from models import Warrant, Usuario, Producto, Orden, TipoOrdenEnum, EstadoOrdenEnum
from datetime import date

db = SessionLocal()

# Get user
user = db.query(Usuario).filter(Usuario.email == "producer@test.com").first()
if not user:
    print("User not found")
    exit()

# Get product
product = db.query(Producto).filter(Producto.nombre.like("%Providencia%")).first()
if not product:
    print("Product not found")
    exit()

# 1. Delete the temporary sell order (warrant simulation)
temp_order = db.query(Orden).filter(
    Orden.usuario_id == user.id,
    Orden.producto_id == product.id,
    Orden.tipo_orden == TipoOrdenEnum.venta,
    Orden.cantidad_original == 90.0,
    Orden.estado == EstadoOrdenEnum.abierta
).first()

if temp_order:
    db.delete(temp_order)
    print("Deleted temporary sell order.")
else:
    print("Temporary sell order not found (already deleted?).")

# 2. Insert Real Warrants
# 600 bags = 30 tons
warrants_data = [
    {
        "cantidad": 30.0,
        "deposito": "Almacén Norte",
        "ingenio": "Ingenio Azucarera del Norte",
        "fecha_emision": date(2023, 10, 15),
        "fecha_vencimiento": date(2024, 4, 15),
        "estado": "activo"
    },
    {
        "cantidad": 30.0,
        "deposito": "Almacén Sur",
        "ingenio": "Ingenio La Esperanza",
        "fecha_emision": date(2023, 11, 20),
        "fecha_vencimiento": date(2024, 5, 20),
        "estado": "activo"
    },
    {
        "cantidad": 30.0,
        "deposito": "Almacén Central",
        "ingenio": "Ingenio del Este",
        "fecha_emision": date(2023, 9, 5),
        "fecha_vencimiento": date(2024, 3, 5),
        "estado": "activo"
    }
]

for w_data in warrants_data:
    warrant = Warrant(
        usuario_id=user.id,
        producto_id=product.id,
        **w_data
    )
    db.add(warrant)

db.commit()
print(f"Created {len(warrants_data)} real warrants.")
db.close()
