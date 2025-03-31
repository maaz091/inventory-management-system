const Stock = require("../models/stockModel");
const StockMovement = require("../models/stockMovementModel");
const Store = require("../models/storeModel");  // Adjust path if needed
const Product = require("../models/productModel");

async function getStockById(req, res) {
    try {
        const stockData = await Stock.getStockById(req.params.stockId);

        if (!stockData) {
            return res.status(404).json({ message: "Stock not found" });
        }

        res.json(stockData); // Now stockData is an object, no need to manually format it
    } catch (error) {
        console.error("Error fetching stock:", error);
        res.status(500).json({ message: "Error fetching stock", error });
    }
}





async function getStockByStore(req, res) {
    try {
        const stock = await Stock.getStockByStore(req.params.storeId);

        if (!stock || stock.length === 0) {
            console.warn(`No stock found for Store ID ${req.params.storeId}`);
            return res.status(404).json({ message: "No stock found for this store" });
        }
        const formattedStock = stock.map(item => ({
            stockId: item[0],
            storeId: item[1],
            productId: item[2]
        }));

        console.log(`Fetched stock for Store ID ${req.params.storeId}:`, formattedStock);
        res.json(formattedStock);
    } catch (error) {
        console.error("Error fetching stock:", error);
        res.status(500).json({ message: "Error fetching stock", error });
    }
}

async function addStock(req, res) {
    try {
        const { store_id, product_id, quantity } = req.body;
        
        const storeExists = await Store.getStoreById(store_id);
        if (!storeExists) {
            console.warn(`Store ID ${store_id} does not exist`);
            return res.status(404).json({ error: "Store not found" });
        }
        const productExists = await Product.getProductById(product_id);
        if (!productExists) {
            console.warn(`Product ID ${product_id} does not exist`);
            return res.status(404).json({ error: "Product not found" });
        }
        await Stock.addStock(store_id, product_id, quantity);
        await StockMovement.recordMovement(store_id, product_id, quantity, "STOCK_IN");

        console.log(`Stock added: Store ${store_id}, Product ${product_id}, Quantity ${quantity}`);
        res.status(201).json({ message: "Stock added successfully" });

    } catch (error) {
        console.error("Error adding stock:", error);
        res.status(500).json({ message: "Error adding stock", error });
    }
}



async function updateStockQuantity(req, res) {
    try {
        const { quantity, movement_type } = req.body;
        const { stockId } = req.params;

        const parsedQuantity = Number(quantity);
        if (isNaN(parsedQuantity)) {
            return res.status(400).json({ error: "Invalid quantity" });
        }

        const stock = await Stock.getStockById(stockId);
        if (!stock) {
            return res.status(404).json({ error: "Stock not found" });
        }

        if (typeof stock.QUANTITY !== "number") {
            return res.status(400).json({ error: "Stock quantity is invalid in the database" });
        }

        let newQuantity = stock.QUANTITY;

        // Adjust stock based on movement type
        if (movement_type === "STOCK_IN") {
            newQuantity += parsedQuantity;
        } else if (movement_type === "SALE" || movement_type === "MANUAL_REMOVE") {
            newQuantity -= parsedQuantity;
        }

        if (isNaN(newQuantity) || newQuantity < 0) {
            return res.status(400).json({ error: "Not enough stock" });
        }

        await Stock.updateStockQuantity(stockId, newQuantity);
        await StockMovement.recordMovement(stock.STORE_ID, stock.PRODUCT_ID, parsedQuantity, movement_type);

        res.json({ message: "Stock updated successfully", newQuantity });

    } catch (error) {
        res.status(500).json({ message: "Error updating stock", error });
    }
}


module.exports = {
    
    getStockById,addStock, getStockByStore, updateStockQuantity



};