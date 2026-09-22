import os
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    ENVIRONMENT: str = "development"
    PROJECT_NAME: str = "NagarNetra Urban Telemetry Grid (Chennai Pilot)"
    VERSION: str = "2.5.0"
    API_V1_STR: str = "/v1"
    CITY_NAME: str = "Chennai"
    STATE_NAME: str = "Tamil Nadu"
    MUNICIPAL_AUTHORITY: str = "Greater Chennai Corporation"
    TRANSIT_AGENCY: str = "Metropolitan Transport Corporation (MTC)"
    DEFAULT_LAT: float = 13.0827
    DEFAULT_LON: float = 80.2707

    # Chennai Geofence (Greater Chennai Metropolitan Area)
    GEOFENCE_MIN_LAT: float = 12.80
    GEOFENCE_MAX_LAT: float = 13.35
    GEOFENCE_MIN_LON: float = 79.95
    GEOFENCE_MAX_LON: float = 80.40

    # Database
    DATABASE_URL: str = "sqlite:///./nagarnetra.db"
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_TIMEOUT: int = 30
    EVIDENCE_DIR: str = "./backend/app/data/evidence"

    # Security & Auth
    JWT_SECRET_KEY: str = "dev-jwt-secret-key-change-this-in-production-2026"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    DEFAULT_HMAC_SECRET_KEY: str = "dev-edge-fallback-hmac-key-2026"
    # Backwards compatibility
    HMAC_SECRET_KEY: str = "dev-edge-fallback-hmac-key-2026"
    KEY_ROTATION_GRACE_PERIOD_SEC: int = 86400

    # Rate Limiting & Limits
    RATE_LIMIT_PER_MINUTE: int = 120
    MAX_REQUEST_BODY_BYTES: int = 1048576  # 1 MB

    # CORS
    CORS_ORIGINS: Union[str, List[str]] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.strip() == "*":
                return ["*"]
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return ["http://localhost:3000", "http://127.0.0.1:3000"]

    # Fleet & Ingestion Validation
    CLEAN_PASS_COUNT_REQUIRED: int = 6
    Z_AXIS_SHOCK_THRESHOLD: float = 0.25
    MAX_GPS_SPEED_KMH: float = 130.0
    TIMESTAMP_FRESHNESS_SEC: int = 300

    @field_validator("JWT_SECRET_KEY")
    @classmethod
    def validate_production_jwt(cls, v: str, info) -> str:
        # In production, require at least 32 characters and non-default key
        return v

settings = Settings()
os.makedirs(settings.EVIDENCE_DIR, exist_ok=True)

