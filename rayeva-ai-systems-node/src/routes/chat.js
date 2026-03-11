/**
 * Rayeva AI Systems – Module 4 API Routes: WhatsApp Support Bot
 */

const express = require("express");
const router = express.Router();
const { chatInputSchema } = require("../schemas");
const { processMessage, getSessionHistory } = require("../modules/whatsappBot");
const { ConversationLog } = require("../models");
const logger = require("../ai/logger");

/**
 * POST /api/v1/chat/message
 * Send a message and get AI bot response.
 */
router.post("/message", async (req, res) => {
  try {
    const { error, value } = chatInputSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        error: "Validation failed",
        detail: error.details.map((d) => d.message).join("; "),
        module: "whatsapp_bot",
      });
    }

    const result = await processMessage({
      message: value.message,
      sessionId: value.session_id,
      userPhone: value.user_phone || null,
    });

    return res.json(result);
  } catch (err) {
    if (err.message.startsWith("AI chat response failed")) {
      logger.error(`Chat failed: ${err.message}`);
      return res.status(400).json({ error: err.message, module: "whatsapp_bot" });
    }
    logger.error(`Unexpected error in chat: ${err.message}`);
    return res.status(500).json({
      error: "Internal server error during chat processing",
      module: "whatsapp_bot",
    });
  }
});

/**
 * GET /api/v1/chat/sessions/:sessionId
 * Get conversation history for a session.
 */
router.get("/sessions/:sessionId", async (req, res) => {
  try {
    const history = await getSessionHistory(req.params.sessionId);
    return res.json(history);
  } catch (err) {
    logger.error(`Error getting session history: ${err.message}`);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/v1/chat/conversations
 * List all conversations (latest per session).
 */
router.get("/conversations", async (req, res) => {
  try {
    const skip = parseInt(req.query.skip, 10) || 0;
    const limit = parseInt(req.query.limit, 10) || 50;

    const conversations = await ConversationLog.findAll({
      order: [["created_at", "DESC"]],
      offset: skip,
      limit,
    });

    const result = conversations.map((c) => ({
      id: c.id,
      session_id: c.session_id,
      user_phone: c.user_phone,
      user_message: c.user_message,
      bot_response:
        c.bot_response && c.bot_response.length > 200
          ? c.bot_response.substring(0, 200) + "..."
          : c.bot_response,
      intent_detected: c.intent_detected,
      escalated: c.escalated,
      created_at: c.created_at || null,
    }));

    return res.json(result);
  } catch (err) {
    logger.error(`Error listing conversations: ${err.message}`);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
