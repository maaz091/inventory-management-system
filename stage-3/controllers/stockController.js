const Stock = require("../models/stockModel");
const StockMovement = require("../models/stockMovementModel");
const Store = require("../models/storeModel");
const Product = require("../models/productModel");
const readDB = require("../config/readDB");
const redisClient = require("../config/redisClient");
const Queue = require("bull");
const auditLogModel = require("../models/auditLogModel");

const stockQueue = new Queue("stock-updates", {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
  },
});

async function getStockById(req, res) {
  try {
    const cacheKey = `stock:${req.params.stockId}`;

    // Try to get from cache first
    const cachedStock = await redisClient.get(cacheKey);
    if (cachedStock) {
      console.log(`[Cache Hit] Stock ID: ${req.params.stockId}`);
      return res.json(JSON.parse(cachedStock));
    }

    // If not in cache, get from read replica
    const connection = await readDB.getConnection();
    const stockData = await Stock.getStockById(req.params.stockId, connection);
    await connection.close();

    if (!stockData) {
      return res.status(404).json({ message: "Stock not found" });
    }

    // Cache the result for 60 seconds
    await redisClient.set(cacheKey, JSON.stringify(stockData), {
      EX: 60,
    });

    res.json(stockData);
  } catch (error) {
    console.error("Error fetching stock:", error);
    res.status(500).json({ message: "Error fetching stock", error });
  }
}

async function getStockByStore(req, res) {
  try {
    const cacheKey = `stock:store:${req.params.storeId}`;

    // Try to get from cache first
    const cachedStock = await redisClient.get(cacheKey);
    if (cachedStock) {
      console.log(`[Cache Hit] Store ID: ${req.params.storeId}`);
      return res.json(JSON.parse(cachedStock));
    }

    // If not in cache, get from read replica
    const connection = await readDB.getConnection();
    const stock = await Stock.getStockByStore(req.params.storeId, connection);
    await connection.close();

    console.log(
      "Raw stock data from database:",
      JSON.stringify(stock, null, 2)
    );

    if (!stock || stock.length === 0) {
      console.warn(`No stock found for Store ID ${req.params.storeId}`);
      return res.status(404).json({ message: "No stock found for this store" });
    }

    const formattedStock = stock.map((item) => ({
      stockId: item.STOCK_ID,
      storeId: item.STORE_ID,
      productId: item.PRODUCT_ID,
      quantity: item.QUANTITY,
    }));

    // Cache the result for 60 seconds
    await redisClient.set(cacheKey, JSON.stringify(formattedStock), {
      EX: 60,
    });

    res.json(formattedStock);
  } catch (error) {
    console.error("Error fetching stock:", error);
    res.status(500).json({ message: "Error fetching stock", error });
  }
}

async function addStock(req, res) {
  try {
    const { store_id, product_id, quantity } = req.body;
    console.log(
      `[Stock Addition Request] Store: ${store_id}, Product: ${product_id}, Quantity: ${quantity}`
    );

    const storeExists = await Store.getStoreById(store_id);
    if (!storeExists) {
      console.warn(`[Stock Addition Failed] Store ${store_id} not found`);
      return res.status(404).json({ error: "Store not found" });
    }

    const productExists = await Product.getProductById(product_id);
    if (!productExists) {
      console.warn(`[Stock Addition Failed] Product ${product_id} not found`);
      return res.status(404).json({ error: "Product not found" });
    }

    // Enqueue the stock update job
    const job = await stockQueue.add({
      action: "STOCK_IN",
      storeId: store_id,
      productId: product_id,
      quantity: quantity,
    });
    console.log(
      `[Stock Job Queued] Store: ${store_id}, Product: ${product_id}, Quantity: ${quantity}, Job ID: ${job.id}`
    );

    res.status(202).json({
      message: "Stock update queued successfully",
      jobId: job.id,
    });
  } catch (error) {
    console.error("Error adding stock:", error);
    res.status(500).json({ message: "Error adding stock", error });
  }
}

async function updateStockQuantity(req, res) {
  try {
    const { quantity, movement_type } = req.body;
    const { stockId } = req.params;
    console.log(
      `[Stock Update Request] ID: ${stockId}, Type: ${movement_type}, Quantity: ${quantity}`
    );

    const parsedQuantity = Number(quantity);
    if (isNaN(parsedQuantity)) {
      console.warn(`[Stock Update Failed] Invalid quantity: ${quantity}`);
      return res.status(400).json({ error: "Invalid quantity" });
    }

    const stock = await Stock.getStockById(stockId);
    if (!stock) {
      console.warn(`[Stock Update Failed] Stock ID ${stockId} not found`);
      return res.status(404).json({ error: "Stock not found" });
    }

    // Enqueue the stock update job
    const job = await stockQueue.add({
      action: movement_type,
      stockId: stockId,
      storeId: stock.STORE_ID,
      productId: stock.PRODUCT_ID,
      quantity: parsedQuantity,
    });
    console.log(
      `[Stock Update Job Queued] ID: ${stockId}, Type: ${movement_type}, Job ID: ${job.id}, Store: ${stock.STORE_ID}, Product: ${stock.PRODUCT_ID}`
    );

    res.status(202).json({
      message: "Stock update queued successfully",
      jobId: job.id,
    });
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({ message: "Error updating stock", error });
  }
}

module.exports = {
  getStockById,
  getStockByStore,
  addStock,
  updateStockQuantity,
};
