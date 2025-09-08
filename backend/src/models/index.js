// Import Sequelize models
const Product = require("./Product");
const Category = require("./Category");
const Attribute = require("./Attribute");
const ProductAttribute = require("./ProductAttribute");
const User = require("./User");
const Role = require("./Role");
const Brand = require("./Brand");
const Supplier = require("./Supplier");

// Các model bổ sung
const Cart = require("./Cart");
const Comment = require("./Comment");
const Coupon = require("./Coupon");
const ContactSubmission = require("./ContactSubmission");
const Delivery = require("./Delivery");
const Favourite = require("./Favourite");
const Momo = require("./Momo");
const OrderItem = require("./OrderItem");
const Permission = require("./Permission");
const ProductCoupon = require("./ProductCoupon");
const PurchaseOrder = require("./PurchaseOrder");
const PurchaseOrderItem = require("./PurchaseOrderItem");
const RolePermission = require("./RolePermission");
const VNPay = require("./VNPay");

//
// Quan hệ Product - Category
//
Product.belongsTo(Category, { foreignKey: "category_id", as: "Category" });
Category.hasMany(Product, { foreignKey: "category_id", as: "Products" });

//
// Quan hệ Product - Brand
//
Product.belongsTo(Brand, { foreignKey: "brand_id", as: "Brand" });
Brand.hasMany(Product, { foreignKey: "brand_id", as: "Products" });

//
// Quan hệ Product - Attribute
//
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

ProductAttribute.belongsTo(Product, { foreignKey: "product_id" });
ProductAttribute.belongsTo(Attribute, { foreignKey: "attribute_id" });

//
// Quan hệ User - Role
//
User.belongsTo(Role, { foreignKey: "role_id", as: "Role" });
Role.hasMany(User, { foreignKey: "role_id", as: "Users" });

//
// Quan hệ Product - Cart
//
Product.hasMany(Cart, { foreignKey: "product_id", as: "Carts" });
Cart.belongsTo(Product, { foreignKey: "product_id", as: "Product" });
User.hasMany(Cart, { foreignKey: "user_id", as: "Carts" });
Cart.belongsTo(User, { foreignKey: "user_id", as: "User" });

//
// Quan hệ Product - Comment
//
Product.hasMany(Comment, { foreignKey: "product_id", as: "Comments" });
Comment.belongsTo(Product, { foreignKey: "product_id", as: "Product" });
User.hasMany(Comment, { foreignKey: "user_id", as: "Comments" });
Comment.belongsTo(User, { foreignKey: "user_id", as: "User" });

//
// Quan hệ Product - Favourite
//
Product.hasMany(Favourite, { foreignKey: "product_id", as: "Favourites" });
Favourite.belongsTo(Product, { foreignKey: "product_id", as: "Product" });
User.hasMany(Favourite, { foreignKey: "user_id", as: "Favourites" });
Favourite.belongsTo(User, { foreignKey: "user_id", as: "User" });

//
// Quan hệ Product - Coupon
//
Product.belongsToMany(Coupon, {
  through: ProductCoupon,
  foreignKey: "product_id",
  otherKey: "coupon_id",
  as: "Coupons",
});
Coupon.belongsToMany(Product, {
  through: ProductCoupon,
  foreignKey: "coupon_id",
  otherKey: "product_id",
  as: "Products",
});

//
// Quan hệ OrderItem
//
Product.hasMany(OrderItem, { foreignKey: "product_id", as: "OrderItems" });
OrderItem.belongsTo(Product, { foreignKey: "product_id", as: "Product" });

//
// (Mở rộng cho Supplier nếu cần trong tương lai)
// Product.belongsTo(Supplier, { foreignKey: "supplier_id", as: "Supplier" });
// Supplier.hasMany(Product, { foreignKey: "supplier_id", as: "Products" });

module.exports = {
  Product,
  Category,
  Attribute,
  ProductAttribute,
  User,
  Role,
  Brand,
  Supplier,
  Cart,
  Comment,
  Coupon,
  ContactSubmission,
  Delivery,
  Favourite,
  Momo,
  OrderItem,
  Permission,
  ProductCoupon,
  PurchaseOrder,
  PurchaseOrderItem,
  RolePermission,
  VNPay,
};
