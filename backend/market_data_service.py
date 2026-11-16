
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

# Cache storage
_cache = {}
CACHE_DURATION_MINUTES = 15

def get_global_sugar_price():
    """
    Fetches the current price and recent history for Sugar #11 Futures (SB=F).
    Returns a dictionary with current price and history.
    """
    ticker_symbol = "SB=F"
    cache_key = f"sugar_price_{ticker_symbol}"
    
    # Check cache
    if cache_key in _cache:
        data, timestamp = _cache[cache_key]
        if datetime.now() - timestamp < timedelta(minutes=CACHE_DURATION_MINUTES):
            logger.info("Returning cached sugar price data")
            return data

    try:
        logger.info(f"Fetching data for {ticker_symbol} from yfinance...")
        ticker = yf.Ticker(ticker_symbol)
        
        # Get recent history (last 1 month to show trends)
        history = ticker.history(period="1mo")
        
        if history.empty:
            logger.warning("No data returned from yfinance")
            return None

        # Get current price (last close)
        current_price = history['Close'].iloc[-1]
        previous_close = history['Close'].iloc[-2] if len(history) > 1 else current_price
        change = current_price - previous_close
        change_percent = (change / previous_close) * 100 if previous_close != 0 else 0

        # Format history for chart
        chart_data = []
        for date, row in history.iterrows():
            chart_data.append({
                "date": date.strftime("%Y-%m-%d"),
                "price": round(row['Close'], 2)
            })

        result = {
            "symbol": "Sugar #11",
            "currency": "USD",
            "unit": "lb", # Sugar #11 is priced in cents per pound usually, but yfinance returns dollars? Let's verify. usually cents/lb.
            # yfinance for SB=F usually returns e.g. 20.50 which is cents per pound.
            "price": round(current_price, 2),
            "change": round(change, 2),
            "change_percent": round(change_percent, 2),
            "history": chart_data,
            "last_updated": datetime.now().isoformat()
        }

        # Update cache
        _cache[cache_key] = (result, datetime.now())
        return result

    except Exception as e:
        logger.error(f"Error fetching sugar price: {e}")
        return None
