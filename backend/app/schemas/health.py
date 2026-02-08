from pydantic import BaseModel
from decimal import Decimal
from enum import Enum

class HealthStatus(str, Enum):
    SAFE = "SAFE"       # Sisa uang > 20%
    WARNING = "WARNING" # Sisa uang positif tapi tipis (< 20%)
    DANGER = "DANGER"   # Minus (Akan bangkrut)

class HealthCheckResponse(BaseModel):
    total_balance: Decimal
    total_variable_expense: Decimal
    average_daily_burn_rate: Decimal
    projected_balance_end_month: Decimal
    days_remaining: int
    status: HealthStatus
    message: str