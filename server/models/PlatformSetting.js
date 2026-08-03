const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PlatformSetting = sequelize.define('PlatformSetting', {
  key: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'platform_settings',
  timestamps: false
});

module.exports = PlatformSetting;
