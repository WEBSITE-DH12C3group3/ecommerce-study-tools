const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ProductAttribute = sequelize.define(
  "ProductAttribute",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "products",
        key: "product_id",
      },
    },
    attribute_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "attributes",
        key: "id",
      },
    },
    value: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "product_attributes",
    timestamps: false,
  }
);

module.exports = ProductAttribute;