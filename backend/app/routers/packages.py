from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.db import DatabaseConfigurationError, DatabaseNotConfigured, DatabaseUnavailable, fetch_all


router = APIRouter()

PACKAGE_PRICING_QUERY = "SELECT * FROM v_package_pricing;"


@router.get("/pricing")
def get_package_pricing():
    try:
        return fetch_all(PACKAGE_PRICING_QUERY)
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
