from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from datetime import datetime
from enum import Enum

class TransactionTypeEnum(str, Enum):
    INCOME = "INCOME"
    EXPENSE = "EXPENSE"
    TRANSFER = "TRANSFER"

# --- SCHEMAS CATEGORY ---
class CategoryBase(BaseModel):
    name: str
    type: str # INCOME / EXPENSE
    is_fixed: bool = False

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    class Config:
        from_attributes = True

# --- SCHEMAS TRANSACTION ---
class TransactionCreate(BaseModel):
    wallet_id: int
    amount: Decimal
    type: TransactionTypeEnum
    date: datetime
    description: Optional[str] = None
    
    # Optional fields tergantung tipe
    category_id: Optional[int] = None
    target_wallet_id: Optional[int] = None # Wajib diisi kalau TRANSFER

class TransactionResponse(BaseModel):
    id: int
    amount: Decimal
    type: TransactionTypeEnum
    description: Optional[str]
    date: datetime
    wallet_id: int
    category: Optional[CategoryResponse] = None # Nested response biar keren
    
    class Config:
        from_attributes = True