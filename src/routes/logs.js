/**
 * Rayeva AI Systems – AI Logs API Routes
 * View logged AI interactions for auditing and debugging.
 */

const express = require("express");
const router = express.Router();
const { AILog } = require("../models");
const logger = require("../ai/logger");

/**
 * GET /api/v1/logs/
 * List AI interaction logs with optional filtering.
 */
router.get("/", async (req, res) => {
  try {
    const skip = parseInt(req.query.skip, 10) || 0;
    const limit = parseInt(req.query.limit, 10) || 50;
    const moduleName = req.query.module || null;
    const success = req.query.success != null ? req.query.success === "true" : null;

    const where = {};
    if (moduleName) where.module = moduleName;
    if (success !== null) where.success = success;

    const logs = await AILog.findAll({
      where,
      order: [["created_at", "DESC"]],
      offset: skip,
      limit,
    });

    const result = logs.map((log) => ({
      id: log.id,
      module: log.module,
      prompt:
        log.prompt && log.prompt.length > 200
          ? log.prompt.substring(0, 200) + "..."
          : log.prompt,
      response:
        log.response && log.response.length > 500
          ? log.response.substring(0, 500) + "..."
          : log.response,
      model_used: log.model_used,
      tokens_used: log.tokens_used,
      latency_ms: log.latency_ms,
      success: log.success,
      error_message: log.error_message,
      created_at: log.created_at || null,
    }));

    return res.json(result);
  } catch (err) {
    logger.error(`Error listing logs: ${err.message}`);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/v1/logs/:logId
 * Get full details of a specific AI log entry.
 */
router.get("/:logId", async (req, res) => {
  try {
    const logId = parseInt(req.params.logId, 10);
    const log = await AILog.findByPk(logId);

    if (!log) {
      return res.status(404).json({ error: `Log with id ${logId} not found` });
    }

    return res.json({
      id: log.id,
      module: log.module,
      prompt: log.prompt,
      response: log.response,
      model_used: log.model_used,
      tokens_used: log.tokens_used,
      latency_ms: log.latency_ms,
      success: log.success,
      error_message: log.error_message,
      created_at: log.created_at || null,
    });
  } catch (err) {
    logger.error(`Error getting log: ${err.message}`);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
