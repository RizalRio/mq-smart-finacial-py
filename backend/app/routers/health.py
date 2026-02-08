from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.sql import func
from datetime import datetime, timedelta
import calendar
from decimal import Decimal

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.models.wallet import Wallet
from app.models.transaction import Transaction, TransactionType, Category
from app.schemas.health import HealthCheckResponse, HealthStatus

router = APIRouter()

@router.get("/", response_model=HealthCheckResponse)
async def check_financial_health(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Analisis Kesehatan Keuangan:
    Menghitung apakah user akan bertahan sampai akhir bulan berdasarkan
    gaya hidup (Burn Rate) saat ini.
    """
    # 1. Tentukan Rentang Waktu (Bulan Ini)
    today = datetime.now()
    start_date = today.replace(day=1, hour=0, minute=0, second=0)
    
    # Cari tanggal terakhir bulan ini (misal 30/31/28)
    last_day = calendar.monthrange(today.year, today.month)[1]
    end_date = today.replace(day=last_day, hour=23, minute=59, second=59)
    
    days_passed = today.day
    days_remaining = last_day - days_passed
    if days_remaining == 0: days_remaining = 1 # Hindari pembagian 0 di akhir bulan

    # 2. Hitung Total Aset (Semua Dompet)
    wallet_res = await db.execute(
        select(func.sum(Wallet.balance))
        .where(Wallet.user_id == current_user.id, Wallet.deleted_at == None)
    )
    total_balance = wallet_res.scalar() or Decimal(0)

    # 3. Hitung Pengeluaran Variable Bulan Ini (Makan, Jajan, Transport)
    # Kita exclude 'Fixed Cost' (Sewa Kost/Cicilan) karena itu pengeluaran pasti, bukan gaya hidup harian.
    expense_res = await db.execute(
        select(func.sum(Transaction.amount))
        .join(Category, Transaction.category_id == Category.id)
        .where(
            Transaction.user_id == current_user.id,
            Transaction.type == TransactionType.EXPENSE,
            Transaction.date >= start_date,
            Transaction.date <= end_date,
            Category.is_fixed == False # HANYA VARIABLE COST
        )
    )
    total_variable_expense = expense_res.scalar() or Decimal(0)

    # 4. Hitung Burn Rate (Rata-rata boros per hari)
    burn_rate = total_variable_expense / Decimal(days_passed)

    # 5. Prediksi: Aset Sekarang - (Burn Rate * Sisa Hari)
    # (Asumsi: User akan jajan terus seperti hari-hari sebelumnya)
    projected_expense_remaining = burn_rate * Decimal(days_remaining)
    projected_balance = total_balance - projected_expense_remaining

    # 6. Tentukan Status
    status = HealthStatus.SAFE
    msg = "Keuanganmu aman terkendali, Bro! 😎"

    if projected_balance < 0:
        status = HealthStatus.DANGER
        msg = "BAHAYA! Kamu diprediksi bangkrut sebelum akhir bulan! 💀 Hemat sekarang!"
    elif projected_balance < (total_balance * Decimal(0.2)): # Sisa kurang dari 20%
        status = HealthStatus.WARNING
        msg = "Hati-hati, uangmu mulai menipis. Kurangi jajan kopi! ☕❌"

    return HealthCheckResponse(
        total_balance=total_balance,
        total_variable_expense=total_variable_expense,
        average_daily_burn_rate=round(burn_rate, 2),
        projected_balance_end_month=round(projected_balance, 2),
        days_remaining=days_remaining,
        status=status,
        message=msg
    )