from pydantic_settings import BaseSettings, SettingsConfigDict
from decimal import Decimal

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    REDIS_URL: str = "redis://redis:6379/0"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Marketplace settings
    COMISION_VENDEDOR: Decimal = Decimal("0.02")
    COMISION_COMPRADOR_BASE: Decimal = Decimal("0.02")
    COMISION_ESCASEZ: Decimal = Decimal("0.025")
    COMISION_SUPERAVIT: Decimal = Decimal("0.015")
    MIN_COMISION: Decimal = Decimal("0.02")  # 2%
    MAX_COMISION: Decimal = Decimal("0.06")  # 6%
    TARGET_AVG_COMISION: Decimal = Decimal("0.045") # 4.5%
    TASA_PARTICIPACION_AHORRO: Decimal = Decimal("0.2") # 20%
    UMBRAL_PROFUNDIDAD_DEMANDA: Decimal = Decimal("50000") # Unidades
    UMBRAL_DEMANDA_ATIPICA: Decimal = Decimal("1.5") # 50% sobre la media
    PBASE_AZUCAR: Decimal = Decimal("800.0")
    K_FACTOR: Decimal = Decimal("0.1") # Ajustado para mayor sensibilidad
    TICK_QTY: Decimal = Decimal("0.0001")
    TICK_MONEY: Decimal = Decimal("0.01")


    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="forbid",
    )

settings = Settings()