const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { isAdmin } = require("../middlewares/auth");
const upload = require("../middlewares/upload");
// Customer routes
router.get("/products", productController.getProducts);

// Admin routes
router.get("/admin/products", productController.getProducts);
router.post("/admin/products", isAdmin, upload.single("image"), productController.create);
router.get("/admin/products/:id", isAdmin, productController.getById);
router.post("/admin/products/:id", isAdmin, upload.single("image"), productController.update);
router.delete("/admin/products/:id", isAdmin, productController.remove);
router.put("/admin/products/:id/restore", isAdmin, productController.restore);
router.delete("/admin/products/:id/hard", isAdmin, productController.hardDelete);


module.exports = router;
