from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, DateTime, Boolean, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.core.database import Base
from app.models.base import SoftDeleteMixin

# Enum untuk Tipe Transaksi
class TransactionType(str, enum.Enum):
    INCOME = "INCOME"
    EXPENSE = "EXPENSE"
    TRANSFER = "TRANSFER"

# --- TABEL KATEGORI ---
class Category(Base, SoftDeleteMixin):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)   # Contoh: "Makan", "Gaji"
    type = Column(String, nullable=False)   # INCOME / EXPENSE
    is_fixed = Column(Boolean, default=False) # True = Fixed Cost (Sewa Kost), False = Variable (Jajan)
    
    # Relasi
    owner = relationship("User", backref="categories")
    transactions = relationship("Transaction", back_populates="category")

# --- TABEL TRANSAKSI ---
class Transaction(Base, SoftDeleteMixin):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    wallet_id = Column(Integer, ForeignKey("wallets.id"), nullable=False) # Dompet Sumber
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True) # Nullable kalau Transfer
    
    # Khusus Transfer: Dompet Tujuan
    target_wallet_id = Column(Integer, ForeignKey("wallets.id"), nullable=True) 

    type = Column(Enum(TransactionType), nullable=False)
    amount = Column(Numeric(15, 2), nullable=False)
    date = Column(DateTime(timezone=True), default=func.now())
    description = Column(String, nullable=True)

    # Relasi
    wallet = relationship("Wallet", foreign_keys=[wallet_id])
    target_wallet = relationship("Wallet", foreign_keys=[target_wallet_id])
    category = relationship("Category", back_populates="transactions")