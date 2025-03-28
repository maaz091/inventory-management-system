const sqlite3 = require("sqlite3").verbose();
const {open} = require("sqlite");

/**
 * Asynchronous function to initialize the database connection.
 * This function returns a database connection that can be used throughout the project.
 */
async function initializeDB() {
    return open({
        filename: "inventory.db", // Name of the SQLite database file. If it doesn’t exist, SQLite will create it.
        driver: sqlite3.Database, // Specifies the database driver to use (sqlite3).
    });
}

// Exporting the initializeDB function so it can be imported and used in other files.
module.exports = initializeDB;
