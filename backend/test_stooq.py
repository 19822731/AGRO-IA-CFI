import pandas_datareader.data as web
from datetime import datetime, timedelta

def test_stooq_sugar():
    # Stooq ticker for White Sugar might be SW.F or similar
    tickers = ["SW.F", "SB.F", "LSU.F"] # Trying a few variations
    
    start_date = datetime.now() - timedelta(days=365)
    end_date = datetime.now()
    
    print(f"Probando descarga desde Stooq (vía pandas_datareader)...")
    
    for ticker in tickers:
        print(f"\nIntentando descargar {ticker}...")
        try:
            df = web.DataReader(ticker, 'stooq', start=start_date, end=end_date)
            if not df.empty:
                print(f"✅ ÉXITO: {len(df)} filas descargadas para {ticker}.")
                print(df.head(2))
            else:
                print(f"❌ FALLO: Datos vacíos para {ticker}")
        except Exception as e:
            print(f"❌ ERROR: {e}")

if __name__ == "__main__":
    test_stooq_sugar()
