const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

// CRUD API
router.get("/", categoryController.getAll);
router.post("/", categoryController.create);
router.get("/:id", categoryController.getById);
router.put("/:id", categoryController.update);
router.delete("/:id", categoryController.remove);

module.exports = router;
