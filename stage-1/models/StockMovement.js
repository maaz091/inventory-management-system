const initializeDB = require("../config/database");

async function recordStockMovement(product_id, quantity, movement_type) {
    const db = await initializeDB();
    await db.run(
        "INSERT INTO stock_movements (product_id, quantity, movement_type) VALUES (?, ?, ?)",
        [product_id, quantity, movement_type]
    );
}

module.exports = { recordStockMovement };
