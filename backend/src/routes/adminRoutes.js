const express = require('express');
const router = express.Router();
const { Product, Category, Brand, Order, User } = require('../models/index');
const { isAdmin } = require('../middlewares/auth');
const multer = require('multer'); // Để upload hình ảnh
const upload = multer({ dest: 'uploads/' }); // Thư mục lưu hình

// Thống kê dashboard (giữ nguyên)

// Quản lý sản phẩm
router.get('/products', isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', category = '', brand = '', sort = 'name_asc' } = req.query;
    let where = {};
    if (search) where.product_name = { [Op.iLike]: `%${search}%` };
    if (category) where.category_id = category;
    if (brand) where.brand_id = brand;

    let order = [];
    if (sort === 'name_asc') order = [['product_name', 'ASC']];
    if (sort === 'name_desc') order = [['product_name', 'DESC']];
    if (sort === 'price_asc') order = [['price', 'ASC']];
    if (sort === 'price_desc') order = [['price', 'DESC']];

    const { count, rows } = await Product.findAndCountAll({
      where,
      order,
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      include: [{ model: Category, as: 'Category' }, { model: Brand, as: 'Brand' }]
    });

    res.json({ products: rows, totalPages: Math.ceil(count / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

router.post('/products', isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { product_name, price, stock_quantity, category_id, brand_id, description } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    const product = await Product.create({ product_name, price, stock_quantity, category_id, brand_id, description, image_url });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

router.put('/products/:id', isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { product_name, price, stock_quantity, category_id, brand_id, description } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : req.body.image_url;
    await Product.update({ product_name, price, stock_quantity, category_id, brand_id, description, image_url }, { where: { product_id: req.params.id } });
    res.json({ message: 'Cập nhật thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

router.delete('/products/:id', isAdmin, async (req, res) => {
  try {
    await Product.destroy({ where: { product_id: req.params.id } });
    res.json({ message: 'Xóa thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

router.get('/suppliers', (req, res) => {
  res.render('admin/suppliers/index');
});

module.exports = router;