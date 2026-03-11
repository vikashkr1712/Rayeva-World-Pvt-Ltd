/**
 * Rayeva AI Systems – Database Setup (Sequelize + SQLite)
 */

const { Sequelize } = require("sequelize");
const config = require("./config");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: config.DATABASE_PATH,
  logging: config.DEBUG ? console.log : false,
});

/**
 * Initialize database – sync all models.
 */
async function initDb() {
  await sequelize.sync();
}

module.exports = { sequelize, initDb };
