import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import flights, health, hotels, packages


LOCAL_DEV_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:8000",
    "http://localhost:8099",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8000",
    "http://127.0.0.1:8099",
]


def get_allowed_origins() -> list[str]:
    raw = os.getenv("ALLOWED_ORIGINS", "")
    configured = [origin.strip() for origin in raw.split(",") if origin.strip()]
    return configured or LOCAL_DEV_ORIGINS


app = FastAPI(title="Sunwing SmartRates API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(health.router)
app.include_router(hotels.router, prefix="/api/hotels", tags=["hotels"])
app.include_router(flights.router, prefix="/api/flights", tags=["flights"])
app.include_router(packages.router, prefix="/api/packages", tags=["packages"])
