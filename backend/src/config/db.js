const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    port: process.env.DB_PORT || 3306,
    logging: console.log, // Bật log SQL để debug
  }
);

// Test kết nối
sequelize.authenticate()
  .then(() => console.log('Kết nối DB thành công'))
  .catch(err => console.error('Lỗi kết nối DB:', err));

module.exports = sequelize;