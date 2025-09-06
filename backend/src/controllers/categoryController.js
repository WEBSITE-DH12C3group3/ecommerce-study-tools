const Category = require("../models/category");

// Lấy danh sách
exports.getAll = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Thêm mới
exports.create = async (req, res) => {
  try {
    const { category_name, description } = req.body;
    const category = await Category.create({ category_name, description });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy theo id
exports.getById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: "Không tìm thấy" });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật
exports.update = async (req, res) => {
  try {
    const { category_name, description } = req.body;
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: "Không tìm thấy" });

    category.category_name = category_name;
    category.description = description;
    await category.save();

    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Xóa
exports.remove = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: "Không tìm thấy" });

    await category.destroy();
    res.json({ message: "Đã xóa" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
