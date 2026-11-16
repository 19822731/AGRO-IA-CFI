import yfinance as yf
from datetime import datetime, timedelta

def test_yfinance_download():
    # Tickers comunes para estos activos en Yahoo Finance
    # Sugar #11 (US): SB=F
    # Sugar #5 (London): LSU=F (White Sugar) - A veces es SW=F o similar, hay que probar.
    # DXY: DX-Y.NYB o DX=F
    
    tickers = {
        "Sugar #11 (US)": "SB=F",
        "Sugar #5 (London)": "LSU=F", # White Sugar Futures
        "US Dollar Index": "DX-Y.NYB",
        "USD/ARS": "ARS=X",
        "USD/BRL": "BRL=X"
    }
    
    start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
    end_date = datetime.now().strftime('%Y-%m-%d')
    
    print(f"Probando descargas con yfinance desde {start_date}...")
    
    for name, ticker in tickers.items():
        print(f"\nIntentando descargar {name} ({ticker})...")
        try:
            data = yf.download(ticker, start=start_date, end=end_date, progress=False)
            if not data.empty:
                print(f"✅ ÉXITO: {len(data)} filas descargadas.")
                print(data.tail(2))
            else:
                print(f"❌ FALLO: Datos vacíos para {ticker}")
        except Exception as e:
            print(f"❌ ERROR: {e}")

if __name__ == "__main__":
    test_yfinance_download()
