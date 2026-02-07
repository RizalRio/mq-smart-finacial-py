from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.models.wallet import Wallet
from app.schemas.wallet import WalletCreate, WalletResponse, WalletUpdate

router = APIRouter()

# --- 1. GET ALL WALLETS ---
@router.get("/", response_model=List[WalletResponse])
async def read_wallets(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Ambil semua dompet aktif milik user yang sedang login.
    """
    # Query hanya wallet milik user INI dan yang belum dihapus (Soft Delete Check)
    result = await db.execute(
        select(Wallet).where(
            Wallet.user_id == current_user.id,
            Wallet.deleted_at == None
        )
    )
    return result.scalars().all()

# --- 2. CREATE WALLET ---
@router.post("/", response_model=WalletResponse)
async def create_wallet(
    wallet_in: WalletCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Buat dompet baru (Bank, Cash, E-Wallet).
    """
    new_wallet = Wallet(
        name=wallet_in.name,
        type=wallet_in.type,
        balance=wallet_in.balance,
        user_id=current_user.id # Otomatis link ke user yang login
    )
    
    db.add(new_wallet)
    await db.commit()
    await db.refresh(new_wallet)
    
    return new_wallet

# --- 3. DELETE WALLET (Flexible: Soft / Hard) ---
@router.delete("/{wallet_id}")
async def delete_wallet(
    wallet_id: int,
    permanent: bool = Query(False), # Default False (Soft Delete)
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Hapus dompet.
    - ?permanent=false (Default): Soft delete (isi deleted_at).
    - ?permanent=true: Hapus permanen dari DB.
    """
    # Cari wallet-nya dulu
    result = await db.execute(
        select(Wallet).where(
            Wallet.id == wallet_id,
            Wallet.user_id == current_user.id
        )
    )
    wallet = result.scalars().first()

    if not wallet:
        raise HTTPException(status_code=404, detail="Dompet tidak ditemukan")

    if permanent:
        # HARD DELETE
        await db.delete(wallet)
        msg = "Dompet dihapus permanen"
    else:
        # SOFT DELETE
        wallet.soft_delete() # Panggil fungsi dari Mixin
        msg = "Dompet dipindahkan ke sampah (Soft Delete)"
    
    await db.commit()
    return {"message": msg, "id": wallet_id}

# --- 4. UPDATE WALLET ---
@router.put("/{wallet_id}", response_model=WalletResponse)
async def update_wallet(
    wallet_id: int,
    wallet_in: WalletUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update informasi dompet (Nama & Tipe).
    Saldo tidak bisa diubah dari sini (harus lewat transaksi).
    """
    # 1. Cari wallet di DB
    result = await db.execute(
        select(Wallet).where(
            Wallet.id == wallet_id,
            Wallet.user_id == current_user.id
        )
    )
    wallet = result.scalars().first()

    if not wallet:
        raise HTTPException(status_code=404, detail="Dompet tidak ditemukan")

    # 2. Update field yang dikirim saja
    update_data = wallet_in.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(wallet, key, value)

    # 3. Simpan perubahan
    await db.commit()
    await db.refresh(wallet)

    return wallet