const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Product = sequelize.define(
  "Product",
  {
    product_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    product_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    stock_quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    image_url: {
      type: DataTypes.STRING(255),
    },
    category_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "categories",
        key: "category_id",
      },
    },
    brand_id: {  // Thêm cột brand_id
      type: DataTypes.INTEGER,
      allowNull: true,  // Có thể null nếu sản phẩm không có thương hiệu
      references: {
        model: "brands",
        key: "brand_id",
      },
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    is_deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "products",
    timestamps: false,
  }
  
);

module.exports = Product;