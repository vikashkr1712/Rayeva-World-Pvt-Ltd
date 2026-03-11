/**
 * Rayeva AI Systems – B2BProposal Model (Module 2)
 */

const { DataTypes } = require("sequelize");
const { sequelize } = require("../database");

const B2BProposal = sequelize.define(
  "B2BProposal",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    client_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    client_industry: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    budget_limit: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    requirements: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // AI-generated fields
    product_mix: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    budget_allocation: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    cost_breakdown: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    impact_summary: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    full_ai_response: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    ai_generated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "b2b_proposals",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

module.exports = B2BProposal;
