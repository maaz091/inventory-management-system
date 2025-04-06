const oracledb = require("oracledb");

async function getAllStores() {
    const connection = await oracledb.getConnection();
    const result = await connection.execute("SELECT * FROM stores");
    await connection.close();
    return result.rows;
}

async function getStoreById(store_id) {
    const connection = await oracledb.getConnection();
    const result = await connection.execute(
        "SELECT * FROM stores WHERE store_id = :store_id",
        [store_id]
    );
    await connection.close();
    return result.rows[0];
}

async function createStore(name, location) {
    const connection = await oracledb.getConnection();
    await connection.execute(
        "INSERT INTO stores (name, location) VALUES (:name, :location)",
        [name, location],
        { autoCommit: true }
    );
    await connection.close();
}

async function deleteStore(store_id) {
    const connection = await oracledb.getConnection();
    await connection.execute(
        "DELETE FROM stores WHERE store_id = :store_id",
        [store_id],
        { autoCommit: true }
    );
    await connection.close();
}

module.exports = {
    getAllStores,
    getStoreById,
    createStore,
    deleteStore
};
