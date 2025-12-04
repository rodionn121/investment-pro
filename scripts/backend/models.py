from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    portfolios = relationship("Portfolio", back_populates="user", cascade="all, delete-orphan")

class Portfolio(Base):
    __tablename__ = "portfolios"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="portfolios")
    assets = relationship("Asset", back_populates="portfolio", cascade="all, delete-orphan")

class Asset(Base):
    __tablename__ = "assets"
    
    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String, nullable=False, index=True)  # Ex: PETR4, VALE3
    name = Column(String)  # Company name
    quantity = Column(Integer, nullable=False)  # Number of shares
    purchase_price = Column(Float, nullable=False)  # Price paid per share
    current_price = Column(Float, nullable=False)  # Current market price
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    portfolio = relationship("Portfolio", back_populates="assets")
    
    @property
    def total_purchase_value(self) -> float:
        """Total amount invested in this asset"""
        return self.quantity * self.purchase_price
    
    @property
    def current_value(self) -> float:
        """Current total value of this asset"""
        return self.quantity * self.current_price
    
    @property
    def gain_loss(self) -> float:
        """Profit or loss on this asset"""
        return self.current_value - self.total_purchase_value
    
    @property
    def gain_loss_percentage(self) -> float:
        """Profit or loss percentage"""
        if self.total_purchase_value == 0:
            return 0
        return (self.gain_loss / self.total_purchase_value) * 100
