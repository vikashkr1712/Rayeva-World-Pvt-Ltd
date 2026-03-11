/**
 * Rayeva AI Systems – Main Express Application
 * Entry point with CORS, lifecycle events, and route registration.
 */

const path = require("path");
const express = require("express");
const cors = require("cors");
const config = require("./config");
const { initDb } = require("./database");
const logger = require("./ai/logger");

// Import routes
const categoryRouter = require("./routes/category");
const proposalRouter = require("./routes/proposal");
const logsRouter = require("./routes/logs");
const impactRouter = require("./routes/impact");
const chatRouter = require("./routes/chat");

// Ensure all models are loaded
require("./models");

const app = express();

// ── Middleware ───────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Static Frontend ─────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "..", "public")));

// ── Register Routes ─────────────────────────────────────────────────
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/proposals", proposalRouter);
app.use("/api/v1/logs", logsRouter);
app.use("/api/v1/impact", impactRouter);
app.use("/api/v1/chat", chatRouter);

// ── Health & Info ───────────────────────────────────────────────────
const isDemo = !config.OPENAI_API_KEY || config.OPENAI_API_KEY === "your-openai-api-key-here";

app.get("/api/info", (_req, res) => {
  res.json({
    service: "Rayeva AI Systems",
    version: "1.0.0",
    mode: isDemo ? "demo" : "live",
    description: "AI-powered modules for sustainable commerce",
    dashboard: "/",
    modules: {
      module_1: {
        name: "AI Auto-Category & Tag Generator",
        status: "fully_implemented",
        endpoints: [
          "POST /api/v1/categories/categorize",
          "GET  /api/v1/categories/products",
          "GET  /api/v1/categories/products/{id}",
        ],
      },
      module_2: {
        name: "AI B2B Proposal Generator",
        status: "fully_implemented",
        endpoints: [
          "POST /api/v1/proposals/generate",
          "GET  /api/v1/proposals/",
          "GET  /api/v1/proposals/{id}",
        ],
      },
      module_3: {
        name: "AI Impact Reporting Generator",
        status: "fully_implemented",
        endpoints: [
          "POST /api/v1/impact/generate",
          "GET  /api/v1/impact/",
          "GET  /api/v1/impact/{id}",
        ],
      },
      module_4: {
        name: "AI WhatsApp Support Bot",
        status: "fully_implemented",
        endpoints: [
          "POST /api/v1/chat/message",
          "GET  /api/v1/chat/conversations",
          "GET  /api/v1/chat/sessions/{sessionId}",
        ],
      },
    },
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "healthy", environment: config.APP_ENV, mode: isDemo ? "demo" : "live" });
});

// ── Global Error Handler (must be AFTER routes) ─────────────────────
app.use((err, _req, res, _next) => {
  logger.error(`Unhandled exception: ${err.message}`);
  return res
    .status(500)
    .json({ error: "Internal server error", detail: err.message });
});

// ── Start Server ────────────────────────────────────────────────────
async function start() {
  try {
    logger.info("🚀 Rayeva AI Systems starting up...");
    await initDb();
    logger.info("✅ Database initialized");

    app.listen(config.PORT, () => {
      logger.info(
        `🌐 Server running on http://localhost:${config.PORT}`
      );
      logger.info(
        `📋 Health check: http://localhost:${config.PORT}/health`
      );
    });
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
}

start();

module.exports = app;
