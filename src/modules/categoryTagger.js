/**
 * Rayeva AI Systems – Module 1: AI Auto-Category & Tag Generator
 *
 * Business Logic:
 * - Accepts product name + description
 * - Calls AI to auto-assign category, sub-category, SEO tags, sustainability filters
 * - Validates AI output against predefined lists
 * - Stores structured result in database
 * - Logs the AI interaction
 */

const aiClient = require("../ai/client");
const {
  CATEGORY_TAGGER_SYSTEM,
  buildCategoryUserPrompt,
} = require("../ai/prompts");
const { logAiInteraction } = require("../ai/aiLogger");
const config = require("../config");
const { Product } = require("../models");
const logger = require("../ai/logger");

const MODULE_NAME = "category_tagger";

/**
 * Categorize a product using AI and store result.
 * @param {string} name - Product name
 * @param {string} description - Product description
 * @param {number|null} price - Optional product price
 * @returns {Promise<object>} Product data with categorization result
 */
async function categorizeProduct(name, description, price = null) {
  // 1. Build prompt
  const userPrompt = buildCategoryUserPrompt(name, description, price);

  // 2. Call AI
  const aiResult = await aiClient.generate(
    CATEGORY_TAGGER_SYSTEM,
    userPrompt,
    0.2, // Low temperature for consistent categorization
    2000
  );

  // 3. Log the interaction
  await logAiInteraction({
    module: MODULE_NAME,
    prompt: `SYSTEM: ${CATEGORY_TAGGER_SYSTEM}\n\nUSER: ${userPrompt}`,
    response: aiResult.response_text,
    model_used: config.OPENAI_MODEL,
    tokens_used: aiResult.tokens_used,
    latency_ms: aiResult.latency_ms,
    success: aiResult.success,
    error_message: aiResult.error,
  });

  // 4. Handle AI failure
  if (!aiResult.success || !aiResult.parsed_json) {
    throw new Error(
      `AI categorization failed: ${aiResult.error || "Unknown error"}`
    );
  }

  // 5. Validate and clean the AI output
  const rawJson = aiResult.parsed_json;
  const validated = validateOutput(rawJson);

  // 6. Store product with categorization in database
  const product = await Product.create({
    name,
    description,
    price,
    primary_category: validated.primary_category,
    sub_category: validated.sub_category,
    seo_tags: validated.seo_tags,
    sustainability_filters: validated.sustainability_filters,
    ai_categorized_at: new Date(),
  });

  logger.info(
    `Product categorized: id=${product.id}, category=${validated.primary_category}`
  );

  // 7. Return structured response
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    categorization: validated,
    created_at: product.created_at,
    ai_categorized_at: product.ai_categorized_at,
  };
}

/**
 * Validate AI output against business rules.
 * - Ensures primary_category is from predefined list
 * - Filters sustainability tags to valid ones
 * - Ensures 5-10 SEO tags
 * @param {object} raw - Raw AI output
 * @returns {object} Validated categorization
 */
function validateOutput(raw) {
  // Validate primary category
  let primaryCategory = raw.primary_category || "";
  if (!config.PRODUCT_CATEGORIES.includes(primaryCategory)) {
    const closest = findClosestCategory(primaryCategory);
    logger.warn(
      `AI category '${raw.primary_category}' not in list, mapped to '${closest}'`
    );
    primaryCategory = closest;
  }

  // Validate sustainability filters
  const rawFilters = raw.sustainability_filters || [];
  let validFilters = rawFilters.filter((f) =>
    config.SUSTAINABILITY_FILTERS.includes(f)
  );
  if (validFilters.length === 0 && rawFilters.length > 0) {
    validFilters = fuzzyMatchFilters(rawFilters);
  }

  // Validate SEO tags (ensure 5-10)
  let seoTags = raw.seo_tags || [];
  if (seoTags.length < 5) {
    logger.warn(
      `AI returned only ${seoTags.length} SEO tags, returning as-is`
    );
  }
  if (seoTags.length > 10) {
    seoTags = seoTags.slice(0, 10);
  }

  return {
    primary_category: primaryCategory,
    sub_category: raw.sub_category || "General",
    seo_tags: seoTags,
    sustainability_filters: validFilters,
    confidence_score: raw.confidence_score || null,
    reasoning: raw.reasoning || null,
  };
}

/**
 * Find the closest matching predefined category.
 * @param {string} candidate
 * @returns {string}
 */
function findClosestCategory(candidate) {
  const candidateLower = (candidate || "").toLowerCase();
  for (const cat of config.PRODUCT_CATEGORIES) {
    if (
      candidateLower.includes(cat.toLowerCase()) ||
      cat.toLowerCase().includes(candidateLower)
    ) {
      return cat;
    }
  }
  // Default to first category if no match
  return config.PRODUCT_CATEGORIES[0];
}

/**
 * Attempt fuzzy matching of sustainability filters.
 * @param {string[]} rawFilters
 * @returns {string[]}
 */
function fuzzyMatchFilters(rawFilters) {
  const matched = [];
  for (const raw of rawFilters) {
    const rawLower = raw.toLowerCase().replace(/ /g, "-");
    for (const valid of config.SUSTAINABILITY_FILTERS) {
      if (rawLower.includes(valid) || valid.includes(rawLower)) {
        if (!matched.includes(valid)) {
          matched.push(valid);
        }
        break;
      }
    }
  }
  return matched;
}

module.exports = { categorizeProduct };
