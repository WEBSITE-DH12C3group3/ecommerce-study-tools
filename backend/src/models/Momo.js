const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Momo = sequelize.define("Momo", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  order_id: DataTypes.INTEGER,
  amount: DataTypes.DECIMAL(10,2),
  status: DataTypes.STRING,
  transaction_id: DataTypes.STRING,
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: "momo",
  timestamps: false,
});

module.exports = Momo;
