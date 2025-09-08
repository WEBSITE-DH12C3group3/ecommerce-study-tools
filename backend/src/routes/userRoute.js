// backend/src/routes/userRoute.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { isAdmin } = require("../middlewares/auth");

// Admin User CRUD
router.get("/admin/users", isAdmin, userController.getUsers);
router.post("/admin/users", isAdmin, userController.create);
router.get("/admin/users/:id", isAdmin, userController.getById);
router.put("/admin/users/:id", isAdmin, userController.update);
router.delete("/admin/users/:id", isAdmin, userController.remove);

// Roles (để fill select)
router.get("/admin/roles", isAdmin, userController.getRoles);

module.exports = router;
