const express = require("express");
const router = express.Router();
const supplierController = require("../controllers/supplierController");
const { isAdmin } = require("../middlewares/auth");

// TẤT CẢ path đều bắt đầu bằng /admin/suppliers
router.get("/admin/suppliers",         isAdmin, supplierController.getSuppliers); 
router.post("/admin/suppliers",        isAdmin, supplierController.create);       
router.get("/admin/suppliers/export",  isAdmin, supplierController.exportCsv);    
router.get("/admin/suppliers/:id",     isAdmin, supplierController.getById);     
router.put("/admin/suppliers/:id",     isAdmin, supplierController.update);    
router.delete("/admin/suppliers/:id",  isAdmin, supplierController.remove);
module.exports = router;
