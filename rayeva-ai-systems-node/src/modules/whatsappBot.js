/**
 * Rayeva AI Systems – Module 4: AI WhatsApp Support Bot
 *
 * Business Logic:
 * - Accepts customer message and session ID
 * - Calls AI to detect intent and generate response
 * - Handles escalation flagging
 * - Stores conversation in database
 * - Logs the AI interaction
 */

const aiClient = require("../ai/client");
const {
  WHATSAPP_BOT_SYSTEM,
  buildChatUserPrompt,
} = require("../ai/prompts");
const { logAiInteraction } = require("../ai/aiLogger");
const config = require("../config");
const { ConversationLog } = require("../models");
const logger = require("../ai/logger");

const MODULE_NAME = "whatsapp_bot";

const VALID_INTENTS = [
  "order_status",
  "return_policy",
  "refund_request",
  "general_query",
  "escalate",
];

/**
 * Process a customer message and generate AI response.
 * @param {object} params
 * @param {string} params.message - Customer's message
 * @param {string} params.sessionId - Conversation session ID
 * @param {string|null} [params.userPhone] - Customer phone number
 * @returns {Promise<object>} Bot response with intent and escalation info
 */
async function processMessage({ message, sessionId, userPhone = null }) {
  // 1. Build prompt
  const userPrompt = buildChatUserPrompt(message, sessionId);

  // 2. Call AI
  const aiResult = await aiClient.generate(
    WHATSAPP_BOT_SYSTEM,
    userPrompt,
    0.5, // Moderate creativity for natural conversation
    1000
  );

  // 3. Log the interaction
  await logAiInteraction({
    module: MODULE_NAME,
    prompt: `SYSTEM: ${WHATSAPP_BOT_SYSTEM}\n\nUSER: ${userPrompt}`,
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
      `AI chat response failed: ${aiResult.error || "Unknown error"}`
    );
  }

  // 5. Validate and clean the AI output
  const raw = aiResult.parsed_json;
  const validated = validateOutput(raw);

  // 6. Store conversation in database
  const conversation = await ConversationLog.create({
    session_id: sessionId,
    user_phone: userPhone,
    user_message: message,
    bot_response: validated.response_message,
    intent_detected: validated.intent,
    escalated: validated.escalate,
  });

  logger.info(
    `Chat processed: id=${conversation.id}, session=${sessionId}, ` +
      `intent=${validated.intent}, escalated=${validated.escalate}`
  );

  // 7. Return structured response
  return {
    id: conversation.id,
    session_id: sessionId,
    user_message: message,
    bot_response: validated.response_message,
    intent: validated.intent,
    escalate: validated.escalate,
    escalation_reason: validated.escalation_reason,
    order_id_referenced: validated.order_id_referenced,
    created_at: conversation.created_at,
  };
}

/**
 * Get conversation history for a session.
 * @param {string} sessionId
 * @returns {Promise<Array>}
 */
async function getSessionHistory(sessionId) {
  const logs = await ConversationLog.findAll({
    where: { session_id: sessionId },
    order: [["created_at", "ASC"]],
  });
  return logs.map((l) => ({
    id: l.id,
    user_message: l.user_message,
    bot_response: l.bot_response,
    intent: l.intent_detected,
    escalated: l.escalated,
    created_at: l.created_at,
  }));
}

/**
 * Validate chat response output.
 * @param {object} raw
 * @returns {object} Validated response
 */
function validateOutput(raw) {
  let intent = raw.intent || "general_query";
  if (!VALID_INTENTS.includes(intent)) {
    logger.warn(`Unknown intent '${intent}', defaulting to 'general_query'`);
    intent = "general_query";
  }

  return {
    response_message:
      raw.response_message || "I'm here to help! Could you please rephrase your question?",
    intent,
    escalate: Boolean(raw.escalate),
    escalation_reason: raw.escalate ? (raw.escalation_reason || "Flagged for human review") : null,
    order_id_referenced: raw.order_id_referenced || null,
  };
}

module.exports = { processMessage, getSessionHistory };
