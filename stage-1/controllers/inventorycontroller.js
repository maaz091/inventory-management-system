const Product = require("../models/Product");
const StockMovement = require("../models/StockMovement");

async function addProduct(req, res) {
  try {
    const { name, quantity } = req.body;
    await Product.addProduct(name, quantity);
    res.json({ message: "Product added successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error adding product" });
  }
}

async function getAllProducts(req, res) {
  try {
    const products = await Product.getAllProducts();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Error fetching products" });
  }
}

async function updateStock(req, res) {
  try {
    const { product_id, quantity, movement_type } = req.body;

    const product = await Product.getProductById(product_id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    let newQuantity = product.quantity;
    if (movement_type === "STOCK_IN") newQuantity += quantity;
    else if (movement_type === "SALE" || movement_type === "MANUAL_REMOVE")
      newQuantity -= quantity;

    if (newQuantity < 0)
      return res.status(400).json({ error: "Not enough stock" });

    await Product.updateProductQuantity(product_id, newQuantity);
    await StockMovement.recordStockMovement(
      product_id,
      quantity,
      movement_type
    );

    res.json({ message: "Stock updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error updating stock" });
  }
}

module.exports = { addProduct, getAllProducts, updateStock };
