"""
Rayeva AI Systems – AI Prompt & Response Logger
Logs every AI interaction to the database for auditing and debugging.
"""

import logging
from sqlalchemy.orm import Session
from app.models import AILog

logger = logging.getLogger(__name__)


def log_ai_interaction(
    db: Session,
    module: str,
    prompt: str,
    response: str,
    model_used: str | None = None,
    tokens_used: int | None = None,
    latency_ms: int | None = None,
    success: bool = True,
    error_message: str | None = None,
) -> AILog:
    """
    Log an AI prompt+response interaction to the database.

    Args:
        db: SQLAlchemy session
        module: Which module made the call (e.g., "category_tagger")
        prompt: The full prompt sent to the AI
        response: The raw response from the AI
        model_used: Model identifier
        tokens_used: Total tokens consumed
        latency_ms: Response time in milliseconds
        success: Whether the call succeeded
        error_message: Error details if failed

    Returns:
        The created AILog record
    """
    try:
        log_entry = AILog(
            module=module,
            prompt=prompt,
            response=response,
            model_used=model_used,
            tokens_used=tokens_used,
            latency_ms=latency_ms,
            success=success,
            error_message=error_message,
        )
        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)
        logger.info(
            f"AI interaction logged: module={module}, success={success}, "
            f"tokens={tokens_used}, latency={latency_ms}ms"
        )
        return log_entry
    except Exception as e:
        logger.error(f"Failed to log AI interaction: {e}")
        db.rollback()
        raise
