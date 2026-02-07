from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from enum import Enum

class WalletTypeEnum(str, Enum):
    BANK = "BANK"
    EWALLET = "EWALLET"
    CASH = "CASH"

class WalletBase(BaseModel):
    name: str
    type: WalletTypeEnum
    balance: Decimal = 0

class WalletCreate(WalletBase):
    pass

class WalletResponse(WalletBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True