const oracledb = require("oracledb");
require("dotenv").config();

// Simulated read replica connection
const readDB = {
  async getConnection() {
    try {
      const connection = await oracledb.getConnection({
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        connectString:
          process.env.READ_REPLICA_CONNECTION_STRING ||
          process.env.DB_CONNECTION_STRING,
      });
      return connection;
    } catch (error) {
      console.error("Error connecting to read replica:", error);
      throw error;
    }
  },
};

module.exports = readDB;
