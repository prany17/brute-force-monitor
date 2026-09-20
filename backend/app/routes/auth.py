from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.database.database import get_db, settings
from app.models.user import User

from app.schemas.auth import (
    UserRegister,
    UserResponse,
    UserLogin,
    TokenResponse
)

from app.utils.security import (
    hash_password,
    verify_password,
    create_access_token
)

from app.services.security_service import (
    is_ip_blocked,
    record_login_attempt,
    get_recent_failed_attempts,
    block_ip,
    create_security_event
)

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
def register(
    user_data: UserRegister,
    db: Session = Depends(get_db)
):

    # Check if username already exists
    existing_username = (
        db.query(User)
        .filter(User.username == user_data.username)
        .first()
    )

    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )

    # Check if email already exists
    existing_email = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists"
        )

    # Hash password
    password_hash = hash_password(user_data.password)

    # Create user
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=password_hash,
        role="USER"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

@router.post(
    "/login",
    response_model=TokenResponse
)
def login(
    request: Request,
    user_data: UserLogin,
    db: Session = Depends(get_db)
):

    # Get client IP address
    ip_address = request.client.host

    # --------------------------------------------------
    # 1. Check whether IP is blocked
    # --------------------------------------------------

    if is_ip_blocked(ip_address, db):

        record_login_attempt(
            db=db,
            username=user_data.username,
            ip_address=ip_address,
            status="BLOCKED",
            failure_reason="IP_BLOCKED"
        )

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your IP address is temporarily blocked"
        )

    # --------------------------------------------------
    # 2. Find user
    # --------------------------------------------------

    user = (
        db.query(User)
        .filter(User.username == user_data.username)
        .first()
    )

    # --------------------------------------------------
    # 3. User doesn't exist
    # --------------------------------------------------

    if not user:

        record_login_attempt(
            db=db,
            username=user_data.username,
            ip_address=ip_address,
            status="FAILED",
            failure_reason="INVALID_CREDENTIALS"
        )

        failed_attempts = get_recent_failed_attempts(
            db,
            ip_address
        )

        if failed_attempts >= settings.MAX_FAILED_ATTEMPTS:

            block_ip(
                db=db,
                ip_address=ip_address,
                reason="Brute-force attack detected"
            )

            create_security_event(
                db=db,
                event_type="BRUTE_FORCE_DETECTED",
                ip_address=ip_address,
                username=user_data.username,
                description=(
                    f"{failed_attempts} failed login attempts "
                    f"within {settings.FAILED_ATTEMPT_WINDOW_SECONDS // 60} minutes"
                ),
                severity="HIGH"
            )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    # --------------------------------------------------
    # 4. Verify password
    # --------------------------------------------------

    if not verify_password(
        user_data.password,
        user.password_hash
    ):

        record_login_attempt(
            db=db,
            username=user_data.username,
            ip_address=ip_address,
            status="FAILED",
            failure_reason="INVALID_CREDENTIALS",
            user_id=user.id
        )

        failed_attempts = get_recent_failed_attempts(
            db,
            ip_address
        )

        if failed_attempts >= settings.MAX_FAILED_ATTEMPTS:

            block_ip(
                db=db,
                ip_address=ip_address,
                reason="Brute-force attack detected"
            )

            create_security_event(
                db=db,
                event_type="BRUTE_FORCE_DETECTED",
                ip_address=ip_address,
                username=user.username,
                description=(
                    f"{failed_attempts} failed login attempts "
                    f"within {settings.FAILED_ATTEMPT_WINDOW_SECONDS // 60} minutes"
                ),
                severity="HIGH"
            )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    # --------------------------------------------------
    # 5. Successful login
    # --------------------------------------------------

    record_login_attempt(
        db=db,
        username=user.username,
        ip_address=ip_address,
        status="SUCCESS",
        user_id=user.id
    )

    # --------------------------------------------------
    # 6. Create JWT
    # --------------------------------------------------

    access_token = create_access_token(
        user_id=user.id,
        username=user.username,
        role=user.role
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }