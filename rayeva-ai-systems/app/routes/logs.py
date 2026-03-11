"""
Rayeva AI Systems – AI Logs API Routes
View logged AI interactions for auditing and debugging.
"""

import logging
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AILog

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/logs", tags=["AI Logs"])


@router.get(
    "/",
    summary="List AI interaction logs",
    description="Retrieve all AI prompt+response logs for auditing.",
)
def list_logs(
    module: str | None = Query(None, description="Filter by module name"),
    success: bool | None = Query(None, description="Filter by success status"),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """List AI interaction logs with optional filtering."""
    query = db.query(AILog)
    if module:
        query = query.filter(AILog.module == module)
    if success is not None:
        query = query.filter(AILog.success == success)

    logs = query.order_by(AILog.created_at.desc()).offset(skip).limit(limit).all()
    return [
        {
            "id": log.id,
            "module": log.module,
            "prompt": log.prompt[:200] + "..." if len(log.prompt) > 200 else log.prompt,
            "response": log.response[:500] + "..." if len(log.response) > 500 else log.response,
            "model_used": log.model_used,
            "tokens_used": log.tokens_used,
            "latency_ms": log.latency_ms,
            "success": log.success,
            "error_message": log.error_message,
            "created_at": log.created_at.isoformat() if log.created_at else None,
        }
        for log in logs
    ]


@router.get(
    "/{log_id}",
    summary="Get a specific AI log entry",
    description="Retrieve full details of a specific AI interaction log.",
)
def get_log(log_id: int, db: Session = Depends(get_db)):
    """Get full details of a specific AI log."""
    log = db.query(AILog).filter(AILog.id == log_id).first()
    if not log:
        return {"error": f"Log with id {log_id} not found"}
    return {
        "id": log.id,
        "module": log.module,
        "prompt": log.prompt,
        "response": log.response,
        "model_used": log.model_used,
        "tokens_used": log.tokens_used,
        "latency_ms": log.latency_ms,
        "success": log.success,
        "error_message": log.error_message,
        "created_at": log.created_at.isoformat() if log.created_at else None,
    }
