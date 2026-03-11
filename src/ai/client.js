/**
 * Rayeva AI Systems – OpenAI Client Wrapper
 * Handles API calls with error handling and structured output parsing.
 * Falls back to intelligent mock responses when no API key is configured (demo mode).
 */

const OpenAI = require("openai");
const config = require("../config");
const logger = require("./logger");
const { getMockResponse } = require("./mockResponses");

class AIClient {
  /**
   * Wrapper around OpenAI API with structured JSON output support.
   */
  constructor() {
    this.useMock = !config.OPENAI_API_KEY || config.OPENAI_API_KEY === "" || config.OPENAI_API_KEY.startsWith("sk-your") || config.OPENAI_API_KEY === "your-openai-api-key-here";
    if (!this.useMock) {
      this.client = new OpenAI({ apiKey: config.OPENAI_API_KEY });
    } else {
      logger.info("⚡ Running in DEMO MODE (no OpenAI API key). Using mock AI responses.");
    }
    this.model = config.OPENAI_MODEL;
  }

  /**
   * Send a prompt to OpenAI and return structured result.
   * Falls back to mock responses when no API key is set.
   * @param {string} systemPrompt - System-level prompt
   * @param {string} userPrompt - User-level prompt
   * @param {number} [temperature=0.3] - Sampling temperature
   * @param {number} [maxTokens=2000] - Max tokens to generate
   * @returns {Promise<object>} - { response_text, parsed_json, tokens_used, latency_ms, success, error }
   */
  async generate(systemPrompt, userPrompt, temperature = 0.3, maxTokens = 2000) {
    // Use mock responses in demo mode
    if (this.useMock) {
      return getMockResponse(systemPrompt, userPrompt);
    }

    const startTime = Date.now();
    const result = {
      response_text: "",
      parsed_json: null,
      tokens_used: 0,
      latency_ms: 0,
      success: false,
      error: null,
    };

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature,
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
      });

      const rawText = response.choices[0]?.message?.content || "";
      result.response_text = rawText;
      result.tokens_used = response.usage?.total_tokens || 0;

      // Parse JSON from response
      const parsed = JSON.parse(rawText);
      result.parsed_json = parsed;
      result.success = true;
    } catch (err) {
      if (err instanceof SyntaxError) {
        result.error = `JSON parse error: ${err.message}`;
        logger.error(`Failed to parse AI response as JSON: ${err.message}`);
      } else {
        result.error = `OpenAI API error: ${err.message}`;
        logger.error(`OpenAI API call failed: ${err.message}`);
      }
    }

    result.latency_ms = Date.now() - startTime;
    return result;
  }
}

// Singleton instance
const aiClient = new AIClient();

module.exports = aiClient;
