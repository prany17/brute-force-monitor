from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.database.database import settings
from app.models.blocked_ip import BlockedIP
from app.models.login_attempt import LoginAttempt
from app.models.security_event import SecurityEvent


def get_current_time():
    return datetime.now(timezone.utc)


def is_ip_blocked(
    ip_address: str,
    db: Session
) -> bool:

    current_time = get_current_time()

    blocked_ip = (
        db.query(BlockedIP)
        .filter(
            BlockedIP.ip_address == ip_address,
            BlockedIP.is_active == True
        )
        .first()
    )

    if not blocked_ip:
        return False

    # Block has expired
    if blocked_ip.expires_at <= current_time:

        blocked_ip.is_active = False

        db.commit()

        return False

    return True


def record_login_attempt(
    db: Session,
    username: str,
    ip_address: str,
    status: str,
    failure_reason: str | None = None,
    user_id: int | None = None
):

    attempt = LoginAttempt(
        username=username,
        ip_address=ip_address,
        status=status,
        failure_reason=failure_reason,
        user_id=user_id
    )

    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    return attempt


def get_recent_failed_attempts(
    db: Session,
    ip_address: str
):

    current_time = get_current_time()

    window_start = (
        current_time -
        timedelta(
            seconds=settings.FAILED_ATTEMPT_WINDOW_SECONDS
        )
    )

    failed_attempts = (
        db.query(LoginAttempt)
        .filter(
            LoginAttempt.ip_address == ip_address,
            LoginAttempt.status == "FAILED",
            LoginAttempt.timestamp >= window_start
        )
        .count()
    )

    return failed_attempts


def block_ip(
    db: Session,
    ip_address: str,
    reason: str
):

    current_time = get_current_time()

    expires_at = (
        current_time +
        timedelta(
            minutes=settings.BLOCK_DURATION_MINUTES
        )
    )

    # Check whether the IP already exists
    blocked_ip = (
        db.query(BlockedIP)
        .filter(
            BlockedIP.ip_address == ip_address
        )
        .first()
    )

    if blocked_ip:

        blocked_ip.reason = reason
        blocked_ip.blocked_at = current_time
        blocked_ip.expires_at = expires_at
        blocked_ip.is_active = True

    else:

        blocked_ip = BlockedIP(
            ip_address=ip_address,
            reason=reason,
            blocked_at=current_time,
            expires_at=expires_at,
            is_active=True
        )

        db.add(blocked_ip)

    db.commit()
    db.refresh(blocked_ip)

    return blocked_ip


def create_security_event(
    db: Session,
    event_type: str,
    ip_address: str | None,
    username: str | None,
    description: str,
    severity: str
):

    event = SecurityEvent(
        event_type=event_type,
        ip_address=ip_address,
        username=username,
        description=description,
        severity=severity
    )

    db.add(event)
    db.commit()
    db.refresh(event)

    return event