/**
 * Rayeva AI Systems – Model Index
 * Exports all models and sets up associations.
 */

const Product = require("./Product");
const B2BProposal = require("./B2BProposal");
const ImpactReport = require("./ImpactReport");
const ConversationLog = require("./ConversationLog");
const AILog = require("./AILog");

module.exports = {
  Product,
  B2BProposal,
  ImpactReport,
  ConversationLog,
  AILog,
};
