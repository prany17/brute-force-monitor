from fastapi import FastAPI
from sqlalchemy import text

from app.database.database import Base, engine
from app.models import (
    User,
    LoginAttempt,
    BlockedIP,
    SecurityEvent
)

from app.routes.auth import router as auth_router


app = FastAPI(
    title="Brute Force Detection & Security Monitoring System",
    description="Cybersecurity system for detecting and monitoring brute-force login attacks",
    version="1.0.0"
)


# Create database tables
Base.metadata.create_all(bind=engine)


# Authentication routes
app.include_router(auth_router)


@app.get("/")
def root():
    return {
        "message": "Brute Force Monitor API is running"
    }


@app.get("/health")
def health_check():

    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "database": "connected"
        }

    except Exception as e:

        return {
            "status": "unhealthy",
            "database": "connection failed",
            "error": str(e)
        }