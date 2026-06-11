# Sunwing SmartRates Backend

Minimal FastAPI backend scaffold for the Sunwing SmartRates application.

## Endpoints

- `GET /health` returns `{"status": "ok"}`
- `GET /api/hotels/pricing` queries `SELECT * FROM v_hotel_pricing;`
- `GET /api/flights/pricing` queries `SELECT * FROM v_flight_pricing;`
- `GET /api/packages/pricing` queries `SELECT * FROM v_package_pricing;`

Pricing endpoints return HTTP `503` with a clear JSON body when required database environment variables are missing or PostgreSQL is unavailable.

## Required Environment Variables

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `ALLOWED_ORIGINS` comma-separated CORS allowlist, for example:
  `http://localhost:8099,http://localhost:3000`

Credentials must be provided through environment variables. Do not hardcode them.

## Local Run

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```

Use `.env` as a reference for the required values, then export the environment variables in your shell and run:

```powershell
$env:DB_HOST="localhost"
$env:DB_PORT="5432"
$env:DB_NAME="sunwing_smartrates"
$env:DB_USER="postgres"
$env:DB_PASSWORD="your-password"
$env:ALLOWED_ORIGINS="http://localhost:8099,http://localhost:3000,http://127.0.0.1:8099"
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Health check:

```powershell
Invoke-RestMethod http://localhost:8000/health
```

## Docker Run

```powershell
cd backend
docker build -t sunwing-smartrates-backend .
docker run --rm -p 8000:8000 `
  -e DB_HOST=host.docker.internal `
  -e DB_PORT=5432 `
  -e DB_NAME=sunwing_smartrates `
  -e DB_USER=postgres `
  -e DB_PASSWORD=your-password `
  -e ALLOWED_ORIGINS=http://localhost:8099,http://localhost:3000,http://127.0.0.1:8099 `
  sunwing-smartrates-backend
```

## ECS Notes

- Container port: `8000`
- Health check path: `/health`
- Intended route: `/api/*`
- Store database credentials in a secrets manager or task definition secrets.
- Set `ALLOWED_ORIGINS` to the deployed frontend origins. Wildcard CORS is not enabled by default.
