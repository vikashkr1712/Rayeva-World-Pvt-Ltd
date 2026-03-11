"""
Rayeva AI Systems – Module 2 API Routes: B2B Proposal Generator
"""

import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import ProposalInput, ErrorResponse
from app.modules.b2b_proposal import b2b_proposal_generator
from app.models import B2BProposal

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/proposals", tags=["Module 2 – B2B Proposal Generator"])


@router.post(
    "/generate",
    response_model=None,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
    summary="Generate a B2B proposal using AI",
    description=(
        "Accepts client details and budget, uses AI to generate a sustainable product "
        "proposal with product mix, budget allocation, cost breakdown, and impact summary."
    ),
)
def generate_proposal(proposal_input: ProposalInput, db: Session = Depends(get_db)):
    """
    AI B2B Proposal Generator endpoint.

    - Suggests sustainable product mix
    - Budget allocation within provided limit
    - Estimated cost breakdown
    - Impact positioning summary
    - Returns structured JSON and stores in database
    """
    try:
        result = b2b_proposal_generator.generate_proposal(
            db=db,
            client_name=proposal_input.client_name,
            client_industry=proposal_input.client_industry,
            budget_limit=proposal_input.budget_limit,
            requirements=proposal_input.requirements,
            sustainability_priority=proposal_input.sustainability_priority,
        )
        return result
    except ValueError as e:
        logger.error(f"Proposal generation failed: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in proposal generation: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during proposal generation")


@router.get(
    "/",
    summary="List all proposals",
    description="Retrieve all B2B proposals with their AI-generated content.",
)
def list_proposals(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    """List all B2B proposals from the database."""
    proposals = db.query(B2BProposal).offset(skip).limit(limit).all()
    return [
        {
            "id": p.id,
            "client_name": p.client_name,
            "client_industry": p.client_industry,
            "budget_limit": p.budget_limit,
            "requirements": p.requirements,
            "product_mix": p.product_mix,
            "budget_allocation": p.budget_allocation,
            "cost_breakdown": p.cost_breakdown,
            "impact_summary": p.impact_summary,
            "created_at": p.created_at.isoformat() if p.created_at else None,
            "ai_generated_at": p.ai_generated_at.isoformat() if p.ai_generated_at else None,
        }
        for p in proposals
    ]


@router.get(
    "/{proposal_id}",
    summary="Get a single proposal",
    description="Retrieve a specific B2B proposal by ID.",
)
def get_proposal(proposal_id: int, db: Session = Depends(get_db)):
    """Get a specific B2B proposal by ID."""
    proposal = db.query(B2BProposal).filter(B2BProposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail=f"Proposal with id {proposal_id} not found")
    return {
        "id": proposal.id,
        "client_name": proposal.client_name,
        "client_industry": proposal.client_industry,
        "budget_limit": proposal.budget_limit,
        "requirements": proposal.requirements,
        "product_mix": proposal.product_mix,
        "budget_allocation": proposal.budget_allocation,
        "cost_breakdown": proposal.cost_breakdown,
        "impact_summary": proposal.impact_summary,
        "full_ai_response": proposal.full_ai_response,
        "created_at": proposal.created_at.isoformat() if proposal.created_at else None,
        "ai_generated_at": proposal.ai_generated_at.isoformat() if proposal.ai_generated_at else None,
    }
