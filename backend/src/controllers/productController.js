const { Op } = require("sequelize");
const { Product, Category, Brand } = require("../models");

exports.getProducts = async (req, res) => {
  try {
    const { category_id, brand_id, page = 1, limit = 10, search = '', priceSort = '', stock = '' } = req.query;
    const offset = (page - 1) * limit;
    let where = {};
    if (category_id) where.category_id = category_id;
    if (brand_id) where.brand_id = brand_id;
    if (search) where.product_name = { [Op.iLike]: `%${search}%` };
    if (stock === 'in-stock') where.stock_quantity = { [Op.gt]: 0 };
    else if (stock === 'out-of-stock') where.stock_quantity = { [Op.eq]: 0 };

    let order = [];
    if (priceSort === 'low-to-high') order.push(['price', 'ASC']);
    else if (priceSort === 'high-to-low') order.push(['price', 'DESC']);

    const { count, rows } = await Product.findAndCountAll({
      where,
      order,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        { model: Category, as: 'Category', required: false },
        { model: Brand, as: 'Brand', required: false },
      ],
    });

    const totalPages = Math.ceil(count / limit);

    // chỉ gửi response một lần
    res.json({
      products: rows,
      totalPages,
      currentPage: parseInt(page),
    });
  } catch (err) {
    console.error("Lỗi chi tiết khi lấy sản phẩm:", err.message, err.stack);
    res.status(500).json({ error: err.message });
  }
};




// Thêm sản phẩm mới (CRUD: Create)
exports.create = async (req, res) => {
  try {
    const { product_name, price, stock_quantity, category_id, brand_id, description, image_url } = req.body; // Thêm brand_id, image_url (nếu dùng upload)
    const product = await Product.create({
      product_name,
      price,
      stock_quantity,
      category_id,
      brand_id,
      description,
      image_url, // Giả sử upload image riêng, lưu URL
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy sản phẩm theo ID (CRUD: Read single)
exports.getById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'Category' },
        { model: Brand, as: 'Brand' },
      ],
    });
    if (!product) return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật sản phẩm (CRUD: Update)
exports.update = async (req, res) => {
  try {
    const { product_name, price, stock_quantity, category_id, brand_id, description, image_url } = req.body;
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Không tìm thấy sản phẩm" });

    product.product_name = product_name;
    product.price = price;
    product.stock_quantity = stock_quantity;
    product.category_id = category_id;
    product.brand_id = brand_id;
    product.description = description;
    product.image_url = image_url || product.image_url; // Giữ nguyên nếu không update image
    await product.save();

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Xóa sản phẩm (CRUD: Delete)
exports.remove = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
    await product.destroy();
    res.json({ message: "Đã xóa sản phẩm" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};