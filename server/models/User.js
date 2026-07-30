const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true // Allow null for anonymous users
  },
  passwordHash: {
    type: DataTypes.STRING,
    field: 'password_hash',
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('citizen', 'moderator', 'admin'),
    defaultValue: 'citizen'
  },
  isAnonymous: {
    type: DataTypes.BOOLEAN,
    field: 'is_anonymous',
    defaultValue: false
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'users'
});

module.exports = User;
