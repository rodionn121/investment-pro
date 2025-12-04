from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List
import jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext

from database import engine, get_db, Base
from models import User, Portfolio, Asset
from schemas import (
    UserCreate, UserLogin, UserResponse,
    PortfolioCreate, PortfolioResponse,
    AssetCreate, AssetUpdate, AssetResponse,
    Token
)
from crud import (
    create_user, get_user_by_email, 
    create_portfolio, get_portfolio_by_user,
    create_asset, get_assets_by_portfolio, 
    get_asset_by_id, update_asset, delete_asset
)
from brapi_service import get_quote, search_tickers, get_available_tickers

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Investment Portfolio API", version="1.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Configuration
SECRET_KEY = "your-secret-key-change-in-production"  # Change this!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = get_user_by_email(db, email=email)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# ============= AUTH ENDPOINTS =============

@app.post("/api/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user exists
    db_user = get_user_by_email(db, email=user_data.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    hashed_password = get_password_hash(user_data.password)
    user_data.password = hashed_password
    
    # Create user
    user = create_user(db=db, user=user_data)
    
    # Create default portfolio for user
    portfolio = PortfolioCreate(
        name=f"{user.name}'s Portfolio",
        user_id=user.id
    )
    create_portfolio(db=db, portfolio=portfolio)
    
    return user

@app.post("/api/auth/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """Login user and return JWT token"""
    user = get_user_by_email(db, email=user_data.email)
    if not user or not verify_password(user_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token = create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@app.get("/api/auth/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user

# ============= PORTFOLIO ENDPOINTS =============

@app.get("/api/portfolio", response_model=PortfolioResponse)
def get_portfolio(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's portfolio with all assets"""
    portfolio = get_portfolio_by_user(db, user_id=current_user.id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    return portfolio

# ============= ASSET ENDPOINTS =============

@app.post("/api/assets", response_model=AssetResponse, status_code=status.HTTP_201_CREATED)
async def add_asset(
    asset_data: AssetCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a new asset to portfolio"""
    portfolio = get_portfolio_by_user(db, user_id=current_user.id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    # Get current quote from Brapi
    quote_data = await get_quote(asset_data.ticker)
    if not quote_data:
        raise HTTPException(status_code=404, detail="Ticker not found")
    
    # Create asset with current price
    asset_data.portfolio_id = portfolio.id
    asset_data.current_price = quote_data['regularMarketPrice']
    
    asset = create_asset(db=db, asset=asset_data)
    return asset

@app.get("/api/assets", response_model=List[AssetResponse])
def list_assets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all assets from user's portfolio"""
    portfolio = get_portfolio_by_user(db, user_id=current_user.id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    assets = get_assets_by_portfolio(db, portfolio_id=portfolio.id)
    return assets

@app.get("/api/assets/{asset_id}", response_model=AssetResponse)
def get_asset(
    asset_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific asset details"""
    asset = get_asset_by_id(db, asset_id=asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    # Verify asset belongs to user's portfolio
    portfolio = get_portfolio_by_user(db, user_id=current_user.id)
    if asset.portfolio_id != portfolio.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return asset

@app.put("/api/assets/{asset_id}", response_model=AssetResponse)
async def update_asset_endpoint(
    asset_id: int,
    asset_data: AssetUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update asset (add more shares or change quantity)"""
    asset = get_asset_by_id(db, asset_id=asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    # Verify ownership
    portfolio = get_portfolio_by_user(db, user_id=current_user.id)
    if asset.portfolio_id != portfolio.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get current price from Brapi
    quote_data = await get_quote(asset.ticker)
    if quote_data:
        asset_data.current_price = quote_data['regularMarketPrice']
    
    updated_asset = update_asset(db=db, asset_id=asset_id, asset_update=asset_data)
    return updated_asset

@app.delete("/api/assets/{asset_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_asset_endpoint(
    asset_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete asset from portfolio"""
    asset = get_asset_by_id(db, asset_id=asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    # Verify ownership
    portfolio = get_portfolio_by_user(db, user_id=current_user.id)
    if asset.portfolio_id != portfolio.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    delete_asset(db=db, asset_id=asset_id)
    return None

# ============= BRAPI INTEGRATION ENDPOINTS =============

@app.get("/api/brapi/quote/{ticker}")
async def get_stock_quote(ticker: str):
    """Get current quote for a ticker from Brapi"""
    quote = await get_quote(ticker)
    if not quote:
        raise HTTPException(status_code=404, detail="Ticker not found")
    return quote

@app.get("/api/brapi/search")
async def search_stocks(query: str):
    """Search for tickers in Brapi"""
    results = await search_tickers(query)
    return results

@app.get("/api/brapi/tickers")
async def list_tickers():
    """Get list of available tickers from Brapi"""
    tickers = await get_available_tickers()
    return tickers

# ============= HEALTH CHECK =============

@app.get("/")
def health_check():
    """API health check"""
    return {
        "status": "ok",
        "message": "Investment Portfolio API is running",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
