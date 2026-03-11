/**
 * Rayeva AI Systems – Module 2: AI B2B Proposal Generator
 *
 * Business Logic:
 * - Accepts client details (name, industry, budget, requirements)
 * - Calls AI to generate sustainable product proposal
 * - Validates budget constraints
 * - Stores structured result in database
 * - Logs the AI interaction
 */

const aiClient = require("../ai/client");
const {
  B2B_PROPOSAL_SYSTEM,
  buildProposalUserPrompt,
} = require("../ai/prompts");
const { logAiInteraction } = require("../ai/aiLogger");
const config = require("../config");
const { B2BProposal } = require("../models");
const logger = require("../ai/logger");

const MODULE_NAME = "b2b_proposal";

/**
 * Generate a B2B proposal using AI and store result.
 * @param {object} params
 * @param {string} params.clientName
 * @param {string} params.clientIndustry
 * @param {number} params.budgetLimit
 * @param {string|null} [params.requirements]
 * @param {string|null} [params.sustainabilityPriority]
 * @returns {Promise<object>} Proposal data with AI-generated content
 */
async function generateProposal({
  clientName,
  clientIndustry,
  budgetLimit,
  requirements = null,
  sustainabilityPriority = "medium",
}) {
  // 1. Build prompt
  const userPrompt = buildProposalUserPrompt(
    clientName,
    clientIndustry,
    budgetLimit,
    requirements,
    sustainabilityPriority
  );

  // 2. Call AI with higher token limit for detailed proposals
  const aiResult = await aiClient.generate(
    B2B_PROPOSAL_SYSTEM,
    userPrompt,
    0.4, // Slightly creative for proposals
    3000
  );

  // 3. Log the interaction
  await logAiInteraction({
    module: MODULE_NAME,
    prompt: `SYSTEM: ${B2B_PROPOSAL_SYSTEM}\n\nUSER: ${userPrompt}`,
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
      `AI proposal generation failed: ${aiResult.error || "Unknown error"}`
    );
  }

  // 5. Validate and clean the AI output
  const rawJson = aiResult.parsed_json;
  const validated = validateOutput(rawJson, budgetLimit);

  // 6. Store proposal in database
  const proposal = await B2BProposal.create({
    client_name: clientName,
    client_industry: clientIndustry,
    budget_limit: budgetLimit,
    requirements,
    product_mix: validated.product_mix,
    budget_allocation: validated.budget_allocation,
    cost_breakdown: validated.cost_breakdown,
    impact_summary: validated.impact_summary,
    full_ai_response: rawJson,
    ai_generated_at: new Date(),
  });

  logger.info(
    `B2B Proposal generated: id=${proposal.id}, client=${clientName}, ` +
      `total=₹${validated.cost_breakdown.total_estimated.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
  );

  // 7. Return structured response
  return {
    id: proposal.id,
    client_name: proposal.client_name,
    client_industry: proposal.client_industry,
    budget_limit: proposal.budget_limit,
    requirements: proposal.requirements,
    proposal: validated,
    created_at: proposal.created_at,
    ai_generated_at: proposal.ai_generated_at,
  };
}

/**
 * Validate AI proposal output against business rules.
 * - Ensures total cost doesn't exceed budget
 * - Validates product mix structure
 * - Recalculates totals if needed
 * @param {object} raw
 * @param {number} budgetLimit
 * @returns {object} Validated proposal
 */
function validateOutput(raw, budgetLimit) {
  // Parse product mix
  const productMix = [];
  for (const item of raw.product_mix || []) {
    try {
      const unitPrice = parseFloat(item.unit_price_estimate) || 0;
      const quantity = parseInt(item.quantity, 10) || 0;
      const calculatedTotal = Math.round(unitPrice * quantity * 100) / 100;

      productMix.push({
        product_name: item.product_name || "Unknown Product",
        category: item.category || "General",
        unit_price_estimate: unitPrice,
        quantity,
        total_price: calculatedTotal,
        sustainability_tags: item.sustainability_tags || [],
      });
    } catch (err) {
      logger.warn(`Skipping invalid product mix item: ${err.message}`);
    }
  }

  // Recalculate actual product costs
  let actualProductCosts = productMix.reduce(
    (sum, item) => sum + item.total_price,
    0
  );

  // Parse budget allocation
  const budgetAllocation = [];
  for (const alloc of raw.budget_allocation || []) {
    try {
      budgetAllocation.push({
        category: alloc.category || "General",
        allocated_amount: parseFloat(alloc.allocated_amount) || 0,
        percentage: parseFloat(alloc.percentage) || 0,
      });
    } catch (err) {
      logger.warn(`Skipping invalid budget allocation: ${err.message}`);
    }
  }

  // Parse and validate cost breakdown
  const rawBreakdown = raw.cost_breakdown || {};
  let shipping =
    parseFloat(rawBreakdown.shipping_estimate) || actualProductCosts * 0.08;
  let packaging =
    parseFloat(rawBreakdown.packaging_costs) || actualProductCosts * 0.04;
  let totalEstimated =
    Math.round((actualProductCosts + shipping + packaging) * 100) / 100;

  // Budget enforcement: scale down if over budget
  if (totalEstimated > budgetLimit) {
    const scaleFactor = (budgetLimit / totalEstimated) * 0.95; // 5% buffer
    logger.warn(
      `Proposal exceeds budget (₹${totalEstimated.toLocaleString()} > ₹${budgetLimit.toLocaleString()}). ` +
        `Scaling down by factor ${scaleFactor.toFixed(2)}`
    );

    for (const item of productMix) {
      item.quantity = Math.max(1, Math.floor(item.quantity * scaleFactor));
      item.total_price =
        Math.round(item.unit_price_estimate * item.quantity * 100) / 100;
    }

    actualProductCosts = productMix.reduce(
      (sum, item) => sum + item.total_price,
      0
    );
    shipping = Math.round(actualProductCosts * 0.08 * 100) / 100;
    packaging = Math.round(actualProductCosts * 0.04 * 100) / 100;
    totalEstimated =
      Math.round((actualProductCosts + shipping + packaging) * 100) / 100;
  }

  const remaining = Math.round((budgetLimit - totalEstimated) * 100) / 100;

  const costBreakdown = {
    product_costs: Math.round(actualProductCosts * 100) / 100,
    shipping_estimate: Math.round(shipping * 100) / 100,
    packaging_costs: Math.round(packaging * 100) / 100,
    total_estimated: totalEstimated,
    remaining_budget: Math.max(0, remaining),
  };

  // Impact summary
  const impactSummary =
    raw.impact_summary ||
    "Sustainable procurement proposal for your organization.";
  const keySellingPoints = raw.key_selling_points || [
    "Reduced environmental footprint",
    "Enhanced brand sustainability positioning",
    "Cost-effective green alternatives",
  ];

  return {
    product_mix: productMix,
    budget_allocation: budgetAllocation,
    cost_breakdown: costBreakdown,
    impact_summary: impactSummary,
    key_selling_points: keySellingPoints,
  };
}

module.exports = { generateProposal };
