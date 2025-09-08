const { Op } = require("sequelize");
const { Category } = require("../models");

// ✅ Lấy danh sách categories (có search + phân trang)
exports.getCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const offset = (page - 1) * limit;

    let where = {};
    if (search) {
      where.category_name = { [Op.iLike]: `%${search}%` };
    }

    const { count, rows } = await Category.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["category_id", "DESC"]],

    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      categories: rows,
      totalPages,
      currentPage: parseInt(page),
    });
  } catch (err) {
    console.error("Lỗi khi lấy danh mục:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Lấy 1 category theo ID
exports.getById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: "Không tìm thấy danh mục" });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Tạo mới category
exports.create = async (req, res) => {
  try {
    const { category_name, description } = req.body;
    const category = await Category.create({ category_name, description });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Cập nhật category
exports.update = async (req, res) => {
  try {
    const { category_name, description } = req.body;
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: "Không tìm thấy danh mục" });

    category.category_name = category_name;
    category.description = description;
    await category.save();

    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Xóa category
exports.remove = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: "Không tìm thấy danh mục" });

    await category.destroy();
    res.json({ message: "Đã xóa danh mục" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
