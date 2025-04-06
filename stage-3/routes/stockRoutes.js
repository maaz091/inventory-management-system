const express = require("express");
const stockController = require("../controllers/stockController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/:storeId", stockController.getStockByStore);
router.post("/", authMiddleware, stockController.addStock);
router.put("/:stockId", authMiddleware, stockController.updateStockQuantity);

module.exports = router;
