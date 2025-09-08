const { Op } = require("sequelize");
const { Product, Cart,Category, Brand, OrderItem, Favourite, Comment, ProductCoupon } = require("../models");


exports.getProducts = async (req, res) => {
  try {
    const { 
      category_id, 
      brand_id, 
      page = 1, 
      limit = 10, 
      search = '', 
      priceSort = '', 
      stock = '' 
    } = req.query;

    const offset = (page - 1) * limit;

    // Điều kiện lọc
    let where = { is_deleted: false }; // ✅ chỉ lấy sp chưa xóa mềm

    if (category_id) where.category_id = category_id;
    if (brand_id) where.brand_id = brand_id;
    if (search) where.product_name = { [Op.iLike]: `%${search}%` };
    if (stock === "in-stock") where.stock_quantity = { [Op.gt]: 0 };
    else if (stock === "out-of-stock") where.stock_quantity = { [Op.eq]: 0 };
    if (req.query.status === 'deleted') {
      where.is_deleted = true;
    } else {
      where.is_deleted = false; // mặc định
    }

    // Sắp xếp
    let order = [];
    if (priceSort === "low-to-high") order.push(["price", "ASC"]);
    else if (priceSort === "high-to-low") order.push(["price", "DESC"]);

    // Truy vấn DB
    const { count, rows } = await Product.findAndCountAll({
      where,
      order,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        { model: Category, as: "Category", required: false },
        { model: Brand, as: "Brand", required: false },
      ],
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      products: rows,
      totalPages,
      currentPage: parseInt(page),
    });
  } catch (err) {
    console.error("Lỗi khi lấy sản phẩm:", err);
    res.status(500).json({ error: "Lỗi server, vui lòng thử lại sau" });
  }
};




// Thêm sản phẩm mới (CRUD: Create)
exports.create = async (req, res) => {
  try {
    const { product_name, price, stock_quantity, category_id, brand_id, description } = req.body;
    const image_url = req.file ? req.file.filename : null;

    const product = await Product.create({
      product_name,
      price,
      stock_quantity,
      category_id,
      brand_id,
      description,
      image_url,
    });

    // Luôn redirect về trang quản lý sản phẩm
    return res.redirect("/admin/products");
  } catch (err) {
    console.error("Lỗi khi thêm sản phẩm:", err);
    // Nếu là AJAX, trả JSON lỗi
    if (req.headers.accept && req.headers.accept.includes("application/json")) {
      return res.status(500).json({ error: err.message });
    }
    res.status(500).send("Lỗi server");
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
    const { product_name, price, stock_quantity, category_id, brand_id, description } = req.body;
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      if (req.headers.accept && req.headers.accept.includes("application/json")) {
        return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
      }
      return res.status(404).send("Không tìm thấy sản phẩm");
    }

    product.product_name = product_name;
    product.price = price;
    product.stock_quantity = stock_quantity;
    product.category_id = category_id;
    product.brand_id = brand_id;
    product.description = description;

    if (req.file) {
      product.image_url = req.file.filename;
    }

    await product.save();

    // Trả JSON nếu AJAX
    if (req.headers.accept && req.headers.accept.includes("application/json")) {
      return res.json(product);
    }

    // Redirect nếu form submit
    return res.redirect("/admin/products");
  } catch (err) {
    console.error("Lỗi khi cập nhật sản phẩm:", err);
    if (req.headers.accept && req.headers.accept.includes("application/json")) {
      return res.status(500).json({ error: err.message });
    }
    res.status(500).send("Lỗi server");
  }
};


// Xóa sản phẩm (CRUD: Delete)
exports.remove = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    // Đánh dấu xóa mềm
    await product.update({
      is_deleted: true,
      deleted_at: new Date(),
    });

    res.json({ message: "Xóa mềm sản phẩm thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm:", error);
    res.status(500).json({ message: "Lỗi khi xóa sản phẩm" });
  }
};

exports.restore = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    await product.update({
      is_deleted: false,
      deleted_at: null,
    });

    res.json({ message: "Khôi phục sản phẩm thành công" });
  } catch (error) {
    console.error("Lỗi khi khôi phục sản phẩm:", error);
    res.status(500).json({ message: "Lỗi khi khôi phục sản phẩm" });
  }
};

exports.hardDelete = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔍 Kiểm tra các bảng liên quan
    const cartItem = await Cart.findOne({ where: { product_id: id } });
    const orderItem = await OrderItem.findOne({ where: { product_id: id } });
    const favourite = await Favourite.findOne({ where: { product_id: id } });
    const comment = await Comment.findOne({ where: { product_id: id } });
    const productCoupon = await ProductCoupon.findOne({ where: { product_id: id } });

    if (cartItem || orderItem || favourite || comment || productCoupon) {
      return res.status(400).json({
        error: "Không thể xóa vì sản phẩm vẫn đang được sử dụng trong hệ thống (giỏ hàng, đơn hàng, yêu thích, bình luận hoặc coupon)."
      });
    }

    // 🔥 Xóa vĩnh viễn sản phẩm
    await Product.destroy({
      where: { product_id: id },
      force: true, // nếu model có paranoid thì cần force
    });

    return res.json({ message: "Xóa vĩnh viễn sản phẩm thành công." });
  } catch (err) {
    console.error("Lỗi khi xóa cứng:", err);
    res.status(500).json({ error: "Có lỗi xảy ra khi xóa sản phẩm." });
  }
};
