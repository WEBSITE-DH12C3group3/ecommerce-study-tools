const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { isAdmin } = require("../middlewares/auth");

// Customer routes
router.get("/products", productController.getProducts); // Lấy danh sách sản phẩm cho khách hàng (không cần auth)

// Admin routes
router.get("/admin/products", productController.getProducts); // Lấy danh sách (phân trang, filter)
router.post("/admin/products", isAdmin, productController.create); // Thêm mới
router.get("/admin/products/:id", isAdmin, productController.getById); // Lấy theo ID
router.put("/admin/products/:id", isAdmin, productController.update); // Cập nhật
router.delete("/admin/products/:id", isAdmin, productController.remove); // Xóa

module.exports = router;