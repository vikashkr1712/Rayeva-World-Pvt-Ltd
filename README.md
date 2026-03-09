# Rayeva AI Systems (Node.js) – Applied AI for Sustainable Commerce

> **Role:** Full Stack / AI Intern Assignment  
> **Focus:** Production-ready AI modules integrated with real business logic for sustainable commerce

---

## Quick Start (Demo)

```bash
# 1. Install dependencies
npm install

# 2. Seed the database with sample products
node seed_data.js

# 3. Start the server
npm start
```

Open **http://localhost:3000** in your browser to see the interactive dashboard.

> **No OpenAI API key needed!** The system runs in **Demo Mode** with intelligent mock AI responses that mimic real GPT-4o outputs. To use real AI, add your key to `.env`.

---

## Demo Walkthrough (What to Show in Presentation)

### 1. Overview Dashboard (http://localhost:3000)
- Shows live KPIs: product count, proposal count, AI log count, server health
- Architecture diagram showing all 4 modules
- Tech stack table

### 2. Module 1: AI Auto-Category & Tag Generator
- Click **"Module 1: Category Tagger"** tab
- Click **"Fill Sample"** to auto-fill a product (or enter your own)
- Click **"Categorize Product"** → AI returns:
  - **Primary Category** (from predefined list of 10 categories)
  - **Sub-Category** (AI-generated)
  - **7 SEO Tags** (for search optimization)
  - **Sustainability Filters** (validated against predefined list)
  - **Confidence Score** (0-1)
  - **Reasoning** (AI's explanation)
- The product appears in the **"All Products"** table below
- Try different products: kitchen items, fashion, cleaning supplies

### 3. Module 2: AI B2B Proposal Generator
- Click **"Module 2: B2B Proposals"** tab
- Click **"Fill Sample"** for a hotel chain example
- Click **"Generate Proposal"** → AI returns:
  - **Product Mix** (8 eco-friendly products with quantities and prices)
  - **Budget Allocation** (by category with percentages)
  - **Cost Breakdown** (products + shipping + packaging)
  - **Budget Utilization** (progress bar showing % of budget used)
  - **Impact Summary** (plastic saved, CO₂ avoided)
  - **Key Selling Points** (5 bullet points for the client)
- Budget constraint is enforced (total never exceeds budget)

### 4. AI Logs (Audit Trail)
- Click **"AI Logs"** tab
- Every AI call is logged with: module, model, tokens, latency, success/fail
- Full audit trail for transparency and debugging

### 5. API Explorer
- Click **"API Explorer"** tab
- Run any endpoint directly and see raw JSON responses
- Shows all available REST endpoints

### Key Technical Points to Mention
1. **Layered Architecture**: Routes → Modules → AI Client → Database (clean separation)
2. **Business Rule Validation**: AI outputs are validated (categories against predefined list, budgets never exceeded)
3. **Structured JSON Output**: All AI responses are forced into JSON format and parsed
4. **Full Audit Logging**: Every AI interaction stored in `ai_logs` table
5. **Prompt Engineering**: System prompts include predefined categories, constraints, and output schemas
6. **Graceful Fallback**: Demo mode auto-activates when no API key is set
7. **Production-Ready**: Error handling, request validation (Joi), CORS, environment config

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
│                      Express.js Application                     │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐    │
│  │  API Routes   │  │  Joi         │  │  Error Handling    │    │
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
│  │                  Database Layer (Sequelize + SQLite)        │  │
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
| **Structured Outputs** | All AI responses are JSON-validated through Joi schemas |
| **Prompt + Response Logging** | Every AI interaction is logged to `ai_logs` table |
| **Env-based Config** | API keys and settings loaded from `.env` via `dotenv` |
| **Business Rule Validation** | AI output is validated against predefined categories and budgets |
| **Error Handling** | Global exception handler + per-module error handling |

---

## Project Structure

```
rayeva-ai-systems-node/
├── public/
│   └── index.html               # Interactive frontend dashboard
├── src/
│   ├── app.js                   # Express app, lifecycle, middleware
│   ├── config.js                # Environment-based configuration
│   ├── database.js              # Sequelize engine & session
│   ├── models/
│   │   ├── index.js             # Model index and associations
│   │   ├── Product.js           # Product catalog model
│   │   ├── B2BProposal.js       # B2B proposals model
│   │   ├── ImpactReport.js      # Impact reports model (outlined)
│   │   ├── ConversationLog.js   # WhatsApp convos model (outlined)
│   │   └── AILog.js             # AI interaction logs model
│   ├── schemas/
│   │   └── index.js             # Joi request validation schemas
│   ├── ai/
│   │   ├── client.js            # OpenAI API wrapper with JSON parsing + demo mode
│   │   ├── mockResponses.js     # Intelligent mock AI responses for demo
│   │   ├── prompts.js           # All prompt templates (all 4 modules)
│   │   ├── logger.js            # Winston logger instance
│   │   └── aiLogger.js          # AI interaction audit logger
│   ├── modules/
│   │   ├── categoryTagger.js    # Module 1 business logic
│   │   └── b2bProposal.js       # Module 2 business logic
│   └── routes/
│       ├── category.js          # Module 1 API endpoints
│       ├── proposal.js          # Module 2 API endpoints
│       └── logs.js              # AI logs viewer endpoints
├── .env.example                 # Environment template
├── .gitignore
├── package.json
├── seed_data.js                 # Sample data seeder
└── README.md                    # This file
```

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- npm 9+
- OpenAI API key

### Step-by-Step

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/rayeva-ai-systems-node.git
cd rayeva-ai-systems-node

# 2. Install dependencies
npm install

# 3. Configure environment
copy .env.example .env    # Windows
# cp .env.example .env    # macOS/Linux

# 4. Edit .env and add your OpenAI API key
# OPENAI_API_KEY=sk-your-key-here

# 5. (Optional) Seed sample data
npm run seed

# 6. Run the server
npm start
# Or for development with auto-reload:
npm run dev
```

### Access Points
- **API Root:** http://localhost:3000/
- **Health Check:** http://localhost:3000/health
- **Use Postman or cURL for API testing**

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
  "created_at": "2026-03-04T12:00:00.000Z",
  "ai_categorized_at": "2026-03-04T12:00:01.000Z"
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
  "created_at": "2026-03-04T12:00:00.000Z",
  "ai_generated_at": "2026-03-04T12:00:03.000Z"
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
- **`src/modules/impactReporter.js`** – Business logic with estimation rules
- **`src/routes/impact.js`** – REST endpoints: `POST /api/v1/impact/generate`, `GET /api/v1/impact/{order_id}`
- **Database:** `impact_reports` table (already created in models)
- **Prompt:** Defined in `src/ai/prompts.js` (IMPACT_REPORT_SYSTEM)

**Estimation Logic:**
| Metric | Rule |
|--------|------|
| Plastic saved | 0.05–0.2 kg per eco-product based on category |
| Carbon avoided | ~0.5 kg CO₂ per kg for local vs imported products |
| Bamboo products | ~2 kg CO₂ saved per unit vs plastic equivalent |

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
- **`src/modules/whatsappBot.js`** – Intent detection, response generation, escalation logic
- **`src/routes/whatsapp.js`** – Webhook endpoint: `POST /api/v1/whatsapp/webhook`
- **Database:** `conversation_logs` table (already created in models)
- **Prompt:** Defined in `src/ai/prompts.js` (WHATSAPP_BOT_SYSTEM)

**Intent Handling:**
| Intent | Action |
|--------|--------|
| `order_status` | Query database, return real order info |
| `return_policy` | Return templated policy (15-day return) |
| `refund_request` | Flag for human escalation |
| `general_query` | AI-generated response |
| `escalate` | Route to human agent |

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
AI Response → JSON Parse → Joi Validation → Business Rule Check → Database Store
```

Every AI output goes through:
1. **JSON parsing** with error handling
2. **Joi schema validation** for type safety
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

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Express.js | Mature, lightweight, huge ecosystem |
| Database | SQLite + Sequelize | Zero-config for development, easy to swap to PostgreSQL |
| AI Provider | OpenAI GPT-3.5-turbo | Good balance of quality, speed, and cost |
| Validation | Joi | Battle-tested schema validation for Node.js |
| Config | dotenv | Standard env-based config for Node.js |
| JSON mode | `response_format=json_object` | Reliable structured output from AI |
| Logging | Winston | Flexible, structured logging for Node.js |

---

## Python ↔ Node.js Mapping

| Python (Original) | Node.js (This Port) |
|---|---|
| FastAPI | Express.js |
| SQLAlchemy + SQLite | Sequelize + SQLite |
| Pydantic schemas | Joi validation |
| pydantic-settings | dotenv + config.js |
| Python OpenAI SDK | Node.js OpenAI SDK |
| Python logging | Winston |
| uvicorn | Node.js built-in http (via Express) |

---

## License

Built for the Rayeva AI Systems Intern Assignment.

---

*Converted from Python/FastAPI to Node.js/Express with structured AI + clean architecture principles.*
