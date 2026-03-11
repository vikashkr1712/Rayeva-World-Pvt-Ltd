"""
Rayeva AI Systems – Module 2: AI B2B Proposal Generator

Business Logic:
- Accepts client details (name, industry, budget, requirements)
- Calls AI to generate sustainable product proposal
- Validates budget constraints
- Stores structured result in database
- Logs the AI interaction
"""

import logging
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.ai.client import ai_client
from app.ai.prompts import B2B_PROPOSAL_SYSTEM, build_proposal_user_prompt
from app.ai.logger import log_ai_interaction
from app.config import get_settings
from app.models import B2BProposal
from app.schemas import ProposalResult, ProductMixItem, BudgetAllocation, CostBreakdown

logger = logging.getLogger(__name__)
settings = get_settings()


class B2BProposalGenerator:
    """
    AI-powered B2B proposal generation engine.

    Responsibilities:
    - Call AI with client details and budget
    - Validate that proposal stays within budget
    - Persist to database
    - Return structured proposal
    """

    MODULE_NAME = "b2b_proposal"

    def generate_proposal(
        self,
        db: Session,
        client_name: str,
        client_industry: str,
        budget_limit: float,
        requirements: str | None = None,
        sustainability_priority: str | None = "medium",
    ) -> dict:
        """
        Generate a B2B proposal using AI and store result.

        Args:
            db: Database session
            client_name: Client/company name
            client_industry: Industry vertical
            budget_limit: Budget limit in INR
            requirements: Specific client requirements
            sustainability_priority: low / medium / high

        Returns:
            dict with proposal data and AI-generated content
        """
        # 1. Build prompt
        user_prompt = build_proposal_user_prompt(
            client_name, client_industry, budget_limit,
            requirements, sustainability_priority
        )

        # 2. Call AI with higher token limit for detailed proposals
        ai_result = ai_client.generate(
            system_prompt=B2B_PROPOSAL_SYSTEM,
            user_prompt=user_prompt,
            temperature=0.4,  # Slightly creative for proposals
            max_tokens=3000,
        )

        # 3. Log the interaction
        log_ai_interaction(
            db=db,
            module=self.MODULE_NAME,
            prompt=f"SYSTEM: {B2B_PROPOSAL_SYSTEM}\n\nUSER: {user_prompt}",
            response=ai_result["response_text"],
            model_used=settings.OPENAI_MODEL,
            tokens_used=ai_result["tokens_used"],
            latency_ms=ai_result["latency_ms"],
            success=ai_result["success"],
            error_message=ai_result["error"],
        )

        # 4. Handle AI failure
        if not ai_result["success"] or not ai_result["parsed_json"]:
            raise ValueError(
                f"AI proposal generation failed: {ai_result['error'] or 'Unknown error'}"
            )

        # 5. Validate and clean the AI output
        raw_json = ai_result["parsed_json"]
        validated = self._validate_output(raw_json, budget_limit)

        # 6. Store proposal in database
        proposal = B2BProposal(
            client_name=client_name,
            client_industry=client_industry,
            budget_limit=budget_limit,
            requirements=requirements,
            product_mix=[item.model_dump() for item in validated.product_mix],
            budget_allocation=[alloc.model_dump() for alloc in validated.budget_allocation],
            cost_breakdown=validated.cost_breakdown.model_dump(),
            impact_summary=validated.impact_summary,
            full_ai_response=raw_json,
            ai_generated_at=datetime.now(timezone.utc),
        )
        db.add(proposal)
        db.commit()
        db.refresh(proposal)

        logger.info(
            f"B2B Proposal generated: id={proposal.id}, client={client_name}, "
            f"total=₹{validated.cost_breakdown.total_estimated:,.2f}"
        )

        # 7. Return structured response
        return {
            "id": proposal.id,
            "client_name": proposal.client_name,
            "client_industry": proposal.client_industry,
            "budget_limit": proposal.budget_limit,
            "requirements": proposal.requirements,
            "proposal": validated.model_dump(),
            "created_at": proposal.created_at.isoformat(),
            "ai_generated_at": proposal.ai_generated_at.isoformat(),
        }

    def _validate_output(self, raw: dict, budget_limit: float) -> ProposalResult:
        """
        Validate AI proposal output against business rules.

        - Ensures total cost doesn't exceed budget
        - Validates product mix structure
        - Recalculates totals if needed
        """
        # Parse product mix
        product_mix = []
        for item in raw.get("product_mix", []):
            try:
                # Recalculate total_price to ensure consistency
                unit_price = float(item.get("unit_price_estimate", 0))
                quantity = int(item.get("quantity", 0))
                calculated_total = round(unit_price * quantity, 2)

                product_mix.append(ProductMixItem(
                    product_name=item.get("product_name", "Unknown Product"),
                    category=item.get("category", "General"),
                    unit_price_estimate=unit_price,
                    quantity=quantity,
                    total_price=calculated_total,
                    sustainability_tags=item.get("sustainability_tags", []),
                ))
            except (ValueError, TypeError) as e:
                logger.warning(f"Skipping invalid product mix item: {e}")
                continue

        # Recalculate actual product costs
        actual_product_costs = sum(item.total_price for item in product_mix)

        # Parse budget allocation
        budget_allocation = []
        for alloc in raw.get("budget_allocation", []):
            try:
                budget_allocation.append(BudgetAllocation(
                    category=alloc.get("category", "General"),
                    allocated_amount=float(alloc.get("allocated_amount", 0)),
                    percentage=float(alloc.get("percentage", 0)),
                ))
            except (ValueError, TypeError) as e:
                logger.warning(f"Skipping invalid budget allocation: {e}")
                continue

        # Parse and validate cost breakdown
        raw_breakdown = raw.get("cost_breakdown", {})
        shipping = float(raw_breakdown.get("shipping_estimate", actual_product_costs * 0.08))
        packaging = float(raw_breakdown.get("packaging_costs", actual_product_costs * 0.04))
        total_estimated = round(actual_product_costs + shipping + packaging, 2)

        # Budget enforcement: scale down if over budget
        if total_estimated > budget_limit:
            scale_factor = budget_limit / total_estimated * 0.95  # 5% buffer
            logger.warning(
                f"Proposal exceeds budget (₹{total_estimated:,.2f} > ₹{budget_limit:,.2f}). "
                f"Scaling down by factor {scale_factor:.2f}"
            )
            for item in product_mix:
                item.quantity = max(1, int(item.quantity * scale_factor))
                item.total_price = round(item.unit_price_estimate * item.quantity, 2)

            actual_product_costs = sum(item.total_price for item in product_mix)
            shipping = round(actual_product_costs * 0.08, 2)
            packaging = round(actual_product_costs * 0.04, 2)
            total_estimated = round(actual_product_costs + shipping + packaging, 2)

        remaining = round(budget_limit - total_estimated, 2)

        cost_breakdown = CostBreakdown(
            product_costs=round(actual_product_costs, 2),
            shipping_estimate=round(shipping, 2),
            packaging_costs=round(packaging, 2),
            total_estimated=total_estimated,
            remaining_budget=max(0, remaining),
        )

        # Impact summary
        impact_summary = raw.get("impact_summary", "Sustainable procurement proposal for your organization.")
        key_selling_points = raw.get("key_selling_points", [
            "Reduced environmental footprint",
            "Enhanced brand sustainability positioning",
            "Cost-effective green alternatives",
        ])

        return ProposalResult(
            product_mix=product_mix,
            budget_allocation=budget_allocation,
            cost_breakdown=cost_breakdown,
            impact_summary=impact_summary,
            key_selling_points=key_selling_points,
        )


# Singleton
b2b_proposal_generator = B2BProposalGenerator()
