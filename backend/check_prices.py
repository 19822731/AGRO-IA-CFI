from database import SessionLocal
from models import PrdSeries, Producto

db = SessionLocal()

products = db.query(Producto).all()
print(f"Found {len(products)} products.")

for p in products:
    print(f"Product: {p.nombre} (ID: {p.id}, Segment: {p.segmento_prd})")
    prd = db.query(PrdSeries).filter(PrdSeries.segment == p.segmento_prd).order_by(PrdSeries.valid_from.desc()).first()
    if prd:
        print(f"  Reference Price: {prd.prd_value} (Valid from: {prd.valid_from})")
    else:
        print("  No reference price found.")
    print("-" * 20)

db.close()
