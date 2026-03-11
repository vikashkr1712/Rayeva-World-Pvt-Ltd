/**
 * Rayeva AI Systems – Product Model (Module 1)
 */

const { DataTypes } = require("sequelize");
const { sequelize } = require("../database");

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    // AI-generated fields
    primary_category: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    sub_category: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    seo_tags: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    sustainability_filters: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    ai_categorized_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "products",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

module.exports = Product;
