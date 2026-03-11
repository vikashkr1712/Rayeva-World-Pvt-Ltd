"""
Rayeva AI Systems – Module 1: AI Auto-Category & Tag Generator

Business Logic:
- Accepts product name + description
- Calls AI to auto-assign category, sub-category, SEO tags, sustainability filters
- Validates AI output against predefined lists
- Stores structured result in database
- Logs the AI interaction
"""

import logging
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.ai.client import ai_client
from app.ai.prompts import CATEGORY_TAGGER_SYSTEM, build_category_user_prompt
from app.ai.logger import log_ai_interaction
from app.config import get_settings
from app.models import Product
from app.schemas import CategoryTagResult

logger = logging.getLogger(__name__)
settings = get_settings()


class CategoryTagger:
    """
    AI-powered product categorization engine.

    Responsibilities:
    - Call AI with product details
    - Validate output against business rules
    - Persist to database
    - Return structured result
    """

    MODULE_NAME = "category_tagger"

    def categorize_product(
        self, db: Session, name: str, description: str, price: float | None = None
    ) -> dict:
        """
        Categorize a product using AI and store result.

        Args:
            db: Database session
            name: Product name
            description: Product description
            price: Optional product price

        Returns:
            dict with product data and categorization result
        """
        # 1. Build prompt
        user_prompt = build_category_user_prompt(name, description, price)

        # 2. Call AI
        ai_result = ai_client.generate(
            system_prompt=CATEGORY_TAGGER_SYSTEM,
            user_prompt=user_prompt,
            temperature=0.2,  # Low temperature for consistent categorization
        )

        # 3. Log the interaction
        log_ai_interaction(
            db=db,
            module=self.MODULE_NAME,
            prompt=f"SYSTEM: {CATEGORY_TAGGER_SYSTEM}\n\nUSER: {user_prompt}",
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
                f"AI categorization failed: {ai_result['error'] or 'Unknown error'}"
            )

        # 5. Validate and clean the AI output
        raw_json = ai_result["parsed_json"]
        validated = self._validate_output(raw_json)

        # 6. Store product with categorization in database
        product = Product(
            name=name,
            description=description,
            price=price,
            primary_category=validated.primary_category,
            sub_category=validated.sub_category,
            seo_tags=validated.seo_tags,
            sustainability_filters=validated.sustainability_filters,
            ai_categorized_at=datetime.now(timezone.utc),
        )
        db.add(product)
        db.commit()
        db.refresh(product)

        logger.info(f"Product categorized: id={product.id}, category={validated.primary_category}")

        # 7. Return structured response
        return {
            "id": product.id,
            "name": product.name,
            "description": product.description,
            "price": product.price,
            "categorization": validated.model_dump(),
            "created_at": product.created_at.isoformat(),
            "ai_categorized_at": product.ai_categorized_at.isoformat(),
        }

    def _validate_output(self, raw: dict) -> CategoryTagResult:
        """
        Validate AI output against business rules.

        - Ensures primary_category is from predefined list
        - Filters sustainability tags to valid ones
        - Ensures 5-10 SEO tags
        """
        # Validate primary category
        primary = raw.get("primary_category", "")
        if primary not in settings.PRODUCT_CATEGORIES:
            # Find closest match or default
            primary = self._find_closest_category(primary)
            logger.warning(f"AI category '{raw.get('primary_category')}' not in list, mapped to '{primary}'")

        # Validate sustainability filters
        raw_filters = raw.get("sustainability_filters", [])
        valid_filters = [f for f in raw_filters if f in settings.SUSTAINABILITY_FILTERS]
        if not valid_filters and raw_filters:
            # Try fuzzy matching
            valid_filters = self._fuzzy_match_filters(raw_filters)

        # Validate SEO tags (ensure 5-10)
        seo_tags = raw.get("seo_tags", [])
        if len(seo_tags) < 5:
            logger.warning(f"AI returned only {len(seo_tags)} SEO tags, padding not applied – returning as-is")
        if len(seo_tags) > 10:
            seo_tags = seo_tags[:10]

        return CategoryTagResult(
            primary_category=primary,
            sub_category=raw.get("sub_category", "General"),
            seo_tags=seo_tags,
            sustainability_filters=valid_filters,
            confidence_score=raw.get("confidence_score"),
            reasoning=raw.get("reasoning"),
        )

    def _find_closest_category(self, candidate: str) -> str:
        """Find the closest matching predefined category."""
        candidate_lower = candidate.lower()
        for cat in settings.PRODUCT_CATEGORIES:
            if candidate_lower in cat.lower() or cat.lower() in candidate_lower:
                return cat
        # Default to first category if no match
        return settings.PRODUCT_CATEGORIES[0]

    def _fuzzy_match_filters(self, raw_filters: list[str]) -> list[str]:
        """Attempt fuzzy matching of sustainability filters."""
        matched = []
        for raw in raw_filters:
            raw_lower = raw.lower().replace(" ", "-")
            for valid in settings.SUSTAINABILITY_FILTERS:
                if raw_lower in valid or valid in raw_lower:
                    if valid not in matched:
                        matched.append(valid)
                    break
        return matched


# Singleton
category_tagger = CategoryTagger()
