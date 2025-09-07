const { User, Role } = require("../models");

// Middleware kiểm tra quyền admin (dựa trên session)
exports.isAdmin = async (req, res, next) => {
  try {
    // Kiểm tra xem có session user không
    if (!req.session.user || !req.session.user.id) {
      return res.redirect('/login');
    }

    // Lấy thông tin user từ session (không cần query DB nếu đã lưu đủ dữ liệu)
    const user = req.session.user;

    // Kiểm tra vai trò admin dựa trên role_id
    if (user.role_id === 1) { // Giả định role_id = 1 là admin
      req.user = user;
      return next();
    }

    return res.redirect('/'); // Chuyển hướng về trang chủ nếu không phải admin
  } catch (error) {
    console.error("Lỗi middleware isAdmin:", error);
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Middleware kiểm tra quyền admin (dựa trên JWT - tùy chọn)
exports.isAdminJWT = async (req, res, next) => {
  const jwt = require("jsonwebtoken");
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Vui lòng cung cấp token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
    const user = await User.findByPk(decoded.user_id, {
      include: [{ model: Role, attributes: ["role_name"] }],
    });

    if (!user) {
      return res.status(401).json({ message: "Người dùng không tồn tại" });
    }

    // Kiểm tra vai trò admin dựa trên role_id từ DB (vì JWT không lưu role_id trực tiếp)
    if (user.role_id === 1) {
      req.user = user;
      return next();
    }

    return res.status(403).json({ message: "Yêu cầu quyền admin" });
  } catch (error) {
    console.error("Lỗi middleware isAdminJWT:", error);
    return res.status(401).json({ message: "Token không hợp lệ", error: error.message });
  }
};