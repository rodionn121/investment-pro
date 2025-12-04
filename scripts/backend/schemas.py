from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import List, Optional

# ============= USER SCHEMAS =============

class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# ============= PORTFOLIO SCHEMAS =============

class PortfolioBase(BaseModel):
    name: str

class PortfolioCreate(PortfolioBase):
    user_id: int

class PortfolioResponse(PortfolioBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    assets: List['AssetResponse'] = []
    
    class Config:
        from_attributes = True

# ============= ASSET SCHEMAS =============

class AssetBase(BaseModel):
    ticker: str = Field(..., description="Stock ticker symbol (e.g., PETR4)")
    name: Optional[str] = None
    quantity: int = Field(..., gt=0, description="Number of shares")
    purchase_price: float = Field(..., gt=0, description="Price paid per share")

class AssetCreate(AssetBase):
    portfolio_id: Optional[int] = None
    current_price: Optional[float] = None

class AssetUpdate(BaseModel):
    quantity: Optional[int] = Field(None, gt=0)
    purchase_price: Optional[float] = Field(None, gt=0)
    current_price: Optional[float] = None

class AssetResponse(AssetBase):
    id: int
    portfolio_id: int
    current_price: float
    created_at: datetime
    updated_at: datetime
    
    # Computed properties
    total_purchase_value: float
    current_value: float
    gain_loss: float
    gain_loss_percentage: float
    
    class Config:
        from_attributes = True

# Update forward references
PortfolioResponse.model_rebuild()
