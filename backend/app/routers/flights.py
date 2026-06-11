from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.db import DatabaseConfigurationError, DatabaseNotConfigured, DatabaseUnavailable, fetch_all


router = APIRouter()

FLIGHT_PRICING_QUERY = "SELECT * FROM v_flight_pricing;"


@router.get("/pricing")
def get_flight_pricing():
    try:
        return fetch_all(FLIGHT_PRICING_QUERY)
    except DatabaseNotConfigured as exc:
        return JSONResponse(
            status_code=503,
            content={
                "error": "Database is not configured",
                "missing_env_vars": exc.missing,
            },
        )
    except DatabaseConfigurationError as exc:
        return JSONResponse(status_code=503, content={"error": str(exc)})
    except DatabaseUnavailable as exc:
        return JSONResponse(status_code=503, content={"error": str(exc)})
