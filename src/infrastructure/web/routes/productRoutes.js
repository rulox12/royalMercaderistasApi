const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

router.post("/", productController.createProduct);
router.delete("/", productController.deleteProduct);
router.get("/:productId", productController.getProduct);
router.put("/:productId", productController.updateProduct);
router.get("/", productController.getProducts);

module.exports = router;
