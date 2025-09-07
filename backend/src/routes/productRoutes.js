const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

// Route lấy danh sách sản phẩm
router.get("/products", productController.getProducts);

module.exports = router;