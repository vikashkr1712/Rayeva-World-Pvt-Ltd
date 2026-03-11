/**
 * Rayeva AI Systems – AILog Model (shared across all modules)
 */

const { DataTypes } = require("sequelize");
const { sequelize } = require("../database");

const AILog = sequelize.define(
  "AILog",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    module: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    prompt: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    response: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    model_used: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    tokens_used: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    latency_ms: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    success: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "ai_logs",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

module.exports = AILog;
