from datetime import datetime, timedelta, timezone

from argon2 import PasswordHasher
from jose import jwt

from app.database.database import settings


password_hasher = PasswordHasher()


def hash_password(password: str) -> str:
    return password_hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return password_hasher.verify(password_hash, password)
    except Exception:
        return False


def create_access_token(
    user_id: int,
    username: str,
    role: str
) -> str:

    expiration = datetime.now(timezone.utc) + timedelta(hours=1)

    payload = {
        "sub": str(user_id),
        "username": username,
        "role": role,
        "exp": expiration
    }

    token = jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm="HS256"
    )

    return token