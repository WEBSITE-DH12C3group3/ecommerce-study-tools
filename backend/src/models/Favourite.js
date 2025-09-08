const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Favourite = sequelize.define("Favourite", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  product_id: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: "favourites",
  timestamps: false,
});

module.exports = Favourite;
