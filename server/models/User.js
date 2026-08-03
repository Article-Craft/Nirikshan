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
    type: DataTypes.ENUM('citizen', 'moderator', 'government_office', 'admin', 'super_admin'),
    defaultValue: 'citizen'
  },
  isAnonymous: {
    type: DataTypes.BOOLEAN,
    field: 'is_anonymous',
    defaultValue: false
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  photoUrl: {
    type: DataTypes.STRING,
    field: 'photo_url',
    allowNull: true
  },
  coverUrl: {
    type: DataTypes.STRING,
    field: 'cover_url',
    allowNull: true
  },
  occupation: {
    type: DataTypes.STRING,
    allowNull: true
  },
  organization: {
    type: DataTypes.STRING,
    allowNull: true
  },
  province: {
    type: DataTypes.STRING,
    allowNull: true
  },
  district: {
    type: DataTypes.STRING,
    allowNull: true
  },
  municipality: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'suspended', 'banned'),
    defaultValue: 'active'
  },
  verificationBadge: {
    type: DataTypes.BOOLEAN,
    field: 'verification_badge',
    defaultValue: false
  },
  twoFactorEnabled: {
    type: DataTypes.BOOLEAN,
    field: 'two_factor_enabled',
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

