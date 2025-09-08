const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const { User, Role } = require("../models");

// GET /api/admin/users?search=&role_id=&page=&limit=&sort=
exports.getUsers = async (req, res) => {
  try {
    const {
      search = "",
      role_id = "",
      page = 1,
      limit = 10,
      sort = "newest",
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;

    const where = {};
    if (search) {
      // nếu bạn dùng MySQL/MariaDB, LIKE là đủ vì collation thường không phân biệt hoa thường
      where[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
      // Nếu muốn giống y chang Products (Op.iLike), đổi [Op.like] -> [Op.iLike] khi dùng Postgres
    }
    if (role_id) where.role_id = role_id;

    let order = [["created_at", "DESC"]];
    if (sort === "name-asc") order = [["full_name", "ASC"]];
    if (sort === "name-desc") order = [["full_name", "DESC"]];

    const { count, rows } = await User.findAndCountAll({
      where,
      include: [{ model: Role, as: "Role", required: false }],
      attributes: { exclude: ["password"] },
      order,
      limit: limitNum,
      offset,
    });

    res.json({
      users: rows,
      totalPages: Math.max(1, Math.ceil(count / limitNum)),
      currentPage: pageNum,
    });
  } catch (err) {
    console.error("getUsers error:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/admin/users/:id
exports.getById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [{ model: Role, as: "Role" }],
      attributes: { exclude: ["password"] },
    });
    if (!user)
      return res.status(404).json({ error: "Không tìm thấy người dùng" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/admin/users
exports.create = async (req, res) => {
  try {
    const { full_name, email, phone, address, password, role_id } = req.body;
    if (!full_name || !email || !password || !role_id) {
      return res.status(400).json({ message: "Thiếu dữ liệu bắt buộc" });
    }

    const existed = await User.findOne({ where: { email } });
    if (existed) return res.status(409).json({ message: "Email đã tồn tại" });

    const hash = await bcrypt.hash(password, 10);
    const created = await User.create({
      full_name,
      email,
      phone,
      address,
      password: hash,
      role_id,
    });

    const plain = created.get({ plain: true });
    delete plain.password;
    res.status(201).json(plain);
  } catch (err) {
    console.error("create user error:", err);
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/admin/users/:id
exports.update = async (req, res) => {
  try {
    const { full_name, email, phone, address, password, role_id } = req.body;

    const user = await User.findByPk(req.params.id);
    if (!user)
      return res.status(404).json({ error: "Không tìm thấy người dùng" });

    if (email && email !== user.email) {
      const dup = await User.findOne({ where: { email } });
      if (dup) return res.status(409).json({ message: "Email đã tồn tại" });
      user.email = email;
    }

    if (full_name !== undefined) user.full_name = full_name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (role_id !== undefined) user.role_id = role_id;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();

    const refreshed = await User.findByPk(user.user_id, {
      include: [{ model: Role, as: "Role" }],
      attributes: { exclude: ["password"] },
    });
    res.json(refreshed);
  } catch (err) {
    console.error("update user error:", err);
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/admin/users/:id
exports.remove = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user)
      return res.status(404).json({ error: "Không tìm thấy người dùng" });

    // Chặn tự xoá chính mình nếu bạn đang dùng session
    if (
      req.session?.user?.id &&
      Number(req.params.id) === Number(req.session.user.id)
    ) {
      return res.status(400).json({ message: "Bạn không thể xoá chính mình." });
    }

    await user.destroy();
    res.json({ message: "Đã xoá người dùng" });
  } catch (err) {
    console.error("remove user error:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/admin/roles
exports.getRoles = async (_req, res) => {
  try {
    const roles = await Role.findAll();
    res.json(roles);
  } catch (err) {
    console.error("getRoles error:", err);
    res.status(500).json({ error: err.message });
  }
};
