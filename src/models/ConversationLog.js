/**
 * Rayeva AI Systems – ConversationLog Model (Module 4 – architecture outlined)
 */

const { DataTypes } = require("sequelize");
const { sequelize } = require("../database");

const ConversationLog = sequelize.define(
  "ConversationLog",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    session_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    user_phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    user_message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    bot_response: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    intent_detected: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    escalated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "conversation_logs",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

module.exports = ConversationLog;
