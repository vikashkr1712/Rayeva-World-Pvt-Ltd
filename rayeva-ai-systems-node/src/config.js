/**
 * Rayeva AI Systems – Environment-based Configuration
 * Uses dotenv for env variable management.
 */

require("dotenv").config();

const config = {
  // ── OpenAI ───────────────────────────────────────────────────────
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  OPENAI_MODEL: process.env.OPENAI_MODEL || "gpt-3.5-turbo",

  // ── Database ─────────────────────────────────────────────────────
  DATABASE_PATH: process.env.DATABASE_PATH || "./rayeva.db",

  // ── App ──────────────────────────────────────────────────────────
  APP_ENV: process.env.APP_ENV || "development",
  DEBUG: process.env.DEBUG === "true",
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  PORT: parseInt(process.env.PORT, 10) || 3000,

  // ── Predefined Business Constants ────────────────────────────────
  PRODUCT_CATEGORIES: [
    "Kitchen & Dining",
    "Personal Care & Hygiene",
    "Home & Living",
    "Fashion & Accessories",
    "Office & Stationery",
    "Travel & Outdoor",
    "Baby & Kids",
    "Food & Beverages",
    "Cleaning & Laundry",
    "Gardening & Agriculture",
  ],

  SUSTAINABILITY_FILTERS: [
    "plastic-free",
    "compostable",
    "biodegradable",
    "vegan",
    "cruelty-free",
    "recycled",
    "organic",
    "fair-trade",
    "zero-waste",
    "locally-sourced",
    "chemical-free",
    "reusable",
    "upcycled",
    "carbon-neutral",
    "water-saving",
  ],
};

module.exports = config;
