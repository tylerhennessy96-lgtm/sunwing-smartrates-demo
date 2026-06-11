import os
from dataclasses import dataclass
from typing import Any

import psycopg
from psycopg.rows import dict_row


REQUIRED_DB_ENV_VARS = ("DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD")


class DatabaseNotConfigured(Exception):
    def __init__(self, missing: list[str]) -> None:
        self.missing = missing
        super().__init__(f"Missing required database environment variables: {', '.join(missing)}")


class DatabaseUnavailable(Exception):
    pass


class DatabaseConfigurationError(Exception):
    pass


@dataclass(frozen=True)
class DatabaseSettings:
    host: str
    port: int
    dbname: str
    user: str
    password: str


def get_database_settings() -> DatabaseSettings:
    missing = [name for name in REQUIRED_DB_ENV_VARS if not os.getenv(name)]
    if missing:
        raise DatabaseNotConfigured(missing)

    try:
        port = int(os.environ["DB_PORT"])
    except ValueError as exc:
        raise DatabaseConfigurationError("DB_PORT must be an integer") from exc

    return DatabaseSettings(
        host=os.environ["DB_HOST"],
        port=port,
        dbname=os.environ["DB_NAME"],
        user=os.environ["DB_USER"],
        password=os.environ["DB_PASSWORD"],
    )


def get_connection() -> psycopg.Connection:
    settings = get_database_settings()
    try:
        return psycopg.connect(
            host=settings.host,
            port=settings.port,
            dbname=settings.dbname,
            user=settings.user,
            password=settings.password,
            row_factory=dict_row,
            connect_timeout=5,
        )
    except psycopg.Error as exc:
        raise DatabaseUnavailable("Unable to connect to PostgreSQL") from exc


def fetch_all(query: str) -> list[dict[str, Any]]:
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(query)
                return list(cur.fetchall())
    except (DatabaseNotConfigured, DatabaseConfigurationError, DatabaseUnavailable):
        raise
    except psycopg.Error as exc:
        raise DatabaseUnavailable("Unable to query PostgreSQL") from exc
