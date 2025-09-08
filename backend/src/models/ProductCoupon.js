// models/ProductCoupon.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ProductCoupon = sequelize.define(
  "ProductCoupon",
  {
    product_coupon_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "products", key: "product_id" },
    },
    coupon_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "coupons", key: "coupon_id" },
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "product_coupons",
    timestamps: false, // vì bảng chỉ có created_at, không có updated_at
  }
);

module.exports = ProductCoupon;
