from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.login_attempt import LoginAttempt
from app.models.blocked_ip import BlockedIP
from app.models.security_event import SecurityEvent
from app.models.user import User
from app.utils.auth import require_admin


router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"]
)


@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):

    total_attempts = (
        db.query(LoginAttempt)
        .count()
    )

    successful_logins = (
        db.query(LoginAttempt)
        .filter(LoginAttempt.status == "SUCCESS")
        .count()
    )

    failed_logins = (
        db.query(LoginAttempt)
        .filter(LoginAttempt.status == "FAILED")
        .count()
    )

    blocked_ips = (
        db.query(BlockedIP)
        .filter(BlockedIP.is_active == True)
        .count()
    )

    detected_attacks = (
        db.query(SecurityEvent)
        .filter(
            SecurityEvent.event_type == "BRUTE_FORCE_DETECTED"
        )
        .count()
    )

    total_users = (
        db.query(User)
        .count()
    )

    return {
        "total_attempts": total_attempts,
        "successful_logins": successful_logins,
        "failed_logins": failed_logins,
        "blocked_ips": blocked_ips,
        "detected_attacks": detected_attacks,
        "total_users": total_users
    }


@router.get("/attempts")
def get_login_attempts(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):

    attempts = (
        db.query(LoginAttempt)
        .order_by(LoginAttempt.timestamp.desc())
        .limit(20)
        .all()
    )

    return [
        {
            "id": attempt.id,
            "username": attempt.username,
            "ip_address": attempt.ip_address,
            "timestamp": attempt.timestamp,
            "status": attempt.status,
            "failure_reason": attempt.failure_reason
        }
        for attempt in attempts
    ]


@router.get("/events")
def get_security_events(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):

    events = (
        db.query(SecurityEvent)
        .order_by(SecurityEvent.timestamp.desc())
        .limit(20)
        .all()
    )

    return [
        {
            "id": event.id,
            "event_type": event.event_type,
            "ip_address": event.ip_address,
            "username": event.username,
            "description": event.description,
            "severity": event.severity,
            "timestamp": event.timestamp
        }
        for event in events
    ]


@router.get("/blocked-ips")
def get_blocked_ips(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):

    blocked_ips = (
        db.query(BlockedIP)
        .filter(BlockedIP.is_active == True)
        .order_by(BlockedIP.blocked_at.desc())
        .all()
    )

    return [
        {
            "id": blocked_ip.id,
            "ip_address": blocked_ip.ip_address,
            "reason": blocked_ip.reason,
            "blocked_at": blocked_ip.blocked_at,
            "expires_at": blocked_ip.expires_at,
            "is_active": blocked_ip.is_active
        }
        for blocked_ip in blocked_ips
    ]