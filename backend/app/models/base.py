from sqlalchemy import Column, DateTime
from app.core.database import Base
from datetime import datetime

class SoftDeleteMixin:
    deleted_at = Column(DateTime, nullable=True, default=None)

    def soft_delete(self):
        self.deleted_at = datetime.utcnow()