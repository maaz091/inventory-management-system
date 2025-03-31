const oracledb = require("oracledb");

async function recordMovement(store_id, product_id, quantity, movement_type) {
    const connection = await oracledb.getConnection();
    await connection.execute(
        "INSERT INTO stock_movements (store_id, product_id, quantity, movement_type) VALUES (:store_id, :product_id, :quantity, :movement_type)",
        [store_id, product_id, quantity, movement_type],
        { autoCommit: true }
    );
    await connection.close();
}

async function getMovementsByStore(store_id) {
    const connection = await oracledb.getConnection();
    const result = await connection.execute(
        "SELECT * FROM stock_movements WHERE store_id = :store_id",
        [store_id]
    );
    await connection.close();
    return result.rows;
}

module.exports = {
    recordMovement,
    getMovementsByStore
};
