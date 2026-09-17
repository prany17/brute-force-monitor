from datetime import datetime

from sqlalchemy import String, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.database.database import Base


class BlockedIP(Base):
    __tablename__ = "blocked_ips"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    ip_address: Mapped[str] = mapped_column(
        String(45),
        unique=True,
        nullable=False,
        index=True
    )

    reason: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    blocked_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False
    )

    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
    )