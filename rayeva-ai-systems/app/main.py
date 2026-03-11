"""
Rayeva AI Systems – Main FastAPI Application
Entry point with CORS, lifecycle events, and route registration.
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.database import init_db
from app.routes.category import router as category_router
from app.routes.proposal import router as proposal_router
from app.routes.logs import router as logs_router
from app.models import AILog  # noqa: F401 – ensure all models are imported

settings = get_settings()

# ── Logging ──────────────────────────────────────────────────────────
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL, logging.INFO),
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


# ── Lifecycle ────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    logger.info("🚀 Rayeva AI Systems starting up...")
    init_db()
    logger.info("✅ Database initialized")
    yield
    logger.info("👋 Rayeva AI Systems shutting down...")


# ── FastAPI App ──────────────────────────────────────────────────────
app = FastAPI(
    title="Rayeva AI Systems",
    description=(
        "AI-powered modules for sustainable commerce: "
        "Auto-Category & Tag Generator, B2B Proposal Generator, "
        "Impact Reporting, and WhatsApp Support Bot."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ─────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Global Error Handler ────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc)},
    )


# ── Register Routes ─────────────────────────────────────────────────
app.include_router(category_router)
app.include_router(proposal_router)
app.include_router(logs_router)


# ── Health & Info ────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    """Root endpoint – API info."""
    return {
        "service": "Rayeva AI Systems",
        "version": "1.0.0",
        "description": "AI-powered modules for sustainable commerce",
        "docs": "/docs",
        "modules": {
            "module_1": {
                "name": "AI Auto-Category & Tag Generator",
                "status": "fully_implemented",
                "endpoints": [
                    "POST /api/v1/categories/categorize",
                    "GET  /api/v1/categories/products",
                    "GET  /api/v1/categories/products/{id}",
                ],
            },
            "module_2": {
                "name": "AI B2B Proposal Generator",
                "status": "fully_implemented",
                "endpoints": [
                    "POST /api/v1/proposals/generate",
                    "GET  /api/v1/proposals/",
                    "GET  /api/v1/proposals/{id}",
                ],
            },
            "module_3": {
                "name": "AI Impact Reporting Generator",
                "status": "architecture_outlined",
                "description": "Estimates plastic saved, carbon avoided, local sourcing impact",
            },
            "module_4": {
                "name": "AI WhatsApp Support Bot",
                "status": "architecture_outlined",
                "description": "Order status, return policy, escalation, conversation logging",
            },
        },
    }


@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "environment": settings.APP_ENV}
