const express = require("express");
const storeController = require("../controllers/storeController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", storeController.getAllStores);
router.get("/:id", storeController.getStoreById);
router.post("/", authMiddleware, storeController.createStore);

router.delete("/:id", authMiddleware, storeController.deleteStore);

module.exports = router;
