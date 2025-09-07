const express = require("express");
const router = express.Router();
const brandController = require("../controllers/brandController");
const { isAdmin } = require("../middlewares/auth");

// Routes cho customer
router.get("/customer/brands", brandController.getAll);

// Routes cho admin
router.get("/admin/brands", isAdmin, brandController.getAll);
// router.post("/admin/brands", isAdmin, brandController.create);
// router.get("/admin/brands/:id", isAdmin, brandController.getById);
// router.put("/admin/brands/:id", isAdmin, brandController.update);
// router.delete("/admin/brands/:id", isAdmin, brandController.remove);

module.exports = router;