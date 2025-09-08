const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const PurchaseOrderItem = sequelize.define("PurchaseOrderItem", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  purchase_order_id: DataTypes.INTEGER,
  product_id: DataTypes.INTEGER,
  quantity: DataTypes.INTEGER,
  price: DataTypes.DECIMAL(10,2),
}, {
  tableName: "purchase_order_items",
  timestamps: false,
});

module.exports = PurchaseOrderItem;
