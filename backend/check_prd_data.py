import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from config import settings

# Setup DB connection
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def check_prd():
    db = SessionLocal()
    try:
        # Check PrdSeries
        result = db.execute(text("SELECT * FROM prd_series ORDER BY valid_from DESC LIMIT 5"))
        rows = result.fetchall()
        print(f"Found {len(rows)} PRD entries.")
        for row in rows:
            print(row)
            
        # Check Products and their segments
        products = db.execute(text("SELECT id, nombre, segmento_prd FROM productos"))
        print("\nProducts:")
        for p in products:
            print(p)
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_prd()
