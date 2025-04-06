const oracledb = require("oracledb");
require("dotenv").config();

async function initializeDB() {
  try {
    await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECTION_STRING,
      poolMin: 2,
      poolMax: 10,
      poolIncrement: 1,
    });
    console.log("Database pool created successfully");
  } catch (error) {
    console.error("Error creating database pool:", error);
    throw error;
  }
}

async function getConnection() {
  try {
    return await oracledb.getConnection();
  } catch (error) {
    console.error("Error getting database connection:", error);
    throw error;
  }
}

module.exports = {
  initializeDB,
  getConnection,
};
