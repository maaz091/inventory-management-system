const oracledb = require("oracledb");


async function getStockById(stockId) {
    const connection = await oracledb.getConnection();
    try {
        const result = await connection.execute(
            `SELECT STOCK_ID, STORE_ID, PRODUCT_ID, QUANTITY FROM STOCK WHERE STOCK_ID = :stockId`,
            [stockId],
            { outFormat: oracledb.OUT_FORMAT_OBJECT } // Fix: Return objects instead of array
        );

        if (result.rows.length === 0) {
            return null; // Fix: Handle no stock found
        }

        return result.rows[0]; // Fix: Return first object directly
    } finally {
        await connection.close();
    }
}



async function getStockByStore(store_id) {
    const connection = await oracledb.getConnection();
    const result = await connection.execute(
        "SELECT * FROM stock WHERE store_id = :store_id",
        [store_id]
    );
    await connection.close();
    return result.rows;
}


async function updateStockQuantity(stockId, quantity) {
    const connection = await oracledb.getConnection();
    try {
        const result = await connection.execute(
            `UPDATE stock SET quantity = :quantity WHERE stock_id = :stockId`,
            { quantity, stockId },
            { autoCommit: true }
        );

        return result.rowsAffected; // Returns the number of updated rows
    } catch (error) {
        console.error("Error updating stock quantity:", error);
        throw error;
    } finally {
        await connection.close();
    }
}

async function addStock(store_id, product_id, quantity) {
    const connection = await oracledb.getConnection();
    await connection.execute(
        "INSERT INTO stock (store_id, product_id, quantity) VALUES (:store_id, :product_id, :quantity)",
        [store_id, product_id, quantity],
        { autoCommit: true }
    );
    await connection.close();
}

module.exports = {
    getStockById,
    getStockByStore,
    updateStockQuantity,
    addStock,
};
