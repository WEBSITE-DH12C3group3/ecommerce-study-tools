// models/index.js
const Product = require("./Product");
const Category = require("./category");
const Attribute = require("./Attribute");
const ProductAttribute = require("./ProductAttribute");
const User = require("./User");
const Role = require("./Role");
const Brand = require("./Brand");
const Supplier = require("./Supplier"); // ✅ Thêm Supplier

// Quan hệ Product - Category (giữ nguyên)
Product.belongsTo(Category, { foreignKey: "category_id", as: "Category" });
Category.hasMany(Product, { foreignKey: "category_id", as: "Products" });

// Quan hệ Product - Brand (giữ nguyên)
Product.belongsTo(Brand, { foreignKey: "brand_id", as: "Brand" });
Brand.hasMany(Product, { foreignKey: "brand_id", as: "Products" });

// Quan hệ Product - Attribute (giữ nguyên)
Product.belongsToMany(Attribute, {
  through: ProductAttribute,
  foreignKey: "product_id",
  otherKey: "attribute_id",
  as: "Attributes",
});
Attribute.belongsToMany(Product, {
  through: ProductAttribute,
  foreignKey: "attribute_id",
  otherKey: "product_id",
  as: "Products",
});

// Quan hệ ProductAttribute (giữ nguyên)
ProductAttribute.belongsTo(Product, { foreignKey: "product_id" });
ProductAttribute.belongsTo(Attribute, { foreignKey: "attribute_id" });

// Quan hệ User - Role (giữ nguyên)
User.belongsTo(Role, { foreignKey: "role_id", as: "Role" });
Role.hasMany(User, { foreignKey: "role_id", as: "Users" });

// (Hiện tại chưa khai báo quan hệ cho Supplier vì bảng Product chưa có supplier_id.
// Nếu sau này có, sẽ thêm: Product.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'Supplier' });
// và Supplier.hasMany(Product, { foreignKey: 'supplier_id', as: 'Products' });)

module.exports = {
  Product,
  Category,
  Attribute,
  ProductAttribute,
  User,
  Role,
  Brand,
  Supplier, // ✅ Export Supplier
};
