/**
 * Rayeva AI Systems – ImpactReport Model (Module 3 – architecture outlined)
 */

const { DataTypes } = require("sequelize");
const { sequelize } = require("../database");

const ImpactReport = sequelize.define(
  "ImpactReport",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    order_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    plastic_saved_kg: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    carbon_avoided_kg: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    local_sourcing_summary: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    human_readable_statement: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    full_ai_response: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    tableName: "impact_reports",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

module.exports = ImpactReport;
