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
from app.routes.dashboard import router as dashboard_router

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Brute Force Detection & Security Monitoring System",
    description="Cybersecurity system for detecting and monitoring brute-force login attacks",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Create database tables
Base.metadata.create_all(bind=engine)


# Authentication routes
app.include_router(auth_router)
app.include_router(dashboard_router)

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