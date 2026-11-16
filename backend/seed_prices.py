from database import SessionLocal
from models import PrdSeries, MarketCommissionPolicy
from datetime import datetime
import pytz

db = SessionLocal()

# Ensure a policy exists
policy = db.query(MarketCommissionPolicy).filter_by(name="default").first()
if not policy:
    policy = MarketCommissionPolicy(
        name="default",
        valid_from=datetime.now(pytz.utc),
        pbase_azucar=500.0,
        k_factor=1.0,
        justification="Initial seed"
    )
    db.add(policy)
    db.commit()
    print("Created default policy.")

# Seed prices for segments
segments = ["AR_total", "Standard"]
base_price = 474600.0 # 23730 * 20 bags/ton

for seg in segments:
    # Close existing open record if any
    existing = db.query(PrdSeries).filter(
        PrdSeries.segment == seg,
        PrdSeries.valid_to.is_(None)
    ).first()
    
    now = datetime.now(pytz.utc)
    
    if existing:
        existing.valid_to = now
        db.add(existing)
        print(f"Closed existing price for {seg}")

    # Insert new price
    prd = PrdSeries(
        segment=seg,
        valid_from=now,
        prd_value=base_price,
        stock_open=100000,
        domestic_demand=50000,
        exportable_balance=50000,
        policy_id=policy.id,
        justification="Updated seed"
    )
    db.add(prd)
    print(f"Seeded price for {seg}: {base_price}")

db.commit()
db.close()
