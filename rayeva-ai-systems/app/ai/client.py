"""
Rayeva AI Systems – OpenAI Client Wrapper
Handles API calls with error handling, retries, and structured output parsing.
"""

import json
import time
import logging
from typing import Optional
from openai import OpenAI
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class AIClient:
    """Wrapper around OpenAI API with structured JSON output support."""

    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL

    def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.3,
        max_tokens: int = 2000,
    ) -> dict:
        """
        Send a prompt to OpenAI and return structured result.

        Returns:
            dict with keys: response_text, parsed_json, tokens_used, latency_ms, success, error
        """
        start_time = time.time()
        result = {
            "response_text": "",
            "parsed_json": None,
            "tokens_used": 0,
            "latency_ms": 0,
            "success": False,
            "error": None,
        }

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=temperature,
                max_tokens=max_tokens,
                response_format={"type": "json_object"},
            )

            raw_text = response.choices[0].message.content or ""
            result["response_text"] = raw_text
            result["tokens_used"] = response.usage.total_tokens if response.usage else 0

            # Parse JSON from response
            parsed = json.loads(raw_text)
            result["parsed_json"] = parsed
            result["success"] = True

        except json.JSONDecodeError as e:
            result["error"] = f"JSON parse error: {str(e)}"
            logger.error(f"Failed to parse AI response as JSON: {e}")
        except Exception as e:
            result["error"] = f"OpenAI API error: {str(e)}"
            logger.error(f"OpenAI API call failed: {e}")

        result["latency_ms"] = int((time.time() - start_time) * 1000)
        return result


# Singleton instance
ai_client = AIClient()
