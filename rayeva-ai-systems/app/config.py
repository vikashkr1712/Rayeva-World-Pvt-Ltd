"""
Rayeva AI Systems – Environment-based Configuration
Uses pydantic-settings for type-safe env variable management.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables / .env file."""

    # ── OpenAI ───────────────────────────────────────────────────────
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-3.5-turbo"

    # ── Database ─────────────────────────────────────────────────────
    DATABASE_URL: str = "sqlite:///./rayeva.db"

    # ── App ──────────────────────────────────────────────────────────
    APP_ENV: str = "development"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"

    # ── Predefined Business Constants ────────────────────────────────
    PRODUCT_CATEGORIES: list[str] = [
        "Kitchen & Dining",
        "Personal Care & Hygiene",
        "Home & Living",
        "Fashion & Accessories",
        "Office & Stationery",
        "Travel & Outdoor",
        "Baby & Kids",
        "Food & Beverages",
        "Cleaning & Laundry",
        "Gardening & Agriculture",
    ]

    SUSTAINABILITY_FILTERS: list[str] = [
        "plastic-free",
        "compostable",
        "biodegradable",
        "vegan",
        "cruelty-free",
        "recycled",
        "organic",
        "fair-trade",
        "zero-waste",
        "locally-sourced",
        "chemical-free",
        "reusable",
        "upcycled",
        "carbon-neutral",
        "water-saving",
    ]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


@lru_cache()
def get_settings() -> Settings:
    """Cached settings singleton."""
    return Settings()
