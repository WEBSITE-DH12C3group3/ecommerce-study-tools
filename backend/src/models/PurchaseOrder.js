const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const PurchaseOrder = sequelize.define("PurchaseOrder", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  supplier_id: DataTypes.INTEGER,
  order_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  total_amount: DataTypes.DECIMAL(10,2),
}, {
  tableName: "purchase_orders",
  timestamps: false,
});

module.exports = PurchaseOrder;
