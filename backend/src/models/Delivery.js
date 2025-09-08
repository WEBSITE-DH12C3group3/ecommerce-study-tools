const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Delivery = sequelize.define("Delivery", {
  delivery_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  order_id: DataTypes.INTEGER,
  address: DataTypes.STRING,
  phone: DataTypes.STRING,
  status: { type: DataTypes.STRING, defaultValue: "pending" },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: "deliveries",
  timestamps: false,
});

module.exports = Delivery;
