const oracledb = require("oracledb");

async function getAllProducts() {
    const connection = await oracledb.getConnection();
    const result = await connection.execute("SELECT * FROM products");
    await connection.close();
    return result.rows;
}

async function getProductById(product_id) {
    const connection = await oracledb.getConnection();
    const result = await connection.execute(
        "SELECT * FROM products WHERE product_id = :product_id",
        [product_id]
    );
    await connection.close();
    return result.rows[0];
}

async function createProduct(name, price) {
    const connection = await oracledb.getConnection();
    await connection.execute(
        "INSERT INTO products (name, price) VALUES (:name, :price)",
        [name, price],
        { autoCommit: true }
    );
    await connection.close();
}

async function updateProduct(product_id, name, price) {
    const connection = await oracledb.getConnection();
    await connection.execute(
        "UPDATE products SET name = :name, price = :price WHERE product_id = :product_id",
        [name, price, product_id],
        { autoCommit: true }
    );
    await connection.close();
}

async function deleteProduct(product_id) {
    const connection = await oracledb.getConnection();
    await connection.execute(
        "DELETE FROM products WHERE product_id = :product_id",
        [product_id],
        { autoCommit: true }
    );
    await connection.close();
}

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
