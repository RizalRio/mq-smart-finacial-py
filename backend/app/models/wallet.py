from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import SoftDeleteMixin
import enum

class WalletType(str, enum.Enum):
    BANK = "BANK"
    EWALLET = "EWALLET"
    CASH = "CASH"

class Wallet(Base, SoftDeleteMixin):
    __tablename__ = "wallets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)  # Contoh: "BCA Utama"
    type = Column(String, nullable=False)  # Disimpan sebagai string di DB
    balance = Column(Numeric(15, 2), default=0) # Support angka besar desimal

    # Relasi balik ke User
    owner = relationship("User", back_populates="wallets")