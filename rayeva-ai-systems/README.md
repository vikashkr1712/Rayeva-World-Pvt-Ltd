# Rayeva AI Systems – Applied AI for Sustainable Commerce

> **Role:** Full Stack / AI Intern Assignment  
> **Focus:** Production-ready AI modules integrated with real business logic for sustainable commerce

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Setup & Installation](#setup--installation)
4. [Module 1: AI Auto-Category & Tag Generator](#module-1-ai-auto-category--tag-generator) *(Fully Implemented)*
5. [Module 2: AI B2B Proposal Generator](#module-2-ai-b2b-proposal-generator) *(Fully Implemented)*
6. [Module 3: AI Impact Reporting Generator](#module-3-ai-impact-reporting-generator) *(Architecture Outlined)*
7. [Module 4: AI WhatsApp Support Bot](#module-4-ai-whatsapp-support-bot) *(Architecture Outlined)*
8. [AI Prompt Design Explanation](#ai-prompt-design-explanation)
9. [API Reference](#api-reference)
10. [Testing](#testing)
11. [Technical Decisions](#technical-decisions)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      FastAPI Application                        │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐    │
│  │  API Routes   │  │  Pydantic    │  │  Error Handling    │    │
│  │  (category,   │  │  Schemas     │  │  & Middleware      │    │
│  │  proposal,    │  │  (validation)│  │                    │    │
│  │  logs)        │  └──────┬───────┘  └────────────────────┘    │
│  └──────┬───────┘         │                                     │
│         │                 │                                     │
│  ┌──────▼─────────────────▼──────────────────────────────────┐  │
│  │              Business Logic Layer (Modules)                │  │
│  │                                                            │  │
│  │  ┌──────────────────┐  ┌──────────────────────────────┐   │  │
│  │  │  Module 1:        │  │  Module 2:                    │   │  │
│  │  │  CategoryTagger   │  │  B2BProposalGenerator         │   │  │
│  │  │  - validate cats  │  │  - validate budget            │   │  │
│  │  │  - fuzzy match    │  │  - scale products             │   │  │
│  │  │  - store result   │  │  - cost breakdown             │   │  │
│  │  └────────┬─────────┘  └──────────┬───────────────────┘   │  │
│  └───────────┼───────────────────────┼───────────────────────┘  │
│              │                       │                           │
│  ┌───────────▼───────────────────────▼───────────────────────┐  │
│  │                    AI Layer                                │  │
│  │                                                            │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │  │
│  │  │  AIClient     │  │  Prompts     │  │  AI Logger   │    │  │
│  │  │  (OpenAI SDK) │  │  (templates) │  │  (audit log) │    │  │
│  │  └──────┬───────┘  └──────────────┘  └──────────────┘    │  │
│  └─────────┼─────────────────────────────────────────────────┘  │
│            │                                                     │
│  ┌─────────▼─────────────────────────────────────────────────┐  │
│  │                  Database Layer (SQLAlchemy + SQLite)       │  │
│  │  Tables: products | b2b_proposals | impact_reports |       │  │
│  │          conversation_logs | ai_logs                        │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            │
                    ┌───────▼───────┐
                    │   OpenAI API   │
                    │  (GPT-3.5/4)   │
                    └───────────────┘
```

### Key Design Principles

| Principle | Implementation |
|-----------|---------------|
| **Separation of Concerns** | AI logic, business logic, and database operations are in distinct layers |
| **Structured Outputs** | All AI responses are JSON-validated through Pydantic schemas |
| **Prompt + Response Logging** | Every AI interaction is logged to `ai_logs` table |
| **Env-based Config** | API keys and settings loaded from `.env` via `pydantic-settings` |
| **Business Rule Validation** | AI output is validated against predefined categories and budgets |
| **Error Handling** | Global exception handler + per-module error handling |

---

## Project Structure

```
rayeva-ai-systems/
├── app/
│   ├── __init__.py
│   ├── main.py                  # FastAPI app, lifecycle, middleware
│   ├── config.py                # Environment-based configuration
│   ├── database.py              # SQLAlchemy engine & session
│   ├── models.py                # ORM models (all 4 modules + AI logs)
│   ├── schemas.py               # Pydantic request/response schemas
│   ├── ai/
│   │   ├── __init__.py
│   │   ├── client.py            # OpenAI API wrapper with JSON parsing
│   │   ├── prompts.py           # All prompt templates (all 4 modules)
│   │   └── logger.py            # AI interaction audit logger
│   ├── modules/
│   │   ├── __init__.py
│   │   ├── category_tagger.py   # Module 1 business logic
│   │   └── b2b_proposal.py      # Module 2 business logic
│   └── routes/
│       ├── __init__.py
│       ├── category.py          # Module 1 API endpoints
│       ├── proposal.py          # Module 2 API endpoints
│       └── logs.py              # AI logs viewer endpoints
├── .env.example                 # Environment template
├── .gitignore
├── requirements.txt
├── seed_data.py                 # Sample data seeder
└── README.md                    # This file
```

---

## Setup & Installation

### Prerequisites
- Python 3.11+
- OpenAI API key

### Step-by-Step

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/rayeva-ai-systems.git
cd rayeva-ai-systems

# 2. Create virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
copy .env.example .env    # Windows
# cp .env.example .env    # macOS/Linux

# 5. Edit .env and add your OpenAI API key
# OPENAI_API_KEY=sk-your-key-here

# 6. (Optional) Seed sample data
python seed_data.py

# 7. Run the server
uvicorn app.main:app --reload --port 8000
```

### Access Points
- **API Docs (Swagger):** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **Health Check:** http://localhost:8000/health

---

## Module 1: AI Auto-Category & Tag Generator

### Status: ✅ Fully Implemented

### What It Does
Takes a product name + description and uses AI to:
1. **Auto-assign primary category** from a predefined list of 10 categories
2. **Suggest sub-category** for finer classification
3. **Generate 5-10 SEO tags** for discoverability
4. **Suggest sustainability filters** (plastic-free, compostable, vegan, etc.)
5. **Return structured JSON** and persist to database

### API Endpoint

```
POST /api/v1/categories/categorize
```

### Example Request

```json
{
  "name": "Bamboo Toothbrush",
  "description": "Eco-friendly bamboo toothbrush with charcoal-infused bristles. Biodegradable handle, BPA-free bristles. Comes in recyclable packaging.",
  "price": 149.0
}
```

### Example Response

```json
{
  "id": 1,
  "name": "Bamboo Toothbrush",
  "description": "Eco-friendly bamboo toothbrush...",
  "price": 149.0,
  "categorization": {
    "primary_category": "Personal Care & Hygiene",
    "sub_category": "Oral Care",
    "seo_tags": [
      "bamboo toothbrush",
      "eco-friendly oral care",
      "biodegradable toothbrush",
      "charcoal bristles",
      "plastic-free toothbrush",
      "sustainable hygiene",
      "zero waste bathroom"
    ],
    "sustainability_filters": [
      "plastic-free",
      "biodegradable",
      "compostable",
      "zero-waste"
    ],
    "confidence_score": 0.95,
    "reasoning": "Product is clearly a personal hygiene oral care item made from bamboo..."
  },
  "created_at": "2026-03-04T12:00:00",
  "ai_categorized_at": "2026-03-04T12:00:01"
}
```

### Business Logic Highlights
- **Category validation:** AI output is checked against 10 predefined categories; fuzzy matching applied if AI returns a non-standard category
- **Sustainability filter validation:** Only valid filters from the predefined list are included
- **SEO tag bounds:** Enforces 5-10 tags per product
- **Database persistence:** Product + categorization stored atomically

---

## Module 2: AI B2B Proposal Generator

### Status: ✅ Fully Implemented

### What It Does
Takes client details + budget and generates a complete sustainable procurement proposal:
1. **Suggested sustainable product mix** (5-15 products)
2. **Budget allocation** by category with percentages
3. **Estimated cost breakdown** (products, shipping, packaging)
4. **Impact positioning summary** for client pitch
5. **Structured JSON output** stored in database

### API Endpoint

```
POST /api/v1/proposals/generate
```

### Example Request

```json
{
  "client_name": "GreenCorp Hotels",
  "client_industry": "Hospitality",
  "budget_limit": 500000,
  "requirements": "Eco-friendly amenities for 200 hotel rooms. Priority on bathroom essentials and kitchen items.",
  "sustainability_priority": "high"
}
```

### Example Response

```json
{
  "id": 1,
  "client_name": "GreenCorp Hotels",
  "client_industry": "Hospitality",
  "budget_limit": 500000,
  "proposal": {
    "product_mix": [
      {
        "product_name": "Bamboo Toothbrush Set",
        "category": "Personal Care",
        "unit_price_estimate": 45.0,
        "quantity": 400,
        "total_price": 18000.0,
        "sustainability_tags": ["biodegradable", "plastic-free"]
      }
    ],
    "budget_allocation": [
      {
        "category": "Personal Care",
        "allocated_amount": 150000,
        "percentage": 30.0
      }
    ],
    "cost_breakdown": {
      "product_costs": 420000.0,
      "shipping_estimate": 33600.0,
      "packaging_costs": 16800.0,
      "total_estimated": 470400.0,
      "remaining_budget": 29600.0
    },
    "impact_summary": "By switching to sustainable products...",
    "key_selling_points": [
      "Reduce plastic waste by estimated 500kg annually",
      "Enhance brand positioning as eco-conscious hospitality leader",
      "Cost-neutral transition with long-term savings"
    ]
  },
  "created_at": "2026-03-04T12:00:00",
  "ai_generated_at": "2026-03-04T12:00:03"
}
```

### Business Logic Highlights
- **Budget enforcement:** If AI-generated total exceeds budget, quantities are automatically scaled down with a 5% safety buffer
- **Cost recalculation:** `unit_price × quantity` is recalculated server-side to prevent AI math errors
- **Shipping/packaging estimates:** Validated at 8-12% of product costs
- **Database persistence:** Full proposal stored with both structured and raw AI response

---

## Module 3: AI Impact Reporting Generator

### Status: 📐 Architecture Outlined

### Planned Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Order Data      │ ──▶ │  Impact Engine    │ ──▶ │  Impact Report   │
│  (products,      │     │  - AI estimation   │     │  - plastic saved  │
│   quantities)    │     │  - rule-based calc │     │  - carbon avoided │
│                  │     │  - hybrid approach │     │  - human statement│
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

**Key Components:**
- **`app/modules/impact_reporter.py`** – Business logic with estimation rules
- **`app/routes/impact.py`** – REST endpoints: `POST /api/v1/impact/generate`, `GET /api/v1/impact/{order_id}`
- **Database:** `impact_reports` table (already created in models.py)
- **Prompt:** Defined in `app/ai/prompts.py` (IMPACT_REPORT_SYSTEM)

**Estimation Logic:**
| Metric | Rule |
|--------|------|
| Plastic saved | 0.05–0.2 kg per eco-product based on category |
| Carbon avoided | ~0.5 kg CO₂ per kg for local vs imported products |
| Bamboo products | ~2 kg CO₂ saved per unit vs plastic equivalent |

**AI's Role:** Generate human-readable impact statements and refine estimates using product-specific context.

---

## Module 4: AI WhatsApp Support Bot

### Status: 📐 Architecture Outlined

### Planned Architecture

```
┌──────────────┐     ┌───────────────┐     ┌──────────────────┐
│  WhatsApp     │     │  Intent        │     │  Response         │
│  Message      │ ──▶ │  Classifier    │ ──▶ │  Generator        │
│  (via webhook)│     │  (AI-powered)  │     │  (template + AI)  │
└──────────────┘     └───────┬───────┘     └────────┬─────────┘
                             │                       │
                     ┌───────▼───────┐       ┌──────▼──────┐
                     │  Order DB      │       │  Escalation  │
                     │  Lookup        │       │  Handler     │
                     └───────────────┘       └─────────────┘
```

**Key Components:**
- **`app/modules/whatsapp_bot.py`** – Intent detection, response generation, escalation logic
- **`app/routes/whatsapp.py`** – Webhook endpoint: `POST /api/v1/whatsapp/webhook`
- **Database:** `conversation_logs` table (already created in models.py)
- **Prompt:** Defined in `app/ai/prompts.py` (WHATSAPP_BOT_SYSTEM)

**Intent Handling:**
| Intent | Action |
|--------|--------|
| `order_status` | Query database, return real order info |
| `return_policy` | Return templated policy (15-day return) |
| `refund_request` | Flag for human escalation |
| `general_query` | AI-generated response |
| `escalate` | Route to human agent |

**Escalation Triggers:**
- Keywords: "refund", "complaint", "manager", "legal"
- Sentiment: Negative sentiment detected
- Repeated queries: Same question asked 3+ times

---

## AI Prompt Design Explanation

### Prompt Engineering Strategy

All prompts follow a **structured system prompt + contextual user prompt** pattern:

#### 1. System Prompt Design
```
[Role Definition] → Who the AI is and its expertise
[Business Context] → Predefined lists, rules, constraints
[Output Schema]   → Exact JSON structure expected
[Validation Rules] → What makes output valid or invalid
```

**Why this works:**
- **Role anchoring** keeps AI focused on domain
- **Predefined lists** constrain output to valid business values
- **JSON schema in prompt** ensures structured, parseable output
- **Explicit rules** reduce hallucination and edge cases

#### 2. User Prompt Design
```
[Input Data]      → Product details / client info
[Task Instruction] → Specific action to perform
[Output Reminder]  → Reinforcement of expected format
```

#### 3. Temperature Settings
| Module | Temperature | Rationale |
|--------|-------------|-----------|
| Category Tagger | 0.2 | Low – needs consistent, accurate classification |
| B2B Proposal | 0.4 | Medium – wants some creativity in product suggestions |
| Impact Report | 0.3 | Low-medium – needs accurate estimates with readable text |
| WhatsApp Bot | 0.5 | Medium – natural conversational tone |

#### 4. Output Validation Pipeline
```
AI Response → JSON Parse → Schema Validation → Business Rule Check → Database Store
```

Every AI output goes through:
1. **JSON parsing** with error handling
2. **Pydantic schema validation** for type safety
3. **Business rule validation** (e.g., category must be from predefined list)
4. **Fuzzy matching** fallback if AI output is close but not exact

---

## API Reference

### Module 1 – Category & Tag Generator
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/categories/categorize` | Categorize a product using AI |
| GET | `/api/v1/categories/products` | List all categorized products |
| GET | `/api/v1/categories/products/{id}` | Get a specific product |

### Module 2 – B2B Proposal Generator
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/proposals/generate` | Generate a B2B proposal using AI |
| GET | `/api/v1/proposals/` | List all proposals |
| GET | `/api/v1/proposals/{id}` | Get a specific proposal |

### AI Logs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/logs/` | List AI interaction logs |
| GET | `/api/v1/logs/{id}` | Get a specific log entry |

### System
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API info and module status |
| GET | `/health` | Health check |

---

## Testing

### Manual Testing with cURL

**Categorize a product:**

```bash
curl -X POST http://localhost:8000/api/v1/categories/categorize \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bamboo Toothbrush",
    "description": "Eco-friendly bamboo toothbrush with charcoal-infused bristles. Biodegradable handle, BPA-free bristles. Recyclable packaging.",
    "price": 149.0
  }'
```

**Generate a B2B proposal:**

```bash
curl -X POST http://localhost:8000/api/v1/proposals/generate \
  -H "Content-Type: application/json" \
  -d '{
    "client_name": "GreenCorp Hotels",
    "client_industry": "Hospitality", 
    "budget_limit": 500000,
    "requirements": "Eco-friendly amenities for 200 hotel rooms",
    "sustainability_priority": "high"
  }'
```

**View AI logs:**

```bash
curl http://localhost:8000/api/v1/logs/?module=category_tagger
```

### Interactive Testing
Visit http://localhost:8000/docs for the Swagger UI with interactive "Try it out" buttons.

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | FastAPI | Async-ready, auto-docs, Pydantic integration |
| Database | SQLite + SQLAlchemy | Zero-config for development, easy to swap to PostgreSQL |
| AI Provider | OpenAI GPT-3.5-turbo | Good balance of quality, speed, and cost |
| Validation | Pydantic v2 | Type-safe schemas for both input and AI output |
| Config | pydantic-settings | Env-based config with type validation |
| JSON mode | `response_format=json_object` | Reliable structured output from AI |
| Logging | Python stdlib + DB | Console for development, DB for AI audit trail |

---

## License

Built for the Rayeva AI Systems Intern Assignment.

---

*Generated with structured AI + clean architecture principles.*
