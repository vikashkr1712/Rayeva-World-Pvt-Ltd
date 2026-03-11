/**
 * Rayeva AI Systems – Joi Validation Schemas (Request / Response Validation)
 */

const Joi = require("joi");

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Module 1 – Category & Tag Generator
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const productInputSchema = Joi.object({
  name: Joi.string().min(2).max(255).required().messages({
    "string.min": "Product name must be at least 2 characters",
    "string.max": "Product name must be at most 255 characters",
    "any.required": "Product name is required",
  }),
  description: Joi.string().min(10).required().messages({
    "string.min": "Product description must be at least 10 characters",
    "any.required": "Product description is required",
  }),
  brand: Joi.string().max(255).allow(null, "").optional(),
  material_tags: Joi.array().items(Joi.string()).optional(),
  price: Joi.number().min(0).allow(null).optional().messages({
    "number.min": "Price must be >= 0",
  }),
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Module 2 – B2B Proposal Generator
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const proposalInputSchema = Joi.object({
  client_name: Joi.string().min(2).max(255).required().messages({
    "string.min": "Client name must be at least 2 characters",
    "string.max": "Client name must be at most 255 characters",
    "any.required": "Client name is required",
  }),
  client_industry: Joi.string().min(2).max(100).required().messages({
    "string.min": "Client industry must be at least 2 characters",
    "string.max": "Client industry must be at most 100 characters",
    "any.required": "Client industry is required",
  }),
  budget_limit: Joi.number().greater(0).required().messages({
    "number.greater": "Budget limit must be greater than 0",
    "any.required": "Budget limit is required",
  }),
  requirements: Joi.string().allow(null, "").optional(),
  sustainability_priority: Joi.string()
    .valid("low", "medium", "high")
    .default("medium")
    .optional(),
});

module.exports = {
  productInputSchema,
  proposalInputSchema,
};
