const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Comment = sequelize.define("Comment", {
  comment_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  product_id: DataTypes.INTEGER,
  user_id: DataTypes.INTEGER,
  rating: {
    type: DataTypes.TINYINT,
    validate: { min: 1, max: 5 },
  },
  comment: DataTypes.TEXT,
  comment_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  fullname: DataTypes.STRING,
}, {
  tableName: "comments",
  timestamps: false,
});

module.exports = Comment;
