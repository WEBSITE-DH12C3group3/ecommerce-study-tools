// models/Supplier.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // dùng cùng instance với app.js

const Supplier = sequelize.define('Supplier', {
  supplier_id: {
    type: DataTypes.INTEGER.UNSIGNED, // OK cho MySQL; Postgres sẽ bỏ qua UNSIGNED
    primaryKey: true,
    autoIncrement: true,
  },
  supplier_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: { notEmpty: true },
  },
  contact_info: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'suppliers',
  timestamps: false,
  indexes: [
    { fields: ['supplier_name'] },
  ],
});

// Associations nếu cần (để trống/ghi chú lại)
// Supplier.associate = (models) => {
//   Supplier.hasMany(models.Product, { foreignKey: 'supplier_id', as: 'Products' });
// };

module.exports = Supplier;
