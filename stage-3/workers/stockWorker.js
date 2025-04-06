const Queue = require("bull");
const Stock = require("../models/stockModel");
const StockMovement = require("../models/stockMovementModel");
const auditLogModel = require("../models/auditLogModel");
const redisClient = require("../config/redisClient");
require("dotenv").config();

const stockQueue = new Queue("stock-updates", {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
  },
});

// Helper function to invalidate stock caches
async function invalidateStockCaches(stockId, storeId) {
  try {
    // Invalidate specific stock cache
    await redisClient.del(`stock:${stockId}`);
    // Invalidate store's stock cache
    await redisClient.del(`stock:store:${storeId}`);
    console.log(
      `[Cache Invalidation] Stock ID: ${stockId}, Store ID: ${storeId}`
    );
  } catch (error) {
    console.error("Error invalidating caches:", error);
  }
}

// Process stock update jobs
stockQueue.process(async (job) => {
  const { action, stockId, storeId, productId, quantity } = job.data;
  if (action === "SALE") {
    console.log(`Processing stock job: ${action}`, { stockId, quantity });
  } else {
    console.log(`Processing stock job: ${action}`, {
      stockId,
      storeId,
      productId,
      quantity,
    });
  }

  try {
    switch (action) {
      case "STOCK_IN": {
        const stockInStoreId = parseInt(storeId, 10);
        const stockInProductId = parseInt(productId, 10);
        const stockInQuantity = parseInt(quantity, 10);

        if (
          isNaN(stockInStoreId) ||
          isNaN(stockInProductId) ||
          isNaN(stockInQuantity)
        ) {
          throw new Error("Invalid store ID, product ID, or quantity");
        }

        console.log(
          `Adding stock: Store ${stockInStoreId}, Product ${stockInProductId}, Quantity ${stockInQuantity}`
        );
        const newStockId = await Stock.addStock(
          stockInStoreId,
          stockInProductId,
          stockInQuantity
        );
        await StockMovement.recordMovement(
          stockInStoreId,
          stockInProductId,
          stockInQuantity,
          "STOCK_IN"
        );
        await auditLogModel.logAction(
          "STOCK_IN",
          newStockId,
          stockInStoreId,
          stockInProductId,
          stockInQuantity
        );

        // Invalidate caches after successful stock addition
        await invalidateStockCaches(newStockId, stockInStoreId);

        return { success: true, stockId: newStockId };
      }

      case "SALE": {
        const parsedStockId = parseInt(stockId, 10);
        const currentStock = await Stock.getStockById(parsedStockId);
        if (!currentStock) throw new Error("Stock not found");

        const currentQty = parseInt(currentStock.quantity, 10);
        const saleQty = parseInt(quantity, 10);
        const saleStoreId = parseInt(currentStock.store_id, 10);
        const saleProductId = parseInt(currentStock.product_id, 10);

        if (
          isNaN(currentQty) ||
          isNaN(saleQty) ||
          isNaN(saleStoreId) ||
          isNaN(saleProductId)
        ) {
          throw new Error("Invalid stock or quantity values");
        }

        if (currentQty < saleQty) {
          throw new Error(
            `Insufficient stock (Current: ${currentQty}, Requested: ${saleQty})`
          );
        }

        console.log(
          `Processing sale: Stock ${parsedStockId}, Quantity ${saleQty}, Current ${currentQty}`
        );
        const newQuantity = currentQty - saleQty;
        await Stock.updateStockQuantity(parsedStockId, newQuantity);
        await StockMovement.recordMovement(
          saleStoreId,
          saleProductId,
          saleQty,
          "SALE"
        );
        await auditLogModel.logAction(
          "SALE",
          parsedStockId,
          saleStoreId,
          saleProductId,
          saleQty
        );

        // Invalidate caches after successful sale
        await invalidateStockCaches(parsedStockId, saleStoreId);

        return { success: true };
      }

      case "MANUAL_REMOVE": {
        const parsedRemoveStockId = parseInt(stockId, 10);
        const stock = await Stock.getStockById(parsedRemoveStockId);
        if (!stock) throw new Error("Stock not found");

        const removeStoreId = parseInt(stock.store_id, 10);
        const removeProductId = parseInt(stock.product_id, 10);
        const stockQty = parseInt(stock.quantity, 10);
        const removeQty = parseInt(quantity, 10);

        if (isNaN(stockQty) || isNaN(removeQty)) {
          throw new Error("Invalid quantity values");
        }

        if (stockQty < removeQty) {
          throw new Error(
            `Insufficient stock (Current: ${stockQty}, Requested: ${removeQty})`
          );
        }

        console.log(
          `Removing stock: Stock ${parsedRemoveStockId}, Quantity ${removeQty}, Current ${stockQty}`
        );
        const remainingQuantity = stockQty - removeQty;
        await Stock.updateStockQuantity(parsedRemoveStockId, remainingQuantity);
        await StockMovement.recordMovement(
          removeStoreId,
          removeProductId,
          removeQty,
          "MANUAL_REMOVE"
        );
        await auditLogModel.logAction(
          "MANUAL_REMOVE",
          parsedRemoveStockId,
          removeStoreId,
          removeProductId,
          removeQty
        );

        // Invalidate caches after successful removal
        await invalidateStockCaches(parsedRemoveStockId, removeStoreId);

        return { success: true };
      }

      default:
        throw new Error(`Unknown action type: ${action}`);
    }
  } catch (error) {
    console.error("Error processing stock update:", error);
    throw error;
  }
});

// Add error handling
stockQueue.on("error", (error) => {
  console.error("Stock Queue Error:", error);
});

stockQueue.on("failed", (job, error) => {
  console.error("Job Failed:", job.id, error);
});

console.log("Stock update worker started");
