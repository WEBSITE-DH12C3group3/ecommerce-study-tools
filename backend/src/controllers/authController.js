const bcrypt = require('bcrypt');
const { User, Role } = require('../models/index');

const register = async (req, res) => {
  try {
    const { full_name, email, phone, address, password } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!full_name || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ họ tên, email và mật khẩu' });
    }

    // Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo người dùng mới
    const newUser = await User.create({
      full_name,
      email,
      phone,
      address,
      password: hashedPassword,
      role_id: 2, // Gán role_id mặc định cho người dùng thường
    });

    return res.status(201).json({ message: 'Đăng ký thành công', user: { id: newUser.user_id, full_name, email } });
  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ email và mật khẩu' });
    }

    // Tìm người dùng theo email
    const user = await User.findOne({ where: { email }, include: [{ model: Role, as: 'Role' }] });
    if (!user) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    // Lưu thông tin người dùng vào session
    req.session.user = {
      id: user.user_id,
      full_name: user.full_name,
      email: user.email,
      role_id: user.role_id,
      role: user.Role ? user.Role.role_name : 'user',
    };

    return res.status(200).json({
      message: 'Đăng nhập thành công',
      user: { id: user.user_id, full_name: user.full_name, email: user.email, role_id: user.role_id },
    });
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau' });
  }
};

module.exports = { register, login };