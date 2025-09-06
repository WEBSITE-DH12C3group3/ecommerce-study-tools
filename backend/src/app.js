const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const categoryRoutes = require("./routes/categoryRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files từ frontend
app.use(express.static(path.join(__dirname, "../../frontend/public")));

// Cấu hình EJS
app.set("views", path.join(__dirname, "../../frontend/views"));
app.set("view engine", "ejs");

// ===== ROUTES =====
// API
app.use("/api/categories", categoryRoutes);

// Trang chủ
app.get("/", (req, res) => {
  res.redirect("/admin/categories");
});

// Admin pages
app.get("/admin/categories", (req, res) => {
  res.render("admin/category/categories");
});

// Customer pages (ví dụ sau này)


module.exports = app;
