const express = require("express");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
require("dotenv").config();

const categoryRoutes = require("./routes/categoryRoutes");
const authRoutes = require('./routes/authRoutes');

const sequelize = require("./config/db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../../frontend/public")));

// Cấu hình session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_session_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production" },
  })
);

// Cấu hình EJS
app.set("views", path.join(__dirname, "../../frontend/views"));
app.set("view engine", "ejs");

// Đồng bộ database
sequelize.authenticate()
  .then(() => console.log("Kết nối DB thành công"))
  .catch(err => console.error("Lỗi DB:", err));
sequelize.sync({ force: false })
  .then(() => console.log("Database synced"))
  .catch(err => console.error("Lỗi đồng bộ DB:", err));

// Routes
app.use("/api", categoryRoutes);
app.use("/api", authRoutes);

// Trang chủ
app.get("/", (req, res) => {
  res.render("customer/home");
});

// Trang đăng ký
app.get("/register", (req, res) => {
  res.render("customer/register");
});

// Trang đăng nhập
app.get("/login", (req, res) => {
  res.render("customer/login");
});

// Admin pages
app.get("/admin/categories", (req, res) => {
  res.render("admin/categories");
});

module.exports = app;