const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventorycontroller");

router.post("/addProduct", inventoryController.addProduct);
router.get("/getproducts", inventoryController.getAllProducts);
router.post("/updateStock", inventoryController.updateStock);

module.exports = router;
