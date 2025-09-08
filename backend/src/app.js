const express = require("express");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const methodOverride = require("method-override");

const { isAdmin } = require("./middlewares/auth");
require("dotenv").config();

const categoryRoutes = require("./routes/categoryRoutes");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes"); // Đã có
const brandRoutes = require("./routes/brandRoutes");

const userRoutes = require("./routes/userRoute");

const productController = require("./controllers/productController");
const sequelize = require("./config/db");
const supplierRoutes = require("./routes/supplierRoutes"); 

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
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
sequelize
  .authenticate()
  .then(() => console.log("Kết nối DB thành công"))
  .catch((err) => console.error("Lỗi DB:", err));
sequelize
  .sync({ force: false })
  .then(() => console.log("Database synced"))
  .catch((err) => console.error("Lỗi đồng bộ DB:", err));

// Routes
app.use("/api", categoryRoutes);
app.use("/api", authRoutes);
app.use("/api", brandRoutes);
app.use("/api", productRoutes); // Mount productRoutes cho cả customer và admin

app.use("/api", userRoutes);

app.use("/api", categoryRoutes);
app.use("/api", supplierRoutes);


// Trang chủ
app.get("/", (req, res) => {
  res.render("customer/home", { session: req.session });
});

// Trang danh mục sản phẩm
const { Product, Category, Brand } = require("./models");

app.get("/products", async (req, res) => {
  const categoryId = req.query.category_id;
  const categoryName = req.query.category_name || "Sản phẩm";
  try {
    // Lấy dữ liệu trực tiếp từ model thay vì gọi getProducts (vì cái đó dành cho API)
    const products = await Product.findAll({
      where: categoryId ? { category_id: categoryId } : {},
      include: [
        { model: Category, as: "Category", required: false },
        { model: Brand, as: "Brand", required: false },
      ],
    });

    res.render("customer/category_products", {
      session: req.session,
      categoryId,
      categoryName,
      products,
    });
  } catch (err) {
    console.error("Lỗi khi lấy sản phẩm:", err);
    res.render("customer/category_products", {
      session: req.session,
      categoryId,
      categoryName,
      products: [],
    });
  }
});

// Trang đăng ký
app.get("/register", (req, res) => {
  res.render("customer/register", { session: req.session });
});

// Trang đăng nhập
app.get("/login", (req, res) => {
  res.render("customer/login", { session: req.session });
});

// Đăng xuất
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Lỗi đăng xuất:", err);
      return res.status(500).send("Lỗi server, vui lòng thử lại sau");
    }
    res.redirect("/");
  });
});


app.get("/admin", isAdmin, (req, res) => {
  res.redirect("/admin/dashboard");
});
app.get("/admin/dashboard", isAdmin, (req, res) => {
  res.render("admin/dashboard", { session: req.session });
});

app.get("/admin/products", isAdmin, (req, res) => {
  res.render("admin/product/products", { session: req.session });
});


app.get("/admin/users", isAdmin, (req, res) => {
  res.render("admin/user/users", { session: req.session });
});


app.get("/admin/categories", isAdmin, (req, res) => {
  res.render("admin/category/categories", { session: req.session });
});

app.get("/admin/suppliers", isAdmin, (req, res) => {
  res.render("admin/suppliers/index", { session: req.session });
});
// Trang thêm sản phẩm
app.get("/admin/products/add", isAdmin, async (req, res) => {
  const categories = await Category.findAll();
  const brands = await Brand.findAll();
  res.render("admin/product/products_addedit", { product: null, categories, brands, session: req.session });
});

// Trang sửa sản phẩm
app.get("/admin/products/edit/:id", isAdmin, async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  const categories = await Category.findAll();
  const brands = await Brand.findAll();
  res.render("admin/product/products_addedit", { product, categories, brands, session: req.session });
});
module.exports = app;

