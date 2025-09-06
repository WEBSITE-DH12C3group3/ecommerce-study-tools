const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,     // tên database
  process.env.DB_USER,     // user MySQL (mặc định: root)
  process.env.DB_PASSWORD, // mật khẩu MySQL
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    port: process.env.DB_PORT || 3306
  }
);

module.exports = sequelize;
