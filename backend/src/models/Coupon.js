const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Coupon = sequelize.define("Coupon", {
  coupon_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  code: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false,
  },
  description: DataTypes.TEXT,
  discount_amount: DataTypes.DECIMAL(10,2),
  discount_percent: DataTypes.TINYINT,
  valid_from: DataTypes.DATE,
  valid_to: DataTypes.DATE,
  usage_limit: DataTypes.INTEGER,
  used_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: "coupons",
  timestamps: false,
});

module.exports = Coupon;
