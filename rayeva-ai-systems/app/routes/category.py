"""
Rayeva AI Systems – Module 1 API Routes: Category & Tag Generator
"""

import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import ProductInput, ErrorResponse
from app.modules.category_tagger import category_tagger
from app.models import Product

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/categories", tags=["Module 1 – Auto-Category & Tag Generator"])


@router.post(
    "/categorize",
    response_model=None,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
    summary="Categorize a product using AI",
    description=(
        "Accepts product name and description, uses AI to auto-assign category, "
        "sub-category, SEO tags, and sustainability filters. Stores result in database."
    ),
)
def categorize_product(product: ProductInput, db: Session = Depends(get_db)):
    """
    AI Auto-Category & Tag Generator endpoint.

    - Auto-assigns primary category from predefined list
    - Suggests sub-category
    - Generates 5-10 SEO tags
    - Suggests sustainability filters
    - Returns structured JSON and stores in database
    """
    try:
        result = category_tagger.categorize_product(
            db=db,
            name=product.name,
            description=product.description,
            price=product.price,
        )
        return result
    except ValueError as e:
        logger.error(f"Categorization failed: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in categorization: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during categorization")


@router.get(
    "/products",
    summary="List all categorized products",
    description="Retrieve all products with their AI-generated categorization data.",
)
def list_products(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    """List all categorized products from the database."""
    products = db.query(Product).offset(skip).limit(limit).all()
    return [
        {
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "price": p.price,
            "primary_category": p.primary_category,
            "sub_category": p.sub_category,
            "seo_tags": p.seo_tags,
            "sustainability_filters": p.sustainability_filters,
            "created_at": p.created_at.isoformat() if p.created_at else None,
            "ai_categorized_at": p.ai_categorized_at.isoformat() if p.ai_categorized_at else None,
        }
        for p in products
    ]


@router.get(
    "/products/{product_id}",
    summary="Get a single product",
    description="Retrieve a specific product by ID with its categorization data.",
)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get a specific product by ID."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail=f"Product with id {product_id} not found")
    return {
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "price": product.price,
        "primary_category": product.primary_category,
        "sub_category": product.sub_category,
        "seo_tags": product.seo_tags,
        "sustainability_filters": product.sustainability_filters,
        "created_at": product.created_at.isoformat() if product.created_at else None,
        "ai_categorized_at": product.ai_categorized_at.isoformat() if product.ai_categorized_at else None,
    }
