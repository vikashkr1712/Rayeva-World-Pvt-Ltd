/**
 * Rayeva AI Systems – Module 2 API Routes: B2B Proposal Generator
 */

const express = require("express");
const router = express.Router();
const { proposalInputSchema } = require("../schemas");
const { generateProposal } = require("../modules/b2bProposal");
const { B2BProposal } = require("../models");
const logger = require("../ai/logger");

/**
 * POST /api/v1/proposals/generate
 * Generate a B2B proposal using AI.
 */
router.post("/generate", async (req, res) => {
  try {
    // Validate input
    const { error, value } = proposalInputSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        error: "Validation failed",
        detail: error.details.map((d) => d.message).join("; "),
        module: "b2b_proposal",
      });
    }

    const result = await generateProposal({
      clientName: value.client_name,
      clientIndustry: value.client_industry,
      budgetLimit: value.budget_limit,
      requirements: value.requirements || null,
      sustainabilityPriority: value.sustainability_priority || "medium",
    });

    return res.json(result);
  } catch (err) {
    if (err.message.startsWith("AI proposal generation failed")) {
      logger.error(`Proposal generation failed: ${err.message}`);
      return res.status(400).json({ error: err.message, module: "b2b_proposal" });
    }
    logger.error(`Unexpected error in proposal generation: ${err.message}`);
    return res.status(500).json({
      error: "Internal server error during proposal generation",
      module: "b2b_proposal",
    });
  }
});

/**
 * GET /api/v1/proposals/
 * List all proposals.
 */
router.get("/", async (req, res) => {
  try {
    const skip = parseInt(req.query.skip, 10) || 0;
    const limit = parseInt(req.query.limit, 10) || 20;

    const proposals = await B2BProposal.findAll({
      offset: skip,
      limit,
    });

    const result = proposals.map((p) => ({
      id: p.id,
      client_name: p.client_name,
      client_industry: p.client_industry,
      budget_limit: p.budget_limit,
      requirements: p.requirements,
      product_mix: p.product_mix,
      budget_allocation: p.budget_allocation,
      cost_breakdown: p.cost_breakdown,
      impact_summary: p.impact_summary,
      created_at: p.created_at || null,
      ai_generated_at: p.ai_generated_at || null,
    }));

    return res.json(result);
  } catch (err) {
    logger.error(`Error listing proposals: ${err.message}`);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/v1/proposals/:proposalId
 * Get a single proposal by ID.
 */
router.get("/:proposalId", async (req, res) => {
  try {
    const proposalId = parseInt(req.params.proposalId, 10);
    const proposal = await B2BProposal.findByPk(proposalId);

    if (!proposal) {
      return res
        .status(404)
        .json({ error: `Proposal with id ${proposalId} not found` });
    }

    return res.json({
      id: proposal.id,
      client_name: proposal.client_name,
      client_industry: proposal.client_industry,
      budget_limit: proposal.budget_limit,
      requirements: proposal.requirements,
      product_mix: proposal.product_mix,
      budget_allocation: proposal.budget_allocation,
      cost_breakdown: proposal.cost_breakdown,
      impact_summary: proposal.impact_summary,
      full_ai_response: proposal.full_ai_response,
      created_at: proposal.created_at || null,
      ai_generated_at: proposal.ai_generated_at || null,
    });
  } catch (err) {
    logger.error(`Error getting proposal: ${err.message}`);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
