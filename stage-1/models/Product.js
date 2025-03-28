const initializeDB = require("../config/database");

async function addProduct(name, quantity) {
    const db = await initializeDB();
    await db.run("INSERT INTO products (name, quantity) VALUES (?, ?)", [name, quantity]);
}

async function getAllProducts() {
    const db = await initializeDB();
    return await db.all("SELECT * FROM products");
}

async function getProductById(product_id) {
    const db = await initializeDB();
    return await db.get("SELECT * FROM products WHERE product_id = ?", [product_id]);
}

async function updateProductQuantity(product_id, quantity) {
    const db = await initializeDB();
    await db.run("UPDATE products SET quantity = ? WHERE product_id = ?", [quantity, product_id]);
}

module.exports = { addProduct, getAllProducts, getProductById, updateProductQuantity };
