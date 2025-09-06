// middleware/auth.js
const { User, Role } = require("../models"); // Giả định models/index.js export User và Role

// Middleware kiểm tra quyền admin (dựa trên session)
exports.isAdmin = async (req, res, next) => {
  try {
    // Kiểm tra xem có session user không
    if (!req.session.user || !req.session.user.user_id) {
      return res.status(401).json({ message: "Vui lòng đăng nhập" });
    }

    // Lấy thông tin user từ database
    const user = await User.findByPk(req.session.user.user_id, {
      include: [{ model: Role, attributes: ["role_name"] }],
    });

    if (!user) {
      return res.status(401).json({ message: "Người dùng không tồn tại" });
    }

    // Kiểm tra vai trò admin
    if (user.Role && user.Role.role_name === "admin") {
      req.user = user; // Gắn thông tin user vào request để sử dụng sau nếu cần
      return next();
    }

    return res.status(403).json({ message: "Yêu cầu quyền admin" });
  } catch (error) {
    console.error("Lỗi middleware isAdmin:", error);
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Middleware kiểm tra quyền admin (dựa trên JWT - tùy chọn)
exports.isAdminJWT = async (req, res, next) => {
  const jwt = require("jsonwebtoken");
  const token = req.headers.authorization?.split(" ")[1]; // Lấy token từ header Authorization: Bearer <token>

  if (!token) {
    return res.status(401).json({ message: "Vui lòng cung cấp token" });
  }

  try {
    // Giải mã token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
    const user = await User.findByPk(decoded.user_id, {
      include: [{ model: Role, attributes: ["role_name"] }],
    });

    if (!user) {
      return res.status(401).json({ message: "Người dùng không tồn tại" });
    }

    // Kiểm tra vai trò admin
    if (user.Role && user.Role.role_name === "admin") {
      req.user = user; // Gắn thông tin user vào request
      return next();
    }

    return res.status(403).json({ message: "Yêu cầu quyền admin" });
  } catch (error) {
    console.error("Lỗi middleware isAdminJWT:", error);
    return res.status(401).json({ message: "Token không hợp lệ", error: error.message });
  }
};