const initializeDB = require("./config/database");

async function setupDatabase() {
    try {
        const db = await initializeDB();

        await db.exec(`CREATE TABLE IF NOT EXISTS products (      
            product_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            quantity INTEGER NOT NULL check (quantity>=0)
        )`);


        //helps track when and why inventory changed
        db.run(`CREATE TABLE IF NOT EXISTS stock_movements (
        movement_id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL check(quantity > 0),
        movement_type TEXT CHECK(movement_type IN ('STOCK_IN', 'SALE', 'MANUAL_REMOVE')),
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(product_id)
    )`);
        console.log("Database setup completed.");

    } catch (error) {
        console.error("error setting up database:", error)
    }

}

setupDatabase();
