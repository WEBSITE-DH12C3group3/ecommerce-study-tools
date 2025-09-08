const { Op } = require("sequelize");
const { Supplier } = require("../models");

// GET /api/admin/suppliers?page=&limit=&search=&nameSort=
exports.getSuppliers = async (req, res) => {
  try {
    const pageNum  = Math.max(parseInt(req.query.page  || '1', 10), 1);
    const limitNum = Math.max(parseInt(req.query.limit || '10', 10), 1);
    const offset   = (pageNum - 1) * limitNum;
    const search   = (req.query.search || "").trim();
    const nameSort = (req.query.nameSort || "").trim();

    let where = {};
    if (search) {
      where = {
        [Op.or]: [
          { supplier_name: { [Op.like]: `%${search}%` } },   // ✅ MySQL dùng LIKE
          { contact_info:  { [Op.like]: `%${search}%` } },
        ],
      };
    }

    let order = [];
    if (nameSort === "a-z") order.push(["supplier_name", "ASC"]);
    else if (nameSort === "z-a") order.push(["supplier_name", "DESC"]);

    const { count, rows } = await Supplier.findAndCountAll({
      where,
      order,
      limit: limitNum,
      offset,
    });

    res.json({
      suppliers: rows,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
    });
  } catch (err) {
    console.error("Lỗi chi tiết khi lấy nhà cung cấp:", err);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/admin/suppliers
exports.create = async (req, res) => {
  try {
    const supplier_name = (req.body.supplier_name || "").trim();
    const contact_info  = (req.body.contact_info  || "").trim();
    if (!supplier_name) return res.status(400).json({ error: "Tên nhà cung cấp là bắt buộc" });

    const created = await Supplier.create({
      supplier_name,
      contact_info: contact_info || null,
    });

    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/admin/suppliers/:id
exports.getById = async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) return res.status(404).json({ error: "Không tìm thấy nhà cung cấp" });
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/admin/suppliers/:id
exports.update = async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) return res.status(404).json({ error: "Không tìm thấy nhà cung cấp" });

    const supplier_name = (req.body.supplier_name || "").trim();
    const contact_info  = (req.body.contact_info  || "").trim();
    if (!supplier_name) return res.status(400).json({ error: "Tên nhà cung cấp là bắt buộc" });

    supplier.supplier_name = supplier_name;
    supplier.contact_info  = contact_info || null;
    await supplier.save();

    res.json(supplier);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/admin/suppliers/:id
exports.remove = async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) return res.status(404).json({ error: "Không tìm thấy nhà cung cấp" });
    await supplier.destroy();
    res.json({ message: "Đã xóa nhà cung cấp" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/admin/suppliers/export?search=&nameSort=
exports.exportCsv = async (req, res) => {
  try {
    const search   = (req.query.search || "").trim();
    const nameSort = (req.query.nameSort || "").trim();

    let where = {};
    if (search) {
      where = {
        [Op.or]: [
          { supplier_name: { [Op.like]: `%${search}%` } },   // ✅ MySQL dùng LIKE
          { contact_info:  { [Op.like]: `%${search}%` } },
        ],
      };
    }

    let order = [];
    if (nameSort === "a-z") order.push(["supplier_name", "ASC"]);
    else if (nameSort === "z-a") order.push(["supplier_name", "DESC"]);

    const rows = await Supplier.findAll({
      where,
      order,
      attributes: ["supplier_id", "supplier_name", "contact_info"],
    });

    const header = "supplier_id,supplier_name,contact_info";
    const body = rows
      .map(r => {
        const name = `"${(r.supplier_name || "").replace(/"/g, '""')}"`;
        const info = `"${(r.contact_info || "").replace(/"/g, '""')}"`;
        return [r.supplier_id, name, info].join(",");
      })
      .join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="suppliers.csv"');
    res.send(header + "\n" + body);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
