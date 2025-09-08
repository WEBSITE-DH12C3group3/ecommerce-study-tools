const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const RolePermission = sequelize.define("RolePermission", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  role_id: DataTypes.INTEGER,
  permission_id: DataTypes.INTEGER,
}, {
  tableName: "role_permissions",
  timestamps: false,
});

module.exports = RolePermission;
