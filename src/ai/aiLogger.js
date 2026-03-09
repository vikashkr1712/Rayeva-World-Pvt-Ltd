/**
 * Rayeva AI Systems – AI Prompt & Response Logger
 * Logs every AI interaction to the database for auditing and debugging.
 */

const { AILog } = require("../models");
const logger = require("./logger");

/**
 * Log an AI prompt+response interaction to the database.
 * @param {object} params
 * @param {string} params.module - Which module made the call
 * @param {string} params.prompt - The full prompt sent to the AI
 * @param {string} params.response - The raw response from the AI
 * @param {string|null} [params.model_used] - Model identifier
 * @param {number|null} [params.tokens_used] - Total tokens consumed
 * @param {number|null} [params.latency_ms] - Response time in milliseconds
 * @param {boolean} [params.success=true] - Whether the call succeeded
 * @param {string|null} [params.error_message] - Error details if failed
 * @returns {Promise<object>} The created AILog record
 */
async function logAiInteraction({
  module: moduleName,
  prompt,
  response,
  model_used = null,
  tokens_used = null,
  latency_ms = null,
  success = true,
  error_message = null,
}) {
  try {
    const logEntry = await AILog.create({
      module: moduleName,
      prompt,
      response,
      model_used,
      tokens_used,
      latency_ms,
      success,
      error_message,
    });

    logger.info(
      `AI interaction logged: module=${moduleName}, success=${success}, ` +
        `tokens=${tokens_used}, latency=${latency_ms}ms`
    );

    return logEntry;
  } catch (err) {
    logger.error(`Failed to log AI interaction: ${err.message}`);
    throw err;
  }
}

module.exports = { logAiInteraction };
