import httpx
from typing import Dict, List, Optional

BRAPI_BASE_URL = "https://brapi.dev/api"

async def get_quote(ticker: str) -> Optional[Dict]:
    """
    Get current quote for a ticker from Brapi
    
    Args:
        ticker: Stock ticker symbol (e.g., PETR4, VALE3)
    
    Returns:
        Dict with quote information or None if not found
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{BRAPI_BASE_URL}/quote/{ticker}",
                params={"token": "demo"}  # Use demo token (get a real one at brapi.dev)
            )
            response.raise_for_status()
            data = response.json()
            
            if data.get("results") and len(data["results"]) > 0:
                return data["results"][0]
            return None
    except Exception as e:
        print(f"Error fetching quote for {ticker}: {e}")
        return None

async def get_quotes(tickers: List[str]) -> List[Dict]:
    """
    Get quotes for multiple tickers
    
    Args:
        tickers: List of ticker symbols
    
    Returns:
        List of quote dictionaries
    """
    try:
        tickers_str = ",".join(tickers)
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{BRAPI_BASE_URL}/quote/{tickers_str}",
                params={"token": "demo"}
            )
            response.raise_for_status()
            data = response.json()
            return data.get("results", [])
    except Exception as e:
        print(f"Error fetching quotes: {e}")
        return []

async def search_tickers(query: str) -> List[Dict]:
    """
    Search for tickers by name or symbol
    
    Args:
        query: Search term (company name or ticker)
    
    Returns:
        List of matching tickers
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{BRAPI_BASE_URL}/available",
                params={"search": query, "token": "demo"}
            )
            response.raise_for_status()
            data = response.json()
            return data.get("stocks", [])
    except Exception as e:
        print(f"Error searching tickers: {e}")
        return []

async def get_available_tickers() -> List[Dict]:
    """
    Get list of all available tickers from Brapi
    
    Returns:
        List of available tickers
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{BRAPI_BASE_URL}/available",
                params={"token": "demo"}
            )
            response.raise_for_status()
            data = response.json()
            return data.get("stocks", [])
    except Exception as e:
        print(f"Error fetching available tickers: {e}")
        return []

async def get_ticker_info(ticker: str) -> Optional[Dict]:
    """
    Get detailed information about a ticker
    
    Args:
        ticker: Stock ticker symbol
    
    Returns:
        Dict with detailed ticker information
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{BRAPI_BASE_URL}/quote/{ticker}",
                params={"token": "demo", "fundamental": "true"}
            )
            response.raise_for_status()
            data = response.json()
            
            if data.get("results") and len(data["results"]) > 0:
                return data["results"][0]
            return None
    except Exception as e:
        print(f"Error fetching ticker info for {ticker}: {e}")
        return None
