/**
 * Rayeva AI Systems – Module 3 API Routes: Impact Report Generator
 */

const express = require("express");
const router = express.Router();
const { impactInputSchema } = require("../schemas");
const { generateImpactReport } = require("../modules/impactReport");
const { ImpactReport } = require("../models");
const logger = require("../ai/logger");

/**
 * POST /api/v1/impact/generate
 * Generate an environmental impact report for an order.
 */
router.post("/generate", async (req, res) => {
  try {
    const { error, value } = impactInputSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        error: "Validation failed",
        detail: error.details.map((d) => d.message).join("; "),
        module: "impact_report",
      });
    }

    const result = await generateImpactReport({
      orderId: value.order_id,
      products: value.products,
      orderTotal: value.order_total,
    });

    return res.json(result);
  } catch (err) {
    if (err.message.startsWith("AI impact report generation failed")) {
      logger.error(`Impact report failed: ${err.message}`);
      return res.status(400).json({ error: err.message, module: "impact_report" });
    }
    logger.error(`Unexpected error in impact report: ${err.message}`);
    return res.status(500).json({
      error: "Internal server error during impact report generation",
      module: "impact_report",
    });
  }
});

/**
 * GET /api/v1/impact/
 * List all impact reports.
 */
router.get("/", async (req, res) => {
  try {
    const skip = parseInt(req.query.skip, 10) || 0;
    const limit = parseInt(req.query.limit, 10) || 20;

    const reports = await ImpactReport.findAll({
      order: [["created_at", "DESC"]],
      offset: skip,
      limit,
    });

    const result = reports.map((r) => ({
      id: r.id,
      order_id: r.order_id,
      plastic_saved_kg: r.plastic_saved_kg,
      carbon_avoided_kg: r.carbon_avoided_kg,
      local_sourcing_summary: r.local_sourcing_summary,
      human_readable_statement: r.human_readable_statement,
      created_at: r.created_at || null,
    }));

    return res.json(result);
  } catch (err) {
    logger.error(`Error listing impact reports: ${err.message}`);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/v1/impact/:reportId
 * Get a single impact report by ID.
 */
router.get("/:reportId", async (req, res) => {
  try {
    const reportId = parseInt(req.params.reportId, 10);
    const report = await ImpactReport.findByPk(reportId);

    if (!report) {
      return res
        .status(404)
        .json({ error: `Impact report with id ${reportId} not found` });
    }

    return res.json({
      id: report.id,
      order_id: report.order_id,
      plastic_saved_kg: report.plastic_saved_kg,
      carbon_avoided_kg: report.carbon_avoided_kg,
      local_sourcing_summary: report.local_sourcing_summary,
      human_readable_statement: report.human_readable_statement,
      full_ai_response: report.full_ai_response,
      created_at: report.created_at || null,
    });
  } catch (err) {
    logger.error(`Error getting impact report: ${err.message}`);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
