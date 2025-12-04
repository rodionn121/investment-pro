from sqlalchemy.orm import Session
from models import User, Portfolio, Asset
from schemas import UserCreate, PortfolioCreate, AssetCreate, AssetUpdate

# ============= USER CRUD =============

def create_user(db: Session, user: UserCreate) -> User:
    """Create a new user"""
    db_user = User(
        name=user.name,
        email=user.email,
        password=user.password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_email(db: Session, email: str) -> User:
    """Get user by email"""
    return db.query(User).filter(User.email == email).first()

def get_user_by_id(db: Session, user_id: int) -> User:
    """Get user by ID"""
    return db.query(User).filter(User.id == user_id).first()

# ============= PORTFOLIO CRUD =============

def create_portfolio(db: Session, portfolio: PortfolioCreate) -> Portfolio:
    """Create a new portfolio"""
    db_portfolio = Portfolio(
        name=portfolio.name,
        user_id=portfolio.user_id
    )
    db.add(db_portfolio)
    db.commit()
    db.refresh(db_portfolio)
    return db_portfolio

def get_portfolio_by_user(db: Session, user_id: int) -> Portfolio:
    """Get user's portfolio"""
    return db.query(Portfolio).filter(Portfolio.user_id == user_id).first()

def get_portfolio_by_id(db: Session, portfolio_id: int) -> Portfolio:
    """Get portfolio by ID"""
    return db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()

# ============= ASSET CRUD =============

def create_asset(db: Session, asset: AssetCreate) -> Asset:
    """Create a new asset"""
    db_asset = Asset(
        ticker=asset.ticker.upper(),
        name=asset.name,
        quantity=asset.quantity,
        purchase_price=asset.purchase_price,
        current_price=asset.current_price or asset.purchase_price,
        portfolio_id=asset.portfolio_id
    )
    db.add(db_asset)
    db.commit()
    db.refresh(db_asset)
    return db_asset

def get_assets_by_portfolio(db: Session, portfolio_id: int) -> list[Asset]:
    """Get all assets from a portfolio"""
    return db.query(Asset).filter(Asset.portfolio_id == portfolio_id).all()

def get_asset_by_id(db: Session, asset_id: int) -> Asset:
    """Get asset by ID"""
    return db.query(Asset).filter(Asset.id == asset_id).first()

def update_asset(db: Session, asset_id: int, asset_update: AssetUpdate) -> Asset:
    """Update asset information"""
    db_asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not db_asset:
        return None
    
    if asset_update.quantity is not None:
        db_asset.quantity = asset_update.quantity
    if asset_update.purchase_price is not None:
        db_asset.purchase_price = asset_update.purchase_price
    if asset_update.current_price is not None:
        db_asset.current_price = asset_update.current_price
    
    db.commit()
    db.refresh(db_asset)
    return db_asset

def delete_asset(db: Session, asset_id: int) -> bool:
    """Delete an asset"""
    db_asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not db_asset:
        return False
    
    db.delete(db_asset)
    db.commit()
    return True
