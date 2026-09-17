from datetime import datetime, timezone

from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.database.database import Base


class SecurityEvent(Base):
    __tablename__ = "security_events"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    event_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True
    )

    ip_address: Mapped[str | None] = mapped_column(
        String(45),
        nullable=True,
        index=True
    )

    username: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True
    )

    description: Mapped[str] = mapped_column(
        String(500),
        nullable=False
    )

    severity: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True
    )