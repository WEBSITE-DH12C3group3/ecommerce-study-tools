const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { isAdmin } = require("../middlewares/auth");

// Routes cho customer
router.get("/customer/categories", categoryController.getAll);

// Routes cho admin
router.get("/admin/categories", isAdmin, categoryController.getAll);
router.post("/admin/categories", isAdmin, categoryController.create);
router.get("/admin/categories/:id", isAdmin, categoryController.getById);
router.put("/admin/categories/:id", isAdmin, categoryController.update);
router.delete("/admin/categories/:id", isAdmin, categoryController.remove);

module.exports = router;