import yfinance as yf
from datetime import datetime, timedelta

def test_london_sugar():
    # Trying alternative tickers for London White Sugar
    tickers = ["SW=F", "LSU=F", "LSUc1", "ICE=F"]
    
    start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
    end_date = datetime.now().strftime('%Y-%m-%d')
    
    print(f"Probando tickers alternativos para Azúcar Londres desde {start_date}...")
    
    for ticker in tickers:
        print(f"\nIntentando descargar {ticker}...")
        try:
            data = yf.download(ticker, start=start_date, end=end_date, progress=False)
            if not data.empty:
                print(f"✅ ÉXITO: {len(data)} filas descargadas para {ticker}.")
                print(data.tail(2))
            else:
                print(f"❌ FALLO: Datos vacíos para {ticker}")
        except Exception as e:
            print(f"❌ ERROR: {e}")

if __name__ == "__main__":
    test_london_sugar()
