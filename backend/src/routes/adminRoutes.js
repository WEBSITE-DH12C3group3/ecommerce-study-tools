const express = require('express');
const router = express.Router();
const { Product, Category, Brand, Order, User } = require('../models/index');
const { isAdmin } = require('../middlewares/auth');

// Thống kê dashboard
router.get('/stats', isAdmin, async (req, res) => {
  try {
    const totalProducts = await Product.count();
    const totalOrders = await Order.count();
    const totalRevenue = await Order.sum('total_amount');
    const totalUsers = await User.count();
    const recentOrders = await Order.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [{ model: User, as: 'user', attributes: ['full_name'] }],
    });
    res.json({ totalProducts, totalOrders, totalRevenue, totalUsers, recentOrders });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Quản lý sản phẩm
router.get('/products', isAdmin, async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: Category, as: 'Category', attributes: ['category_name'] },
        { model: Brand, as: 'Brand', attributes: ['brand_name'] }
      ]
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

router.post('/products', isAdmin, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

router.put('/products/:id', isAdmin, async (req, res) => {
  try {
    await Product.update(req.body, { where: { product_id: req.params.id } });
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

// Tương tự cho categories, brands, orders, users, suppliers, purchase-orders, coupons

module.exports = router;