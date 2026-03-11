/**
 * Rayeva AI Systems – Winston Logger
 * Shared logger instance for the entire application.
 */

const winston = require("winston");
const config = require("../config");

const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(
      ({ timestamp, level, message }) =>
        `${timestamp} | ${level.toUpperCase().padEnd(8)} | ${message}`
    )
  ),
  transports: [new winston.transports.Console()],
});

module.exports = logger;
