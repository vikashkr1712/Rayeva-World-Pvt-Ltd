"""
Rayeva AI Systems – Pydantic Schemas (Request / Response Validation)
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Module 1 – Category & Tag Generator
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class ProductInput(BaseModel):
    """Input: product details for AI categorization."""
    name: str = Field(..., min_length=2, max_length=255, description="Product name")
    description: str = Field(..., min_length=10, description="Product description")
    price: Optional[float] = Field(None, ge=0, description="Product price in INR")

    model_config = {"json_schema_extra": {
        "examples": [{
            "name": "Bamboo Toothbrush",
            "description": "Eco-friendly bamboo toothbrush with charcoal-infused bristles. Biodegradable handle, BPA-free bristles. Comes in recyclable packaging.",
            "price": 149.0
        }]
    }}


class CategoryTagResult(BaseModel):
    """AI-generated categorization output."""
    primary_category: str = Field(..., description="Main category from predefined list")
    sub_category: str = Field(..., description="Suggested sub-category")
    seo_tags: list[str] = Field(..., min_length=5, max_length=10, description="5-10 SEO tags")
    sustainability_filters: list[str] = Field(..., description="Applicable sustainability filters")
    confidence_score: Optional[float] = Field(None, ge=0, le=1, description="AI confidence 0-1")
    reasoning: Optional[str] = Field(None, description="Brief AI reasoning for the categorization")


class ProductResponse(BaseModel):
    """Full response after categorization."""
    id: int
    name: str
    description: str
    price: Optional[float]
    categorization: CategoryTagResult
    created_at: datetime
    ai_categorized_at: datetime

    model_config = {"from_attributes": True}


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Module 2 – B2B Proposal Generator
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class ProposalInput(BaseModel):
    """Input: client details for B2B proposal generation."""
    client_name: str = Field(..., min_length=2, max_length=255, description="Client / company name")
    client_industry: str = Field(..., min_length=2, max_length=100, description="Industry vertical")
    budget_limit: float = Field(..., gt=0, description="Budget limit in INR")
    requirements: Optional[str] = Field(None, description="Specific requirements or preferences")
    sustainability_priority: Optional[str] = Field(
        "medium",
        description="Priority: low / medium / high"
    )

    model_config = {"json_schema_extra": {
        "examples": [{
            "client_name": "GreenCorp Hotels",
            "client_industry": "Hospitality",
            "budget_limit": 500000,
            "requirements": "Looking for eco-friendly amenities for 200 hotel rooms. Priority on bathroom essentials and kitchen items.",
            "sustainability_priority": "high"
        }]
    }}


class ProductMixItem(BaseModel):
    """Single item in the suggested product mix."""
    product_name: str
    category: str
    unit_price_estimate: float
    quantity: int
    total_price: float
    sustainability_tags: list[str]


class BudgetAllocation(BaseModel):
    """Budget breakdown by category."""
    category: str
    allocated_amount: float
    percentage: float


class CostBreakdown(BaseModel):
    """Estimated cost breakdown."""
    product_costs: float
    shipping_estimate: float
    packaging_costs: float
    total_estimated: float
    remaining_budget: float


class ProposalResult(BaseModel):
    """AI-generated B2B proposal output."""
    product_mix: list[ProductMixItem] = Field(..., description="Suggested sustainable product mix")
    budget_allocation: list[BudgetAllocation] = Field(..., description="Budget allocation by category")
    cost_breakdown: CostBreakdown = Field(..., description="Estimated cost breakdown")
    impact_summary: str = Field(..., description="Impact positioning summary")
    key_selling_points: list[str] = Field(default_factory=list, description="Key selling points")


class ProposalResponse(BaseModel):
    """Full response after proposal generation."""
    id: int
    client_name: str
    client_industry: str
    budget_limit: float
    requirements: Optional[str]
    proposal: ProposalResult
    created_at: datetime
    ai_generated_at: datetime

    model_config = {"from_attributes": True}


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Shared
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class ErrorResponse(BaseModel):
    """Standard error response."""
    error: str
    detail: Optional[str] = None
    module: Optional[str] = None


class AILogResponse(BaseModel):
    """AI log entry response."""
    id: int
    module: str
    model_used: Optional[str]
    tokens_used: Optional[int]
    latency_ms: Optional[int]
    success: bool
    created_at: datetime

    model_config = {"from_attributes": True, "protected_namespaces": ()}
