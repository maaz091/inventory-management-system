const oracledb = require("oracledb");
require("dotenv").config();
// Right after require('dotenv').config();
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
console.log("DB_CONNECTION_STRING:", process.env.DB_CONNECTION_STRING);

async function initializeDB() {
  try {
    console.log("Attempting to connect with the following details:");
    console.log(`User: ${process.env.DB_USER}`);
    console.log(`Password: ${process.env.DB_PASSWORD}`);
    console.log(`Connection String: ${process.env.DB_CONNECTION_STRING}`);

    await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
        connectString: process.env.DB_CONNECTION_STRING,

    });

    console.log("Oracle DB pool created successfully");
  } catch (err) {
    console.error("Failed to create Oracle DB pool:", err);
    throw err;
  }
}

module.exports = { initializeDB };
//const connection = await oracledb.getConnection();
