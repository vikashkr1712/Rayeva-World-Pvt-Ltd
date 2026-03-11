/**
 * Rayeva AI Systems – Module 1 API Routes: Category & Tag Generator
 */

const express = require("express");
const router = express.Router();
const { productInputSchema } = require("../schemas");
const { categorizeProduct } = require("../modules/categoryTagger");
const { Product } = require("../models");
const logger = require("../ai/logger");

/**
 * POST /api/v1/categories/categorize
 * Categorize a product using AI.
 */
router.post("/categorize", async (req, res) => {
  try {
    // Validate input
    const { error, value } = productInputSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        error: "Validation failed",
        detail: error.details.map((d) => d.message).join("; "),
        module: "category_tagger",
      });
    }

    const result = await categorizeProduct(
      value.name,
      value.description,
      value.price || null
    );
    return res.json(result);
  } catch (err) {
    if (err.message.startsWith("AI categorization failed")) {
      logger.error(`Categorization failed: ${err.message}`);
      return res.status(400).json({ error: err.message, module: "category_tagger" });
    }
    logger.error(`Unexpected error in categorization: ${err.message}`);
    return res.status(500).json({
      error: "Internal server error during categorization",
      module: "category_tagger",
    });
  }
});

/**
 * GET /api/v1/categories/products
 * List all categorized products.
 */
router.get("/products", async (req, res) => {
  try {
    const skip = parseInt(req.query.skip, 10) || 0;
    const limit = parseInt(req.query.limit, 10) || 20;

    const products = await Product.findAll({
      offset: skip,
      limit,
    });

    const result = products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      primary_category: p.primary_category,
      sub_category: p.sub_category,
      seo_tags: p.seo_tags,
      sustainability_filters: p.sustainability_filters,
      created_at: p.created_at || null,
      ai_categorized_at: p.ai_categorized_at || null,
    }));

    return res.json(result);
  } catch (err) {
    logger.error(`Error listing products: ${err.message}`);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/v1/categories/products/:productId
 * Get a single product by ID.
 */
router.get("/products/:productId", async (req, res) => {
  try {
    const productId = parseInt(req.params.productId, 10);
    const product = await Product.findByPk(productId);

    if (!product) {
      return res
        .status(404)
        .json({ error: `Product with id ${productId} not found` });
    }

    return res.json({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      primary_category: product.primary_category,
      sub_category: product.sub_category,
      seo_tags: product.seo_tags,
      sustainability_filters: product.sustainability_filters,
      created_at: product.created_at || null,
      ai_categorized_at: product.ai_categorized_at || null,
    });
  } catch (err) {
    logger.error(`Error getting product: ${err.message}`);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
