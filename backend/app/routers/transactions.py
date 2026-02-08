from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.models.wallet import Wallet
from app.models.transaction import Transaction, TransactionType, Category
from app.schemas.transaction import TransactionCreate, TransactionResponse, CategoryCreate, CategoryResponse

router = APIRouter()

# --- CATEGORY ENDPOINTS ---
@router.post("/categories", response_model=CategoryResponse)
async def create_category(
    cat_in: CategoryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    new_cat = Category(**cat_in.model_dump(), user_id=current_user.id)
    db.add(new_cat)
    await db.commit()
    await db.refresh(new_cat)
    return new_cat

@router.get("/categories", response_model=list[CategoryResponse])
async def get_categories(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Category).where(Category.user_id == current_user.id))
    return result.scalars().all()

# --- TRANSACTION ENDPOINTS ---

@router.post("/", response_model=TransactionResponse)
async def create_transaction(
    trx_in: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Core Logic: Mencatat transaksi & update saldo dompet secara otomatis.
    """
    # Safety Check: Kalau bukan Transfer, target wallet harus null
    if trx_in.type != TransactionType.TRANSFER:
        trx_in.target_wallet_id = None
    
    if trx_in.target_wallet_id == 0:
        trx_in.target_wallet_id = None

    # 1. Ambil Dompet Sumber
    result = await db.execute(select(Wallet).where(Wallet.id == trx_in.wallet_id, Wallet.user_id == current_user.id))
    wallet = result.scalars().first()
    
    if not wallet:
        raise HTTPException(status_code=404, detail="Dompet sumber tidak ditemukan")

    # 2. Logic Perubahan Saldo
    if trx_in.type == TransactionType.INCOME:
        wallet.balance += trx_in.amount
    
    elif trx_in.type == TransactionType.EXPENSE:
        if wallet.balance < trx_in.amount:
            raise HTTPException(status_code=400, detail="Saldo tidak cukup bro!")
        wallet.balance -= trx_in.amount

    elif trx_in.type == TransactionType.TRANSFER:
        if not trx_in.target_wallet_id:
            raise HTTPException(status_code=400, detail="Target wallet wajib untuk transfer")
            
        target_res = await db.execute(select(Wallet).where(Wallet.id == trx_in.target_wallet_id, Wallet.user_id == current_user.id))
        target_wallet = target_res.scalars().first()
        
        if not target_wallet:
            raise HTTPException(status_code=404, detail="Dompet tujuan tidak ditemukan")
            
        if wallet.balance < trx_in.amount:
            raise HTTPException(status_code=400, detail="Saldo kurang untuk transfer")

        wallet.balance -= trx_in.amount
        target_wallet.balance += trx_in.amount

    # 3. Simpan Transaksi
    new_trx = Transaction(
        user_id=current_user.id,
        wallet_id=trx_in.wallet_id,
        category_id=trx_in.category_id,
        target_wallet_id=trx_in.target_wallet_id,
        type=trx_in.type,
        amount=trx_in.amount,
        date=trx_in.date,
        description=trx_in.description
    )

    db.add(new_trx)
    await db.commit()
    
    query = select(Transaction).options(
        selectinload(Transaction.category) # Load data kategori sekalian!
    ).where(Transaction.id == new_trx.id)
    
    result = await db.execute(query)
    final_trx = result.scalars().first()
    
    return final_trx

@router.get("/", response_model=list[TransactionResponse])
async def get_transactions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Gunakan selectinload untuk mengambil data Category sekaligus (Eager Loading)
    query = select(Transaction).options(selectinload(Transaction.category)).where(
        Transaction.user_id == current_user.id
    ).order_by(Transaction.date.desc())
    
    result = await db.execute(query)
    return result.scalars().all()