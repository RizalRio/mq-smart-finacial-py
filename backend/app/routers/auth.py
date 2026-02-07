from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi.security import OAuth2PasswordRequestForm
from typing import Any

from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse

router = APIRouter()

# --- REGISTER ---
@router.post("/register", response_model=UserResponse)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)) -> Any:
    """
    Daftar user baru.
    """
    # 1. Cek apakah email sudah ada
    result = await db.execute(select(User).where(User.email == user_in.email))
    existing_user = result.scalars().first()
    
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email sudah terdaftar bro, coba login aja."
        )

    # 2. Buat object User baru dengan password yang sudah di-hash
    new_user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password),
        avatar_url=user_in.avatar_url
    )

    # 3. Simpan ke Database
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return new_user

# --- LOGIN ---
@router.post("/login")
async def login(
    # Kita pakai OAuth2PasswordRequestForm biar kompatibel sama Swagger UI
    # Nanti form_data.username isinya adalah EMAIL kita
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Login untuk dapat Access Token.
    """
    # 1. Cari user by Email
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalars().first()

    # 2. Validasi User & Password
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau password salah bro.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 3. Bikin Token
    access_token = create_access_token(data={"sub": user.email, "id": user.id})

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }