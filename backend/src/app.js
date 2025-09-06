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

// Admin pages
app.get("/admin/categories", (req, res) => {
  res.render("admin/categories");
});

// Customer pages (ví dụ sau này)
app.get("/", (req, res) => {
  res.render("customer/home"); // bạn sẽ tạo file home.ejs trong customer
});

// API
app.use("/api/categories", categoryRoutes);

module.exports = app;
