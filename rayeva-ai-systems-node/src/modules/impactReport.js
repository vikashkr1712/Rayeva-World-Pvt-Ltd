/**
 * Rayeva AI Systems – Module 3: AI Impact Reporting Generator
 *
 * Business Logic:
 * - Accepts order details (order ID, products, total)
 * - Calls AI to estimate environmental impact
 * - Validates estimates are reasonable
 * - Stores structured result in database
 * - Logs the AI interaction
 */

const aiClient = require("../ai/client");
const {
  IMPACT_REPORT_SYSTEM,
  buildImpactUserPrompt,
} = require("../ai/prompts");
const { logAiInteraction } = require("../ai/aiLogger");
const config = require("../config");
const { ImpactReport } = require("../models");
const logger = require("../ai/logger");

const MODULE_NAME = "impact_report";

/**
 * Generate an environmental impact report for an order.
 * @param {object} params
 * @param {string} params.orderId
 * @param {Array} params.products - Array of {name, quantity, price, category}
 * @param {number} params.orderTotal
 * @returns {Promise<object>} Impact report data
 */
async function generateImpactReport({ orderId, products, orderTotal }) {
  // 1. Build prompt
  const userPrompt = buildImpactUserPrompt(orderId, products, orderTotal);

  // 2. Call AI
  const aiResult = await aiClient.generate(
    IMPACT_REPORT_SYSTEM,
    userPrompt,
    0.3,
    2000
  );

  // 3. Log the interaction
  await logAiInteraction({
    module: MODULE_NAME,
    prompt: `SYSTEM: ${IMPACT_REPORT_SYSTEM}\n\nUSER: ${userPrompt}`,
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
      `AI impact report generation failed: ${aiResult.error || "Unknown error"}`
    );
  }

  // 5. Validate and clean the AI output
  const raw = aiResult.parsed_json;
  const validated = validateOutput(raw, products.length, orderTotal);

  // 6. Store in database
  const report = await ImpactReport.create({
    order_id: orderId,
    plastic_saved_kg: validated.plastic_saved_kg,
    carbon_avoided_kg: validated.carbon_avoided_kg,
    local_sourcing_summary: validated.local_sourcing_summary,
    human_readable_statement: validated.human_readable_statement,
    full_ai_response: raw,
  });

  logger.info(
    `Impact report generated: id=${report.id}, order=${orderId}, ` +
      `plastic_saved=${validated.plastic_saved_kg}kg, carbon_avoided=${validated.carbon_avoided_kg}kg`
  );

  // 7. Return structured response
  return {
    id: report.id,
    order_id: report.order_id,
    impact: validated,
    created_at: report.created_at,
  };
}

/**
 * Validate impact report output.
 * - Ensures numeric values are reasonable
 * - Caps unrealistic estimates
 * @param {object} raw
 * @param {number} itemCount
 * @param {number} orderTotal
 * @returns {object} Validated impact data
 */
function validateOutput(raw, itemCount, orderTotal) {
  // Reasonable caps: max 2kg plastic per item, max 5kg carbon per item
  let plasticSaved = parseFloat(raw.plastic_saved_kg) || 0;
  if (plasticSaved < 0) plasticSaved = 0;
  if (plasticSaved > itemCount * 2) {
    logger.warn(
      `Capping unrealistic plastic estimate: ${plasticSaved}kg -> ${itemCount * 2}kg`
    );
    plasticSaved = itemCount * 2;
  }

  let carbonAvoided = parseFloat(raw.carbon_avoided_kg) || 0;
  if (carbonAvoided < 0) carbonAvoided = 0;
  if (carbonAvoided > itemCount * 5) {
    logger.warn(
      `Capping unrealistic carbon estimate: ${carbonAvoided}kg -> ${itemCount * 5}kg`
    );
    carbonAvoided = itemCount * 5;
  }

  return {
    plastic_saved_kg: Math.round(plasticSaved * 100) / 100,
    carbon_avoided_kg: Math.round(carbonAvoided * 100) / 100,
    local_sourcing_summary:
      raw.local_sourcing_summary || "Local sourcing data not available.",
    human_readable_statement:
      raw.human_readable_statement ||
      `Your order helped save ${plasticSaved.toFixed(2)} kg of plastic and avoid ${carbonAvoided.toFixed(2)} kg of CO₂ emissions.`,
    methodology_notes:
      raw.methodology_notes || "Estimates based on product lifecycle analysis.",
  };
}

module.exports = { generateImpactReport };
