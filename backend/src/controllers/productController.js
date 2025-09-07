const { Op } = require("sequelize");
const { Product, Category } = require("../models");

// Lấy danh sách sản phẩm
exports.getProducts = async (req, res) => {
  try {
    const { category_id, page = 1, limit = 8, search = '', priceSort = '', stock = '' } = req.query;
    const offset = (page - 1) * limit;

    // Điều kiện tìm kiếm
    let where = {};
    if (category_id) {
      where.category_id = category_id;
    }
    if (search) {
      where.product_name = { [Op.iLike]: `%${search}%` }; // Tìm kiếm không phân biệt hoa thường
    }
    if (stock === 'in-stock') {
      where.stock_quantity = { [Op.gt]: 0 };
    } else if (stock === 'out-of-stock') {
      where.stock_quantity = { [Op.eq]: 0 };
    }

    // Sắp xếp
    let order = [];
    if (priceSort === 'low-to-high') {
      order.push(['price', 'ASC']);
    } else if (priceSort === 'high-to-low') {
      order.push(['price', 'DESC']);
    }

    // Lấy sản phẩm
    const { count, rows } = await Product.findAndCountAll({
      where,
      order,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [{ model: Category, as: 'Category' }],
    });

    // Tính tổng số trang
    const totalPages = Math.ceil(count / limit);

    // Nếu gọi từ API, trả về JSON
    if (req.headers['accept'] === 'application/json') {
      return res.json({
        products: rows,
        totalPages,
        currentPage: parseInt(page),
      });
    }

    // Nếu gọi từ route render, trả về object
    return {
      products: rows,
      totalPages,
      currentPage: parseInt(page),
    };
  } catch (err) {
    console.error("Lỗi khi lấy sản phẩm:", err);
    // Nếu gọi từ API, trả về lỗi JSON
    if (req.headers['accept'] === 'application/json') {
      return res.status(500).json({ error: err.message });
    }
    // Nếu gọi từ route render, ném lỗi để xử lý ở app.js
    throw err;
  }
};