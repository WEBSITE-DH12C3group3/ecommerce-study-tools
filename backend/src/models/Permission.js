const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Permission = sequelize.define("Permission", {
  permission_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, unique: true },
  description: DataTypes.TEXT,
}, {
  tableName: "permissions",
  timestamps: false,
});

module.exports = Permission;
