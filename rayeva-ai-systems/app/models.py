"""
Rayeva AI Systems – SQLAlchemy ORM Models
Tables for products, proposals, AI logs, and impact reports.
"""

from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean, DateTime, JSON, ForeignKey,
)
from sqlalchemy.orm import relationship
from app.database import Base


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Module 1 – Product Catalog
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    price = Column(Float, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # AI-generated fields
    primary_category = Column(String(100), nullable=True)
    sub_category = Column(String(100), nullable=True)
    seo_tags = Column(JSON, nullable=True)               # list[str]
    sustainability_filters = Column(JSON, nullable=True)  # list[str]
    ai_categorized_at = Column(DateTime, nullable=True)

    def __repr__(self):
        return f"<Product id={self.id} name='{self.name}'>"


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Module 2 – B2B Proposals
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class B2BProposal(Base):
    __tablename__ = "b2b_proposals"

    id = Column(Integer, primary_key=True, index=True)
    client_name = Column(String(255), nullable=False)
    client_industry = Column(String(100), nullable=False)
    budget_limit = Column(Float, nullable=False)
    requirements = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # AI-generated fields
    product_mix = Column(JSON, nullable=True)        # list[dict]
    budget_allocation = Column(JSON, nullable=True)   # dict
    cost_breakdown = Column(JSON, nullable=True)      # dict
    impact_summary = Column(Text, nullable=True)
    full_ai_response = Column(JSON, nullable=True)    # complete JSON
    ai_generated_at = Column(DateTime, nullable=True)

    def __repr__(self):
        return f"<B2BProposal id={self.id} client='{self.client_name}'>"


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Module 3 – Impact Reports (architecture outlined)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class ImpactReport(Base):
    __tablename__ = "impact_reports"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String(100), nullable=False, index=True)
    plastic_saved_kg = Column(Float, nullable=True)
    carbon_avoided_kg = Column(Float, nullable=True)
    local_sourcing_summary = Column(Text, nullable=True)
    human_readable_statement = Column(Text, nullable=True)
    full_ai_response = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Module 4 – WhatsApp Bot Conversation Logs (architecture outlined)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class ConversationLog(Base):
    __tablename__ = "conversation_logs"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), nullable=False, index=True)
    user_phone = Column(String(20), nullable=True)
    user_message = Column(Text, nullable=False)
    bot_response = Column(Text, nullable=False)
    intent_detected = Column(String(50), nullable=True)
    escalated = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# AI Prompt + Response Log (shared across all modules)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class AILog(Base):
    __tablename__ = "ai_logs"

    id = Column(Integer, primary_key=True, index=True)
    module = Column(String(50), nullable=False, index=True)     # e.g., "category_tagger", "b2b_proposal"
    prompt = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    model_used = Column(String(50), nullable=True)
    tokens_used = Column(Integer, nullable=True)
    latency_ms = Column(Integer, nullable=True)
    success = Column(Boolean, default=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f"<AILog id={self.id} module='{self.module}' success={self.success}>"
